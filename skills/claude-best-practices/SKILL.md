---
name: claude-best-practices
model: standard
version: 1.0.0
description: >
  Claude API 提示词工程最佳实践。覆盖 system prompt 设计、XML 结构化、思维链推理、
  长上下文利用（200K→1M token）、结构化输出、流式传输、动态追问策略和多轮对话管理。
  基于 Anthropic 官方文档和 prompt-eng-interactive-tutorial（33K star）。
tags: [claude, anthropic, prompt-engineering, api, system-prompt, xml, streaming]
license: MIT
author: ndhy
---

# Claude Best Practices

> Claude API 提示词工程最佳实践速查。当你需要调用 Claude API、设计 system prompt 或优化 AI 输出质量时，查这里。

## 触发条件
- 调用 Claude API（Messages API、Streaming、Tool Use）
- 编写或优化 system prompt
- 需要结构化输出（JSON/XML）
- 处理长上下文（20K+ token）
- 实现流式输出或多轮对话
- 设计动态追问策略

## 模块速查

| 场景 | 加载 | 路径 |
|------|------|------|
| System Prompt 设计 | 📖 | references/system-prompt-design.md |
| 结构化输出（XML/JSON） | 📖 | references/structured-output.md |
| 思维链与推理优化 | 📖 | references/chain-of-thought.md |
| 长上下文利用（200K→1M） | 📖 | references/long-context.md |
| 动态追问策略 | 📖 | references/dynamic-questioning.md |
| 流式输出最佳实践 | 📖 | references/streaming.md |
| 多轮对话上下文管理 | 📖 | references/multi-turn-context.md |

## 核心铁律
1. **用 XML 标签分隔内容** — `<instructions>`, `<context>`, `<examples>` 让 Claude 无歧义解析
2. **长文档放顶部，问题放底部** — 可提升 30% 响应质量
3. **说做什么，不说不做什么** — 正向指令比否定指令有效
4. **给 Claude 角色** — 一句话 system prompt 就能显著改变行为
5. **用 3-5 个示例** — Few-shot 是最可靠的输出格式控制手段
6. **结构化输出用 `output_config.format`** — 比 prompt 约束更可靠
