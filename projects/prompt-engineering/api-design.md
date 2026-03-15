# API 接口契约设计：提示词工程系统 v1（60分版本）

> 产出者：📜 API设计专家 | 产出日期：2026-03-15
> 输入依据：技术架构方案 v1、产品定义文档 v1、体验设计方案 v1
> 下游消费者：⚙️ 后端开发专家、🖥️ 前端开发专家、🧪 测试专家、🔗 联调集成专家

---

## 一、接口总览

### 1.1 接口清单

| # | 路径 | 方法 | 功能 | 响应时间目标 | 幂等 |
|---|------|------|------|-------------|------|
| 1 | `/api/dimensions` | GET | 维度索引（元信息，不含全文） | < 50ms | ✅ 天然幂等 |
| 2 | `/api/task-types` | GET | 任务类型列表 | < 10ms | ✅ 天然幂等 |
| 3 | `/api/engines` | GET | 引擎列表 | < 10ms | ✅ 天然幂等 |
| 4 | `/api/route` | POST | 任务路由（匹配任务类型 + 返回分级维度） | < 100ms | ✅ 无副作用 |
| 5 | `/api/generate` | POST | 提示词生成（组装 + 适配） | < 500ms | ✅ 无副作用 |
| 6 | `/api/reload` | POST | 重新加载维度文件 | < 2s | ✅ 幂等（同状态重载结果一致） |

### 1.2 通用约定

| 约定项 | 规范 |
|--------|------|
| **协议** | HTTP/1.1 |
| **内容类型** | 请求 `application/json`（POST）；响应 `application/json` |
| **字符编码** | UTF-8 |
| **字段命名** | snake_case |
| **认证** | 无（内网工具，无需认证） |
| **分页** | 无（数据量小，全量返回） |
| **版本** | 无版本前缀（60分版本单一版本，v2 如需可加 `/api/v2/`） |
| **时间格式** | ISO 8601（`2026-03-15T12:00:00Z`），当前版本无时间字段 |
| **空值处理** | 字段值为空时使用 `null`，不省略字段 |

### 1.3 接口间依赖关系

```
页面加载
  ├── GET /api/dimensions ──┐
  ├── GET /api/task-types    ├── 并行请求，页面初始化
  └── GET /api/engines ─────┘

用户输入任务描述 → 失焦触发
  └── POST /api/route
        ├── 依赖：前端缓存的 dimensions（用于展示维度列表）
        └── 返回：分级维度 ID 列表 → 前端从 dimensions 缓存取详情展示

用户点击生成
  └── POST /api/generate
        ├── 依赖：route 的结果（或用户手动调整后的维度列表）
        └── 依赖：引擎选择（来自 engines 缓存）

维度文件更新后
  └── POST /api/reload
        └── 效果：刷新后端内存索引 → 后续所有 GET/POST 返回新数据
```

**前端调用时序**：
1. 页面加载 → 并行调用 `dimensions` + `task-types` + `engines`，缓存到前端 state
2. 用户输入失焦 → 调用 `route`，用返回的维度 ID 列表从本地缓存查维度详情展示
3. 用户点击生成 → 调用 `generate`，传入最终确认的维度和优先级
4. `reload` 为管理接口，维度文件更新后手动调用

---

## 二、统一响应与错误模型

### 2.1 成功响应格式

所有接口成功时直接返回业务数据（不套 wrapper），HTTP 状态码 `200`。

```
HTTP/1.1 200 OK
Content-Type: application/json

{ ...业务数据... }
```

**设计理由**：60分版本接口简单，无需 `{code, message, data}` 三层套娃。RESTful 语义下 HTTP 状态码已表达请求结果，业务数据直接作为响应体，前端消费更直接。

### 2.2 错误响应格式

所有接口错误时统一返回以下结构：

```json
{
  "error": {
    "code": "DIMENSION_LOAD_FAILED",
    "message": "维度文件解析失败：A-strategy-values.md 格式异常",
    "suggestion": "请检查维度文件格式是否符合规范，或联系维度维护专家"
  }
}
```

| 字段 | 类型 | 必须 | 说明 |
|------|------|------|------|
| `error.code` | string | ✅ | 业务错误码（大写 SNAKE_CASE），可编程判断 |
| `error.message` | string | ✅ | 人类可读的错误描述，可直接展示给用户 |
| `error.suggestion` | string | ✅ | 建议的恢复操作 |

### 2.3 错误码体系

#### HTTP 状态码映射

| HTTP 状态码 | 语义 | 使用场景 |
|-------------|------|----------|
| `200` | 成功 | 所有正常请求 |
| `400` | 请求参数错误 | 缺少必填字段、字段类型错误、字段值非法 |
| `404` | 资源不存在 | 请求的维度 ID、任务类型 key、引擎 key 不存在 |
| `422` | 业务规则校验失败 | 参数格式正确但业务逻辑不允许（如空维度列表生成） |
| `500` | 服务端内部错误 | 维度文件解析异常、未预期的运行时错误 |

#### 业务错误码清单

| 错误码 | HTTP 状态码 | 触发场景 | message 示例 | suggestion |
|--------|-------------|----------|-------------|------------|
| `INVALID_REQUEST_BODY` | 400 | 请求体非法 JSON 或缺少必填字段 | "请求体格式错误：缺少必填字段 task" | "请检查请求参数是否完整" |
| `INVALID_FIELD_VALUE` | 400 | 字段值类型错误或取值超范围 | "字段 priority 值必须为 1、2 或 3，收到: 5" | "请检查字段取值范围" |
| `TASK_TYPE_NOT_FOUND` | 404 | 指定的 task_type key 不存在 | "任务类型 'unknown_type' 不存在" | "请从 /api/task-types 获取有效的任务类型列表" |
| `ENGINE_NOT_FOUND` | 404 | 指定的 engine key 不存在 | "引擎 'gpt5' 不存在" | "请从 /api/engines 获取有效的引擎列表" |
| `DIMENSION_NOT_FOUND` | 404 | 维度 ID 列表中包含不存在的 ID | "维度 'Z99' 不存在" | "请从 /api/dimensions 获取有效的维度 ID 列表" |
| `EMPTY_DIMENSIONS` | 422 | 生成时维度列表为空 | "维度列表不能为空" | "请至少选择一个维度" |
| `ROUTE_FAILED` | 500 | 路由引擎内部异常 | "任务路由处理失败" | "请稍后重试，若持续失败请联系管理员" |
| `GENERATE_FAILED` | 500 | 组装/适配引擎内部异常 | "提示词生成处理失败" | "请稍后重试，若持续失败请联系管理员" |
| `DIMENSION_LOAD_FAILED` | 500 | 维度文件读取或解析失败 | "维度文件加载失败：文件不存在或格式异常" | "请检查 dimensions/ 目录下的文件完整性" |
| `RELOAD_FAILED` | 500 | reload 过程中发生异常 | "维度重新加载失败" | "请检查 dimensions/ 目录和文件格式" |
| `INTERNAL_ERROR` | 500 | 未预期的服务端错误 | "服务内部错误" | "请稍后重试，若持续失败请联系管理员" |

---

## 三、接口详细设计

### 3.1 GET /api/dimensions — 维度索引

**功能**：返回全部维度的元信息索引（不含维度全文内容），供前端缓存后用于维度列表展示、字符数累加计算、维度预览。

#### 请求

无请求参数、无请求体。

```
GET /api/dimensions HTTP/1.1
```

#### 响应 Schema

```json
{
  "dimensions": [
    {
      "id": "A01",
      "name": "战略核心方向",
      "category": "A",
      "category_name": "战略与价值观",
      "definition": "定义公司/产品的战略核心方向和使命宣言",
      "char_count": 4200,
      "status": "ready",
      "summary": "华渔教育的战略核心方向聚焦于利用3D/VR/AR/AI技术构建全球领先的教育平台..."
    }
  ],
  "total": 89,
  "categories": [
    {
      "key": "A",
      "name": "战略与价值观",
      "count": 8
    }
  ]
}
```

| 字段 | 类型 | 必须 | 说明 |
|------|------|------|------|
| `dimensions` | array\<Dimension\> | ✅ | 维度元信息列表 |
| `dimensions[].id` | string | ✅ | 维度唯一标识，格式 `{类别字母}{两位数字}`，如 `A01`、`B12` |
| `dimensions[].name` | string | ✅ | 维度名称，如"战略核心方向" |
| `dimensions[].category` | string | ✅ | 类别字母，如 `A`、`B`...`L` |
| `dimensions[].category_name` | string | ✅ | 类别中文名称，如"战略与价值观" |
| `dimensions[].definition` | string | ✅ | 维度定义描述（从维度文件的"维度定义"段提取） |
| `dimensions[].char_count` | integer | ✅ | 该维度具体内容的字符数（前端用于预估长度计算） |
| `dimensions[].status` | string | ✅ | 内容状态。枚举值：`"ready"`（内容就绪）、`"partial"`（含 ⚠️ 待填充标记） |
| `dimensions[].summary` | string | ✅ | 维度内容前 200 字摘要（前端维度预览展示用） |
| `total` | integer | ✅ | 维度总数 |
| `categories` | array\<Category\> | ✅ | 类别汇总列表 |
| `categories[].key` | string | ✅ | 类别字母 |
| `categories[].name` | string | ✅ | 类别中文名称 |
| `categories[].count` | integer | ✅ | 该类别下的维度数量 |

#### 错误响应

| 场景 | HTTP 状态码 | 错误码 |
|------|-------------|--------|
| 维度索引未初始化（启动时加载失败） | 500 | `DIMENSION_LOAD_FAILED` |

#### Mock 响应示例

```json
{
  "dimensions": [
    {
      "id": "A01",
      "name": "战略核心方向",
      "category": "A",
      "category_name": "战略与价值观",
      "definition": "定义公司/产品的战略核心方向和使命宣言",
      "char_count": 4200,
      "status": "ready",
      "summary": "华渔教育的战略核心方向聚焦于利用3D/VR/AR/AI技术构建全球领先的教育平台。核心使命：让每个孩子都能享受到优质的教育资源。战略路径包括：1）技术驱动的教育内容创新 2）AI辅助的个性化学习..."
    },
    {
      "id": "A02",
      "name": "红线与禁区",
      "category": "A",
      "category_name": "战略与价值观",
      "definition": "明确不可逾越的底线和绝对不做的事情",
      "char_count": 1500,
      "status": "ready",
      "summary": "华渔教育的绝对红线包括：❌ 不做大模型研发（使用现有AI引擎）❌ 不涉及学生个人隐私数据的商业化 ❌ 不做与教育无关的业务扩展 ❌ 不做违反教育部政策法规的功能..."
    },
    {
      "id": "A03",
      "name": "品牌定位",
      "category": "A",
      "category_name": "战略与价值观",
      "definition": "品牌在目标市场中的位置和差异化定位",
      "char_count": 3100,
      "status": "ready",
      "summary": "华渔教育品牌定位为"AI驱动的教育科技领先者"。核心差异化：依托网龙集团的3D/VR/AR技术积累，结合AI能力打造沉浸式教育体验。目标受众：K12学校、教育局、培训机构..."
    },
    {
      "id": "G03",
      "name": "同业案例",
      "category": "G",
      "category_name": "历史经验与案例",
      "definition": "同行业其他公司的成功/失败案例参考",
      "char_count": 2800,
      "status": "partial",
      "summary": "⚠️ 待填充：同业案例部分信息需进一步收集。已有框架包括：好未来AI课堂案例分析、作业帮智能批改案例、科大讯飞教育AI应用案例。具体数据和效果对比待补充..."
    },
    {
      "id": "B01",
      "name": "核心用户画像",
      "category": "B",
      "category_name": "用户真实性",
      "definition": "基于真实数据的核心目标用户画像",
      "char_count": 5100,
      "status": "ready",
      "summary": "华渔教育核心用户画像分为四类：1）一线教师（占60%）：30-50岁，本科学历，日常使用PPT+教学平台，对新技术接受度中等 2）教研组长/教务主任（占20%）：负责教学管理..."
    },
    {
      "id": "C01",
      "name": "直接竞品分析",
      "category": "C",
      "category_name": "竞品与差异化",
      "definition": "直接竞争对手的产品、策略和市场表现分析",
      "char_count": 3800,
      "status": "ready",
      "summary": "直接竞品分析覆盖三家主要竞争者：1）好未来-学而思：AI课堂产品矩阵完整，强项在于自适应学习算法，弱项在于硬件生态 2）科大讯飞：语音AI技术领先..."
    },
    {
      "id": "E01",
      "name": "DJ七步设计法",
      "category": "E",
      "category_name": "设计方法与技巧",
      "definition": "DJ独创的七步设计方法论流程",
      "char_count": 5200,
      "status": "ready",
      "summary": "DJ七步设计法是华渔教育的核心设计方法论，覆盖从需求到交付的完整流程：Step 1 需求拆解→Step 2 竞品扫描→Step 3 用户验证→Step 4 方案设计→Step 5 原型验证..."
    },
    {
      "id": "K01",
      "name": "产品术语表",
      "category": "K",
      "category_name": "专有名词与定义",
      "definition": "产品相关的专有名词标准定义",
      "char_count": 2400,
      "status": "ready",
      "summary": "华渔教育产品术语标准定义：【虚拟实验】指利用3D/VR技术模拟真实实验操作的数字化教学工具。【AI课堂】指集成AI辅助教学功能的在线课堂系统..."
    }
  ],
  "total": 89,
  "categories": [
    { "key": "A", "name": "战略与价值观", "count": 8 },
    { "key": "B", "name": "用户真实性", "count": 12 },
    { "key": "C", "name": "竞品与差异化", "count": 6 },
    { "key": "D", "name": "场景与需求", "count": 7 },
    { "key": "E", "name": "设计方法与技巧", "count": 16 },
    { "key": "F", "name": "可行性与资源", "count": 5 },
    { "key": "G", "name": "历史经验与案例", "count": 5 },
    { "key": "H", "name": "设计标准与规范", "count": 7 },
    { "key": "I", "name": "质量判断与检查", "count": 8 },
    { "key": "J", "name": "特殊领域知识", "count": 9 },
    { "key": "K", "name": "专有名词与定义", "count": 6 },
    { "key": "L", "name": "项目全生命周期", "count": 10 }
  ]
}
```

> **注**：Mock 中仅列出 8 个维度作为示例。实际响应包含全部 89 个维度。

---

### 3.2 GET /api/task-types — 任务类型列表

**功能**：返回系统支持的全部任务类型，供前端「手动切换类型」下拉菜单使用。

#### 请求

无请求参数、无请求体。

```
GET /api/task-types HTTP/1.1
```

#### 响应 Schema

```json
{
  "task_types": [
    {
      "key": "prototype",
      "name": "原型设计",
      "description": "适用于交互设计、界面原型、UI方案等设计类任务"
    }
  ]
}
```

| 字段 | 类型 | 必须 | 说明 |
|------|------|------|------|
| `task_types` | array\<TaskType\> | ✅ | 任务类型列表 |
| `task_types[].key` | string | ✅ | 任务类型唯一标识（英文 snake_case），用于 route 接口的 `task_type` 参数 |
| `task_types[].name` | string | ✅ | 任务类型中文名称（前端展示用） |
| `task_types[].description` | string | ✅ | 任务类型说明（前端下拉菜单的辅助描述） |

#### 错误响应

| 场景 | HTTP 状态码 | 错误码 |
|------|-------------|--------|
| 任务类型配置加载失败 | 500 | `INTERNAL_ERROR` |

#### Mock 响应示例

```json
{
  "task_types": [
    {
      "key": "core_value",
      "name": "核心价值编写",
      "description": "适用于核心价值定义、价值主张提炼等战略类任务"
    },
    {
      "key": "design_methodology",
      "name": "设计方法论编写",
      "description": "适用于设计方法论梳理、竞品分析方法等方法论类任务"
    },
    {
      "key": "prototype",
      "name": "原型设计",
      "description": "适用于交互设计、界面原型、UI方案等设计类任务"
    },
    {
      "key": "product_planning",
      "name": "产品策划",
      "description": "适用于产品规划、需求分析、策划方案等策划类任务"
    },
    {
      "key": "ai_programming",
      "name": "AI 编程",
      "description": "适用于AI辅助编程、代码开发等技术类任务"
    },
    {
      "key": "ai_art",
      "name": "AI 美术",
      "description": "适用于AI辅助美术设计、视觉创作、3D建模等视觉类任务"
    },
    {
      "key": "ai_marketing",
      "name": "AI Marketing",
      "description": "适用于AI辅助营销推广、市场策略等营销类任务"
    },
    {
      "key": "general",
      "name": "通用设计任务",
      "description": "无法明确匹配到特定类型时的通用设计任务"
    }
  ]
}
```

---

### 3.3 GET /api/engines — 引擎列表

**功能**：返回系统支持的全部 AI 引擎，供前端引擎选择下拉菜单及预估长度指示器使用。

#### 请求

无请求参数、无请求体。

```
GET /api/engines HTTP/1.1
```

#### 响应 Schema

```json
{
  "engines": [
    {
      "key": "claude",
      "name": "Claude",
      "ai_platform": "Anthropic Claude 3.5 Sonnet",
      "max_chars": 180000,
      "format_type": "markdown"
    }
  ]
}
```

| 字段 | 类型 | 必须 | 说明 |
|------|------|------|------|
| `engines` | array\<Engine\> | ✅ | 引擎列表 |
| `engines[].key` | string | ✅ | 引擎唯一标识（英文 snake_case），用于 generate 接口的 `engine` 参数 |
| `engines[].name` | string | ✅ | 引擎显示名称（前端展示用） |
| `engines[].ai_platform` | string | ✅ | AI 平台名称（前端辅助信息显示） |
| `engines[].max_chars` | integer | ✅ | 引擎最大字符数限制（前端预估长度指示器的分母） |
| `engines[].format_type` | string | ✅ | 输出格式类型。枚举值：`"markdown"`（文本型引擎）、`"keywords"`（视觉型引擎）、`"description"`（音频型引擎） |

#### 错误响应

| 场景 | HTTP 状态码 | 错误码 |
|------|-------------|--------|
| 引擎配置加载失败 | 500 | `INTERNAL_ERROR` |

#### Mock 响应示例

```json
{
  "engines": [
    {
      "key": "claude",
      "name": "Claude",
      "ai_platform": "Anthropic Claude 3.5 Sonnet",
      "max_chars": 180000,
      "format_type": "markdown"
    },
    {
      "key": "gpt4",
      "name": "GPT-4",
      "ai_platform": "OpenAI GPT-4o",
      "max_chars": 120000,
      "format_type": "markdown"
    },
    {
      "key": "deepseek",
      "name": "DeepSeek",
      "ai_platform": "DeepSeek V3",
      "max_chars": 60000,
      "format_type": "markdown"
    },
    {
      "key": "midjourney",
      "name": "Midjourney",
      "ai_platform": "Midjourney v6",
      "max_chars": 4000,
      "format_type": "keywords"
    },
    {
      "key": "dall_e",
      "name": "DALL-E",
      "ai_platform": "OpenAI DALL-E 3",
      "max_chars": 4000,
      "format_type": "keywords"
    },
    {
      "key": "suno",
      "name": "Suno",
      "ai_platform": "Suno v4",
      "max_chars": 2000,
      "format_type": "description"
    }
  ]
}
```

---

### 3.4 POST /api/route — 任务路由

**功能**：接收用户的任务描述文本，通过关键词匹配确定任务类型，返回匹配结果及按三级优先级分组的维度 ID 列表。支持用户手动指定任务类型跳过自动匹配。

#### 请求 Schema

```json
{
  "task": "设计一个初中化学虚拟实验的交互方案",
  "task_type": null
}
```

| 字段 | 类型 | 必须 | 说明 | 示例 |
|------|------|------|------|------|
| `task` | string | ✅ | 用户输入的任务描述文本，非空 | `"设计一个初中化学虚拟实验的交互方案"` |
| `task_type` | string \| null | ❌ | 手动指定的任务类型 key。传入时跳过自动匹配，直接按该类型路由。值必须是 `/api/task-types` 返回的有效 key。默认 `null`（自动匹配）。 | `"prototype"` 或 `null` |

#### 响应 Schema

```json
{
  "task_type": "prototype",
  "task_type_name": "原型设计",
  "confidence": 0.85,
  "is_manual_override": false,
  "required": ["E11", "H01", "H02", "H03", "H04", "H05", "H06", "H07", "I04"],
  "recommended": ["G01", "G02", "G03", "G04", "G05", "D07"],
  "optional": ["A01", "A02", "A03", "A04", "A05", "A06", "A07", "A08", "B01", "B02", "B03", "B04", "B05", "B06", "B07", "B08", "B09", "B10", "B11", "B12", "K01", "K02", "K03", "K04", "K05", "K06"],
  "total_chars": 87600
}
```

| 字段 | 类型 | 必须 | 说明 |
|------|------|------|------|
| `task_type` | string | ✅ | 匹配到的任务类型 key |
| `task_type_name` | string | ✅ | 匹配到的任务类型中文名称（前端直接展示，无需二次查找） |
| `confidence` | number | ✅ | 匹配置信度，范围 `0.0` ~ `1.0`。自动匹配：`≥0.5`（有命中）或 `0.3`（回退通用）；手动指定：`1.0` |
| `is_manual_override` | boolean | ✅ | 是否为用户手动指定。`true` = 用户指定，`false` = 自动匹配 |
| `required` | array\<string\> | ✅ | 一级（必须）维度 ID 列表。对应路由配置中该任务类型的 required，已展开类别引用 |
| `recommended` | array\<string\> | ✅ | 二级（建议）维度 ID 列表。对应路由配置中该任务类型的 recommended，已展开类别引用 |
| `optional` | array\<string\> | ✅ | 三级（可选）维度 ID 列表。对应路由配置中该任务类型的 optional，已展开类别引用 |
| `total_chars` | integer | ✅ | 全部相关维度（required + recommended + optional）的字符数总和。前端用于预估长度指示器初始值 |

**字段语义说明**：
- `required`、`recommended`、`optional` 中的维度 ID 互不重叠，且并集覆盖该任务类型的全部相关维度
- 类别引用自动展开：配置中写 `"A"` 会展开为 `["A01","A02",...,"A08"]`；写 `"A01"` 保持原值
- 前端收到后从本地维度缓存（`/api/dimensions` 的结果）按 ID 取详情展示

#### 错误响应

| 场景 | HTTP 状态码 | 错误码 |
|------|-------------|--------|
| 缺少 `task` 字段或 `task` 为空字符串 | 400 | `INVALID_REQUEST_BODY` |
| `task_type` 指定的值不存在 | 404 | `TASK_TYPE_NOT_FOUND` |
| 路由引擎内部异常 | 500 | `ROUTE_FAILED` |

#### Mock 响应示例

**示例 1：自动匹配成功**

请求：
```json
{
  "task": "设计一个初中化学虚拟实验的交互方案"
}
```

响应：
```json
{
  "task_type": "prototype",
  "task_type_name": "原型设计",
  "confidence": 0.85,
  "is_manual_override": false,
  "required": ["E11", "H01", "H02", "H03", "H04", "H05", "H06", "H07", "I04"],
  "recommended": ["G01", "G02", "G03", "G04", "G05", "D07"],
  "optional": ["A01", "A02", "A03", "A04", "A05", "A06", "A07", "A08", "B01", "B02", "B03", "B04", "B05", "B06", "B07", "B08", "B09", "B10", "B11", "B12", "K01", "K02", "K03", "K04", "K05", "K06"],
  "total_chars": 87600
}
```

**示例 2：手动指定任务类型**

请求：
```json
{
  "task": "设计一个初中化学虚拟实验的交互方案",
  "task_type": "product_planning"
}
```

响应：
```json
{
  "task_type": "product_planning",
  "task_type_name": "产品策划",
  "confidence": 1.0,
  "is_manual_override": true,
  "required": ["A01", "A02", "A03", "A04", "A05", "A06", "A07", "A08", "B01", "B02", "B03", "B04", "B05", "B06", "B07", "B08", "B09", "B10", "B11", "B12", "C01", "C02", "C03", "C04", "C05", "C06", "D01", "D02", "D03", "D04", "D05", "D06", "D07", "K01", "K02", "K03", "K04", "K05", "K06"],
  "recommended": ["E01", "E02", "E03", "E04", "E05", "E06", "E07", "E08", "E09", "E10", "E11", "E12", "E13", "E14", "E15", "E16", "F01", "F02", "F03", "F04", "F05", "G01", "G02", "G03", "G04", "G05", "I01", "I02"],
  "optional": ["J01", "J02", "J03", "J04", "J05", "J06", "J07", "J08", "J09", "L01", "L02", "L03", "L04", "L05", "L06", "L07", "L08", "L09", "L10"],
  "total_chars": 156200
}
```

**示例 3：无匹配回退通用**

请求：
```json
{
  "task": "帮我做个东西"
}
```

响应：
```json
{
  "task_type": "general",
  "task_type_name": "通用设计任务",
  "confidence": 0.3,
  "is_manual_override": false,
  "required": ["A01", "A02", "A03", "A04", "A05", "A06", "A07", "A08", "B01", "B02", "B03", "B04", "B05", "B06", "B07", "B08", "B09", "B10", "B11", "B12", "D01", "D02", "D03", "D04", "D05", "D06", "D07", "K01", "K02", "K03", "K04", "K05", "K06"],
  "recommended": ["C01", "C02", "C03", "C04", "C05", "C06", "E01", "E02", "E03", "E04", "E05", "E06", "E07", "E08", "E09", "E10", "E11", "E12", "E13", "E14", "E15", "E16", "F01", "F02", "F03", "F04", "F05", "G01", "G02", "G03", "G04", "G05"],
  "optional": ["H01", "H02", "H03", "H04", "H05", "H06", "H07", "I01", "I02", "I03", "I04", "I05", "I06", "I07", "I08", "J01", "J02", "J03", "J04", "J05", "J06", "J07", "J08", "J09", "L01", "L02", "L03", "L04", "L05", "L06", "L07", "L08", "L09", "L10"],
  "total_chars": 198400
}
```

---

### 3.5 POST /api/generate — 提示词生成

**功能**：接收最终确认的维度列表、优先级映射、引擎选择和任务描述，执行组装 + 适配流程，返回最终提示词文本和覆盖统计。

#### 请求 Schema

```json
{
  "task": "设计一个初中化学虚拟实验的交互方案",
  "engine": "claude",
  "dimensions": ["A01", "A02", "B01", "C01", "D07", "E01", "E11", "H01", "I04", "K01"],
  "priorities": {
    "A01": 1,
    "A02": 1,
    "B01": 2,
    "C01": 2,
    "D07": 2,
    "E01": 1,
    "E11": 1,
    "H01": 3,
    "I04": 1,
    "K01": 1
  }
}
```

| 字段 | 类型 | 必须 | 说明 | 示例 |
|------|------|------|------|------|
| `task` | string | ✅ | 用户输入的任务描述文本，非空 | `"设计一个初中化学虚拟实验的交互方案"` |
| `engine` | string | ✅ | 目标引擎 key，必须是 `/api/engines` 返回的有效 key | `"claude"` |
| `dimensions` | array\<string\> | ✅ | 用户最终确认的维度 ID 列表，至少 1 个。每个 ID 必须是 `/api/dimensions` 返回的有效维度 ID | `["A01", "B01", "E11"]` |
| `priorities` | object | ✅ | 维度优先级映射，key 为维度 ID，value 为优先级数字。`1` = 一级（必须），`2` = 二级（建议），`3` = 三级（可选）。每个 `dimensions` 中的 ID 都必须在 `priorities` 中有对应 entry | `{"A01": 1, "B01": 2}` |

**校验规则**：
- `dimensions` 不能为空数组
- `dimensions` 中的每个 ID 必须在 `priorities` 中有对应 key
- `priorities` 的值只能是 `1`、`2` 或 `3`
- `dimensions` 和 `priorities` 中不存在的维度 ID 返回 `DIMENSION_NOT_FOUND`
- `engine` 不存在返回 `ENGINE_NOT_FOUND`

#### 响应 Schema

```json
{
  "prompt": "你是一名专业的原型设计师。以下是你执行任务时必须参考的关键信息维度...",
  "stats": {
    "total_chars": 45200,
    "dimensions_used": 10,
    "dimensions_total": 26,
    "coverage_percent": 87.5,
    "by_level": {
      "required_count": 5,
      "recommended_count": 3,
      "optional_count": 2
    },
    "missing_required": [],
    "truncated_dimensions": []
  }
}
```

| 字段 | 类型 | 必须 | 说明 |
|------|------|------|------|
| `prompt` | string | ✅ | 生成的最终提示词文本（已经过引擎适配）。前端直接展示和复制此文本 |
| `stats` | object | ✅ | 覆盖统计信息（前端覆盖报告展示用） |
| `stats.total_chars` | integer | ✅ | 生成的提示词总字符数 |
| `stats.dimensions_used` | integer | ✅ | 实际包含的维度数量（可能因长度限制少于请求的维度数） |
| `stats.dimensions_total` | integer | ✅ | 该任务类型的全部相关维度总数（覆盖报告的分母） |
| `stats.coverage_percent` | number | ✅ | 覆盖率百分比（按权重计算），范围 `0.0` ~ `100.0` |
| `stats.by_level` | object | ✅ | 按优先级级别统计 |
| `stats.by_level.required_count` | integer | ✅ | 实际使用的一级维度数量 |
| `stats.by_level.recommended_count` | integer | ✅ | 实际使用的二级维度数量 |
| `stats.by_level.optional_count` | integer | ✅ | 实际使用的三级维度数量 |
| `stats.missing_required` | array\<string\> | ✅ | 缺失的一级维度 ID 列表。包括：被用户取消勾选的一级维度（不在 dimensions 列表中但属于该任务类型 required）、因长度限制被截断的一级维度（理论上不会，因为规则 A2 保证一级不截断）。空数组表示无缺失 |
| `stats.truncated_dimensions` | array\<string\> | ✅ | 因引擎字符数限制而被整体跳过的维度 ID 列表。空数组表示无截断 |

#### 错误响应

| 场景 | HTTP 状态码 | 错误码 |
|------|-------------|--------|
| 缺少必填字段 | 400 | `INVALID_REQUEST_BODY` |
| `priorities` 值非 1/2/3 | 400 | `INVALID_FIELD_VALUE` |
| `engine` 不存在 | 404 | `ENGINE_NOT_FOUND` |
| `dimensions` 中有不存在的 ID | 404 | `DIMENSION_NOT_FOUND` |
| `dimensions` 为空数组 | 422 | `EMPTY_DIMENSIONS` |
| 组装或适配引擎内部异常 | 500 | `GENERATE_FAILED` |

#### Mock 响应示例

**示例 1：Claude 引擎生成（文本型）**

请求：
```json
{
  "task": "设计一个初中化学虚拟实验的交互方案",
  "engine": "claude",
  "dimensions": ["A01", "A02", "B01", "C01", "D07", "E01", "E11", "H01", "I04", "K01"],
  "priorities": {
    "A01": 1, "A02": 1, "E01": 1, "E11": 1, "I04": 1, "K01": 1,
    "B01": 2, "C01": 2, "D07": 2,
    "H01": 3
  }
}
```

响应：
```json
{
  "prompt": "你是一名专业的原型设计师。以下是你执行任务时必须参考的关键信息维度，按重要性从高到低排列。请基于这些信息完成用户的任务。\n\n【用户任务】\n设计一个初中化学虚拟实验的交互方案\n\n【关键信息维度】\n\n## 一级：必须参考\n\n### A01 战略核心方向\n华渔教育的战略核心方向聚焦于利用3D/VR/AR/AI技术构建全球领先的教育平台...\n\n### A02 红线与禁区\n❌ 不做大模型研发...\n\n### E01 DJ七步设计法\n...\n\n### E11 原型设计规范\n...\n\n### I04 原型质量检查\n...\n\n### K01 产品术语表\n...\n\n## 二级：建议参考\n\n### B01 核心用户画像\n...\n\n### C01 直接竞品分析\n...\n\n### D07 需求场景完整性\n...\n\n## 三级：可选参考\n\n### H01 平台设计规范\n...\n\n【约束与禁忌】\n- ❌ 不做大模型研发（使用现有AI引擎）\n- ❌ 不涉及学生个人隐私数据的商业化\n- 禁止直接复制竞品界面设计",
  "stats": {
    "total_chars": 45200,
    "dimensions_used": 10,
    "dimensions_total": 26,
    "coverage_percent": 87.5,
    "by_level": {
      "required_count": 6,
      "recommended_count": 3,
      "optional_count": 1
    },
    "missing_required": [],
    "truncated_dimensions": []
  }
}
```

**示例 2：Midjourney 引擎生成（关键词型）**

请求：
```json
{
  "task": "设计一个初中化学虚拟实验的交互方案",
  "engine": "midjourney",
  "dimensions": ["A01", "E11", "H01"],
  "priorities": {
    "A01": 1, "E11": 1, "H01": 2
  }
}
```

响应：
```json
{
  "prompt": "educational virtual chemistry lab, interactive UI design, 3D molecular models, clean modern interface, student-friendly, VR environment, immersive learning experience, safety-focused design, colorful periodic table elements, drag-and-drop experiment tools, Chinese educational platform, high-tech classroom aesthetic, --ar 16:9 --v 6",
  "stats": {
    "total_chars": 312,
    "dimensions_used": 3,
    "dimensions_total": 26,
    "coverage_percent": 34.2,
    "by_level": {
      "required_count": 2,
      "recommended_count": 1,
      "optional_count": 0
    },
    "missing_required": ["I04", "K01"],
    "truncated_dimensions": []
  }
}
```

**示例 3：存在维度截断**

请求：
```json
{
  "task": "设计一个初中化学虚拟实验的交互方案",
  "engine": "suno",
  "dimensions": ["A01", "A02", "B01", "E01", "K01"],
  "priorities": {
    "A01": 1, "A02": 1, "B01": 2, "E01": 2, "K01": 3
  }
}
```

响应：
```json
{
  "prompt": "educational technology innovation, inspiring learning journey, young students exploring chemistry, wonder and discovery, digital classroom atmosphere, safe and creative, Chinese school spirit, hopeful and energetic",
  "stats": {
    "total_chars": 198,
    "dimensions_used": 3,
    "dimensions_total": 26,
    "coverage_percent": 22.1,
    "by_level": {
      "required_count": 2,
      "recommended_count": 1,
      "optional_count": 0
    },
    "missing_required": [],
    "truncated_dimensions": ["E01", "K01"]
  }
}
```

---

### 3.6 POST /api/reload — 重新加载维度文件

**功能**：触发后端重新扫描 `dimensions/` 目录并重建内存索引。维度文件更新后调用此接口使更改生效，无需重启服务。

#### 请求

无请求体。

```
POST /api/reload HTTP/1.1
```

#### 响应 Schema

```json
{
  "dimensions_count": 89,
  "categories_count": 12,
  "loaded_at": "2026-03-15T12:30:45Z"
}
```

| 字段 | 类型 | 必须 | 说明 |
|------|------|------|------|
| `dimensions_count` | integer | ✅ | 成功加载的维度总数 |
| `categories_count` | integer | ✅ | 成功加载的类别总数 |
| `loaded_at` | string | ✅ | 加载完成时间（ISO 8601 UTC），可用于确认 reload 是否执行 |

#### 错误响应

| 场景 | HTTP 状态码 | 错误码 |
|------|-------------|--------|
| dimensions/ 目录不存在或无可读文件 | 500 | `RELOAD_FAILED` |
| 解析过程中发生致命错误 | 500 | `RELOAD_FAILED` |

**容错行为**：单个文件解析失败不阻塞整体 reload。后端跳过异常文件，成功加载可解析的维度，`dimensions_count` 反映实际加载数量。前端可对比 `dimensions_count` 与预期值（89）判断是否有文件异常。

#### Mock 响应示例

```json
{
  "dimensions_count": 89,
  "categories_count": 12,
  "loaded_at": "2026-03-15T12:30:45Z"
}
```

---

## 四、CORS 配置说明

### 4.1 生产环境

生产环境前端静态文件由 FastAPI `StaticFiles` 直接 serve，前后端同源（同端口 8080），**无需 CORS 配置**。

### 4.2 开发环境

开发环境前端 Vite Dev Server 运行在 `localhost:5173`，后端 FastAPI 运行在 `localhost:8080`，**跨域需配置 CORS**。

```python
# main.py — 开发环境 CORS 配置
from fastapi.middleware.cors import CORSMiddleware

if os.getenv("ENV", "production") == "development":
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173"],
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type"],
        allow_credentials=False,
    )
```

| 配置项 | 值 | 说明 |
|--------|-----|------|
| `allow_origins` | `["http://localhost:5173"]` | 仅允许 Vite 开发服务器 |
| `allow_methods` | `["GET", "POST"]` | 系统只用到 GET 和 POST |
| `allow_headers` | `["Content-Type"]` | 仅需 JSON 内容类型头 |
| `allow_credentials` | `false` | 无认证，不需要传 cookie |

### 4.3 前端开发备选：Vite Proxy

前端也可通过 Vite Proxy 规避跨域，不依赖后端 CORS 配置：

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:8080'
    }
  }
})
```

---

## 五、前端消费指南

### 5.1 与体验设计数据需求对齐

| 体验设计需求（§九） | 对应接口 | 字段映射 | 对齐状态 |
|---------------------|----------|----------|----------|
| 维度索引列表：id, name, category, char_count, status, summary | `GET /api/dimensions` | `dimensions[].id`, `.name`, `.category`, `.char_count`, `.status`, `.summary` | ✅ 完全对齐 |
| 任务类型列表：key, name, description | `GET /api/task-types` | `task_types[].key`, `.name`, `.description` | ✅ 完全对齐 |
| 引擎列表：key, name, ai_platform, max_chars, format_type | `GET /api/engines` | `engines[].key`, `.name`, `.ai_platform`, `.max_chars`, `.format_type` | ✅ 完全对齐 |
| 路由结果：task_type, confidence, required[], recommended[], optional[], total_chars | `POST /api/route` | `task_type`, `confidence`, `required`, `recommended`, `optional`, `total_chars` | ✅ 完全对齐 |
| 生成结果：prompt, stats.total_chars, dimensions_used, coverage_percent, by_level{}, missing_required[] | `POST /api/generate` | `prompt`, `stats.total_chars`, `.dimensions_used`, `.coverage_percent`, `.by_level{}`, `.missing_required` | ✅ 完全对齐 |

### 5.2 前端 TypeScript 类型定义（建议）

```typescript
// types/index.ts — 与 API 响应对齐的类型定义

/** 维度元信息 */
interface Dimension {
  id: string;                    // "A01"
  name: string;                  // "战略核心方向"
  category: string;              // "A"
  category_name: string;         // "战略与价值观"
  definition: string;            // 维度定义描述
  char_count: number;            // 内容字符数
  status: "ready" | "partial";   // 内容状态
  summary: string;               // 前 200 字摘要
}

/** 类别汇总 */
interface Category {
  key: string;                   // "A"
  name: string;                  // "战略与价值观"
  count: number;                 // 该类别维度数
}

/** 维度索引响应 */
interface DimensionsResponse {
  dimensions: Dimension[];
  total: number;
  categories: Category[];
}

/** 任务类型 */
interface TaskType {
  key: string;                   // "prototype"
  name: string;                  // "原型设计"
  description: string;           // 类型说明
}

/** 任务类型列表响应 */
interface TaskTypesResponse {
  task_types: TaskType[];
}

/** AI 引擎 */
interface Engine {
  key: string;                   // "claude"
  name: string;                  // "Claude"
  ai_platform: string;           // "Anthropic Claude 3.5 Sonnet"
  max_chars: number;             // 180000
  format_type: "markdown" | "keywords" | "description";
}

/** 引擎列表响应 */
interface EnginesResponse {
  engines: Engine[];
}

/** 路由请求 */
interface RouteRequest {
  task: string;
  task_type?: string | null;
}

/** 路由响应 */
interface RouteResponse {
  task_type: string;
  task_type_name: string;
  confidence: number;
  is_manual_override: boolean;
  required: string[];
  recommended: string[];
  optional: string[];
  total_chars: number;
}

/** 生成请求 */
interface GenerateRequest {
  task: string;
  engine: string;
  dimensions: string[];
  priorities: Record<string, 1 | 2 | 3>;
}

/** 覆盖统计 */
interface CoverageStats {
  total_chars: number;
  dimensions_used: number;
  dimensions_total: number;
  coverage_percent: number;
  by_level: {
    required_count: number;
    recommended_count: number;
    optional_count: number;
  };
  missing_required: string[];
  truncated_dimensions: string[];
}

/** 生成响应 */
interface GenerateResponse {
  prompt: string;
  stats: CoverageStats;
}

/** 重新加载响应 */
interface ReloadResponse {
  dimensions_count: number;
  categories_count: number;
  loaded_at: string;
}

/** 统一错误响应 */
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    suggestion: string;
  };
}
```

### 5.3 前端 API 调用封装（建议）

```typescript
// api/client.ts

const API_BASE = "/api";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    const errorBody: ErrorResponse = await response.json();
    throw new ApiError(
      response.status,
      errorBody.error.code,
      errorBody.error.message,
      errorBody.error.suggestion
    );
  }

  return response.json();
}

// GET 接口
export const getDimensions = () => request<DimensionsResponse>("/dimensions");
export const getTaskTypes = () => request<TaskTypesResponse>("/task-types");
export const getEngines = () => request<EnginesResponse>("/engines");

// POST 接口
export const postRoute = (data: RouteRequest) =>
  request<RouteResponse>("/route", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const postGenerate = (data: GenerateRequest) =>
  request<GenerateResponse>("/generate", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const postReload = () =>
  request<ReloadResponse>("/reload", { method: "POST" });

// 错误类
class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public suggestion: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}
```

---

## 六、与技术架构对齐验证

| 技术架构约束（§六） | 本文档实现 | 对齐状态 |
|---------------------|-----------|----------|
| 6 个接口路径和方法 | §三 完整定义 6 个接口 | ✅ |
| 无认证 | §1.2 通用约定：无认证 | ✅ |
| 无分页 | §1.2 通用约定：无分页 | ✅ |
| JSON 响应 | §1.2 通用约定：`application/json` | ✅ |
| 统一错误格式 `{"error": {"code", "message", "suggestion"}}` | §2.2 错误响应格式完全一致 | ✅ |
| 开发环境 CORS | §四 CORS 配置说明 | ✅ |
| dimensions < 50ms | 内存直接序列化，可满足 | ✅ |
| task-types/engines < 10ms | 配置直接返回，可满足 | ✅ |
| route < 100ms | 关键词匹配 + 展开，可满足 | ✅ |
| generate < 500ms | 内存读取 + 排序组装 + 文本拼接，可满足 | ✅ |
| reload < 2s | 17 个文件重新扫描解析，可满足 | ✅ |

---

## 七、设计决策说明

### 7.1 成功响应不套 wrapper

**决策**：成功时直接返回业务数据，不用 `{code: 0, message: "success", data: {...}}` 格式。

**理由**：
- 60分版本接口简单，HTTP 200 已充分表达成功语义
- 前端消费更直接：`response.data.task_type` vs `response.data.data.task_type`
- RESTful 标准实践
- 错误时有统一 error 结构，正常时不需要冗余的 code/message

### 7.2 route 接口返回 task_type_name

**决策**：route 响应中同时返回 `task_type`（key）和 `task_type_name`（中文名）。

**理由**：前端收到路由结果后需要立即展示任务类型名称。如果只返回 key，前端还需要从 task-types 缓存中查找 name，增加不必要的前端逻辑。冗余一个字段，换取前端消费零转换。

### 7.3 dimensions 响应包含 categories 汇总

**决策**：dimensions 响应体中额外返回 `categories` 汇总数组。

**理由**：前端在维度列表的三列头需要显示每列的数量统计。虽然前端可以从 dimensions 数组中自行计算，但后端顺手汇总一次，前端减少重复计算逻辑。

### 7.4 generate 响应中 stats.dimensions_total

**决策**：生成响应的 stats 中返回 `dimensions_total`（该任务类型全部相关维度数），而不是硬编码 89。

**理由**：覆盖报告的分母应该是"该任务类型有多少相关维度"，而不是"系统总共有多少维度"。不同任务类型的相关维度数不同（原型设计可能只涉及 26 个，产品策划可能涉及 60 个），用总数 89 作为分母会让覆盖率偏低且没有意义。

### 7.5 generate 请求中 priorities 必须覆盖 dimensions

**决策**：要求 `priorities` 对象的 key 集合必须覆盖 `dimensions` 数组的全部 ID。

**理由**：
- 消除歧义：如果某维度在 dimensions 中但不在 priorities 中，后端无法判断默认优先级
- 前端在路由结果返回后已有每个维度的默认优先级，发送时一并传入即可，无额外负担
- 避免后端猜测"缺失优先级的维度该怎么排"的复杂逻辑

### 7.6 POST route 而非 GET route

**决策**：路由接口用 POST 而非 GET。

**理由**：
- 任务描述文本可能很长（中文数百字），GET 的 URL 查询参数有长度限制（浏览器约 2K-8K）
- POST body 无长度限制
- 虽然 route 是无副作用的查询操作，但 HTTP 方法选择应同时考虑实际约束。语义上可视为"向路由引擎提交一个匹配请求"

---

## 八、自检清单

- [x] 6 个接口全部有完整的请求/响应 Schema
- [x] 与体验设计 §九"前端消费数据需求清单"字段完全对齐（§5.1 逐项对照）
- [x] 与技术架构 §六 API 技术规格一致（§六 逐项对照）
- [x] 每个接口都有可直接使用的 Mock JSON 示例
- [x] 错误模型统一且覆盖所有可能的错误场景（§2.3 错误码清单 11 个错误码）
- [x] 前端开发专家看了这份文档可以独立开发（§五 含 TypeScript 类型定义 + API 封装代码）
- [x] 字段命名 snake_case，与内存模型字段语义对齐
- [x] 资源边界清晰——维度、任务类型、引擎是独立查询资源；route 和 generate 是动作资源
- [x] 响应结构便于前端直接消费，无需多步转换
- [x] 接口间依赖关系明确（§1.3 含调用时序说明）
- [x] CORS 配置说明覆盖开发和生产环境

---

*文档版本：v1.0 | 状态：待审核 | 下游交接条件：审核通过后交 后端开发专家 + 前端开发专家 并行实现*
