---
name: release-strategy
description: "发布策略执行工具箱：设计产品从'开发完成'到'用户成功用起来'的全过程策略。覆盖9步标准流程，8大能力域，3级深度分级，含6条铁律、教育发布日历、灰度阶段速查、反模式速查、发布检查清单。Use when: 发布策略、版本规划、灰度发布、用户培训、数据迁移、发布复盘。Triggers on: 发布策略, release strategy, 版本规划, 灰度发布, 试点方案, 用户培训, 数据迁移, 系统切换, 发布执行, 发布复盘, 更新日志, changelog, 变更管理, 发布检查清单, 紧急发布, hotfix."
---

# release-strategy — 发布策略执行工具箱

> 代码上了服务器不等于发布成功，用户真正用起来了才算。发布 = 上线 + 触达 + 教会 + 驱动使用。

## 模块速查

| 场景 | 加载 | 路径 |
|------|------|------|
| 9步标准流程 + 交付物 + 能力索引 | 📖 | [references/workflow.md](references/workflow.md) |
| 版本规划与发布类型 | 📖 | [references/version-planning.md](references/version-planning.md) |
| 试点与灰度策略 | 📖 | [references/pilot-grayscale.md](references/pilot-grayscale.md) |
| 用户准备与培训 | 📖 | [references/user-training.md](references/user-training.md) |
| 沟通与变更管理 | 📖 | [references/communication-change.md](references/communication-change.md) |
| 数据迁移与系统切换 | 📖 | [references/migration-switchover.md](references/migration-switchover.md) |
| 发布执行管理 | 📖 | [references/execution-management.md](references/execution-management.md) |
| 效果评估与复盘 | 📖 | [references/evaluation-retrospective.md](references/evaluation-retrospective.md) |
| 教育发布日历 + 灰度阶段 | 📖 | [references/education-calendar.md](references/education-calendar.md) |
| 发布检查清单（6大类） | 📖 | [references/release-checklist.md](references/release-checklist.md) |
| 反模式速查（8条） | 📖 | [references/anti-patterns.md](references/anti-patterns.md) |
| 特殊场景发布策略 | 📖 | [references/special-scenarios.md](references/special-scenarios.md) |
| 协作接口（上下游/升级规则） | 📖 | [references/collaboration.md](references/collaboration.md) |
| 完整模板与清单 | 📖 | [references/templates.md](references/templates.md) |

## 深度分级

| 级别 | 适用场景 | 说明 |
|------|---------|------|
| L1 轻量发布 | bug修复、小优化 | Step 1 + 简化清单 + 更新日志 |
| L2 标准发布 | 新功能上线 | 完整 9 步，含灰度+培训+沟通+检查清单+复盘 |
| L3 重大发布 | 全新产品/大版本/政府交付 | 完整 9 步 + 试点 + 迁移 + 应急预案 + 深度复盘 |

## 铁律

1. **没有回退方案的发布 = 赌博** — 回退决策权和触发条件提前明确
2. **用户不会自己发现新功能** — 发布 = 上线 + 触达 + 教会 + 驱动使用
3. **灰度是保护伞不是麻烦事** — "时间紧"不是跳过灰度的理由
4. **复盘不做等于白做** — 改进项必须有责任人和完成时间

## 触发时首要动作

> 确认"发的是什么"→"发给谁"→"什么时候发"→"风险在哪"→"怎么判断成功"
> → 判断深度 → 按 9 步流程执行。教育项目额外读 references/education-calendar.md
