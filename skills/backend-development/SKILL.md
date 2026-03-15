---
name: backend-development
description: >-
  后端服务实现执行工具箱：在既定的数据模型、接口契约、架构约束下，将业务能力准确、稳定、可维护地实现为后端服务。
  覆盖9步标准流程（理解输入、确认边界、handler层、service层、repository层、补齐横切关注点、测试、自检一致性、输出交付包），
  13大能力方向（handler实现/service业务逻辑/repository数据访问/输入校验/权限控制/错误处理/事务边界/日志可观测/单元测试/集成测试/服务重构/契约一致性审查/联调交接），
  3级深度分级（快速实现/标准开发/深度开发），5层深度边界（需求层/模型契约层/服务实现层/架构层/验证交付层），
  标准输出物为实现交付包（6文档+代码）。
  包含10条反模式防范、合格后端实现检查清单。
  Use when: (1) 需要根据API契约实现接口handler层,
  (2) 需要实现服务层业务逻辑,
  (3) 需要实现数据访问层repository/DAO,
  (4) 需要添加输入校验、权限控制、错误处理、事务边界、日志,
  (5) 需要编写后端单元测试或集成测试支撑,
  (6) 需要重构服务边界或审查实现层契约一致性,
  (7) 需要输出联调与测试交接说明,
  (8) 用户提到后端开发、服务实现、handler、service、repository、controller.
  Triggers on: 后端开发, backend development, 服务实现, service implementation,
  handler, controller, service, repository, DAO, 业务逻辑, 接口实现,
  错误处理, 事务边界, 单元测试, 集成测试, 联调, 权限控制, 输入校验.
---

# backend-development -- 后端服务实现执行工具箱

在既定的数据模型、接口契约、架构约束和项目目标下，将业务能力准确、稳定、可维护地实现为后端服务。

> 契约必须被准确实现。模型必须被尊重。正确性优先于"看起来能跑"。

## 模块速查

| # | 模块 | 何时用 | 详细位置 |
|---|------|--------|----------|
| 1 | 9 步标准流程 | 每次后端实现全程 | 本文 §9步标准流程 |
| 2 | 3 级深度速查 | Step 0 判断投入量 | 本文 §实现深度速查 |
| 3 | 5 层深度边界 | 划清职责边界 | 本文 §深度边界速查 |
| 4 | 分层实现指南 | handler→service→repo | 本文 §分层实现速查 |
| 5 | 工作模式决策树 | 开始前判断协作方式 | 本文 §工作模式决策树 |
| 6 | 反模式速查 | 自检常见陷阱 | 本文 §反模式速查 |
| 7 | 质量检查清单 | 交付前逐项验收 | 本文 §合格后端实现检查清单 |
| 8 | 三层实现详解 | handler/service/repo 方法论 | [references/handler-service-repo.md](references/handler-service-repo.md) |
| 9 | 校验与权限 | 输入校验 + 权限控制 | [references/validation-auth.md](references/validation-auth.md) |
| 10 | 错误/事务/日志 | 错误处理 + 事务 + 可观测性 | [references/error-transaction-log.md](references/error-transaction-log.md) |
| 11 | 测试指南 | 单元测试 + 集成测试 | [references/testing.md](references/testing.md) |
| 12 | 重构与审查 | 服务边界重构 + 契约一致性 | [references/refactoring.md](references/refactoring.md) |
| 13 | 检查清单详版 | 质量检查 + 反模式详解 + 联调 | [references/checklists.md](references/checklists.md) |
| 14 | 交付模板 | 6 个交付文件模板 | [references/templates.md](references/templates.md) |
| 15 | 教育行业适配 | 教育项目专用 | [references/education-backend.md](references/education-backend.md) |

---

## 9 步标准流程

```
Step 1: 理解需求、契约、模型和架构约束
  |  消化 PRD/功能需求 + API 契约 + 数据模型/schema + 架构约束
  |  -> 提取: 要实现的业务能力、涉及的实体和接口、前端消费约束
  |  -> 确认: 错误码规范、权限模型、事务边界要求、日志规范
  |  -> 信息不足 -> 要求上游补充（不猜测、不假设）
  |
Step 2: 确认模块边界与实现落点
  |  -> 本次实现涉及哪些模块（新模块/已有模块扩展）
  |  -> 代码落在哪个包/目录，与哪些已有模块交互
  |  -> 依赖关系排序：先 repository → service → handler
  |  -> 识别需并行/串行的实现单元
  |
Step 3: 实现 handler/controller 层
  |  -> 路由映射（URL + HTTP Method → handler 方法）
  |  -> 请求解析与参数绑定
  |  -> 调用 service 层（不含业务逻辑）
  |  -> 响应组装与序列化
  |  -> 详细方法 -> references/handler-service-repo.md §Handler层
  |
Step 4: 实现 service/use case 层业务逻辑
  |  -> 编排业务规则和流程
  |  -> 状态流转与业务校验
  |  -> 跨 repository 协调
  |  -> 事件发布（如需要）
  |  -> 详细方法 -> references/handler-service-repo.md §Service层
  |
Step 5: 实现 repository/data access 层
  |  -> 按数据模型实现 CRUD 操作
  |  -> 查询构建（条件/排序/分页）
  |  -> 数据映射（entity ↔ domain object）
  |  -> 详细方法 -> references/handler-service-repo.md §Repository层
  |
Step 6: 补齐横切关注点
  |  -> 输入校验（参数格式/业务规则/权限前置）
  |  -> 权限控制（认证/授权/数据权限）
  |  -> 错误处理（分层异常/错误码映射/统一响应）
  |  -> 事务边界（事务范围/隔离级别/补偿机制）
  |  -> 日志与可观测性（请求日志/业务日志/链路追踪）
  |  -> 详细方法 -> references/validation-auth.md
  |  -> 详细方法 -> references/error-transaction-log.md
  |
Step 7: 编写测试
  |  -> 单元测试（service 层核心逻辑/边界条件/异常路径）
  |  -> 集成测试支撑（测试工具类/mock/fixture/测试配置）
  |  -> 详细方法 -> references/testing.md
  |
Step 8: 自检契约一致性与可维护性
  |  -> API 契约对齐检查（URL/Method/参数/响应/错误码）
  |  -> 数据模型对齐检查（字段映射/约束遵守）
  |  -> 边界条件覆盖检查
  |  -> 代码结构与可读性检查
  |  -> 详细方法 -> references/refactoring.md §契约一致性审查
  |
Step 9: 输出交付包
     -> 6 个标准文档 + 代码（见下方）
     -> 过质量检查清单（见下方速查）
     -> 按模板组织 -> references/templates.md
```

### 标准交付物

```
{project}/backend/
  service-implementation/         # 实现代码
  backend-impl-notes.md           # 实现说明（设计决策、技术选型理由）
  known-limitations.md            # 已知限制与技术债务
  test-notes.md                   # 测试说明（覆盖范围、运行方式）
  integration-handoff.md          # 联调交接说明（环境、mock、注意事项）
  refactor-summary.md             # 重构说明（仅重构任务时输出）
```

---

## 实现深度速查

| 深度 | 适用场景 | 覆盖步骤 | 输出物 |
|------|----------|----------|--------|
| **快速实现** | 单接口/局部修复/补校验/加日志 | Step 1-2 简查 + 3-6 目标步骤 | 代码 + 简要 impl-notes |
| **标准开发** | 新模块/完整功能/多接口 | 完整 9 步 | 完整交付包（6 文档 + 代码） |
| **深度开发** | 核心模块从 0 到 1 / 大规模重构 / 复杂业务 | 完整 9 步 + 多方案对比 + 性能评估 | 完整交付包 + 重构报告 + 性能评估 |

判断不清时向上确认。

---

## 5 层深度边界速查

| 层级 | 主责 | 后端开发专家的关系 | 边界说明 |
|------|------|-------------------|---------|
| **业务需求与流程层** | PM/产品/体验 | 消费输入 | 不替产品定义需求，需求不清回流确认 |
| **数据模型与接口契约层** | 数据库/API 专家 | 消费输入 | 不篡改模型和契约，发现问题回流上游 |
| **服务实现层（核心）** | **后端开发专家** | 主责 | handler/service/repo/校验/权限/错误/事务/日志 |
| **系统级架构层** | 技术架构专家 | 承接约束 | 在架构约束内实现，不越权主导架构选型 |
| **验证与交付层** | 审查/联调/测试/运维 | 提供支持 | 提供测试支撑和联调说明，不替代最终验收 |

**铁律**：
- 不替数据库专家重新定义主数据模型
- 不替 API 专家擅自修改接口契约
- 不因"实现方便"改坏上游边界
- 发现上游问题 → 回流而非绕行

---

## 分层实现速查

### Handler/Controller 层 — 协议适配

| 职责 | 说明 |
|------|------|
| ✅ 做 | 路由映射、请求解析、参数绑定、调用 service、响应组装 |
| ❌ 不做 | 业务逻辑、数据库访问、复杂条件判断 |
| 原则 | 薄层——只做协议转换，一眼能看完 |

### Service/Use Case 层 — 业务编排

| 职责 | 说明 |
|------|------|
| ✅ 做 | 业务规则执行、流程编排、状态流转、跨 repo 协调、事务控制 |
| ❌ 不做 | HTTP 细节、SQL 语句、框架特定注解堆砌 |
| 原则 | 业务核心——读代码就能理解业务规则 |

### Repository/DAO 层 — 数据访问

| 职责 | 说明 |
|------|------|
| ✅ 做 | CRUD 实现、查询构建、数据映射、缓存策略 |
| ❌ 不做 | 业务判断、流程编排、响应格式化 |
| 原则 | 数据隔离——切换数据源不影响 service 层 |

-> 详细实现方法和代码示例 [references/handler-service-repo.md](references/handler-service-repo.md)

---

## 工作模式决策树

```
收到后端实现任务
  |- 小范围任务（单接口/补校验/加日志/修 bug/补测试）
  |   -> 单独执行
  |
  |- 明确边界的专项任务（单模块实现/单 use case/错误码映射）
  |   -> 作为 subagent 被调用（默认模式）
  |
  +- 大 feature / 核心模块从 0 到 1 / 跨模块重构
      |- 涉及 DB 模型变更 / API 契约调整 / 前端联调？
      |   -> Agent Team（拉数据库/API/前端/测试专家协同）
      +- 否 -> subagent 模式 + 输出后交相关专家细化
```

**禁止**：
- 简单实现滥用 Agent Team
- 上游边界未清前大规模并行写实现
- 用并行掩盖需求和契约没定清楚
- 变成全能替身（替 DB 建表、替 API 定契约、替前端写交互）

---

## 反模式速查

| # | ❌ 错误做法 | ✅ 正确做法 |
|---|-----------|-----------|
| 1 | 看到接口就把所有逻辑塞进 controller | handler 只做协议适配，业务逻辑下沉到 service |
| 2 | service/repository/domain 职责混乱 | 每层职责一句话说清，跨层调用只通过接口 |
| 3 | 为图快绕过输入校验和权限判断 | 校验和权限是正式实现，不是"后面再补"的东西 |
| 4 | 用 if/else 堆砌状态逻辑不做边界抽象 | 提取状态机或策略模式，让状态转换可枚举可测试 |
| 5 | 把数据库字段直接泄漏成 API 响应 | 通过 DTO/VO 做映射，数据库结构变更不穿透到 API |
| 6 | 为适配前端临时写法污染长期实现 | 前端适配放在 handler 层 DTO 映射，不污染 service |
| 7 | 无日志、无错误码映射、无异常分层 | 错误处理三件套：分层异常 + 错误码映射 + 结构化日志 |
| 8 | 没有测试就默认实现正确 | 关键路径必须有单元测试，边界条件必须有测试用例 |
| 9 | 复制粘贴逻辑到多个模块 | 提取公共服务或工具方法，单点维护 |
| 10 | 实现层偷偷改契约或模型不升级说明 | 发现契约/模型问题 → 回流上游确认 → 不私自改 |

-> 详细防范方法与案例 [references/checklists.md](references/checklists.md) §反模式详细防范

---

## 合格后端实现检查清单

| # | 检验项 | 通过条件 |
|---|--------|---------|
| 1 | **契约一致** | 实现与 API 契约完全对齐（URL/Method/参数/响应/错误码） |
| 2 | **业务逻辑正确** | 核心业务规则有实现、有测试、有边界处理 |
| 3 | **分层清晰** | handler/service/repo 各司其职，无越层调用 |
| 4 | **输入校验完整** | 必填/格式/范围/业务规则校验齐全 |
| 5 | **权限控制到位** | 认证 + 授权 + 数据权限，无越权路径 |
| 6 | **错误处理完整** | 分层异常 + 错误码映射 + 统一响应格式 |
| 7 | **事务边界合理** | 事务范围最小化，无嵌套事务陷阱 |
| 8 | **日志可观测** | 请求日志 + 业务关键日志 + 异常日志，含链路 ID |
| 9 | **测试覆盖关键路径** | 核心 service 有单元测试，覆盖正常/异常/边界 |
| 10 | **代码结构清晰** | 命名自解释，无魔法值，无超长方法 |
| 11 | **无隐性耦合** | 模块间通过接口交互，无直接依赖内部实现 |
| 12 | **下游可接入** | 联调说明完整，测试专家/前端能稳定对接 |

-> 详细检查清单 [references/checklists.md](references/checklists.md) §实现质量检查清单

---

## 13 大能力方向覆盖索引

| # | 能力方向 | 流程步骤 | 详细参考 |
|---|---------|---------|---------|
| 1 | 实现接口入口层（handler/controller） | Step 3 | references/handler-service-repo.md §Handler层 |
| 2 | 实现服务层业务逻辑（service/use case） | Step 4 | references/handler-service-repo.md §Service层 |
| 3 | 实现数据访问层（repository/DAO） | Step 5 | references/handler-service-repo.md §Repository层 |
| 4 | 添加输入校验 | Step 6 | references/validation-auth.md §输入校验 |
| 5 | 添加权限控制 | Step 6 | references/validation-auth.md §权限控制 |
| 6 | 添加错误处理与错误码映射 | Step 6 | references/error-transaction-log.md §错误处理 |
| 7 | 添加事务边界 | Step 6 | references/error-transaction-log.md §事务边界 |
| 8 | 添加日志与可观测性 | Step 6 | references/error-transaction-log.md §日志可观测性 |
| 9 | 编写单元测试 | Step 7 | references/testing.md §单元测试 |
| 10 | 编写集成测试支撑 | Step 7 | references/testing.md §集成测试 |
| 11 | 重构服务边界 | Step 8+ | references/refactoring.md §服务边界重构 |
| 12 | 审查实现层契约一致性 | Step 8 | references/refactoring.md §契约一致性审查 |
| 13 | 输出联调与测试交接说明 | Step 9 | references/checklists.md §联调交接指南 |

---

## 协作接口

### 上游输入

| 来源 | 接收内容 | 使用方式 |
|------|---------|---------|
| 产品/项目管理 | PRD、功能需求、验收点 | 理解要实现的业务能力 |
| 数据库专家（沈表序） | schema、字段字典、约束 | 在模型约束内实现 repository |
| API 专家 | 接口契约、错误码规范 | 在契约约束内实现 handler |
| 技术架构专家（骆骨架） | 系统约束、分层要求 | 在架构约束内选择实现方案 |

### 下游输出

| 接收方 | 传递内容 | 约束关系 |
|--------|---------|---------|
| 前端专家 | 联调说明、mock 数据 | 按契约和联调说明对接 |
| 代码审查专家（严守正） | 代码 + impl-notes | 提供审查上下文 |
| 测试专家 | test-notes + 关键路径 | 在实现约束内设计测试 |
| 运维专家 | 配置/依赖/健康检查说明 | 在部署说明内执行上线 |

### 升级规则

| 场景 | 升级给 |
|------|--------|
| 数据模型不匹配实现需求 | 数据库专家（沈表序） |
| API 契约不清晰或有歧义 | API 设计专家 |
| 架构约束导致实现困难 | 技术架构专家（骆骨架） |
| 优先级/范围/阻塞 | 项目管理专家（纪统辰） |
| 联调不一致 | 前端 + 联调专家 |
| 测试风险超出自测范围 | 测试专家 |

---

## 触发时首要动作

无论如何触发，第一步永远是：

> "要实现什么业务能力？API 契约定了吗？数据模型定了吗？架构约束是什么？有没有现有代码上下文？"

-> 判断实现深度 -> 消化输入 -> 按 9 步流程执行

**教育行业项目**：额外读取 [references/education-backend.md](references/education-backend.md) 了解行业特殊约束。
