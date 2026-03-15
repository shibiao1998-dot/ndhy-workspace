# 发布策略 — 9 步标准流程

```
Step 1: 理解发布背景
  |  → 发布内容：全新产品/新功能/优化/修复？
  |  → 发布目标：用户增长/体验提升/客户交付？
  |  → 上游文档：产品定义/体验设计/技术架构/项目计划是否齐全？
  |  → 约束条件：时间窗口/预算/团队资源？
  |  → 已知风险有哪些？
  |  → 信息不足 → 要求上游补充（不猜测、不假设）
  |
Step 2: 制定发布策略
  |  → 确定发布类型和规模 → references/version-planning.md
  |  → 选择发布窗口（结合教育行业日历，见 education-calendar.md）
  |  → 制定灰度/试点方案 → references/pilot-grayscale.md
  |  → 设定各阶段"开门/关门"标准
  |  → 确认：这个节奏，团队和用户都跟得上吗？
  |
Step 3: 设计用户准备方案
  |  → 培训内容和形式设计（三层蛋糕 + 6种形式）
  |  → 培训对象分层（管理员/领导/教师/学生）
  |  → 种子教师策略
  |  → 帮助文档和FAQ准备
  |  → 详细方法 → references/user-training.md
  |
Step 4: 制定沟通计划
  |  → 内部沟通计划（各团队对齐时间表）
  |  → 外部沟通计划（用户通知/更新日志/宣传配合）
  |  → 变更管理策略（处理用户抵触情绪）
  |  → 详细方法 → references/communication-change.md
  |
Step 5: 准备数据迁移方案（如需要）
  |  → 数据盘点和映射规则
  |  → 选择切换策略（并行/分批/一刀切）
  |  → 迁移测试和验证方案
  |  → 用户告知和确认方案
  |  → 详细方法 → references/migration-switchover.md
  |
Step 6: 制定发布执行计划
  |  → 发布检查清单（6大类）
  |  → 发布日流程和角色分工（War Room 模式）
  |  → 回退方案和触发条件
  |  → 应急预案 + 紧急发布流程
  |  → 详细方法 → references/execution-management.md
  |
Step 7: 设定效果评估方案
  |  → 定义"发布成功"的4层标准（技术/到达/采纳/价值）
  |  → 设定各阶段监控指标
  |  → 规划复盘时间和形式
  |  → 详细方法 → references/evaluation-retrospective.md
  |
Step 8: 执行与监控
  |  → 按计划执行发布
  |  → 实时监控各项指标
  |  → 处理发布过程中的问题
  |  → 根据数据决定"继续推进"还是"暂停/回退"
  |
Step 9: 复盘与沉淀
     → 执行复盘会议（6模块框架）
     → 输出复盘报告
     → 更新检查清单、模板、知识库
     → 跟踪改进项落地
     → 详细方法 → references/evaluation-retrospective.md
```

## 标准交付物

```
{project}/release/
  release-strategy.md           # 发布策略文档（10章节）
  pilot-plan.md                 # 试点与灰度方案
  training-plan.md              # 用户培训方案
  communication-plan.md         # 沟通计划
  migration-plan.md             # 数据迁移方案（如适用）
  release-checklist.md          # 发布检查清单
  release-retrospective.md      # 发布复盘报告
```

## 8 大能力域覆盖索引

| # | 能力域 | 流程步骤 | 详细参考 |
|---|--------|---------|---------|
| 1 | 发布规划与版本策略 | Step 2 | references/version-planning.md |
| 2 | 试点与灰度策略 | Step 2 | references/pilot-grayscale.md |
| 3 | 用户准备与培训 | Step 3 | references/user-training.md |
| 4 | 数据迁移与系统切换 | Step 5 | references/migration-switchover.md |
| 5 | 沟通与变更管理 | Step 4 | references/communication-change.md |
| 6 | 发布执行管理 | Step 6/8 | references/execution-management.md |
| 7 | 发布效果评估与复盘 | Step 7/9 | references/evaluation-retrospective.md |
| 8 | 特殊场景发布策略 | 按需 | references/special-scenarios.md |

## 工作模式决策树

```
收到发布策略任务
  |- 轻量任务（更新日志/单次沟通/简单通知）
  |   → 单独执行
  |
  |- 明确边界的专项任务（试点方案/培训方案/迁移方案）
  |   → 作为 subagent 被调用（默认模式）
  |
  +- 大发布 / 全新产品 / 多团队协同
      |- 涉及技术部署/数据迁移/多端同步？
      |   → Agent Team（拉技术/运维/测试专家协作）
      +- 否 → subagent 模式 + 输出后交相关专家执行
```
