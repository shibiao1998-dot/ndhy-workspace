---
name: code-review
description: >-
  代码审查执行工具箱：对实现代码进行系统性审查，识别正确性、契约一致性、边界条件、
  可维护性、安全性、性能和测试充分性风险，输出分级审查意见与放行决策。
  覆盖8步标准流程（理解上下文、审查契约一致性、审查正确性与边界、审查结构与可维护性、
  审查安全与性能、审查测试充分性、分级与决策、输出审查包），
  12大审查方向（契约一致性/逻辑正确性/边界与异常/分层与职责/可维护性与重复/
  安全风险/性能与资源/测试充分性/问题分级/审查报告/结构性风险升级/复审清单），
  3级审查深度（快速审查/标准审查/深度审查），5层深度边界（需求设计/实现/审查/验证/运行），
  4级问题分级（阻断/需修改/建议/备注），标准输出物为审查交付包（6文档）。
  包含8条反模式防范、放行决策树、审查检查清单。
  Use when: (1) 需要对代码变更进行系统性审查,
  (2) 需要审查实现是否符合API契约和数据模型,
  (3) 需要审查逻辑正确性和边界条件,
  (4) 需要审查分层职责和可维护性,
  (5) 需要审查基础安全和性能风险,
  (6) 需要审查测试充分性,
  (7) 需要对审查发现进行分级并生成放行决策,
  (8) 用户提到代码审查、code review、审查报告、放行决策.
  Triggers on: 代码审查, code review, 审查报告, 放行决策, 审查意见,
  契约一致性审查, 逻辑审查, 安全审查, 性能审查, 测试充分性,
  审查分级, blocking issues, review report.
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
