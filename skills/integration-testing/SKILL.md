---
name: integration-testing
description: >-
  Use when 需要前后端联调、端到端验证、契约对齐、集成问题归因，或判断是否可进入下一阶段。
  触发词：联调、集成测试、端到端验证、契约对齐、联调归因、回归验证。
---

# 联调集成

> 将多模块独立产出放到真实集成链路中连接、验证、归因和回流，确保整体可跑通。

## 模块速查

| 场景 | 加载 | 路径 |
|------|------|------|
| 8步标准流程 + 归因决策树 + 就绪标准 + 协作接口 | 📖 | [references/workflow.md](references/workflow.md) |
| 联调前提校验 | 📖 | [references/prerequisite-validation.md](references/prerequisite-validation.md) |
| 契约一致性对齐 | 📖 | [references/contract-alignment.md](references/contract-alignment.md) |
| 流程与时序验证 | 📖 | [references/flow-and-timing.md](references/flow-and-timing.md) |
| 归因与回流 | 📖 | [references/triage-and-attribution.md](references/triage-and-attribution.md) |
| 完整检查清单 + 就绪标准 | 📖 | [references/checklists.md](references/checklists.md) |
| 反模式速查 | 📖 | [references/anti-patterns.md](references/anti-patterns.md) |
| 交付模板 | 📖 | [references/templates.md](references/templates.md) |
| 教育行业适配 | 📖 | [references/education-integration.md](references/education-integration.md) |

## 深度分级

| 级别 | 适用场景 | 说明 |
|------|---------|------|
| L1 快速验证 | 单接口/单流程/小改动后回归 | Step 1-4 重点 + 5-6 扫描 → 流程报告 + 归因 |
| L2 标准联调 | 功能模块联调/迭代联调 | 完整 8 步 → 完整交付包(6文档) |
| L3 深度联调 | 全新产品首次联调/跨系统对接/核心链路 | 8 步 + 多轮回归 + 压力路径 → 交付包 + 风险专项 |

## 铁律

1. **局部能跑 ≠ 整体可用** — 联调目标是收敛真实问题，不是制造扯皮
2. **归因必须准确** — 有证据才归因，不笼统甩锅，附复现路径和对比
3. **回归必须闭环** — 每个修复逐项回归验证，不接受"应该好了"
4. **mock ≠ 真实** — 明确区分 mock 和真实对接，分别标记
5. **信息不足就停** — 不猜测、不假设、不硬调
