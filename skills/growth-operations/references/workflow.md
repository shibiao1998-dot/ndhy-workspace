# 增长运营 — 6 步标准流程

```
Step 1: 诊断现状
  |  当前增长瓶颈在哪？（获取？激活？留存？活跃？）
  |  -> 关键指标现状和趋势
  |  -> 用户反馈中的高频问题
  |  -> 漏斗各环节转化率
  |  -> 信息不足 -> 要求补充数据（不猜测）
  |
Step 2: 定位机会
  |  -> 漏斗中转化率最低的环节 = 最大的增长机会
  |  -> "如果只能做一件事来提升增长，应该做什么？"
  |  -> 投入产出比最高的方向
  |  -> 详细方法 -> references/metrics-model.md
  |
Step 3: 制定策略
  |  -> 明确目标（量化 + 有时间限制）
  |  -> 确定策略方向和具体打法
  |  -> 制定资源需求和时间计划
  |  -> 获取策略 -> references/acquisition-activation.md
  |  -> 留存策略 -> references/retention-engagement.md
  |  -> 区域策略 -> references/activities-content.md 区域化增长
  |
Step 4: 设计执行方案
  |  -> 拆分为可执行的具体动作
  |  -> 明确每个动作的负责人和交付时间
  |  -> 设定过程指标（不只看最终结果）
  |  -> 实验方案 -> references/experimentation.md
  |  -> 活动方案 -> references/activities-content.md
  |
Step 5: 执行与迭代
  |  -> 快速执行，小步快跑
  |  -> 每周回顾数据，判断方向是否正确
  |  -> 有效的加大投入，无效的果断停止
  |  -> 教育行业节奏 -> references/education-growth.md
  |
Step 6: 复盘与沉淀
     -> 什么有效、什么无效、为什么
     -> 有效策略标准化、可复制化
     -> 更新增长策略知识库
     -> 按模板输出 -> references/templates.md
```

## 标准交付物

```
{project}/growth/
  growth-strategy.md       # 增长策略文档（6章节）
  metrics-dashboard.md     # 指标监控方案
  experiment-backlog.md    # 实验待办清单
  user-segmentation.md     # 用户分层运营方案
  activity-calendar.md     # 运营活动日历
  regional-plan.md         # 区域化增长方案（如需要）
```

## 7 大能力域覆盖索引

| # | 能力域 | 流程步骤 | 详细参考 |
|---|--------|---------|---------|
| 1 | 增长模型与指标体系 | Step 1-2 | references/metrics-model.md |
| 2 | 用户获取策略 | Step 3 | references/acquisition-activation.md 获取部分 |
| 3 | 用户激活与啊哈时刻 | Step 3-4 | references/acquisition-activation.md 激活部分 |
| 4 | 用户留存与活跃 | Step 3-5 | references/retention-engagement.md |
| 5 | 增长实验与数据驱动 | Step 4-5 | references/experimentation.md |
| 6 | 运营活动与内容运营 | Step 4-5 | references/activities-content.md 活动与内容 |
| 7 | 区域化增长策略 | Step 3-5 | references/activities-content.md 区域化增长 |

## 工作模式决策树

```
收到增长运营任务
  |- 小范围任务（单指标诊断/单活动策划/数据分析）
  |   -> 单独执行
  |
  |- 明确边界的专项任务（获取方案/留存优化/实验设计）
  |   -> 作为 subagent 被调用（默认模式）
  |
  +- 大 feature / 全面增长体系搭建
      |- 需要产品改动/技术支撑/市场资源？
      |   -> Agent Team（拉产品/技术/市场专家协作）
      +- 否 -> subagent 模式 + 输出后交相关专家执行
```
