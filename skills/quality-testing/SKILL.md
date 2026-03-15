---
name: quality-testing
description: >-
  质量测试执行工具箱：基于需求、设计、实现和联调结果，系统性验证功能、边界、异常、
  回归与发布风险，判断交付物是否达到可验收、可发布或需继续修正的质量门槛。
  覆盖9步标准流程（理解目标、识别风险、制定策略、设计用例、执行验证、记录缺陷、
  回归验证、汇总结果、形成结论），
  12大能力方向（测试策略/风险场景/测试计划/测试用例/边界异常/缺陷记录/缺陷分级/
  回归清单/回归验证/结果汇总/发布风险/验收结论），
  3级深度分级（快速验证/标准测试/深度测试），6层深度边界
  （需求设计/实现/代码审查/集成闭环/验证验收/发布运行），
  标准输出物为测试交付包（7文档）。
  包含9条反模式防范、缺陷分级框架(P0-P3)、发布风险评估矩阵、验收结论判断标准。
  Use when: (1) 需要制定测试策略和测试计划,
  (2) 需要设计测试用例（主路径/边界/异常/兼容性）,
  (3) 需要记录缺陷、复现路径和影响范围,
  (4) 需要对缺陷进行P0-P3分级,
  (5) 需要设计回归清单和执行回归验证,
  (6) 需要汇总测试结果和评估发布风险,
  (7) 需要形成阶段验收结论（通过/有条件通过/不通过）,
  (8) 用户提到测试、验证、缺陷、回归、发布风险、验收.
  Triggers on: 测试, testing, 测试策略, 测试计划, 测试用例, test case,
  缺陷, bug, defect, 回归, regression, 发布风险, release risk,
  验收, acceptance, 质量验证, quality validation, 边界测试,
  异常测试, 缺陷分级, 风险评估.
---

# 质量测试

> 系统性验证功能、边界、异常、回归与发布风险，判断交付物是否达到可验收、可发布的质量门槛。

## 模块速查

| 场景 | 加载 | 路径 |
|------|------|------|
| 9步标准流程 + 缺陷分级 + 风险矩阵 + 验收标准 + 协作接口 | 📖 | [references/workflow.md](references/workflow.md) |
| 策略与计划 | 📖 | [references/strategy-planning.md](references/strategy-planning.md) |
| 用例设计方法 | 📖 | [references/test-case-design.md](references/test-case-design.md) |
| 缺陷管理 | 📖 | [references/defect-management.md](references/defect-management.md) |
| 回归验证 | 📖 | [references/regression-verification.md](references/regression-verification.md) |
| 完整检查清单 + 发布风险评估 | 📖 | [references/checklists.md](references/checklists.md) |
| 反模式速查 | 📖 | [references/anti-patterns.md](references/anti-patterns.md) |
| 交付模板 | 📖 | [references/templates.md](references/templates.md) |
| 教育行业适配 | 📖 | [references/education-testing.md](references/education-testing.md) |

## 深度分级

| 级别 | 适用场景 | 说明 |
|------|---------|------|
| L1 快速验证 | 小功能修复/配置变更/单接口验证 | Step 1-2 快速 + Step 4-5 重点 → 轻量用例 + 缺陷 + 结论 |
| L2 标准测试 | 新功能模块/重要改版/常规迭代 | 完整 9 步 → 完整交付包(7文档) |
| L3 深度测试 | 全新产品/核心模块重构/发布前全面验证 | 9 步 + 探索性测试 + 多轮回归 → 交付包 + 专项报告 |

## 铁律

1. **能跑通 ≠ 已验证** — Happy path 不是测试的全部
2. **缺陷必须分级** — P0-P3 严格分级，附复现路径和影响范围
3. **回归必须闭环** — 跟踪到修复 → 回归验证 → 关闭
4. **风险必须标注** — 跳过的验证必须在报告中标为"未验证风险"
5. **先覆盖高风险** — 先覆盖高风险场景，再补充常规场景
