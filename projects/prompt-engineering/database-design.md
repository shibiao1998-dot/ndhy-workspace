# 内存数据模型设计：提示词工程系统 v1（60分版本）

> 产出者：🗄️ 数据库设计专家 | 产出日期：2026-03-15
> 输入依据：技术架构方案 v1（§3.2-3.5）、产品定义文档 v1
> 下游消费者：⚙️ 后端开发专家、📜 API 设计专家、🖥️ 前端开发专家

---

## 一、设计前提与约束

### 1.1 关键架构决策

| 决策 | 内容 | 影响 |
|------|------|------|
| **无数据库** | ADR-003：60分版本不使用任何数据库 | 所有模型为 Python 内存对象，不生成 DDL |
| **数据源** | `dimensions/` 目录 17 个 Markdown 文件（434KB） | 启动时解析到内存，运行时只读 |
| **无状态** | 产品规则 B1：不存储用户历史 | 无用户实体、无会话实体、无持久化写入 |
| **内存索引** | 启动时构建 `Dict[str, DimensionIndex]`，请求时查内存 | 内存占用 < 10MB |

### 1.2 模型描述约定

- 用 Python 类型标注（Pydantic `BaseModel` 风格）描述所有模型
- 字段命名统一 `snake_case`
- `Optional[X]` 表示可选字段（可为 `None`）
- `Literal[...]` 表示枚举约束
- 所有字符串默认 UTF-8

---

## 二、领域概念模型

### 2.1 实体总览

```
┌──────────────────────────────────────────────────────────┐
│                    配置数据（启动时加载，只读）              │
│                                                          │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐    │
│  │  Dimension   │   │  TaskType   │   │   Engine    │    │
│  │  Index       │   │  Config     │   │   Config    │    │
│  │  (89个)      │   │  (8种)      │   │   (6种)     │    │
│  └──────┬──────┘   └──────┬──────┘   └──────┬──────┘    │
│         │                  │                  │           │
└─────────┼──────────────────┼──────────────────┼───────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌──────────────────────────────────────────────────────────┐
│                 运行时数据（每次请求生成，不持久化）         │
│                                                          │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐    │
│  │   Route      │   │  Generate   │   │  Coverage   │    │
│  │   Result     │   │  Result     │   │  Stats      │    │
│  └─────────────┘   └─────────────┘   └─────────────┘    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 2.2 实体分类

| 类别 | 实体 | 生命周期 | 数量级 |
|------|------|----------|--------|
| **配置数据** | DimensionIndex, DimensionCategory, TaskTypeConfig, EngineConfig | 启动时加载 → 进程存活期间不变 → reload 时整体替换 | 89 + 12 + 8 + 6 |
| **运行时数据** | RouteResult, GenerateRequest, GenerateResult, CoverageStats | 请求开始 → 请求结束 → GC 回收 | 每请求 1 个 |
| **全局状态** | DimensionStore | 进程级单例 | 1 |

### 2.3 实体关系

```
DimensionCategory (1) ──── (N) DimensionIndex
       │
       └── category_id ←── DimensionIndex.category

TaskTypeConfig (1) ──── (N) DimensionIndex   [通过 required/recommended/optional 引用 dimension_id 或 category_id]

EngineConfig (1) ──── (1) AdapterType        [通过 adapter_type 关联]

RouteResult ──→ TaskTypeConfig               [通过 task_type 引用]
RouteResult ──→ DimensionIndex[]             [通过 required/recommended/optional 引用]

GenerateRequest ──→ DimensionIndex[]         [通过 dimensions 引用]
GenerateRequest ──→ EngineConfig             [通过 engine 引用]

GenerateResult ──→ CoverageStats             [包含关系]
GenerateResult ──→ DimensionUsage[]          [包含关系]
```

---

## 三、内存数据模型定义

### 3.1 维度索引（DimensionIndex）

> 对齐技术架构 §3.2 DimensionIndex 定义

```python
class DimensionIndex(BaseModel):
    """单个维度的内存索引对象，由 Markdown 文件解析而来"""

    id: str
    # 维度唯一标识符，格式 "{类别字母}{两位数字}"
    # 示例: "A01", "B12", "E16", "K06"
    # 约束: 正则 ^[A-L]\d{2}$

    name: str
    # 维度名称，从 ## 标题中提取
    # 示例: "战略核心方向", "用户画像真实性", "竞品功能对比矩阵"

    category: str
    # 所属类别字母，从 id 首字母提取
    # 示例: "A", "B", "C"
    # 约束: Literal["A","B","C","D","E","F","G","H","I","J","K","L"]

    category_name: str
    # 类别中文名，从文件级 # 标题提取
    # 示例: "战略与价值观", "用户真实性", "竞品与差异化"

    definition: str
    # 维度定义文本，从 **维度定义**：后提取
    # 示例: "DJ 最近强调的战略重点（不超过 3 个）..."

    quality_role: str
    # 质量作用文本，从 **质量作用**：后提取
    # 示例: "战略对齐刚性检查——设计必须对齐至少 1 个战略重点。"

    content: str
    # ### 具体信息内容 之后的完整 Markdown 文本（组装提示词时使用）
    # 此字段不通过 GET /api/dimensions 返回给前端（434KB 太大）

    char_count: int
    # content 的字符数（len(content)）
    # 示例: 3200, 8500, 12000
    # 用途: 前端预估长度、组装时空间计算

    status: Literal["ready", "partial"]
    # 维度内容状态
    # "ready": 内容完整可用
    # "partial": 内容中含 "⚠️ 待填充" 标记，部分内容未完成
    # 判断规则: content 中包含 "⚠️ 待填充" → "partial"，否则 → "ready"

    summary: str
    # 内容前 200 字摘要（前端预览用）
    # 截取 content 前 200 个字符，如超出则追加 "..."
    # 示例: "#### 战略重点 1：AI 全面融合（"AI+"战略）\n- **DJ 原话**..."

    source_file: str
    # 来源文件名（调试和 reload 用）
    # 示例: "A-strategy-values.md", "B-user-authenticity-1.md"
```

### 3.2 维度类别（DimensionCategory）

```python
class DimensionCategory(BaseModel):
    """维度类别汇总信息，由解析过程聚合生成"""

    id: str
    # 类别字母标识
    # 约束: Literal["A","B","C","D","E","F","G","H","I","J","K","L"]

    name: str
    # 类别中文名
    # 示例: "战略与价值观"

    dimension_count: int
    # 该类别下的维度数量
    # 示例: 8（A类有 A01-A08）

    dimension_ids: list[str]
    # 该类别下所有维度 ID 列表（按编号排序）
    # 示例: ["A01", "A02", "A03", "A04", "A05", "A06", "A07", "A08"]

    total_chars: int
    # 该类别下所有维度 content 的字符总数
    # 示例: 28000

    source_files: list[str]
    # 该类别涉及的源文件列表（一个类别可能跨多个文件，如 B 类有 B-user-authenticity-1.md 和 B-user-authenticity-2.md）
    # 示例: ["B-user-authenticity-1.md", "B-user-authenticity-2.md"]
```

### 3.3 维度存储（DimensionStore）——全局单例

```python
class DimensionStore:
    """内存维度存储，进程级单例，启动时构建，reload 时原子替换"""

    dimensions: dict[str, DimensionIndex]
    # key = dimension_id, value = DimensionIndex 对象
    # 示例: {"A01": DimensionIndex(...), "A02": DimensionIndex(...), ...}
    # 约束: 启动后不可变（reload 时整体替换新 dict，不做原地修改）

    categories: dict[str, DimensionCategory]
    # key = category_id ("A"~"L"), value = DimensionCategory 对象
    # 示例: {"A": DimensionCategory(...), "B": DimensionCategory(...), ...}

    total_dimensions: int
    # 已加载的维度总数
    # 预期值: 89（允许因解析失败略少，产品标准 S4 要求 ≥ 85）

    total_categories: int
    # 已加载的类别总数
    # 预期值: 12

    total_chars: int
    # 所有维度 content 的字符总数
    # 预期值: ~434000（434KB 文件解析后）

    loaded_at: str
    # 最后一次加载的时间戳（ISO 8601 格式）
    # 示例: "2026-03-15T20:30:00+08:00"
    # 用途: reload API 返回、调试

    parse_errors: list[ParseError]
    # 解析过程中的错误记录（非致命，不阻止启动）
    # 用途: reload API 返回、运维排查
```

```python
class ParseError(BaseModel):
    """维度文件解析错误记录"""

    file: str
    # 出错的文件名
    # 示例: "J-domain-knowledge-2.md"

    dimension_id: Optional[str]
    # 出错的维度 ID（如果能识别）
    # 示例: "J07"，如果无法识别则为 None

    error_type: Literal["missing_id", "missing_definition", "missing_content", "format_error", "file_read_error"]
    # 错误类型

    message: str
    # 错误描述
    # 示例: "维度 J07 缺少 **维度定义** 段落"
```

### 3.4 任务类型配置（TaskTypeConfig）

> 对齐技术架构 §3.3 TASK_TYPES 定义 + 产品定义 §附录B 任务类型路由表

```python
class TaskTypeConfig(BaseModel):
    """任务类型配置，硬编码在 config.py 中"""

    key: str
    # 任务类型唯一标识（英文，用于 API 传参）
    # 约束: 正则 ^[a-z_]+$
    # 示例: "core_value", "prototype", "product_planning", "general"

    name: str
    # 任务类型中文名（展示给用户）
    # 示例: "核心价值编写", "原型设计", "产品策划"

    description: str
    # 任务类型简要说明
    # 示例: "围绕产品核心价值进行定义和阐述"

    keywords: list[str]
    # 路由关键词列表（关键词匹配用）
    # 用于 router_engine 的包含检测
    # 示例: ["核心价值", "价值定义", "价值主张"]
    # "general" 类型的 keywords 为空列表 []

    required: list[str]
    # 必须维度引用列表（一级优先级）
    # 元素可以是类别 ID（如 "A"）或具体维度 ID（如 "I01"）
    # 类别引用在路由时展开为该类别全部维度
    # 示例: ["A", "K", "I01"]

    recommended: list[str]
    # 建议维度引用列表（二级优先级）
    # 格式同 required
    # 示例: ["B", "C", "G"]

    optional: list[str]
    # 可选维度引用列表（三级优先级）
    # 格式同 required
    # 示例: ["D", "E", "F"]
```

**完整任务类型配置数据**（对齐产品定义附录 B）：

```python
TASK_TYPES: dict[str, TaskTypeConfig] = {
    "core_value": TaskTypeConfig(
        key="core_value",
        name="核心价值编写",
        description="围绕产品核心价值进行定义、阐述和验证",
        keywords=["核心价值", "价值定义", "价值主张"],
        required=["A", "K", "I01"],
        recommended=["B", "C", "G"],
        optional=["D", "E", "F"],
    ),
    "design_methodology": TaskTypeConfig(
        key="design_methodology",
        name="设计方法论编写",
        description="编写或梳理设计方法论、竞品分析等方法类文档",
        keywords=["设计方法", "方法论", "竞品分析"],
        required=["A", "B", "C", "D", "E", "K", "I03"],
        recommended=["F", "G", "J"],
        optional=["H", "L"],
    ),
    "prototype": TaskTypeConfig(
        key="prototype",
        name="原型设计",
        description="交互原型、界面设计、UI 方案",
        keywords=["原型", "交互", "界面", "UI"],
        required=["E11", "H", "I04"],
        recommended=["G", "D07"],
        optional=["A", "B", "K"],
    ),
    "product_planning": TaskTypeConfig(
        key="product_planning",
        name="产品策划",
        description="产品规划、需求定义、功能策划",
        keywords=["策划", "规划", "需求"],
        required=["A", "B", "C", "D", "K"],
        recommended=["E", "F", "G", "I01", "I02"],
        optional=["J", "L"],
    ),
    "ai_programming": TaskTypeConfig(
        key="ai_programming",
        name="AI 编程",
        description="AI 辅助编程、代码生成、开发任务",
        keywords=["编程", "开发", "代码"],
        required=["A", "D", "F", "K"],
        recommended=["H", "J"],
        optional=["B", "C"],
    ),
    "ai_art": TaskTypeConfig(
        key="ai_art",
        name="AI 美术",
        description="AI 辅助视觉设计、3D 建模、美术创作",
        keywords=["美术", "视觉", "3D"],
        required=["A", "H", "K"],
        recommended=["B", "C", "E11"],
        optional=["G"],
    ),
    "ai_marketing": TaskTypeConfig(
        key="ai_marketing",
        name="AI Marketing",
        description="AI 辅助营销内容创作、市场推广",
        keywords=["营销", "推广", "市场"],
        required=["A", "B", "C", "K"],
        recommended=["D", "G"],
        optional=["E", "F"],
    ),
    "general": TaskTypeConfig(
        key="general",
        name="通用设计任务",
        description="未匹配到特定类型时的回退路由",
        keywords=[],  # 无关键词，作为回退类型
        required=["A", "B", "D", "K"],
        recommended=["C", "E", "F", "G"],
        optional=["H", "I", "J", "L"],
    ),
}
```

### 3.5 引擎配置（EngineConfig）

> 对齐技术架构 §3.5 适配器 + 产品定义 §4.4 引擎适配规则

```python
class EngineConfig(BaseModel):
    """AI 引擎配置，硬编码在 config.py 中"""

    key: str
    # 引擎唯一标识（英文，用于 API 传参）
    # 约束: 正则 ^[a-z0-9_]+$
    # 示例: "claude", "gpt4", "midjourney"

    name: str
    # 引擎显示名称
    # 示例: "Claude", "GPT-4", "Midjourney"

    type: Literal["text", "visual", "audio"]
    # 引擎类型分类
    # "text": 文本型（Claude/GPT/DeepSeek）
    # "visual": 视觉型（Midjourney/DALL-E）
    # "audio": 音频型（Suno）

    max_chars: int
    # 最大字符数限制
    # 示例: 180000 (Claude), 120000 (GPT-4), 60000 (DeepSeek)
    #        4000 (Midjourney/DALL-E), 2000 (Suno)

    adapter_type: Literal["markdown", "keyword", "description"]
    # 适配器类型，对应技术架构 §3.5 的 ADAPTER_MAP
    # "markdown": 文本型引擎，保留完整 Markdown 结构
    # "keyword": 视觉型引擎，提取关键词/风格词
    # "description": 音频型引擎，提取情感/氛围描述

    description: str
    # 引擎用途描述（前端展示用）
    # 示例: "适合长文本结构化方案输出"
```

**完整引擎配置数据**（对齐产品定义 §4.4 + 技术架构 §3.5）：

```python
ENGINES: dict[str, EngineConfig] = {
    "claude": EngineConfig(
        key="claude",
        name="Claude",
        type="text",
        max_chars=180000,
        adapter_type="markdown",
        description="适合长文本结构化方案，支持 180K 字符",
    ),
    "gpt4": EngineConfig(
        key="gpt4",
        name="GPT-4 / GPT-4o",
        type="text",
        max_chars=120000,
        adapter_type="markdown",
        description="适合结构化方案，支持 120K 字符",
    ),
    "deepseek": EngineConfig(
        key="deepseek",
        name="DeepSeek",
        type="text",
        max_chars=60000,
        adapter_type="markdown",
        description="适合精简方案，支持 60K 字符",
    ),
    "midjourney": EngineConfig(
        key="midjourney",
        name="Midjourney",
        type="visual",
        max_chars=4000,
        adapter_type="keyword",
        description="视觉生成，关键词模式，4K 字符",
    ),
    "dall_e": EngineConfig(
        key="dall_e",
        name="DALL-E",
        type="visual",
        max_chars=4000,
        adapter_type="keyword",
        description="视觉生成，关键词模式，4K 字符",
    ),
    "suno": EngineConfig(
        key="suno",
        name="Suno",
        type="audio",
        max_chars=2000,
        adapter_type="description",
        description="音乐生成，情感氛围描述，2K 字符",
    ),
}
```

### 3.6 路由结果（RouteResult）

> 对齐技术架构 §3.3 路由引擎输出 + 产品定义 §4.1 路由规则

```python
class RoutedDimension(BaseModel):
    """路由结果中的单个维度信息（含优先级和元信息）"""

    id: str
    # 维度 ID
    # 示例: "A01"

    name: str
    # 维度名称
    # 示例: "战略核心方向"

    category: str
    # 所属类别字母
    # 示例: "A"

    category_name: str
    # 类别中文名
    # 示例: "战略与价值观"

    priority: Literal[1, 2, 3]
    # 默认优先级
    # 1 = 必须（来自 required）
    # 2 = 建议（来自 recommended）
    # 3 = 可选（来自 optional）

    char_count: int
    # 维度内容字符数
    # 示例: 3200

    status: Literal["ready", "partial"]
    # 维度内容状态
    # "partial" 的维度在前端灰色显示（产品规则 B3）

    summary: str
    # 内容摘要（前 200 字）


class RouteResult(BaseModel):
    """POST /api/route 的响应数据模型"""

    task_type: str
    # 匹配的任务类型 key
    # 示例: "prototype", "general"

    task_type_name: str
    # 任务类型中文名
    # 示例: "原型设计", "通用设计任务"

    confidence: float
    # 匹配置信度，范围 [0.0, 1.0]
    # 计算规则（对齐产品规则 R2）:
    #   - 有关键词命中: max(0.5, 命中数/总关键词数)
    #   - 无命中回退 general: 0.3
    #   - 手动指定: 1.0
    # 示例: 0.67, 0.85, 1.0

    is_manual_override: bool
    # 是否为用户手动指定（产品规则 R3）
    # True: 用户通过 task_type 参数手动指定
    # False: 系统自动匹配

    matched_keywords: list[str]
    # 命中的关键词列表（调试和前端展示用）
    # 示例: ["原型", "交互"]
    # 手动指定时为空列表

    required: list[RoutedDimension]
    # 一级（必须）维度列表
    # 已展开类别引用（"A" → [A01, A02, ..., A08]）
    # 按类别字母序 + 编号排列

    recommended: list[RoutedDimension]
    # 二级（建议）维度列表
    # 已展开类别引用
    # 按类别字母序 + 编号排列

    optional: list[RoutedDimension]
    # 三级（可选）维度列表
    # 已展开类别引用
    # 按类别字母序 + 编号排列

    total_chars: int
    # 全部已路由维度（required + recommended + optional）的 char_count 总和
    # 用于前端预估长度指示器（F12）
    # 示例: 245000
```

### 3.7 生成请求（GenerateRequest）

> 对齐技术架构 §3.4 组装引擎输入 + 产品定义 F8

```python
class GenerateRequest(BaseModel):
    """POST /api/generate 的请求数据模型"""

    task_text: str
    # 用户输入的原始任务描述
    # 示例: "设计一个初中化学虚拟实验的交互方案"
    # 约束: 非空字符串

    engine: str
    # 目标引擎 key（必须是 ENGINES 中的有效 key）
    # 示例: "claude", "midjourney"

    dimensions: list[str]
    # 用户最终确认的维度 ID 列表
    # 示例: ["A01", "A02", "B01", "B03", "K01"]
    # 约束: 每个元素必须是 DimensionStore 中的有效 dimension_id

    priorities: dict[str, int]
    # 用户调整后的优先级映射 {dimension_id: priority}
    # priority 取值: 1（一级）, 2（二级）, 3（三级）
    # 示例: {"A01": 1, "B01": 2, "K01": 1, "C03": 3}
    # 约束: keys 必须是 dimensions 列表的子集
    # 缺失的 dimension 使用路由时的默认优先级
```

### 3.8 生成结果（GenerateResult）

> 对齐技术架构 §3.4 组装引擎输出 + 产品定义 F8/F9/F11

```python
class DimensionUsage(BaseModel):
    """单个维度在生成结果中的使用情况"""

    id: str
    # 维度 ID
    # 示例: "A01"

    name: str
    # 维度名称
    # 示例: "战略核心方向"

    category: str
    # 所属类别
    # 示例: "A"

    priority: Literal[1, 2, 3]
    # 实际使用的优先级（用户调整后的值）
    # 示例: 1

    char_count: int
    # 该维度内容实际占用的字符数
    # 示例: 3200

    included: bool
    # 是否被包含在最终提示词中
    # True: 已包含
    # False: 因长度限制被截断（整维度跳过）

    truncated_reason: Optional[str]
    # 未包含的原因（included=False 时填写）
    # 示例: "引擎字符限制（4000），已用 3800，该维度需 1200"
    # included=True 时为 None


class CoverageStats(BaseModel):
    """维度覆盖统计（产品定义 F11 覆盖报告）"""

    total_available: int
    # 系统可用维度总数（DimensionStore.total_dimensions）
    # 示例: 89

    total_selected: int
    # 用户选择的维度数（GenerateRequest.dimensions 长度）
    # 示例: 23

    total_included: int
    # 实际包含在提示词中的维度数（未被截断的）
    # 示例: 21

    total_truncated: int
    # 因长度限制被截断的维度数
    # 示例: 2

    by_priority: dict[int, int]
    # 按优先级分布 {priority: count}（已包含的维度）
    # 示例: {1: 8, 2: 10, 3: 3}

    by_category: dict[str, int]
    # 按类别分布 {category: count}（已包含的维度）
    # 示例: {"A": 5, "B": 3, "C": 2, "D": 4, ...}

    coverage_rate: float
    # 覆盖率 = total_included / total_selected
    # 范围 [0.0, 1.0]
    # 示例: 0.87

    missing_required: list[str]
    # 缺失的必须维度 ID 列表（required 级别但未被包含）
    # 示例: ["A07", "K05"]（用户取消勾选或被截断的必须维度）
    # 空列表 [] 表示无缺失

    total_chars_used: int
    # 最终提示词的总字符数
    # 示例: 45000

    engine_max_chars: int
    # 目标引擎的最大字符限制
    # 示例: 180000

    char_usage_rate: float
    # 字符使用率 = total_chars_used / engine_max_chars
    # 示例: 0.25


class ConstraintBlock(BaseModel):
    """从维度内容中提取的反向约束"""

    source_dimension_id: str
    # 约束来源的维度 ID
    # 示例: "A02"

    source_dimension_name: str
    # 约束来源的维度名称
    # 示例: "战略红线清单"

    content: str
    # 约束文本内容
    # 示例: "❌ 不能做：从零训练基础大模型"


class GenerateResult(BaseModel):
    """POST /api/generate 的响应数据模型"""

    prompt_text: str
    # 最终生成的提示词文本
    # 已经过引擎适配（Markdown / 关键词 / 描述 格式）

    engine: str
    # 使用的引擎 key
    # 示例: "claude"

    engine_name: str
    # 引擎显示名称
    # 示例: "Claude"

    task_text: str
    # 用户原始任务描述（回传给前端确认一致性）

    dimensions_used: list[DimensionUsage]
    # 每个维度的使用详情

    constraints: list[ConstraintBlock]
    # 提取的反向约束列表（组装规则 A3）

    coverage: CoverageStats
    # 覆盖统计

    warnings: list[str]
    # 警告信息列表
    # 可能的警告:
    #   - "一级维度总字符数（XXX）超过引擎限制（YYY），已全部保留"
    #   - "维度 A07 内容状态为 partial，可能影响输出质量"
    #   - "缺失必须维度：A07, K05"
    # 空列表 [] 表示无警告
```

### 3.9 重新加载结果（ReloadResult）

```python
class ReloadResult(BaseModel):
    """POST /api/reload 的响应数据模型"""

    dimensions_count: int
    # 重新加载后的维度总数
    # 示例: 89

    categories_count: int
    # 重新加载后的类别总数
    # 示例: 12

    total_chars: int
    # 重新加载后的总字符数
    # 示例: 434000

    loaded_at: str
    # 加载时间戳
    # 示例: "2026-03-15T20:30:00+08:00"

    parse_errors: list[ParseError]
    # 解析错误列表（空列表表示无错误）

    changes: Optional[ReloadChanges]
    # 与上次加载相比的变更（如果能检测到）


class ReloadChanges(BaseModel):
    """reload 前后的变更检测（可选功能，v1 可不实现）"""

    added: list[str]
    # 新增的维度 ID
    removed: list[str]
    # 删除的维度 ID
    modified: list[str]
    # 内容变更的维度 ID（通过 char_count 变化检测）
```

---

## 四、字段字典

### 4.1 DimensionIndex 字段字典

| 字段 | 类型 | 必须 | 说明 | 示例值 | 约束 |
|------|------|------|------|--------|------|
| `id` | `str` | ✅ | 维度唯一标识，格式 `{类别字母}{两位数字}` | `"A01"` | 正则 `^[A-L]\d{2}$` |
| `name` | `str` | ✅ | 维度中文名称 | `"战略核心方向"` | 非空 |
| `category` | `str` | ✅ | 所属类别字母 | `"A"` | `A`~`L` 12 个值之一 |
| `category_name` | `str` | ✅ | 类别中文名 | `"战略与价值观"` | 非空 |
| `definition` | `str` | ✅ | 维度定义文本 | `"DJ 最近强调的战略重点..."` | 非空 |
| `quality_role` | `str` | ✅ | 质量作用文本 | `"战略对齐刚性检查..."` | 非空 |
| `content` | `str` | ✅ | 完整 Markdown 内容 | *(长文本)* | 可为空字符串（partial 状态） |
| `char_count` | `int` | ✅ | `content` 字符数 | `3200` | ≥ 0 |
| `status` | `str` | ✅ | 内容状态 | `"ready"` | `"ready"` 或 `"partial"` |
| `summary` | `str` | ✅ | 前 200 字摘要 | `"#### 战略重点 1..."` | 长度 ≤ 203（200 + "..."） |
| `source_file` | `str` | ✅ | 来源文件名 | `"A-strategy-values.md"` | 非空 |

### 4.2 TaskTypeConfig 字段字典

| 字段 | 类型 | 必须 | 说明 | 示例值 | 约束 |
|------|------|------|------|--------|------|
| `key` | `str` | ✅ | 任务类型唯一标识 | `"prototype"` | 正则 `^[a-z_]+$`，8 个预定义值之一 |
| `name` | `str` | ✅ | 中文名称 | `"原型设计"` | 非空 |
| `description` | `str` | ✅ | 简要说明 | `"交互原型、界面设计..."` | 非空 |
| `keywords` | `list[str]` | ✅ | 路由关键词列表 | `["原型", "交互", "界面", "UI"]` | 可为空列表（仅 general 为空） |
| `required` | `list[str]` | ✅ | 必须维度引用 | `["E11", "H", "I04"]` | 元素为类别 ID 或维度 ID |
| `recommended` | `list[str]` | ✅ | 建议维度引用 | `["G", "D07"]` | 同上 |
| `optional` | `list[str]` | ✅ | 可选维度引用 | `["A", "B", "K"]` | 同上 |

### 4.3 EngineConfig 字段字典

| 字段 | 类型 | 必须 | 说明 | 示例值 | 约束 |
|------|------|------|------|--------|------|
| `key` | `str` | ✅ | 引擎唯一标识 | `"claude"` | 正则 `^[a-z0-9_]+$`，6 个预定义值之一 |
| `name` | `str` | ✅ | 显示名称 | `"Claude"` | 非空 |
| `type` | `str` | ✅ | 引擎类型 | `"text"` | `"text"`, `"visual"`, `"audio"` |
| `max_chars` | `int` | ✅ | 最大字符限制 | `180000` | > 0 |
| `adapter_type` | `str` | ✅ | 适配器类型 | `"markdown"` | `"markdown"`, `"keyword"`, `"description"` |
| `description` | `str` | ✅ | 引擎用途描述 | `"适合长文本结构化方案输出"` | 非空 |

### 4.4 RouteResult 字段字典

| 字段 | 类型 | 必须 | 说明 | 示例值 | 约束 |
|------|------|------|------|--------|------|
| `task_type` | `str` | ✅ | 匹配的任务类型 key | `"prototype"` | TASK_TYPES 中的有效 key |
| `task_type_name` | `str` | ✅ | 任务类型中文名 | `"原型设计"` | 非空 |
| `confidence` | `float` | ✅ | 置信度 | `0.85` | [0.0, 1.0] |
| `is_manual_override` | `bool` | ✅ | 是否手动指定 | `false` | — |
| `matched_keywords` | `list[str]` | ✅ | 命中的关键词 | `["原型", "交互"]` | 手动指定时为空列表 |
| `required` | `list[RoutedDimension]` | ✅ | 一级维度列表 | *(对象列表)* | 已展开类别引用 |
| `recommended` | `list[RoutedDimension]` | ✅ | 二级维度列表 | *(对象列表)* | 已展开类别引用 |
| `optional` | `list[RoutedDimension]` | ✅ | 三级维度列表 | *(对象列表)* | 已展开类别引用 |
| `total_chars` | `int` | ✅ | 全部维度的总字符数 | `245000` | ≥ 0 |

### 4.5 GenerateResult 字段字典

| 字段 | 类型 | 必须 | 说明 | 示例值 | 约束 |
|------|------|------|------|--------|------|
| `prompt_text` | `str` | ✅ | 最终提示词文本 | *(长文本)* | 非空 |
| `engine` | `str` | ✅ | 使用的引擎 key | `"claude"` | ENGINES 有效 key |
| `engine_name` | `str` | ✅ | 引擎显示名称 | `"Claude"` | 非空 |
| `task_text` | `str` | ✅ | 原始任务描述 | `"设计一个化学实验..."` | 非空 |
| `dimensions_used` | `list[DimensionUsage]` | ✅ | 维度使用详情 | *(对象列表)* | — |
| `constraints` | `list[ConstraintBlock]` | ✅ | 反向约束列表 | *(对象列表)* | 可为空列表 |
| `coverage` | `CoverageStats` | ✅ | 覆盖统计 | *(对象)* | — |
| `warnings` | `list[str]` | ✅ | 警告信息 | `["缺失必须维度: A07"]` | 可为空列表 |

### 4.6 CoverageStats 字段字典

| 字段 | 类型 | 必须 | 说明 | 示例值 | 约束 |
|------|------|------|------|--------|------|
| `total_available` | `int` | ✅ | 系统可用维度总数 | `89` | > 0 |
| `total_selected` | `int` | ✅ | 用户选择的维度数 | `23` | ≥ 0 |
| `total_included` | `int` | ✅ | 实际包含的维度数 | `21` | ≤ total_selected |
| `total_truncated` | `int` | ✅ | 被截断的维度数 | `2` | = total_selected - total_included |
| `by_priority` | `dict[int, int]` | ✅ | 按优先级分布 | `{1: 8, 2: 10, 3: 3}` | key ∈ {1,2,3} |
| `by_category` | `dict[str, int]` | ✅ | 按类别分布 | `{"A": 5, "B": 3}` | key ∈ A~L |
| `coverage_rate` | `float` | ✅ | 覆盖率 | `0.87` | [0.0, 1.0] |
| `missing_required` | `list[str]` | ✅ | 缺失的必须维度 | `["A07"]` | 可为空列表 |
| `total_chars_used` | `int` | ✅ | 最终提示词字符数 | `45000` | ≥ 0 |
| `engine_max_chars` | `int` | ✅ | 引擎最大字符限制 | `180000` | > 0 |
| `char_usage_rate` | `float` | ✅ | 字符使用率 | `0.25` | [0.0, +∞)（一级维度可超限） |

---

## 五、维度文件解析规范

### 5.1 文件结构概览

```
dimensions/
├── A-strategy-values.md          # A类: 战略与价值观 (A01-A08)
├── B-user-authenticity-1.md      # B类(上): 用户真实性 (B01-B06)
├── B-user-authenticity-2.md      # B类(下): 用户真实性 (B07-B12)
├── C-competitive.md              # C类: 竞品与差异化 (C01-C06)
├── D-scenarios.md                # D类: 场景与需求 (D01-D07)
├── E-design-methods-1.md         # E类(上): 设计方法与技巧 (E01-E08)
├── E-design-methods-2.md         # E类(下): 设计方法与技巧 (E09-E16)
├── F-feasibility.md              # F类: 可行性与资源 (F01-F05)
├── G-history.md                  # G类: 历史经验与案例 (G01-G05)
├── H-standards.md                # H类: 设计标准与规范 (H01-H07)
├── I-quality.md                  # I类: 质量判断与检查 (I01-I08)
├── J01-J02.md                    # J类: 特殊领域知识 (J01-J02)
├── J03-J04.md                    # J类: 特殊领域知识 (J03-J04)
├── J05.md                        # J类: 特殊领域知识 (J05)
├── J-domain-knowledge-2.md       # J类: 特殊领域知识 (J06-J09)
├── K-terminology.md              # K类: 专有名词与定义 (K01-K06)
└── L-lifecycle.md                # L类: 项目全生命周期 (L01-L10)
```

**关键特征**：
- 一个类别可能分布在多个文件中（B 类 2 个文件、E 类 2 个文件、J 类 4 个文件）
- 每个文件只包含一个类别的维度
- 文件总数：17

### 5.2 Markdown 结构模式

每个维度文件遵循以下结构模式：

```markdown
# {类别字母}类：{类别中文名}维度          ← 文件级标题（提取 category_name）

> 填充日期：... | 填充人：...              ← 元信息（忽略）
> ...

---

## {ID} {维度名称}                         ← 维度标题（提取 id + name）

**维度定义**：{定义文本}                   ← 提取 definition

**质量作用**：{作用文本}                   ← 提取 quality_role

### 具体信息内容                            ← 内容分隔标记

{维度的完整 Markdown 内容}                 ← 提取 content（从这里到下一个 ## 或文件末尾）

---                                         ← 维度间分隔符（可选）

## {ID} {下一个维度名称}
...
```

### 5.3 解析算法（伪代码）

```python
def parse_dimension_file(file_path: str) -> list[DimensionIndex]:
    """解析单个维度文件，返回该文件中所有维度的索引对象"""

    text = read_file(file_path)
    file_name = basename(file_path)
    results = []

    # Step 1: 提取文件级标题中的类别名
    # 匹配模式: # {X}类：{类别名}维度  或  # {X}类：{类别名}
    file_title_match = re.search(r'^# ([A-L])类[：:]\s*(.+?)(?:维度)?\s*$', text, re.MULTILINE)
    if not file_title_match:
        record_error(file_name, None, "format_error", "无法从文件标题提取类别信息")
        return []
    category = file_title_match.group(1)          # "A"
    category_name = file_title_match.group(2).strip()  # "战略与价值观"

    # Step 2: 按 ## 标题分割出每个维度段落
    # 分割模式: 以 ## 开头的行（不匹配 ### 及更深层级）
    sections = re.split(r'^(?=## (?!#))', text, flags=re.MULTILINE)

    for section in sections:
        if not section.strip():
            continue

        # Step 3: 提取维度 ID 和名称
        # 匹配模式: ## {ID} {名称}
        # ID 格式: 字母 + 两位数字（如 A01, B12, E16）
        id_match = re.match(r'^## ([A-L]\d{2})\s+(.+?)\s*$', section, re.MULTILINE)
        if not id_match:
            continue  # 跳过非维度段落（如文件头部内容）
        dim_id = id_match.group(1)    # "A01"
        dim_name = id_match.group(2)  # "战略核心方向"

        # Step 4: 提取维度定义
        # 匹配模式: **维度定义**：{文本}  （到行尾或到下一个 ** 标记）
        def_match = re.search(r'\*\*维度定义\*\*[：:]\s*(.+?)(?=\n\n|\n\*\*|$)', section, re.DOTALL)
        definition = def_match.group(1).strip() if def_match else ""
        if not definition:
            record_error(file_name, dim_id, "missing_definition", f"维度 {dim_id} 缺少维度定义")

        # Step 5: 提取质量作用
        # 匹配模式: **质量作用**：{文本}
        qr_match = re.search(r'\*\*质量作用\*\*[：:]\s*(.+?)(?=\n\n|\n\*\*|\n###|$)', section, re.DOTALL)
        quality_role = qr_match.group(1).strip() if qr_match else ""

        # Step 6: 提取具体内容
        # 匹配模式: ### 具体信息内容 之后的所有内容
        content_match = re.search(r'### 具体信息内容\s*\n(.*)', section, re.DOTALL)
        content = content_match.group(1).strip() if content_match else ""
        if not content:
            record_error(file_name, dim_id, "missing_content", f"维度 {dim_id} 缺少具体信息内容")

        # Step 7: 判断状态
        status = "partial" if "⚠️ 待填充" in content else "ready"

        # Step 8: 生成摘要
        summary = content[:200] + ("..." if len(content) > 200 else "")

        results.append(DimensionIndex(
            id=dim_id,
            name=dim_name,
            category=category,
            category_name=category_name,
            definition=definition,
            quality_role=quality_role,
            content=content,
            char_count=len(content),
            status=status,
            summary=summary,
            source_file=file_name,
        ))

    return results


def build_dimension_store(dimensions_dir: str) -> DimensionStore:
    """扫描维度目录，构建全局维度存储"""

    all_dimensions: dict[str, DimensionIndex] = {}
    all_errors: list[ParseError] = []

    # 扫描目录下所有 .md 文件
    for file_path in sorted(glob(f"{dimensions_dir}/*.md")):
        try:
            dims = parse_dimension_file(file_path)
            for dim in dims:
                if dim.id in all_dimensions:
                    all_errors.append(ParseError(
                        file=basename(file_path),
                        dimension_id=dim.id,
                        error_type="format_error",
                        message=f"维度 {dim.id} 重复（已在 {all_dimensions[dim.id].source_file} 中存在）",
                    ))
                    continue  # 保留首次出现的
                all_dimensions[dim.id] = dim
        except Exception as e:
            all_errors.append(ParseError(
                file=basename(file_path),
                dimension_id=None,
                error_type="file_read_error",
                message=str(e),
            ))

    # 聚合类别信息
    categories: dict[str, DimensionCategory] = {}
    for dim in all_dimensions.values():
        cat_id = dim.category
        if cat_id not in categories:
            categories[cat_id] = DimensionCategory(
                id=cat_id,
                name=dim.category_name,
                dimension_count=0,
                dimension_ids=[],
                total_chars=0,
                source_files=[],
            )
        cat = categories[cat_id]
        cat.dimension_count += 1
        cat.dimension_ids.append(dim.id)
        cat.total_chars += dim.char_count
        if dim.source_file not in cat.source_files:
            cat.source_files.append(dim.source_file)

    # 对 dimension_ids 排序
    for cat in categories.values():
        cat.dimension_ids.sort()

    return DimensionStore(
        dimensions=all_dimensions,
        categories=categories,
        total_dimensions=len(all_dimensions),
        total_categories=len(categories),
        total_chars=sum(d.char_count for d in all_dimensions.values()),
        loaded_at=datetime.now(timezone.utc).isoformat(),
        parse_errors=all_errors,
    )
```

### 5.4 解析边界条件

| 条件 | 处理方式 |
|------|----------|
| 文件无法读取（权限/编码问题） | 记录 `file_read_error`，跳过该文件，不阻止启动 |
| `##` 标题缺少 ID（如 `## 补充说明`） | 跳过该段落，不记录错误（允许文件包含非维度段落） |
| ID 重复（跨文件出现相同 ID） | 保留首次出现的，记录 `format_error` |
| 缺少 `**维度定义**` | 记录 `missing_definition`，`definition` 置空字符串 |
| 缺少 `### 具体信息内容` | 记录 `missing_content`，`content` 置空字符串，`char_count` = 0 |
| 内容中含 `⚠️ 待填充` | `status` = `"partial"`，维度正常加载（产品规则 B3） |
| 文件级标题格式不匹配 | 记录 `format_error`，跳过整个文件 |

### 5.5 类别 ID 到类别名映射（验证用常量）

```python
CATEGORY_NAMES: dict[str, str] = {
    "A": "战略与价值观",
    "B": "用户真实性",
    "C": "竞品与差异化",
    "D": "场景与需求",
    "E": "设计方法与技巧",
    "F": "可行性与资源",
    "G": "历史经验与案例",
    "H": "设计标准与规范",
    "I": "质量判断与检查",
    "J": "特殊领域知识",
    "K": "专有名词与定义",
    "L": "项目全生命周期",
}
```

### 5.6 各类别预期维度数量（验证用常量）

```python
EXPECTED_DIMENSION_COUNTS: dict[str, int] = {
    "A": 8,   # A01-A08
    "B": 12,  # B01-B12
    "C": 6,   # C01-C06
    "D": 7,   # D01-D07
    "E": 16,  # E01-E16
    "F": 5,   # F01-F05
    "G": 5,   # G01-G05
    "H": 7,   # H01-H07
    "I": 8,   # I01-I08
    "J": 9,   # J01-J09 (分布在4个文件)
    "K": 6,   # K01-K06
    "L": 10,  # L01-L10 (产品定义附录A写10, 技术架构提89总数)
}
# 合计: 8+12+6+7+16+5+5+7+8+9+6+10 = 99 (飞书文档约99个，实际解析出89个为准)
# 注意：产品定义写89个维度，如有差异以实际解析结果为准
```

---

## 六、引用展开规则

### 6.1 类别引用展开

`TaskTypeConfig` 的 `required/recommended/optional` 列表中的元素可以是：
- **类别引用**：单个字母（如 `"A"`）→ 展开为该类别所有维度
- **具体维度**：字母+数字（如 `"I01"`）→ 直接使用

```python
def expand_dimension_refs(
    refs: list[str],
    store: DimensionStore,
) -> list[str]:
    """
    将维度引用列表展开为具体维度 ID 列表

    Args:
        refs: 引用列表，元素可以是类别 ID ("A") 或维度 ID ("A01")
        store: 全局维度存储

    Returns:
        展开后的维度 ID 列表（去重，按字母+数字排序）

    示例:
        expand_dimension_refs(["A", "K", "I01"], store)
        → ["A01","A02",...,"A08","I01","K01",...,"K06"]
    """
    result: set[str] = set()
    for ref in refs:
        if len(ref) == 1 and ref in store.categories:
            # 类别引用：展开为该类别全部维度
            result.update(store.categories[ref].dimension_ids)
        elif ref in store.dimensions:
            # 具体维度引用
            result.add(ref)
        else:
            # 无效引用（配置错误），记录警告但不阻止
            pass
    return sorted(result)
```

### 6.2 展开后去重规则

- 同一维度可能在 `required` 和 `recommended` 中都被引用（如 `required=["A"]` 和 `recommended=["A01"]`）
- **优先级冲突解决**：同一维度出现在多个级别时，取最高优先级（数字最小）
  - `required` > `recommended` > `optional`
  - 即 `1` > `2` > `3`

---

## 七、前端消费的数据子集

> API 设计专家参考：前端不需要所有字段，以下是各接口的前端消费视图

### 7.1 GET /api/dimensions 响应（维度索引列表）

```python
class DimensionListItem(BaseModel):
    """前端消费的维度列表项（不含 content 全文）"""

    id: str
    name: str
    category: str
    category_name: str
    char_count: int
    status: Literal["ready", "partial"]
    summary: str
    # 注意：不包含 content、definition、quality_role、source_file
    # content 只在后端组装时使用，不传给前端（434KB 太大）
```

### 7.2 GET /api/task-types 响应

```python
class TaskTypeListItem(BaseModel):
    """前端消费的任务类型列表项"""

    key: str
    name: str
    description: str
    # 不包含 keywords、required、recommended、optional（路由逻辑在后端）
```

### 7.3 GET /api/engines 响应

```python
class EngineListItem(BaseModel):
    """前端消费的引擎列表项"""

    key: str
    name: str
    type: Literal["text", "visual", "audio"]
    max_chars: int
    description: str
    # 不包含 adapter_type（适配逻辑在后端）
```

---

## 八、80分演进预留（v2 SQLite 映射）

### 8.1 会引入持久化的场景

| v2 特性 | 需要持久化的数据 | 建议的表 |
|---------|----------------|----------|
| X2 历史记录 | 每次生成的请求和结果 | `generation_history` |
| X1 用户账户 | 用户身份和偏好 | `users` |
| X7 质量评分 | 提示词评分记录 | `quality_scores` |
| X8 提示词模板 | 用户自定义模板 | `prompt_templates` |
| X5 维度内容编辑 | 维度修改记录 | `dimension_edits` |

### 8.2 模型 → 表映射预案

| v1 内存模型 | v2 是否建表 | 映射说明 |
|-------------|-------------|----------|
| `DimensionIndex` | ⚠️ 可选 | 维度仍可从文件加载。如建表则用于存储维度元信息+内容，支持在线编辑（X5）。表名: `dimensions` |
| `DimensionCategory` | ❌ 不建 | 聚合数据，由查询生成 |
| `DimensionStore` | ❌ 不建 | 运行时状态，非持久化 |
| `TaskTypeConfig` | ⚠️ 可选 | 如支持自定义路由规则，建表 `task_types`。否则继续 config.py |
| `EngineConfig` | ⚠️ 可选 | 如支持动态引擎管理，建表 `engines`。否则继续 config.py |
| `RouteResult` | ❌ 不建 | 临时计算结果，不持久化 |
| `GenerateRequest` | ✅ 建表 | 历史记录核心。表名: `generation_history`，含 task_text、engine、dimensions（JSON）、priorities（JSON） |
| `GenerateResult` | ✅ 建表 | 与 GenerateRequest 合并或一对一关联。存 prompt_text + coverage（JSON） |
| `CoverageStats` | ❌ 不建 | 作为 GenerateResult 的 JSON 字段存储 |

### 8.3 v2 新增表预案

```python
# v2 新增：生成历史记录表
class GenerationHistory(BaseModel):
    """v2 SQLite 表: generation_history"""
    id: int                    # 自增主键
    task_text: str             # 任务描述
    task_type: str             # 匹配的任务类型
    engine: str                # 使用的引擎
    dimensions: str            # JSON: ["A01","B03",...]
    priorities: str            # JSON: {"A01":1,"B03":2,...}
    prompt_text: str           # 生成的提示词
    coverage_rate: float       # 覆盖率
    total_chars: int           # 总字符数
    created_at: str            # ISO 8601 时间戳
    # user_id: Optional[int]  # v2+ 如引入用户体系

# v2 新增：用户表（如引入用户体系）
class User(BaseModel):
    """v2+ SQLite 表: users"""
    id: int                    # 自增主键
    name: str                  # 用户名
    team: str                  # 所属团队（"设计"/"策划"）
    created_at: str
    last_active_at: str
```

### 8.4 迁移路径

```
v1（当前）                    v2（80分）
─────────────────────────────────────────
config.py 硬编码    ──→    可选迁移到 SQLite
dimensions/*.md     ──→    仍为主数据源（兼容）
内存 DimensionStore ──→    保留（增加 SQLite 缓存层）
无历史记录          ──→    generation_history 表
无用户体系          ──→    可选 users 表
```

**迁移原则**：v2 增量添加 SQLite 层，不改变 v1 的内存模型结构。v1 的所有模型字段在 v2 中语义不变，只是增加了持久化存储。

---

## 九、自检清单

- [x] 所有实体字段定义完整（类型、必须/可选、说明、示例）
- [x] 与技术架构 §3.2（DimensionIndex）完全对齐——字段一一对应，新增 `source_file` 便于调试
- [x] 与技术架构 §3.3（TASK_TYPES）完全对齐——结构和示例数据一致
- [x] 与技术架构 §3.4（组装引擎输入输出）完全对齐——GenerateRequest/GenerateResult 覆盖所有字段
- [x] 与技术架构 §3.5（适配器/引擎配置）完全对齐——EngineConfig 包含 adapter_type 映射
- [x] 字段命名清晰一致（全部 snake_case）
- [x] 维度文件解析规范明确——伪代码可直接实现，边界条件全覆盖
- [x] 配置数据覆盖全部 8 种任务类型（含完整 keywords/required/recommended/optional）
- [x] 配置数据覆盖全部 6 种引擎（含 max_chars/adapter_type）
- [x] 字段语义自洽，与 API 设计可对齐（前端消费视图已独立定义）
- [x] 80分演进预留——标注了哪些模型映射为表、新增表预案、迁移路径
- [x] 解析规范含验证常量（类别名映射、预期维度数量）
- [x] 引用展开规则和优先级冲突解决规则明确

---

*文档版本：v1.0 | 状态：待 Leader 审核 | 下游交接条件：后端开发专家可直接基于本文档实现 models/ 目录和 dimension_loader.py*
