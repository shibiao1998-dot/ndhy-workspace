---
name: backend-development
description: >-
  后端服务实现执行工具箱：在既定的数据模型、接口契约、架构约束下，将业务能力准确、稳定、可维护地实现为后端服务。
  覆盖9步标准流程（理解输入、确认边界、handler层、service层、repository层、补齐横切关注点、测试、自检一致性、输出交付包），
  13大能力方向（handler实现/service业务逻辑/repository数据访问/输入校验/权限控制/错误处理/事务边界/日志可观测/单元测试/集成测试/服务重构/契约一致性审查/联调交接），
  3级深度分级（快速实现/标准开发/深度开发），5层深度边界（需求层/模型契约层/服务实现层/架构层/验证交付层），
  标准输出物为实现交付包（6文档+代码）。
  包含10条反模式防范、合格后端实现检查清单。
  Use when: (1) 需要实现接口handler/service/repository层,
  (2) 需要添加输入校验、权限控制、错误处理、事务边界、日志,
  (3) 需要编写后端单元测试或集成测试支撑,
  (4) 需要重构服务边界或审查契约一致性,
  (5) 用户提到后端开发、服务实现、handler、service、repository、controller.
  Triggers on: 后端开发, backend development, 服务实现, service implementation,
  handler, controller, service, repository, DAO, 业务逻辑, 接口实现,
  错误处理, 事务边界, 单元测试, 集成测试, 联调, 权限控制, 输入校验.
---

# 后端服务实现

> 在既定的数据模型、接口契约、架构约束下，将业务能力准确、稳定、可维护地实现为后端服务。

## 模块速查

| 场景 | 加载 | 路径 |
|------|------|------|
| 9步标准流程 + 职责边界 + 协作接口 | 📖 | [references/workflow.md](references/workflow.md) |
| 三层实现详解 (handler/service/repo) | 📖 | [references/handler-service-repo.md](references/handler-service-repo.md) |
| 校验与权限 | 📖 | [references/validation-auth.md](references/validation-auth.md) |
| 错误处理 + 事务 + 日志 | 📖 | [references/error-transaction-log.md](references/error-transaction-log.md) |
| 测试指南 | 📖 | [references/testing.md](references/testing.md) |
| 重构与审查 | 📖 | [references/refactoring.md](references/refactoring.md) |
| 质量检查清单 | 📖 | [references/checklists.md](references/checklists.md) |
| 反模式速查 | 📖 | [references/anti-patterns.md](references/anti-patterns.md) |
| 交付模板 | 📖 | [references/templates.md](references/templates.md) |
| 教育行业适配 | 📖 | [references/education-backend.md](references/education-backend.md) |

## 深度分级

| 级别 | 适用场景 | 说明 |
|------|---------|------|
| L1 快速实现 | 单接口/局部修复/补校验/加日志 | Step 1-2 简查 + 目标步骤 → 代码 + 简要说明 |
| L2 标准开发 | 新模块/完整功能/多接口 | 完整 9 步 → 完整交付包(6文档+代码) |
| L3 深度开发 | 核心模块从0到1/大规模重构/复杂业务 | 9 步 + 多方案对比 + 性能评估 → 交付包 + 重构报告 |

## 铁律

1. **契约必须被准确实现** — 模型必须被尊重，正确性优先于"看起来能跑"
2. **分层清晰** — handler 只做协议适配，service 编排业务，repo 隔离数据
3. **不篡改上游边界** — 发现契约/模型问题回流上游，不私自修改
4. **横切关注点是正式实现** — 校验、权限、错误处理、日志不是"后面再补"
5. **关键路径必须有测试** — 没有测试就默认未完成
