# 数据库设计 — 9 步标准流程

```
Step 1: 理解业务目标与边界
  |  消化 PRD、业务流程、领域边界说明
  |  -> 提取: 核心业务目标、关键流程、一致性要求、历史系统约束
  |  -> 确认: 上游是否有 API 草案、查询/写入模式、合规要求
  |  -> 信息不足 -> 要求上游补充（不猜测、不假设）
  |
Step 2: 抽取业务实体与识别聚合边界
  |  -> 名词法 + 动词法从需求中提取候选实体
  |  -> 过滤噪声实体（UI 概念、派生数据、临时状态）
  |  -> 识别聚合根、聚合边界、实体间关系（1:1 / 1:N / M:N）
  |  -> 标注实体生命周期和状态流转
  |  -> 详细方法 -> references/entity-modeling.md
  |
Step 3: 设计概念模型
  |  -> 绘制实体关系图（只含实体名 + 关系，不含字段）
  |  -> 标注聚合边界和核心业务规则
  |  -> 确认概念模型覆盖所有核心业务场景
  |  -> 详细方法 -> references/entity-modeling.md 概念模型
  |
Step 4: 设计逻辑数据模型
  |  -> 为每个实体定义属性（字段名、语义、是否必填）
  |  -> 确定主键策略、关系映射方式
  |  -> 判断规范化级别（3NF 为基线，有理由可降级）
  |  -> 处理 M:N 关系（中间表设计）
  |  -> 详细方法 -> references/logical-physical-design.md 逻辑模型
  |
Step 5: 设计物理表结构 + 生命周期
  |  -> 字段类型选择、命名规范、默认值
  |  -> 设计审计字段（created_at/updated_at/created_by/updated_by）
  |  -> 设计软删除策略（is_deleted / deleted_at）
  |  -> 设计状态机与生命周期字段
  |  -> 设计历史版本模型（如需要）
  |  -> 设计归档策略（如需要）
  |  -> 详细方法 -> references/logical-physical-design.md 物理模型
  |  -> 详细方法 -> references/lifecycle-audit.md
  |
Step 6: 设计约束与索引策略
  |  -> 主键 / 外键 / 唯一约束 / NOT NULL / CHECK 约束
  |  -> 基于查询模式设计索引（B-Tree / 复合 / 部分 / 函数）
  |  -> 评估索引的写入开销与查询收益
  |  -> 详细方法 -> references/constraints-indexes.md
  |
Step 7: 评估演进风险与一致性
  |  -> 识别 schema 变更风险点（字段重命名/类型变更/约束变更）
  |  -> 评估与现有系统的兼容性
  |  -> 审查跨表/跨模块一致性风险
  |  -> 详细方法 -> references/migration-evolution.md 风险评估
  |  -> 详细方法 -> references/checklists.md 一致性审查
  |
Step 8: 规划迁移策略
  |  -> 制定迁移步骤（DDL 顺序、数据回填、验证）
  |  -> 设计回滚方案
  |  -> 评估迁移对在线服务的影响
  |  -> 详细方法 -> references/migration-evolution.md 迁移策略
  |
Step 9: 输出交付包
     -> 7 个标准文档（见下方）
     -> 生成字段字典
     -> 过质量检查清单
     -> 按模板组织 -> references/templates.md
```

## 标准交付物

```
{project}/database/
  domain-model.md               # 领域概念模型
  logical-data-model.md         # 逻辑数据模型
  physical-schema.sql           # 物理表结构（DDL）
  field-dictionary.md           # 字段字典
  constraint-and-index-plan.md  # 约束与索引方案
  schema-migration-plan.md      # 迁移方案
  data-risk-report.md           # 数据风险报告
```

## 12 大能力方向覆盖索引

| # | 能力方向 | 流程步骤 | 详细参考 |
|---|---------|---------|---------|
| 1 | 从需求中抽取业务实体 | Step 2 | references/entity-modeling.md 实体抽取 |
| 2 | 识别聚合边界与关系 | Step 2 | references/entity-modeling.md 聚合边界 |
| 3 | 设计概念模型 | Step 3 | references/entity-modeling.md 概念模型 |
| 4 | 设计逻辑数据模型 | Step 4 | references/logical-physical-design.md 逻辑模型 |
| 5 | 设计物理表结构 | Step 5 | references/logical-physical-design.md 物理模型 |
| 6 | 设计审计字段与历史模型 | Step 5 | references/lifecycle-audit.md 审计 + 历史 |
| 7 | 设计软删除与归档策略 | Step 5 | references/lifecycle-audit.md 软删除 + 归档 |
| 8 | 设计约束与索引策略 | Step 6 | references/constraints-indexes.md |
| 9 | 生成字段字典 | Step 9 | references/checklists.md 字段字典指南 |
| 10 | 评估 schema 演进风险 | Step 7 | references/migration-evolution.md 风险评估 |
| 11 | 规划迁移策略 | Step 8 | references/migration-evolution.md 迁移策略 |
| 12 | 审查一致性风险 | Step 7 | references/checklists.md 一致性审查 |

## 工作模式决策树

```
收到数据建模任务
  |- 小范围任务（字段审查/索引评估/字典生成/单表设计）
  |   -> 单独执行
  |
  |- 明确边界的专项任务（单模块建模/审计策略/迁移评估）
  |   -> 作为 subagent 被调用（默认模式）
  |
  +- 大 feature / 新产品 / 多专家强依赖
      |- 模型影响 API 契约 / 后端事务 / 测试数据？
      |   -> Agent Team（拉 API/后端/测试专家评审）
      +- 否 -> subagent 模式 + 输出后交相关专家细化
```

## 协作接口

### 上游输入

| 来源 | 接收内容 | 使用方式 |
|------|---------|---------|
| 产品/项目管理 | PRD、业务流程、领域边界 | 理解业务目标和实体范围 |
| 技术架构专家 | 系统约束、存储策略、分层要求 | 在架构约束内设计模型 |
| API 设计专家 | 接口草案、消费约束 | 确保模型能支撑 API 契约 |

### 下游输出

| 接收方 | 传递内容 | 约束关系 |
|--------|---------|---------|
| API 专家 | 字段语义、关系映射 | 在模型语义内设计契约 |
| 后端专家 | 表结构、约束、索引 | 在模型约束内实现 ORM/DAO |
| 测试专家 | 状态机、边界条件、约束 | 在模型约束内设计测试 |
| 运维专家 | 迁移方案、归档策略 | 在迁移计划内执行部署 |

### 升级规则

| 场景 | 升级给 |
|------|--------|
| 需求模糊、边界冲突 | 项目管理专家 |
| 接口字段语义冲突 | API 设计专家 |
| 访问模式/事务边界冲突 | 后端开发专家 |
| 系统级存储/分层约束 | 技术架构专家 |
| 上线/迁移执行风险 | 测试 + 运维专家 |
