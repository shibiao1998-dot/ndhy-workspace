# System Prompt 设计

> 来源：Anthropic 官方 Prompting Best Practices + prompt-eng-interactive-tutorial

## 核心原则

### 1. 清晰直接
Claude 响应明确的指令效果最好。把 Claude 当作一个聪明但刚入职的新员工——他缺乏你的上下文。

**黄金法则**：把 prompt 给一个不了解背景的同事看，如果他会困惑，Claude 也会。

```python
# ✅ 有效
system = "You are a helpful coding assistant specializing in Python."

# ❌ 无效 — 太模糊
system = "Help with code"
```

### 2. 给 Claude 角色
在 system prompt 中设定角色，聚焦 Claude 的行为和语气。一句话就能产生差异：

```python
import anthropic

client = anthropic.Anthropic()
message = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=1024,
    system="You are a senior backend engineer reviewing code for security vulnerabilities.",
    messages=[
        {"role": "user", "content": "Review this authentication code..."}
    ],
)
```

### 3. 提供上下文/动机
解释 **为什么** 比单纯给指令更有效——Claude 足够聪明，能从解释中泛化。

```text
# ❌ 效果差
NEVER use ellipses

# ✅ 效果好
Your response will be read aloud by a text-to-speech engine,
so never use ellipses since the TTS engine can't pronounce them.
```

### 4. 用顺序步骤指导
当步骤的顺序或完整性重要时，使用编号列表或分步指令：

```text
Analyze the codebase following these steps:
1. Read the project structure and identify entry points
2. Check for security vulnerabilities in authentication flows
3. Review error handling patterns
4. Identify performance bottlenecks
5. Provide a summary with severity ratings
```

## System Prompt 结构模板

```python
system_prompt = """
<role>
You are a {role_description}. Your expertise includes {expertise_areas}.
</role>

<context>
{background_information}
</context>

<instructions>
{specific_behavioral_instructions}
</instructions>

<constraints>
- {constraint_1}
- {constraint_2}
</constraints>

<output_format>
{expected_format_description}
</output_format>
"""
```

## Claude 特有偏好

### XML 标签优于纯文本分隔
Claude 原生理解 XML 标签，用来分隔 prompt 中不同类型的内容：

```xml
<instructions>
Analyze the customer feedback below.
</instructions>

<context>
We are a B2B SaaS company focused on education.
</context>

<input>
{{CUSTOMER_FEEDBACK}}
</input>

<output_format>
Respond with a JSON object containing: sentiment, topics, action_items.
</output_format>
```

### 正向指令优于否定指令
```text
# ❌ 效果差
Do not use markdown in your response

# ✅ 效果好
Your response should be composed of smoothly flowing prose paragraphs.
```

### 上下文驱动的格式控制
prompt 本身的格式会影响 Claude 的输出格式。如果你想减少 markdown 输出，让你的 prompt 也少用 markdown。

## 模型身份设置

```text
# 让 Claude 正确标识自己
The assistant is Claude, created by Anthropic. The current model is Claude Opus 4.6.

# 指定模型字符串
When an LLM is needed, default to Claude Opus 4.6.
The exact model string is claude-opus-4-6.
```

## 避免过度 Markdown 的 Prompt 模板

```xml
<avoid_excessive_markdown_and_bullet_points>
When writing reports or technical explanations, write in clear, flowing prose
using complete paragraphs and sentences. Reserve markdown primarily for
`inline code`, code blocks, and simple headings.

DO NOT use ordered/unordered lists unless:
a) you're presenting truly discrete items
b) the user explicitly requests a list

Your goal is readable, flowing text that guides the reader naturally.
</avoid_excessive_markdown_and_bullet_points>
```

## 控制输出详细度

Claude 最新模型（4.5+）更简洁直接。如果你需要更详细的输出：

```text
After completing a task that involves tool use, provide a quick summary of the work you've done.
```

## 关键要点

| 技巧 | 效果 | 优先级 |
|------|------|--------|
| 给角色 | 聚焦行为和语气 | 🔴 高 |
| XML 标签分隔 | 消除歧义 | 🔴 高 |
| 提供动机/上下文 | 更精准的响应 | 🔴 高 |
| 正向指令 | 比否定更可靠 | 🟡 中 |
| 匹配 prompt 格式 | 控制输出格式 | 🟡 中 |
| 步骤编号 | 确保完整执行 | 🟡 中 |
