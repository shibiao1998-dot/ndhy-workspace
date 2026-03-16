---
name: code-review
description: >-
  Use when 需要对代码变更进行系统性审查，检查正确性、契约一致性、安全和性能风险，或生成放行决策。
  触发词：代码审查、code review、审查报告、放行决策、契约一致性审查、安全审查。
---

# 代码审查

> 对实现代码进行系统性审查，输出分级意见与放行决策。审查目标是降低真实交付风险。

## 模块速查

| 场景 | 加载 | 路径 |
|------|------|------|
| 8步标准流程 + 分级框架 + 决策树 + 协作接口 | 📖 | [references/workflow.md](references/workflow.md) |
| 正确性审查（契约+逻辑+边界） | 📖 | [references/correctness-review.md](references/correctness-review.md) |
| 结构与可维护性审查 | 📖 | [references/structure-maintainability.md](references/structure-maintainability.md) |
| 安全与性能审查 | 📖 | [references/security-performance.md](references/security-performance.md) |
| 测试充分性审查 | 📖 | [references/test-adequacy.md](references/test-adequacy.md) |
| 完整检查清单 + 分级详解 | 📖 | [references/checklists.md](references/checklists.md) |
| 反模式速查 | 📖 | [references/anti-patterns.md](references/anti-patterns.md) |
| 交付模板 | 📖 | [references/templates.md](references/templates.md) |
| 教育行业适配 | 📖 | [references/education-review.md](references/education-review.md) |

## 深度分级

| 级别 | 适用场景 | 说明 |
|------|---------|------|
| L1 快速审查 | 小 diff/配置变更/文案修改/非核心模块 | Step 1-3 重点 + 5-6 扫描 → 报告 + 决策 |
| L2 标准审查 | 功能开发/接口实现/模块改动 | 完整 8 步 → 完整交付包(6文档) |
| L3 深度审查 | 核心模块/支付安全/数据迁移/架构重构 | 8 步 + 多轮交叉验证 → 交付包 + 风险专项报告 |

## 铁律

1. **审查目标是降低风险** — 不是挑刺，能跑 ≠ 可交付
2. **问题必须分级** — P0-P3 严格分级，阻断和建议必须分开
3. **意见必须可执行** — P0/P1 必须附具体修复建议
4. **信息不足就暂停** — 不猜测不假设，要求补充上下文
5. **审查 ≠ 重写** — 超出审查边界的改动回流开发专家
