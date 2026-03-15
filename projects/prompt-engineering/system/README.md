# 提示词工程系统 v1.0

> 维度驱动的提示词自动组装系统

## 是什么

这个系统将 `dimensions/` 目录下的 Markdown 维度文件（89 个维度，12 个类别）**程序化地加载、路由、组装成提示词**，适配不同的 AI 引擎。

核心理念来自 DJ："提示词工程的本质是信息对称——为 AI 提供最全面、最准确的信息。"

## 架构

```
任务描述 → 维度路由器 → 维度选择 → 组装引擎 → 引擎适配 → 提示词输出
              ↑                           ↑
          config.py                  adapters/
         (路由规则)              (claude/midjourney/suno)
```

**四个核心模块**：

| 模块 | 文件 | 职责 |
|------|------|------|
| 维度加载器 | `dimension_loader.py` | 扫描 `dimensions/` 目录，解析 Markdown 为结构化数据 |
| 维度路由器 | `router.py` | 根据任务描述自动匹配任务类型，选出相关维度 |
| 组装引擎 | `assembler.py` | 按优先级组装维度内容，支持长度控制和反向约束提取 |
| 引擎适配器 | `adapters/` | 针对不同 AI 引擎输出不同格式 |

## 快速开始

### 前提
- Python 3.8+
- 零外部依赖（纯标准库）

### 基础用法

```bash
# 进入系统目录
cd projects/prompt-engineering/system

# 生成提示词（默认使用 Claude 引擎）
python main.py --task "设计一个化学实验交互方案"

# 指定引擎
python main.py --task "设计一个化学实验交互方案" --engine midjourney
python main.py --task "为化学实验配背景音乐" --engine suno

# 手动指定任务类型（覆盖自动匹配）
python main.py --task "写产品核心价值" --type core_value

# 详细模式（显示路由过程）
python main.py --task "设计一个化学实验交互方案" --verbose

# 输出到文件
python main.py --task "设计一个化学实验交互方案" -o prompt.md
```

### 查看信息

```bash
# 查看维度加载统计
python main.py --stats

# 查看可用任务类型
python main.py --list-types

# 查看可用引擎
python main.py --list-engines
```

## 命令行参数

| 参数 | 缩写 | 说明 |
|------|------|------|
| `--task TEXT` | `-t` | 任务描述（必需） |
| `--engine NAME` | `-e` | AI 引擎（默认 `claude`） |
| `--type NAME` | — | 手动指定任务类型 |
| `--verbose` | `-v` | 显示详细路由信息 |
| `--output FILE` | `-o` | 输出到文件 |
| `--stats` | `-s` | 显示维度统计 |
| `--list-types` | — | 列出所有任务类型 |
| `--list-engines` | — | 列出所有引擎 |

## 可用引擎

| 引擎 | 适用 AI | 输出格式 | 最大长度 |
|------|---------|----------|----------|
| `claude` | Claude / GPT / DeepSeek | 结构化 Markdown | 180K 字符 |
| `gpt` | GPT-4 / GPT-4o | 结构化 Markdown | 120K 字符 |
| `deepseek` | DeepSeek | 结构化 Markdown | 60K 字符 |
| `midjourney` | Midjourney / DALL-E | 精简关键词式 | 4K 字符 |
| `dalle` | DALL-E | 精简关键词式 | 4K 字符 |
| `suno` | Suno | 简洁描述式 | 2K 字符 |

## 任务类型与路由规则

系统根据任务描述中的关键词**自动匹配**任务类型。每种任务类型定义了三级维度需求：

| 级别 | 含义 |
|------|------|
| **必须（required）** | 缺失时警告，始终包含 |
| **建议（recommended）** | 空间允许时包含 |
| **可选（optional）** | 充裕时包含 |

### 路由规则（来自飞书文档 1.3 节）

| 任务类型 | 关键词 | 必须维度 |
|----------|--------|----------|
| 核心价值编写 | 核心价值、价值定义 | A + K + M + I01 |
| 设计方法论编写 | 设计方法、方法论、竞品分析 | A-E + K + I03 |
| 原型设计 | 原型、交互、界面、UI | E11 + H + I04 |
| 产品策划 | 策划、规划、需求 | A + B + C + D + K |
| AI 编程 | 编程、开发、代码 | A + D + F + K |
| AI 美术 | 美术、视觉、3D | A + H + K |
| AI Marketing | 营销、推广、市场 | A + B + C + K |
| 通用 | （无匹配时回退） | A + B + D + K |

## 维度文件格式

系统自动解析 `dimensions/` 下的 Markdown 文件。每个维度用二级标题标识：

```markdown
## A01 战略核心方向

**维度定义**：DJ 最近强调的战略重点...

**质量作用**：战略对齐刚性检查...

### 具体信息内容
[维度的详细内容]
```

**解析规则**：
- 维度 ID 格式：大写字母 + 两位数字（如 `A01`、`K06`）
- 文件名首字母推断类别（如 `A-strategy-values.md` → A 类）
- 标记 `⚠️ 待填充` 等关键词的维度被识别为"未完成"

## 目录结构

```
system/
├── main.py              ← CLI 入口
├── config.py            ← 路由规则、引擎配置
├── dimension_loader.py  ← 维度文件加载与解析
├── router.py            ← 任务类型匹配与维度路由
├── assembler.py         ← 提示词组装引擎（优先级排序、长度控制、反向约束）
├── adapters/            ← 引擎适配器
│   ├── __init__.py
│   ├── claude.py        ← 通用 AI（结构化 Markdown）
│   ├── midjourney.py    ← 设计 AI（精简关键词）
│   └── suno.py          ← 音频 AI（简洁描述）
└── README.md            ← 本文件
```

## 设计决策

1. **零外部依赖**：纯 Python 标准库 + 正则解析 Markdown。DJ 团队不需要装额外包。
2. **容错设计**：维度文件可能在被其他专家并行填充中，系统能处理"部分维度尚未完成"的情况，标记为 `⚠️` 但不崩溃。
3. **路由可配置**：所有路由规则在 `config.py` 中集中管理，新增任务类型只需加配置。
4. **三级信息排序**：参考 DJ 子项目 2（信息排序），按 required → recommended → optional 三级组装。
5. **引擎适配**：通用 AI 给完整上下文，设计 AI 精简为关键词，音频 AI 提取情感和风格。

## 扩展指南

### 添加新的任务类型

在 `config.py` 的 `TASK_ROUTES` 中添加：

```python
"new_type": {
    "name": "新任务类型",
    "description": "描述",
    "required": ["A", "K"],
    "recommended": ["B"],
    "optional": ["C"],
},
```

在 `TASK_KEYWORDS` 中添加关键词匹配：

```python
"new_type": ["关键词1", "关键词2"],
```

### 添加新的引擎适配器

1. 在 `adapters/` 下创建新文件
2. 实现 `format(route_result, max_chars)` 方法
3. 在 `ENGINE_CONFIGS` 中注册

### 添加新的维度文件

直接在 `dimensions/` 下放 Markdown 文件，遵循命名格式：
- `X-description.md`（X 为类别字母，如 `B-user-research.md`）
- 文件内用 `## X01 维度名称` 格式标识每个维度

系统会自动发现并加载。

## 已知限制（v1）

- 关键词匹配路由准确度有限，复杂任务建议用 `--type` 手动指定
- 反向约束提取基于正则模式，可能有遗漏
- 未实现维度内容的智能截断（超长维度整体包含或整体跳过）
- 未实现 Web 界面（v2 计划）

## 后续计划

- [ ] Web 界面（Flask/Streamlit）
- [ ] 更智能的任务类型匹配（可接入 AI 分类）
- [ ] 维度内容的语义搜索（基于关键词或嵌入向量）
- [ ] 提示词质量评估（自动检查覆盖了多少维度）
- [ ] 多轮对话模式（交互式填充缺失信息）
