# 动态追问策略

> 如何让 Claude 主动补充信息、澄清模糊需求，而非猜测或直接拒绝。

## 核心理念

让 Claude 在信息不足时**主动追问**，是提升交互质量的关键能力。默认情况下，Claude 倾向于直接回答或过于保守地拒绝。通过正确的 prompt 设计，可以让 Claude 在"猜测"和"拒绝"之间找到最佳平衡——**追问补充信息**。

---

## 策略一：System Prompt 中设定追问行为

```python
system_prompt = """
<role>
You are an expert product analyst.
</role>

<interaction_style>
When the user's request is ambiguous or missing critical information:
1. Identify what specific information is missing
2. Ask 1-3 targeted clarifying questions
3. Explain WHY you need this information (how it affects your analysis)
4. If possible, provide a preliminary answer while noting your assumptions

DO NOT:
- Guess critical details silently
- Refuse to help because information is incomplete
- Ask more than 3 questions at once (prioritize the most important)
</interaction_style>
"""
```

## 策略二：分层追问模型

根据信息缺失的严重程度，设计不同的追问策略：

```xml
<questioning_protocol>
When receiving a request, assess information completeness:

LEVEL 1 - Minor gaps (can make reasonable assumptions):
  → Proceed with clear assumptions stated
  → Example: "I'll assume you mean the production environment. Let me know if otherwise."

LEVEL 2 - Moderate gaps (multiple valid interpretations):
  → Provide preliminary analysis with top 2-3 interpretations
  → Ask which interpretation matches their intent
  → Example: "This could mean X or Y. Here's my analysis for X: ... For Y: ... Which did you mean?"

LEVEL 3 - Critical gaps (cannot proceed meaningfully):
  → Ask targeted questions before proceeding
  → Explain what you can't determine and why it matters
  → Example: "I need to understand [specific thing] before I can help. Without it, I risk [specific consequence]."
</questioning_protocol>
```

## 策略三：主动发现模式

让 Claude 在执行任务过程中发现新的信息需求时主动提出：

```xml
<proactive_discovery>
As you work through the task, if you discover:
- Unstated assumptions that could significantly change the outcome
- Edge cases the user may not have considered
- Dependencies or prerequisites that aren't mentioned
- Potential risks or trade-offs worth discussing

Raise these proactively. Format as:
"⚠️ I noticed [observation]. This matters because [reason]. Should we [suggestion]?"
</proactive_discovery>
```

## 策略四：Tool Use 驱动的追问

利用工具调用让 Claude 在信息不足时通过工具获取所需信息，而非直接问用户：

```python
tools = [
    {
        "name": "ask_clarification",
        "description": "When critical information is missing and you cannot proceed safely, use this tool to ask the user for clarification.",
        "input_schema": {
            "type": "object",
            "properties": {
                "questions": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "question": {"type": "string"},
                            "reason": {"type": "string"},
                            "default_assumption": {"type": "string"},
                        },
                        "required": ["question", "reason"],
                    },
                },
            },
            "required": ["questions"],
        },
    }
]
```

```xml
<!-- System prompt 配合 -->
<tool_usage>
Use ask_clarification when:
- User's intent is ambiguous and wrong assumption could waste significant effort
- Multiple valid approaches exist with very different outcomes
- You're about to make a decision that's hard to reverse

DO NOT use ask_clarification when:
- You can make a reasonable assumption and note it
- The gap is minor and won't significantly affect the result
- You've already asked questions this turn (max 1 clarification per turn)
</tool_usage>
```

## 策略五：默认行动 vs 默认询问

根据产品需求选择 Claude 的默认行为模式：

### 默认行动（适合执行类场景）

```xml
<default_to_action>
By default, implement changes rather than only suggesting them.
If the user's intent is unclear, infer the most useful likely action and proceed,
using tools to discover any missing details instead of guessing.
Try to infer the user's intent and act accordingly.
</default_to_action>
```

### 默认询问（适合分析/咨询类场景）

```xml
<do_not_act_before_instructions>
Do not jump into implementation unless clearly instructed.
When intent is ambiguous, default to providing information, research,
and recommendations rather than taking action.
Only proceed with edits when the user explicitly requests them.
</do_not_act_before_instructions>
```

---

## 多轮追问的对话设计模式

```python
# 第一轮：用户给出模糊需求
messages = [
    {"role": "user", "content": "帮我分析一下竞品"}
]

# Claude 追问（第一轮响应）
# → "我需要几个关键信息来给出有价值的分析：
#    1. 你的产品是什么领域的？
#    2. 你最关注的竞品是哪几个？
#    3. 分析的目的是什么（功能对比/定价策略/技术路线）？"

# 第二轮：用户补充信息
messages.append({"role": "assistant", "content": "..."})
messages.append({"role": "user", "content": "教育 SaaS，主要看 ClassIn 和腾讯课堂，重点看功能和定价"})

# 第三轮：Claude 执行分析（现在有足够信息了）
```

---

## 关键要点

| 原则 | 说明 |
|------|------|
| 分级追问 | 小缺口→假设+声明；大缺口→先问再做 |
| 限制追问数量 | 每轮最多 3 个问题，优先最关键的 |
| 解释为什么问 | 让用户理解追问的价值 |
| 提供默认值 | "如果你不指定，我默认使用 X" |
| 主动发现 | 执行过程中发现新问题就及时提出 |
| 不要连续追问 | 同一信息问一次就够了 |

## 适用于我们产品的核心能力

这些追问策略是让 AI 产品从"被动问答"升级到"主动协作"的关键。在教育和 B2B 场景中：
- 学生描述模糊的学习问题 → AI 通过追问定位真实卡点
- 老师描述教学需求 → AI 追问澄清后给出针对性方案
- 产品需求模糊 → AI 通过结构化追问补全需求文档
