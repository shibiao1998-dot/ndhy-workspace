# 技术架构方案：提示词工程系统 v1（60分版本）

> 产出者：🏛️ 技术架构专家 | 产出日期：2026-03-15
> 输入依据：产品定义文档 v1、执行流程 Phase 2.2、维度内容文件结构
> 下游消费者：🗄️ 数据库设计专家、📜 API 设计专家、⚙️ 后端开发专家、🖥️ 前端开发专家

---

## 一、系统分层

```
┌────────────────────────────────────────────────┐
│                   前端层                         │
│         React SPA（Vite 构建）                   │
│   输入区 · 维度配置区 · 输出区 · 覆盖报告        │
├────────────────────────────────────────────────┤
│                 后端 API 层                      │
│            FastAPI（Python 3.11+）               │
│  路由引擎 · 组装引擎 · 适配器 · 维度加载器       │
├────────────────────────────────────────────────┤
│                   数据层                         │
│     dimensions/ Markdown 文件（只读数据源）       │
│         内存索引（启动时构建，运行时查询）         │
└────────────────────────────────────────────────┘
```

### 分层职责

| 层 | 职责 | 不做什么 |
|----|------|----------|
| **前端** | 用户交互、状态管理（维度勾选/优先级/引擎选择）、结果展示、一键复制 | 不做维度路由计算、不做提示词组装、不做维度内容解析 |
| **后端** | 维度文件解析与索引、任务路由、提示词组装、引擎适配、覆盖统计 | 不做用户状态持久化、不做身份认证 |
| **数据层** | 维度内容存储（Markdown 文件即数据源）、内存索引提供快速查询 | 不用数据库、不做持久化写入 |

---

## 二、技术选型

### 2.1 后端：Python 3.11+ / FastAPI

| 维度 | 选型 | 理由 |
|------|------|------|
| **语言** | Python 3.11+ | 维度文件是 Markdown，Python 生态的文本处理能力最强；团队可快速维护 |
| **框架** | FastAPI | ① 原生 async 支持，单线程即可处理并发请求 ② 自动生成 OpenAPI 文档，前端可直接消费 ③ Pydantic 模型验证，接口契约即代码 ④ 轻量，核心依赖仅 `uvicorn` + `pydantic` |
| **运行时** | Uvicorn | ASGI 服务器，生产可用，单进程即满足内网场景 |

**排除方案**：
- Flask：无原生 async、无自动 OpenAPI，60分场景下 FastAPI 优势明显
- Django：过重，MVC 全家桶不适合 API-only 服务
- Node.js/Go：需要重写全部维度解析逻辑，违背复用原则

### 2.2 前端：React + Vite + TypeScript

| 维度 | 选型 | 理由 |
|------|------|------|
| **框架** | React 18 | ① 组件化架构天然匹配三区域布局（输入/配置/输出） ② 生态最成熟，UI 组件库选择丰富 ③ 单向数据流，维度状态管理清晰 |
| **构建** | Vite | 开发热更新 < 200ms，生产构建输出纯静态文件，FastAPI 可直接托管 |
| **语言** | TypeScript | API 响应类型安全，维度/引擎等结构化数据不会打错字段名 |
| **UI 组件** | Ant Design 5 | ① 中文友好 ② Checkbox/Tag/Select/Progress 等组件直接覆盖 F4-F12 全部 UI 需求 ③ 零定制即可达到60分体验 |
| **状态管理** | React 内置（useState + useReducer） | 60分版本状态简单（维度列表+勾选+优先级+引擎+结果），不需要 Redux/Zustand |

**排除方案**：
- Streamlit/Gradio：看似快速但 ① 无法实现维度勾选/拖拽等精细交互 ② 部署是 Python 进程不是静态文件 ③ 定制能力极弱，60分后向80分演进困难
- Vue：能力等价，但 React + Ant Design 在中文企业级工具场景的实践更多

### 2.3 数据库：不需要

| 决策 | 理由 |
|------|------|
| **不使用任何数据库** | ① 产品规则 B1 明确"无状态"——不存历史记录 ② 维度数据来源是 Markdown 文件，运行时解析到内存即可 ③ 60分版本唯一的数据源是 `dimensions/` 目录下的 17 个 Markdown 文件 ④ 省去数据库部署和运维复杂度 |
| **内存索引替代数据库** | 启动时扫描解析维度文件，构建内存中的维度索引（dict/list），请求时直接查内存。434KB 文件解析后内存占用 < 10MB，热加载仅需重新扫描目录 |

### 2.4 部署：Docker 单容器

| 维度 | 选型 | 理由 |
|------|------|------|
| **容器化** | Docker 单容器 | 前端静态文件由 FastAPI 直接 serve（`StaticFiles`），无需 Nginx。一个端口、一个进程、一条命令启动 |
| **基础镜像** | `python:3.11-slim` | 体积 < 150MB，包含 Python 运行时，足够 |
| **端口** | 8080 | 内网访问，单端口 |
| **编排** | 无需 | 单容器不需要 docker-compose / k8s |

---

## 三、核心模块设计

### 3.1 系统模块总览

```
prompt-engineering-system/
├── backend/                    # 后端
│   ├── app/
│   │   ├── main.py             # FastAPI 入口 + 静态文件挂载
│   │   ├── routers/            # API 路由层
│   │   │   ├── dimensions.py   # GET /api/dimensions
│   │   │   ├── task_types.py   # GET /api/task-types
│   │   │   ├── engines.py      # GET /api/engines
│   │   │   ├── route.py        # POST /api/route
│   │   │   ├── generate.py     # POST /api/generate
│   │   │   └── reload.py       # POST /api/reload
│   │   ├── core/               # 核心业务逻辑
│   │   │   ├── dimension_loader.py   # 维度加载器
│   │   │   ├── router_engine.py      # 路由引擎
│   │   │   ├── assembler.py          # 组装引擎
│   │   │   └── adapter.py            # 引擎适配器
│   │   ├── models/             # Pydantic 数据模型
│   │   │   ├── dimension.py
│   │   │   ├── task_type.py
│   │   │   ├── engine.py
│   │   │   └── prompt.py
│   │   └── config.py           # 配置（路由表、引擎列表、优先级默认值）
│   ├── dimensions/             # 维度内容文件（挂载/复制进容器）
│   ├── requirements.txt        # fastapi, uvicorn, pydantic
│   └── tests/
├── frontend/                   # 前端
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/         # UI 组件
│   │   │   ├── TaskInput.tsx           # 任务输入区
│   │   │   ├── RouteResult.tsx         # 路由匹配结果
│   │   │   ├── DimensionPanel.tsx      # 维度配置面板
│   │   │   ├── EngineSelector.tsx      # 引擎选择
│   │   │   ├── LengthIndicator.tsx     # 预估长度指示器
│   │   │   ├── PromptOutput.tsx        # 提示词输出区
│   │   │   └── CoverageReport.tsx      # 覆盖报告
│   │   ├── api/                # API 调用封装
│   │   │   └── client.ts
│   │   ├── types/              # TypeScript 类型（与后端 Pydantic 模型对齐）
│   │   │   └── index.ts
│   │   └── hooks/              # 自定义 Hooks
│   │       └── usePromptEngine.ts  # 核心状态管理 Hook
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── Dockerfile
└── README.md
```

### 3.2 维度加载器（dimension_loader.py）

**职责**：扫描 `dimensions/` 目录，解析 Markdown 结构，构建内存索引。

**解析规则**（基于维度文件实际格式分析）：

```python
# 维度文件格式规律（以 A-strategy-values.md 为例）：
# - 文件级标题：# A类：战略与价值观维度
# - 维度标题：  ## A01 战略核心方向
# - 维度定义：  **维度定义**：xxx
# - 质量作用：  **质量作用**：xxx
# - 具体内容：  ### 具体信息内容 之后的所有内容
# - 待填充标记：⚠️ 待填充

class DimensionIndex:
    """内存维度索引"""
    id: str              # "A01"
    name: str            # "战略核心方向"
    category: str        # "A"
    category_name: str   # "战略与价值观"
    definition: str      # 维度定义文本
    quality_role: str    # 质量作用文本
    char_count: int      # 具体内容的字符数
    content: str         # 完整具体内容（组装时使用）
    status: str          # "ready" | "partial"（含 ⚠️ 待填充）
    summary: str         # 前 200 字摘要（前端预览用）
```

**解析流程**：

```
启动 / reload 触发
  ↓
扫描 dimensions/*.md（17 个文件）
  ↓
逐文件按 ## 标题分割出每个维度
  ↓
提取 ID（如 A01）、名称、定义、质量作用、内容
  ↓
计算 char_count、生成 summary、检测 ⚠️ 标记
  ↓
构建 Dict[str, DimensionIndex]（key = dimension_id）
  ↓
存入全局变量（模块级单例）
```

**关键设计决策**：
- **纯正则/字符串解析，不引入 Markdown 库**。维度文件结构规律且可控（我们自己维护），用 `re.split(r'^## ', content, flags=re.MULTILINE)` 即可按维度分割。外部 Markdown 解析库引入 AST 层级，对简单提取反而更复杂。
- **全量加载到内存**。434KB → 解析后 < 10MB 内存，对比每次请求读文件 I/O，内存缓存收益巨大。
- **热加载**：`POST /api/reload` 触发重新扫描，原子替换全局索引。

### 3.3 路由引擎（router_engine.py）

**职责**：接收任务描述文本，匹配任务类型，返回分级维度列表。

**数据结构**：

```python
# 路由配置（写在 config.py）
TASK_TYPES = {
    "core_value": {
        "name": "核心价值编写",
        "keywords": ["核心价值", "价值定义", "价值主张"],
        "required": ["A", "K", "I01"],     # 必须维度（类别或具体ID）
        "recommended": ["B", "C", "G"],     # 建议维度
        "optional": ["D", "E", "F"],        # 可选维度
    },
    "prototype": {
        "name": "原型设计",
        "keywords": ["原型", "交互", "界面", "UI"],
        "required": ["E11", "H", "I04"],
        "recommended": ["G", "D07"],
        "optional": ["A", "B", "K"],
    },
    # ... 共 8 种任务类型
    "general": {
        "name": "通用设计任务",
        "keywords": [],  # 回退类型，无关键词
        "required": ["A", "B", "D", "K"],
        "recommended": ["C", "E", "F", "G"],
        "optional": ["H", "I", "J", "L"],
    },
}
```

**匹配算法**：

```
输入：task_text（用户输入的任务描述）
  ↓
对每个 task_type，计算 score = 命中关键词数
  ↓
取 score 最高的 task_type（并列取第一个）
  ↓
confidence = 命中数 / 该类型总关键词数
  ↓
if 最高 score == 0 → 回退 "general"（confidence = 0.3）
if 最高 score > 0 → confidence = max(0.5, 命中数/总关键词数)
  ↓
根据 task_type 的 required/recommended/optional 配置
  ↓
展开类别引用（"A" → ["A01","A02",...,"A08"]）
  ↓
输出：task_type, confidence, required[], recommended[], optional[], total_chars
```

**关键设计决策**：
- **关键词匹配用 `in` 包含检测，不用分词**。60分版本优先可用，中文分词引入外部依赖（jieba）且收益不明显——关键词本身已是完整短语。
- **类别引用自动展开**。配置中写 `"A"` 表示 A 类全部维度，写 `"A01"` 表示单个维度。展开逻辑查内存索引。
- **手动覆盖**：前端传入 `task_type` 参数时跳过匹配，直接用指定类型路由，confidence = 1.0。

### 3.4 组装引擎（assembler.py）

**职责**：接收维度列表、优先级映射、引擎配置，按规则组装提示词文本。

**组装流程**：

```
输入：
  - dimensions: List[str]          # 用户最终确认的维度 ID 列表
  - priorities: Dict[str, int]     # {dimension_id: 1|2|3}（用户调整后的优先级）
  - engine_config: EngineConfig    # 引擎名称 + 最大字符数 + 输出格式
  - task_text: str                 # 原始任务描述
  ↓
Step 1: 获取维度内容
  从内存索引中提取每个 dimension_id 的完整内容
  ↓
Step 2: 按优先级分组排序
  一级（priority=1）→ 按类别字母序排列
  二级（priority=2）→ 按 char_count 从小到大排列（空间紧张时优先放小维度）
  三级（priority=3）→ 按 char_count 从小到大排列
  ↓
Step 3: 长度控制（整维度不拆分）
  累计字符数，达到 engine.max_chars 时停止
  先填满全部一级 → 剩余空间填二级 → 再填三级
  如果一级维度总字符数已超限 → 仍全部保留（一级不截断，记录超限警告）
  ↓
Step 4: 提取反向约束
  扫描已选维度内容，提取 ❌ / "不要" / "禁止" / "红线" 标记的段落
  独立汇总为"约束与禁忌"段
  ↓
Step 5: 组装最终文本
  结构：系统指令头 + 任务描述 + 一级维度 + 二级维度 + 三级维度 + 约束与禁忌
  ↓
Step 6: 引擎适配（调用 adapter）
  ↓
输出：prompt_text + stats（已用维度数、总字符数、覆盖率、被截断维度列表）
```

**系统指令头模板**：

```
你是一名专业的 {task_type_name}。以下是你执行任务时必须参考的关键信息维度，
按重要性从高到低排列。请基于这些信息完成用户的任务。

【用户任务】
{task_text}

【关键信息维度】
```

**关键设计决策**：
- **维度整体性原则（规则 A4）**：单个维度要么完整包含要么完全跳过，绝不做维度内部截断。这保证信息完整性，也简化组装逻辑。
- **一级维度不截断**：即使总字符数超过引擎限制，一级维度仍全部保留。实际场景中一级维度通常 4-8 个，总字符数远低于最大引擎限制（180K）。
- **反向约束独立段**：反向约束不混在正向内容中，避免 AI "注意力稀释"。

### 3.5 引擎适配器（adapter.py）

**职责**：将组装好的提示词文本转换为目标引擎的最优格式。

**适配策略矩阵**：

| 引擎类型 | 格式策略 | 最大字符 | 转换逻辑 |
|----------|----------|----------|----------|
| **文本型**（Claude/GPT/DeepSeek） | 结构化 Markdown | 180K/120K/60K | 保留原始 Markdown 层级、代码块、列表 |
| **视觉型**（Midjourney/DALL-E） | 精简关键词 | 4K | 提取关键名词/形容词/风格词，去掉说明性文字，逗号分隔 |
| **音频型**（Suno） | 简洁描述 | 2K | 提取情感词/氛围词/节奏描述，去掉技术细节 |

**适配器实现**：

```python
class BaseAdapter:
    """适配器基类"""
    def adapt(self, raw_prompt: str, engine: EngineConfig) -> str:
        raise NotImplementedError

class MarkdownAdapter(BaseAdapter):
    """文本型引擎：Claude / GPT / DeepSeek"""
    def adapt(self, raw_prompt: str, engine: EngineConfig) -> str:
        # 保留完整 Markdown 结构
        # 如果超过 max_chars，在维度边界处截断（不拆维度）
        return truncate_at_dimension_boundary(raw_prompt, engine.max_chars)

class KeywordAdapter(BaseAdapter):
    """视觉型引擎：Midjourney / DALL-E"""
    def adapt(self, raw_prompt: str, engine: EngineConfig) -> str:
        # 1. 从维度内容中提取关键词（名词、形容词、风格描述）
        # 2. 去掉所有长句和说明性段落
        # 3. 用逗号连接，控制在 max_chars 以内
        return extract_keywords(raw_prompt, engine.max_chars)

class DescriptionAdapter(BaseAdapter):
    """音频型引擎：Suno"""
    def adapt(self, raw_prompt: str, engine: EngineConfig) -> str:
        # 1. 提取情感、氛围、节奏相关描述
        # 2. 精简为短句
        # 3. 控制在 max_chars 以内
        return extract_description(raw_prompt, engine.max_chars)

# 引擎 → 适配器映射
ADAPTER_MAP = {
    "claude": MarkdownAdapter(),
    "gpt4": MarkdownAdapter(),
    "deepseek": MarkdownAdapter(),
    "midjourney": KeywordAdapter(),
    "dall_e": KeywordAdapter(),
    "suno": DescriptionAdapter(),
}
```

**关键设计决策**：
- **适配器模式**：新增引擎只需实现 `BaseAdapter`，注册到 `ADAPTER_MAP`，零改动已有代码。
- **视觉/音频适配器的关键词提取**：60分版本用正则提取（匹配中文名词/形容词模式 + 英文关键词），不引入 NLP 库。准确度够用，v2 可升级为 LLM 提取。

---

## 四、模块边界

### 4.1 前后端职责分界

| 逻辑 | 位于 | 理由 |
|------|------|------|
| 维度文件解析 | **后端** | 文件 I/O + 文本解析，前端做不了 |
| 任务类型路由（关键词匹配） | **后端** | 路由配置和算法统一管理，避免前端同步配置 |
| 维度优先级默认值 | **后端** | 路由接口返回默认优先级，前端不需要知道路由规则 |
| 维度勾选/取消 | **前端** | 纯 UI 交互，本地 state 管理 |
| 维度优先级调整 | **前端** | 纯 UI 交互，生成时发送最终映射到后端 |
| 引擎选择 | **前端** | 下拉选择，值传给后端生成接口 |
| 预估长度计算 | **前端** | 基于后端返回的 char_count 做本地累加，实时响应无需请求 |
| 提示词组装 | **后端** | 核心业务逻辑，涉及完整维度内容读取和排序 |
| 引擎适配 | **后端** | 适配策略可能复杂（关键词提取），后端统一处理 |
| 覆盖率统计 | **后端** | 生成时顺带计算，随结果一起返回 |
| 一键复制 | **前端** | Clipboard API，纯浏览器能力 |
| 结果展示 | **前端** | 只读文本渲染 |

### 4.2 模块间数据流

```
                         ┌────────── 前端 ──────────┐
                         │                          │
用户输入任务 ──→ POST /api/route ──→ 路由引擎      │
                         │    ↓                     │
              ←── 返回匹配结果 + 分级维度列表 ──←   │
                         │                          │
用户调整维度/优先级（本地 state）                    │
                         │                          │
用户点击生成 ──→ POST /api/generate ──→ 组装引擎 → 适配器
                         │    ↓                     │
              ←── 返回提示词文本 + 覆盖统计 ──←     │
                         │                          │
              用户查看结果、一键复制                  │
                         └──────────────────────────┘
```

### 4.3 前端核心状态模型

```typescript
interface AppState {
  // 输入区
  taskText: string;                    // 用户输入的任务描述

  // 路由结果
  routeResult: {
    taskType: string;                  // 匹配的任务类型 key
    taskTypeName: string;              // 任务类型中文名
    confidence: number;                // 置信度
    isManualOverride: boolean;         // 是否手动切换
  } | null;

  // 维度配置
  dimensions: DimensionItem[];         // 全量维度索引（页面加载时获取）
  selectedDimensions: Set<string>;     // 已勾选的维度 ID
  priorities: Record<string, 1|2|3>;   // 维度优先级映射

  // 引擎
  selectedEngine: string;              // 当前选择的引擎 key
  engines: EngineItem[];               // 引擎列表（页面加载时获取）

  // 预估
  estimatedChars: number;              // 预估总字符数（前端本地计算）

  // 输出
  generatedPrompt: string | null;      // 生成的提示词
  coverageStats: CoverageStats | null; // 覆盖统计

  // UI 状态
  isRouting: boolean;
  isGenerating: boolean;
}
```

---

## 五、部署架构

### 5.1 Docker 单容器方案

```
┌──────────────── Docker Container ────────────────┐
│                                                   │
│  Uvicorn (port 8080)                              │
│    └── FastAPI App                                │
│          ├── /api/*          → API 路由            │
│          └── /*              → 前端静态文件         │
│                                (Vite build 输出)   │
│                                                   │
│  /app/dimensions/            → 维度文件（挂载）     │
│                                                   │
└───────────────────────────────────────────────────┘
          ↑
    华渔内网用户浏览器
    http://<内网IP>:8080
```

### 5.2 Dockerfile

```dockerfile
# ---- 前端构建阶段 ----
FROM node:20-alpine AS frontend-build
WORKDIR /build
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build
# 输出到 /build/dist/

# ---- 后端运行阶段 ----
FROM python:3.11-slim
WORKDIR /app

# 安装 Python 依赖
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# 复制后端代码
COPY backend/app/ ./app/

# 复制前端构建产物
COPY --from=frontend-build /build/dist/ ./static/

# 复制维度文件（也可通过 volume mount 覆盖）
COPY backend/dimensions/ ./dimensions/

EXPOSE 8080

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
```

### 5.3 FastAPI 静态文件挂载

```python
# main.py
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

app = FastAPI(title="提示词工程系统")

# API 路由
app.include_router(dimensions_router, prefix="/api")
app.include_router(task_types_router, prefix="/api")
app.include_router(engines_router, prefix="/api")
app.include_router(route_router, prefix="/api")
app.include_router(generate_router, prefix="/api")
app.include_router(reload_router, prefix="/api")

# 前端静态文件（放在 API 路由之后，作为 fallback）
app.mount("/", StaticFiles(directory="static", html=True), name="static")
```

### 5.4 维度文件更新方式

```bash
# 方式 1：Volume Mount（推荐，维度更新不需要重新构建镜像）
docker run -p 8080:8080 -v /path/to/dimensions:/app/dimensions prompt-engineering

# 方式 2：更新文件后调用 reload API
curl -X POST http://<内网IP>:8080/api/reload
# 返回：{"dimensions_count": 89, "categories_count": 12}
```

### 5.5 运行环境要求

| 资源 | 最低要求 | 说明 |
|------|----------|------|
| CPU | 1 核 | 纯文本处理，无计算密集任务 |
| 内存 | 512MB | 维度索引 < 10MB + Python 运行时 ~100MB + 请求处理缓冲 |
| 磁盘 | 200MB | Docker 镜像 ~150MB + 维度文件 ~1MB |
| 网络 | 内网可达 | 无外部依赖，无需公网 |
| 操作系统 | 任何支持 Docker 的系统 | Linux / Windows / macOS |

---

## 六、API 接口技术规格

> 详细 Schema 由 API 设计专家定义，此处仅给出技术架构层面的约束和规格。

### 6.1 接口清单

| # | 路径 | 方法 | 功能 | 响应时间目标 |
|---|------|------|------|-------------|
| 1 | `/api/dimensions` | GET | 维度索引（不含全文） | < 50ms |
| 2 | `/api/task-types` | GET | 任务类型列表 | < 10ms |
| 3 | `/api/engines` | GET | 引擎列表 | < 10ms |
| 4 | `/api/route` | POST | 任务路由 | < 100ms |
| 5 | `/api/generate` | POST | 提示词生成 | < 500ms |
| 6 | `/api/reload` | POST | 重新加载维度文件 | < 2s |

### 6.2 技术约束

- **无认证**：内网工具，所有接口无需 token/session
- **无分页**：维度数 89 个、任务类型 8 个、引擎 6 个，全量返回
- **JSON 响应**：所有接口统一返回 JSON
- **错误格式**：统一 `{"error": {"code": "ROUTE_FAILED", "message": "...", "suggestion": "..."}}`
- **CORS**：开发环境需配置，生产环境前后端同源（同一端口）

---

## 七、关键技术决策记录（ADR）

### ADR-001：不引入 Markdown 解析库

- **决策**：用正则和字符串操作解析维度文件，不用 `markdown-it` / `mistune` 等库
- **理由**：维度文件结构规范且可控（我们自己维护），只需按 `##` 分割提取信息。引入 AST 解析库增加依赖但不增加价值。
- **风险**：维度文件格式变化时需更新解析逻辑。**缓解**：写格式校验测试用例，CI 中运行。

### ADR-002：前端构建产物由 FastAPI 直接 serve

- **决策**：不用 Nginx，FastAPI `StaticFiles` 直接托管前端静态文件
- **理由**：60分版本用户量 < 50 人，Uvicorn 单进程完全够用。省去 Nginx 配置和多进程协调，部署复杂度降至最低。
- **风险**：高并发时静态文件响应慢。**缓解**：60分不存在此问题；v2 如需可加 Nginx 前置。

### ADR-003：维度全量加载到内存

- **决策**：启动时将 434KB 维度文件全部解析到内存
- **理由**：① 文件总量小（434KB → 内存 < 10MB） ② 每次请求读文件 I/O 不必要 ③ 热加载只需替换内存对象
- **风险**：维度内容更新后忘记 reload。**缓解**：reload API 可由自动化脚本调用。

### ADR-004：视觉/音频适配器用正则提取关键词

- **决策**：Midjourney/DALL-E/Suno 的适配器用正则模式提取关键词和描述，不引入 NLP 库
- **理由**：60分版本快速可用。维度内容结构化程度高（有标题、列表、关键词标注），正则可覆盖 80% 场景。
- **风险**：提取质量有限。**缓解**：v2 引入 LLM 做智能提取。

### ADR-005：React + Ant Design 而非 Streamlit

- **决策**：前端用 React + Ant Design，不用 Streamlit/Gradio
- **理由**：产品定义中 F4（维度勾选）、F5（维度优先级调整）、F6（三级切换按钮）、F12（预估长度指示器）需要精细交互。Streamlit 的组件粒度无法满足。且 Streamlit 构建的应用向 80 分演进几乎等于重写。
- **风险**：开发量比 Streamlit 大。**缓解**：Ant Design 提供现成组件（Checkbox、Tag、Select、Progress），实际额外开发量有限。

---

## 八、非功能性考量

### 8.1 性能

| 场景 | 目标 | 实现手段 |
|------|------|----------|
| 首次页面加载 | < 2s | Vite 构建压缩 + 静态文件 gzip（Uvicorn 支持） |
| 维度索引获取 | < 50ms | 内存直接序列化，无 I/O |
| 路由匹配 | < 100ms | 8 种类型 × 关键词包含检测，纯字符串操作 |
| 提示词生成 | < 500ms | 内存读取维度 + 排序组装 + 文本拼接，纯 CPU |

### 8.2 可维护性

- **维度文件与代码解耦**：维度内容是 Markdown 文件，非代码一部分。专家更新维度不需要碰代码。
- **路由配置集中**：所有任务类型、关键词、默认优先级集中在 `config.py`，新增任务类型只改配置。
- **引擎配置集中**：引擎列表、最大字符数、适配器映射集中在 `config.py`，新增引擎只需写适配器 + 加配置。

### 8.3 可演进性（60 → 80 分路径）

| 60分 | 80分演进 | 架构影响 |
|------|----------|----------|
| 关键词路由 | LLM 智能路由 | 新增 `AIRouterEngine` 实现，路由接口不变 |
| 无持久化 | SQLite 历史记录 | 新增数据层，API 增加历史查询接口 |
| 正则关键词提取 | LLM 关键词提取 | 替换适配器实现，接口不变 |
| 单业务线 | 多业务线切换 | config.py 已预留，前端加业务线选择器 |
| 无用户体系 | 基础用户认证 | FastAPI 中间件 + 前端 token 管理 |

---

## 九、依赖清单

### 后端（requirements.txt）

```
fastapi==0.111.*
uvicorn[standard]==0.30.*
pydantic==2.*
```

**共 3 个直接依赖**，符合零/低外部依赖偏好。

### 前端（package.json 核心依赖）

```json
{
  "dependencies": {
    "react": "^18.3",
    "react-dom": "^18.3",
    "antd": "^5.20",
    "@ant-design/icons": "^5.4"
  },
  "devDependencies": {
    "typescript": "^5.5",
    "vite": "^5.4",
    "@vitejs/plugin-react": "^4.3"
  }
}
```

**共 4 个运行时依赖**（react / react-dom / antd / icons），构建时依赖不影响运行。

---

## 十、自检清单

- [x] 系统分层清晰（前端/后端/数据层），职责不重叠
- [x] 技术选型每项有明确理由，排除方案有说明
- [x] 零数据库——维度文件即数据源，内存索引即查询层
- [x] 核心模块（加载器/路由/组装/适配器）边界明确，可独立测试
- [x] 前后端职责分界明确，无模糊地带
- [x] Docker 单容器部署，一条命令启动
- [x] 后端直接依赖 3 个，前端运行时依赖 4 个——低依赖
- [x] 所有 API 响应时间目标可达（纯内存操作 + 文本处理）
- [x] 80分演进路径清晰，60分架构不阻塞后续升级
- [x] 维度文件热加载支持，更新不需重启/重新构建
- [x] 不依赖任何"现有 CLI 系统"——从零设计

---

*文档版本：v1.0 | 状态：待 Leader 审核 | 下游交接条件：Leader 确认后交 数据库设计+API 设计 并行启动*
