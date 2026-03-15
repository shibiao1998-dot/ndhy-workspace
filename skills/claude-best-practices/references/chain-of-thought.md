# 思维链与推理优化

> 来源：Anthropic 官方文档 — Extended Thinking, Adaptive Thinking, Prompting Best Practices

## 三种推理模式

| 模式 | 配置 | 适用模型 | 适用场景 |
|------|------|---------|---------|
| Adaptive Thinking（推荐） | `thinking: {type: "adaptive"}` | Opus 4.6, Sonnet 4.6 | 自动决定何时/多深度思考 |
| Extended Thinking（手动） | `thinking: {type: "enabled", budget_tokens: N}` | Sonnet 4.6, Sonnet 4.5, Haiku 4.5 | 需要精确控制思考预算 |
| Prompt-based CoT | 无特殊配置，prompt 中引导 | 所有模型 | thinking 关闭时的替代方案 |

---

## Adaptive Thinking（推荐方式）

Claude 自动决定是否需要思考、思考多深。通过 `effort` 参数控制：

```python
import anthropic

client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=64000,
    thinking={"type": "adaptive"},
    output_config={"effort": "high"},  # max, high, medium, low
    messages=[{"role": "user", "content": "Solve this complex problem..."}],
)

for block in response.content:
    if block.type == "thinking":
        print(f"思考过程: {block.thinking}")
    elif block.type == "text":
        print(f"最终回答: {block.text}")
```

### Effort 参数指南

| Effort | 思考深度 | 适用场景 |
|--------|---------|---------|
| `max` | 最深 | 复杂数学、深度分析 |
| `high` | 深 | 多步推理、代码审查 |
| `medium` | 适中 | 一般分析任务 |
| `low` | 浅 | 简单任务，减少延迟 |

---

## Extended Thinking（手动模式）

适用于需要精确控制思考 token 预算的场景：

```python
response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=16000,
    thinking={"type": "enabled", "budget_tokens": 10000},
    messages=[
        {"role": "user", "content": "Are there infinite primes where n mod 4 == 3?"}
    ],
)
```

> ⚠️ `budget_tokens` 在 Opus 4.6 上已弃用，未来版本会移除。请迁移到 Adaptive Thinking。

### 关键约束
- `budget_tokens` 必须小于 `max_tokens`
- Opus 4.6 支持最多 128K 输出 token，早期模型支持 64K
- 思考 token 按输出 token 计费
- 前几行思考内容更详细，对 prompt 工程调试有帮助

### Summarized Thinking（Claude 4+）
Claude 4 模型返回思考过程的**摘要**而非完整思考。要点：
- 按完整思考 token 计费，不是摘要 token
- 账单 token 数 ≠ 响应中可见的 token 数
- 摘要保留关键推理步骤，延迟影响极小
- Sonnet 3.7 仍返回完整思考输出

---

## Prompt-based CoT（无 Thinking 模式时的替代方案）

当 thinking 关闭时，通过 prompt 引导逐步推理：

```xml
<instructions>
Think through this problem step by step.
Put your reasoning in <thinking> tags and your final answer in <answer> tags.
</instructions>

<problem>
{{PROBLEM_DESCRIPTION}}
</problem>
```

### 关键技巧

1. **通用指令优于具体步骤**
   - ✅ "think thoroughly" — 让 Claude 自由推理，通常质量更高
   - ❌ 手写详细推理步骤 — Claude 的推理能力经常超越人类预设的步骤

2. **Few-shot + Thinking 标签**
   在示例中展示思考过程，Claude 会泛化这个推理风格：

```xml
<examples>
  <example>
    <input>Is 17 prime?</input>
    <thinking>
    Check divisibility: 17/2=8.5, 17/3=5.67, 17/4=4.25.
    sqrt(17) ≈ 4.12, so only need to check 2, 3, 4.
    None divide evenly. 17 is prime.
    </thinking>
    <answer>Yes, 17 is prime.</answer>
  </example>
</examples>
```

3. **自检指令**
   ```text
   Before you finish, verify your answer against [test criteria].
   ```
   对编码和数学任务特别有效。

---

## 控制过度思考

Opus 4.6 比前代模型做更多前置探索，有时过于彻底。解决方案：

### 方案一：降低 Effort
```python
output_config={"effort": "medium"}  # 或 "low"
```

### 方案二：Prompt 引导
```text
When deciding how to approach a problem, choose an approach and commit to it.
Avoid revisiting decisions unless you encounter new information that directly
contradicts your reasoning. If you're weighing two approaches, pick one and
see it through.
```

### 方案三：限制思考触发
```text
Extended thinking adds latency and should only be used when it will
meaningfully improve answer quality — typically for problems that require
multi-step reasoning. When in doubt, respond directly.
```

---

## 过度触发 vs 不足触发（4.6 模型）

Claude 4.5/4.6 对 system prompt 的响应更敏感。之前为防止 undertriggering 的激进 prompt 现在可能 overtriggering：

```text
# ❌ 旧模型的 prompt（4.6 上会过度触发）
CRITICAL: You MUST use this tool when...

# ✅ 4.6 模型的 prompt
Use this tool when...
```

---

## Interleaved Thinking（工具调用间思考）

Claude 4+ 模型支持在工具调用之间穿插思考：

```text
# 在 system prompt 中引导
After receiving tool results, carefully reflect on their quality
and determine optimal next steps before proceeding.
Use your thinking to plan and iterate based on this new information.
```

这对 agentic 工作流特别有用——Claude 可以在每次工具调用后重新评估策略。

---

## 关键要点

| 场景 | 推荐方案 |
|------|---------|
| 复杂推理（默认） | Adaptive Thinking + high effort |
| 简单任务 | 不开 thinking，或 low effort |
| 需要精确预算 | Extended Thinking with budget_tokens |
| thinking 关闭时 | Prompt-based CoT with `<thinking>` tags |
| Agent 循环中 | Interleaved Thinking |
| 过度思考 | 降低 effort / prompt 约束 |

> ⚠️ 注意：thinking 关闭时，Opus 4.5 对 "think" 这个词特别敏感。改用 "consider", "evaluate", "reason through" 等替代词。
