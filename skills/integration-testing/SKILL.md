---
name: integration-testing
description: >-
  联调集成执行工具箱：将多模块、多专家的独立产出放到真实集成链路中进行连接、验证、归因和回流，
  确保系统不是"局部正确"而是"整体可跑通、可协作、可进入验证与交付阶段"。
  覆盖8步标准流程（理解边界、校验前提、核对契约一致性、跑通端到端流程、
  识别不一致与时序问题、归因与回流、回归验证、输出联调结论），
  12大能力方向（校验联调前提/核对契约vs实现一致性/核对前后端一致性/跑通端到端流程/
  识别字段与状态不一致/识别错误语义不一致/识别时序与异步问题/归因集成问题/
  生成回归清单/验证回归结果/汇总联调结论/标记阶段就绪），
  3级联调深度（快速验证/标准联调/深度联调），5层深度边界（设计定义/单模块实现/集成闭环/完整验证/发布运行），
  归因决策树，标准输出物为联调交付包（6文档）。
  包含8条反模式防范、就绪判断标准、联调检查清单。
  Use when: (1) 需要校验联调前提是否满足,
  (2) 需要核对API契约与前后端实现的一致性,
  (3) 需要跑通端到端关键流程,
  (4) 需要识别字段、状态、错误语义、时序不一致,
  (5) 需要对集成问题进行归因并回流对应专家,
  (6) 需要生成回归清单并验证修复结果,
  (7) 需要汇总联调结论并判断是否可进入下一阶段,
  (8) 用户提到联调、集成测试、端到端验证、契约对齐、联调归因.
  Triggers on: 联调, 集成测试, integration testing, 端到端验证, 契约对齐,
  前后端一致性, 联调归因, 回归验证, 联调就绪, 集成问题, 联调闭环.
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
