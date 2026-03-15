# 后端服务实现 — 9步标准流程

## 流程总览

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

## 标准交付物

```
{project}/backend/
  service-implementation/         # 实现代码
  backend-impl-notes.md           # 实现说明（设计决策、技术选型理由）
  known-limitations.md            # 已知限制与技术债务
  test-notes.md                   # 测试说明（覆盖范围、运行方式）
  integration-handoff.md          # 联调交接说明（环境、mock、注意事项）
  refactor-summary.md             # 重构说明（仅重构任务时输出）
```

## 5层深度边界速查

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

-> 详细实现方法和代码示例 [handler-service-repo.md](handler-service-repo.md)

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

## 13大能力方向覆盖索引

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

## 协作接口

### 上游输入

| 来源 | 接收内容 | 使用方式 |
|------|---------|---------|
| 产品/项目管理 | PRD、功能需求、验收点 | 理解要实现的业务能力 |
| 数据库专家（数据库设计专家） | schema、字段字典、约束 | 在模型约束内实现 repository |
| API 专家 | 接口契约、错误码规范 | 在契约约束内实现 handler |
| 技术架构专家（技术架构专家） | 系统约束、分层要求 | 在架构约束内选择实现方案 |

### 下游输出

| 接收方 | 传递内容 | 约束关系 |
|--------|---------|---------|
| 前端专家 | 联调说明、mock 数据 | 按契约和联调说明对接 |
| 代码审查专家（代码审查专家） | 代码 + impl-notes | 提供审查上下文 |
| 测试专家 | test-notes + 关键路径 | 在实现约束内设计测试 |
| 运维专家 | 配置/依赖/健康检查说明 | 在部署说明内执行上线 |

### 升级规则

| 场景 | 升级给 |
|------|--------|
| 数据模型不匹配实现需求 | 数据库专家（数据库设计专家） |
| API 契约不清晰或有歧义 | API 设计专家 |
| 架构约束导致实现困难 | 技术架构专家（技术架构专家） |
| 优先级/范围/阻塞 | 项目管理专家（项目管理专家） |
| 联调不一致 | 前端 + 联调专家 |
| 测试风险超出自测范围 | 测试专家 |

## 触发时首要动作

无论如何触发，第一步永远是：

> "要实现什么业务能力？API 契约定了吗？数据模型定了吗？架构约束是什么？有没有现有代码上下文？"

-> 判断实现深度 -> 消化输入 -> 按 9 步流程执行

**教育行业项目**：额外读取 [references/education-backend.md](references/education-backend.md) 了解行业特殊约束。
