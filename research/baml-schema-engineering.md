# BAML Schema Engineering 调研报告

> 调研时间：2026-03-16 | 项目：GitHub 7.7K★ BoundaryML/baml | License: Apache 2.0

---

## 一、BAML 核心概念精华

### 1.1 核心理念：Schema Engineering vs String Engineering

BAML 的核心洞察：**prompt 本质上是函数——有输入参数、有输出类型、有处理逻辑**。

当前行业现状（String Engineering）：
```python
# 典型的字符串拼接方式（我们当前的做法）
prompt = f"你是一个 AI 设计师。\n{positive_section}\n{constraint_section}\n请输出..."
```

BAML 的做法（Schema Engineering）：
```baml
function GenerateDesign(task: TaskInfo, dimensions: Dimension[]) -> DesignOutput {
  client "openai/gpt-4o"
  prompt #"
    你是华渔教育的 AI 设计师。
    {{ ctx.output_format }}
    
    {% for dim in dimensions %}
      {{ dim.name }}: {{ dim.content }}
    {% endfor %}
  "#
}
```

**关键差异**：
- String Engineering = 在业务代码中用 f-string 拼 prompt → 脆弱、不可测、不可版本化
- Schema Engineering = 用类型化模板定义 prompt → 可组合、可测试、可版本化

BAML 自比为 "React 之于 HTML"——从拼接字符串到声明式组件。

### 1.2 类型系统

BAML 定义了完整的类型系统来描述 prompt 的输入和输出：

```baml
// 基础类型：string, int, float, bool
// 复合类型：class（结构体）、enum（枚举）
// 容器：array（T[]）、map、optional（T?）
// 联合类型：T1 | T2

class Dimension {
  id string
  name string
  description string @description("维度的详细描述")
  direction "positive" | "negative" | "mixed"
  priority int @assert(valid_range, {{ this >= 1 and this <= 3 }})
}

enum OutputFormat {
  Markdown @description("结构化 Markdown")
  JSON
  PlainText
}
```

核心价值：**输入输出的 schema 是显式声明的，不是隐藏在字符串里的**。

### 1.3 模板语法（Jinja2-like）

BAML 的 prompt 模板使用 Minijinja（Jinja2 子集）：

```baml
prompt #"
  {# 注释 #}
  {{ variable }}                    {# 输出变量 #}
  {% for item in list %} ... {% endfor %}  {# 循环 #}
  {% if condition %} ... {% endif %}       {# 条件 #}
  {{ ctx.output_format }}           {# 自动注入输出 schema 说明 #}
  {{ _.role("system") }}            {# 切换 message role #}
"#
```

### 1.4 template_string（模板组合）

```baml
// 可复用的模板片段
template_string RenderDimensions(dims: Dimension[]) #"
  {% for dim in dims %}
    ### {{ dim.name }}
    {{ dim.description }}
  {% endfor %}
"#

// 在主 prompt 中组合
function GenerateDesign(dims: Dimension[], task: string) -> Output {
  prompt #"
    {{ _.role("system") }}
    你是 AI 设计师。
    {{ RenderDimensions(dims) }}
    
    {{ _.role("user") }}
    {{ task }}
  "#
}
```

**关键能力**：模板可嵌套、可复用、可独立测试。

### 1.5 约束验证（@assert / @check）

```baml
class Output {
  summary string @assert(not_empty, {{ this|length > 0 }})
  sections string[] @assert(has_sections, {{ this|length >= 3 }})
  word_count int @check(reasonable_length, {{ this > 100 and this < 5000 }})
}
```

- `@assert`：严格验证，不通过抛异常
- `@check`：软验证，结果可检查但不阻断
- `@description`：为 LLM 提供字段说明，注入到 output_format

### 1.6 不支持继承，只支持组合

BAML 明确不支持 class 继承（与 Rust 一致的设计哲学：组合优于继承）。通过 template_string 嵌套实现复用。

### 1.7 版本管理哲学

BAML 不发明版本管理工具——**用 git 管版本，用文件系统存 prompt**。`.baml` 文件和代码一样被 git track，可以 diff、review、rollback。

---

## 二、与我们当前 prompt_assembler.py 的对比分析

### 2.1 当前实现分析

我们的 `prompt_assembler.py`（~130行）做了以下事情：
1. 接收 `dimensions: list[dict]` + `task_description` + `user_exclusions`
2. 按 direction（positive/negative/mixed）分流
3. 按 priority（1/2/3）分组正向维度
4. 用关键词匹配（"❌"、"不要"、"禁止"等）拆分 mixed 维度
5. 用 f-string 拼装最终 system prompt
6. 计算覆盖率统计

### 2.2 逐项对比

| 维度 | 当前实现（String Engineering） | BAML 思路（Schema Engineering） |
|------|------|------|
| **输入类型** | `list[dict]`，字段靠约定 | 类型化的 class，编译期检查 |
| **模板管理** | f-string 内嵌在 Python 函数里 | 独立的 .baml / .jinja2 模板文件 |
| **正反向分离** | 代码中手动 if/elif 分流 | 模板中声明式 `{% if dim.direction == "positive" %}` |
| **mixed 拆分** | 关键词硬编码列表逐行扫描 | 应在数据入库时就分离，不在组装时处理 |
| **输出约束** | 无（f-string 结果是纯字符串） | `@assert`/`@check` 验证输出结构 |
| **可测试性** | 需要 mock 整个函数 | 模板可独立渲染测试 |
| **版本管理** | 嵌在代码里，改 prompt = 改代码 | 独立模板文件，git diff 清晰 |
| **可复用性** | 函数级，难以复用部分片段 | template_string 粒度复用 |
| **覆盖率统计** | 在组装函数内计算 | 分离到独立工具函数 |

### 2.3 当前实现的具体问题

1. **类型不安全**：`dimensions` 是 `list[dict]`，任何字段缺失只有运行时才能发现
2. **prompt 模板与组装逻辑耦合**：改 prompt 措辞 = 改 Python 代码，需要完整部署
3. **mixed 拆分过于脆弱**：靠关键词列表（"❌"、"不要"...）做语义判断，遇到 "不要紧" 会误判
4. **不可组合**：正向 section 和约束 section 的渲染逻辑不能被其他 prompt 复用
5. **硬编码 prompt 框架**：system prompt 的角色设定、输出要求等固定在代码里，不同场景无法复用

---

## 三、可借鉴的 5 个具体改进点

### 改进1：类型化维度定义（Pydantic Schema）

**现状**：`list[dict]`，字段靠约定
**改进**：用 Pydantic 定义严格类型

```python
from pydantic import BaseModel, Field
from enum import Enum
from typing import Literal

class Direction(str, Enum):
    POSITIVE = "positive"
    NEGATIVE = "negative"

class DimensionInput(BaseModel):
    id: str
    name: str
    description: str
    direction: Direction  # 不再有 "mixed"，入库时已分离
    priority: Literal[1, 2, 3]
```

**价值**：编译期发现错误 → 消灭一类运行时 bug。

### 改进2：Jinja2 模板化 prompt 组装

**现状**：f-string 拼装
**改进**：独立 Jinja2 模板文件

```
templates/
├── system_prompt.jinja2        # 主模板
├── partials/
│   ├── positive_section.jinja2 # 正向信息渲染
│   ├── constraint_section.jinja2 # 约束渲染
│   └── output_requirements.jinja2 # 输出要求
```

**价值**：改 prompt 只改模板文件，不碰 Python 代码。模板可独立 review。

### 改进3：消灭 mixed direction

**现状**：组装时用关键词拆分 mixed 内容
**改进**：在数据录入/导入阶段就将 mixed 维度拆分为 positive + negative 两条记录

**价值**：组装器不做语义判断，只做结构化渲染。单一职责。

### 改进4：模板片段复用（template_string 思路）

**现状**：一个大函数做所有事
**改进**：每个 section 是独立的可组合模板

```python
# 不同场景可以组合不同模板片段
design_prompt = compose_prompt(
    role_template="design_ai",
    sections=[positive_section_template, constraint_template],
    output_template="structured_markdown"
)

review_prompt = compose_prompt(
    role_template="review_ai",
    sections=[positive_section_template],  # 复用同一个模板
    output_template="review_checklist"
)
```

**价值**：多场景复用，不重复编写。

### 改进5：输出 schema 自动注入（ctx.output_format 思路）

**现状**：输出要求硬编码在 prompt 里
**改进**：基于 Pydantic 模型自动生成输出格式说明

```python
class DesignOutput(BaseModel):
    summary: str = Field(description="设计概述")
    user_journey: str = Field(description="用户旅程")
    interaction: str = Field(description="交互方案")
    visual: str = Field(description="视觉建议")
    constraints: str = Field(description="约束与禁忌")

# 自动生成并注入到 prompt
output_format_instruction = generate_output_format(DesignOutput)
```

**价值**：输出结构变更时，prompt 自动同步更新。

---

## 四、不适用的部分（我们不需要什么）

### 4.1 不需要引入 BAML 本身

BAML 是一个完整的 DSL + 编译器 + 运行时体系，引入它意味着：
- 团队要学一门新语言
- 需要 BAML 编译器（Rust 编写）作为构建依赖
- 需要 VS Code 扩展才能获得完整开发体验
- 代码生成流程加入构建链

**我们只需要吸收它的思路，用 Python 原生工具（Jinja2 + Pydantic）实现同等效果。**

### 4.2 不需要多 LLM Client 管理

BAML 的 client/retry/fallback/round-robin 是 LLM 调用层的能力，我们的 prompt_assembler 只负责组装 prompt 文本，LLM 调用由其他模块处理。

### 4.3 不需要 Streaming 解析

BAML 的 SAP（Schema-Aligned Parsing）和流式类型安全是响应解析层的能力，不在 prompt 组装范围内。

### 4.4 不需要 @assert 运行时约束

BAML 的 `@assert`/`@check` 用于验证 LLM 输出。我们的组装器只生产 prompt，不消费 LLM 输出。输出验证应在调用层处理。

### 4.5 不需要 @@dynamic 动态类型

BAML 的运行时动态字段扩展是为了应对 schema 不确定的场景。我们的维度结构是确定的，用静态类型即可。

---

## 五、总结

| 维度 | 借鉴 | 不借鉴 |
|------|------|--------|
| 类型系统 | ✅ Pydantic 替代 dict | — |
| 模板引擎 | ✅ Jinja2 替代 f-string | ❌ BAML DSL 本身 |
| 模板组合 | ✅ template_string 思路 | — |
| 输出 schema 自动注入 | ✅ ctx.output_format 思路 | — |
| 正反向分离 | ✅ 在数据层而非组装层分离 | — |
| LLM 调用管理 | — | ❌ client/retry/fallback |
| 流式解析 | — | ❌ SAP 算法 |
| 运行时约束 | — | ❌ @assert/@check |

**一句话**：不用 BAML，用 BAML 的思路。Pydantic + Jinja2 = Python 世界的 Schema Engineering。
