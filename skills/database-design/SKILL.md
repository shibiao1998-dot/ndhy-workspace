---
name: database-design
description: "数据库设计执行工具箱：将业务需求转化为稳定、可扩展、可迁移、可维护的数据模型与数据库结构设计。覆盖9步标准流程，12大能力方向，3级深度分级，4层深度边界。含9条反模式防范、数据模型质量检查清单。Use when: 数据库设计、数据建模、表结构、字段设计、schema设计。Triggers on: 数据库设计, database design, 数据建模, 表结构, 字段设计, schema, 实体抽取, 聚合边界, 逻辑模型, 物理模型, 字段字典, 索引策略, 迁移策略, 审计字段, 软删除."
---

# database-design — 数据库设计执行工具箱

> 模型先于实现。语义稳定优先于临时凑字段。约束是设计的一部分，不是上线后再补。

## 模块速查

| 场景 | 加载 | 路径 |
|------|------|------|
| 9步标准流程 + 交付物 + 能力索引 | 📖 | [references/workflow.md](references/workflow.md) |
| 实体建模方法（抽取/聚合/概念） | 📖 | [references/entity-modeling.md](references/entity-modeling.md) |
| 逻辑与物理设计 | 📖 | [references/logical-physical-design.md](references/logical-physical-design.md) |
| 约束与索引策略 | 📖 | [references/constraints-indexes.md](references/constraints-indexes.md) |
| 生命周期与审计（审计/软删除/归档） | 📖 | [references/lifecycle-audit.md](references/lifecycle-audit.md) |
| 迁移与演进 | 📖 | [references/migration-evolution.md](references/migration-evolution.md) |
| 反模式（9条）+ 质量检查清单 | 📖 | [references/anti-patterns-checklists.md](references/anti-patterns-checklists.md) |
| 详版检查清单 + 一致性审查 | 📖 | [references/checklists.md](references/checklists.md) |
| 交付模板 | 📖 | [references/templates.md](references/templates.md) |
| 教育行业适配 | 📖 | [references/education-data.md](references/education-data.md) |

## 深度分级

| 级别 | 适用场景 | 说明 |
|------|---------|------|
| L1 快速建模 | 单模块/小功能/字段审查/索引评估 | Step 1-3 + 轻量逻辑模型 |
| L2 标准设计 | 新模块或重要改版 | 完整 9 步，输出 7 文档交付包 |
| L3 深度设计 | 全新产品/大规模重构/迁移 | 9 步 + 多方案对比 + 迁移预研 + 演进路线图 |

## 铁律

1. **模型先于实现** — 先抽实体、概念模型、逻辑模型，再建表
2. **约束与表结构同步交付** — "先跑起来约束以后加"是反模式
3. **向下只给约束，不越界写实现** — 向上只承接确认的业务边界
4. **每次schema变更附带迁移方案和回滚计划**

## 触发时首要动作

> "业务要做什么？核心实体是什么？有没有现有表结构？查询和写入模式是什么？"
> → 判断深度 → 按 9 步流程执行。教育项目额外读 references/education-data.md
