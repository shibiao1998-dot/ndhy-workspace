---
name: deployment-ops
description: >-
  Use when 需要部署发布、运维监控、回滚操作，或执行发布前检查。
  触发词：部署、发布、上线、运维、回滚、监控告警、发布检查、健康检查、环境校验。
---

# deployment-ops — 部署运维执行工具箱

> 能部署不等于可上线。没有回滚和监控的发布不是合格发布。

## 模块速查

| 场景 | 加载 | 路径 |
|------|------|------|
| 9步标准流程 + 交付物 + 能力索引 | 📖 | [references/workflow.md](references/workflow.md) |
| 发布前提校验（环境/配置/密钥） | 📖 | [references/prerequisites.md](references/prerequisites.md) |
| 发布执行设计（步骤/窗口/灰度） | 📖 | [references/release-execution.md](references/release-execution.md) |
| 回滚与恢复方案 | 📖 | [references/rollback-recovery.md](references/rollback-recovery.md) |
| 可观测性（健康检查/监控/告警） | 📖 | [references/observability.md](references/observability.md) |
| 发布就绪判断 + 回滚决策树 | 📖 | [references/readiness-rollback.md](references/readiness-rollback.md) |
| 完整检查清单 + 风险评估 | 📖 | [references/checklists.md](references/checklists.md) |
| 反模式速查（9条） | 📖 | [references/anti-patterns.md](references/anti-patterns.md) |
| 协作接口（上下游/升级规则） | 📖 | [references/collaboration.md](references/collaboration.md) |
| 交付模板 | 📖 | [references/templates.md](references/templates.md) |
| 教育行业适配 | 📖 | [references/education-ops.md](references/education-ops.md) |

## 深度分级

| 级别 | 适用场景 | 说明 |
|------|---------|------|
| L1 快速发布 | 配置变更/小补丁/单服务热修 | Step 1-3 + 简版回滚 + 检查清单 |
| L2 标准发布 | 常规迭代/多模块上线 | 完整 9 步，输出 7 文档交付包 |
| L3 深度发布 | 全新产品/大规模架构变更/数据迁移 | 完整 9 步 + 多方案对比 + 演练验证 |

## 铁律

1. **没有回滚方案的发布 = 赌博** — 每次发布必附回滚方案
2. **向下只给约束，不越界写代码** — 向上只消费已确认结论，不替上游补质量
3. **上线前必须有监控和告警** — 没有可观测性不发布
4. **环境和配置问题发布前解决** — 不带入生产

## 触发时首要动作

> "发布目标是什么？变更了哪些模块？联调和测试结论是否齐备？有没有已知风险？"
> → 判断深度 → 按 9 步流程执行。教育项目额外读 references/education-ops.md
