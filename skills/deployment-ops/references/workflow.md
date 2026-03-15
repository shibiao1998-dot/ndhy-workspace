# 部署运维 — 9 步标准流程

```
Step 1: 理解发布目标、范围与依赖
  |  消化发布范围、目标环境、变更清单、上游交付结论
  |  -> 提取: 发布目标、变更模块、目标环境、依赖服务、已知风险
  |  -> 确认: 联调结论、测试结论、代码审查结论是否齐备
  |  -> 信息不足 -> 要求上游补充（不猜测、不假设）
  |
Step 2: 校验发布前提与环境一致性
  |  -> 校验构建产物完整性（前端包/后端镜像/数据库迁移脚本）
  |  -> 校验环境一致性（开发→预发→生产配置对齐）
  |  -> 校验外部依赖可达性（第三方API/数据库/消息队列/缓存）
  |  -> 详细方法 -> references/prerequisites.md
  |
Step 3: 校验配置、密钥与权限
  |  -> 校验环境变量、配置文件差异
  |  -> 校验密钥/证书有效性和过期时间
  |  -> 校验部署账号权限、网络策略、防火墙规则
  |  -> 校验数据库连接、第三方服务凭证
  |  -> 详细方法 -> references/prerequisites.md 配置密钥权限
  |
Step 4: 制定发布步骤与发布窗口
  |  -> 设计发布步骤（顺序、依赖、并行度）
  |  -> 确定发布窗口（低峰期、维护窗口）
  |  -> 设计 War Room 模式（人员、通道、决策链）
  |  -> 设计灰度/蓝绿/滚动策略（如适用）
  |  -> 详细方法 -> references/release-execution.md
  |
Step 5: 制定回滚方案与故障恢复
  |  -> 制定每个变更点的回滚步骤
  |  -> 定义回滚触发条件和决策阈值
  |  -> 制定数据回滚策略（如涉及schema变更）
  |  -> 制定紧急发布流程（hotfix路径）
  |  -> 详细方法 -> references/rollback-recovery.md
  |
Step 6: 校验可观测性（健康检查+日志+监控+告警）
  |  -> 校验健康检查端点和探针配置
  |  -> 校验日志格式、级别和采集链路
  |  -> 校验核心指标监控（延迟/错误率/吞吐/饱和度）
  |  -> 校验告警规则和通知渠道
  |  -> 制定发布观察计划（观察窗口/观察指标/升级条件）
  |  -> 详细方法 -> references/observability.md
  |
Step 7: 评估发布风险与汇总 readiness
  |  -> 逐项评估发布风险（影响面/概率/可控度）
  |  -> 汇总发布就绪状态（见 readiness-rollback.md §发布就绪判断框架）
  |  -> 输出发布决策建议（放行/带风险发布/阻塞）
  |  -> 详细方法 -> references/checklists.md
  |
Step 8: 执行发布观察与异常跟踪
  |  -> 按观察计划监控关键指标
  |  -> 记录异常事件（时间/现象/影响/处置）
  |  -> 触发回滚决策（见 readiness-rollback.md §回滚决策树）
  |  -> 确认发布稳定后关闭观察窗口
  |
Step 9: 输出发布结论与运行反馈回流
     -> 7 个标准文档（见下方）
     -> 生成运行反馈回流清单（问题→归属专家→建议措施）
     -> 过发布检查清单
     -> 按模板组织 -> references/templates.md
```

## 标准交付物

```
{project}/deployment/
  deploy-plan.md                  # 发布方案
  release-checklist.md            # 发布检查清单
  env-config-checklist.md         # 环境配置检查清单
  rollback-plan.md                # 回滚方案
  observability-checklist.md      # 可观测性检查清单
  post-release-watch-plan.md      # 发布后观察计划
  release-risk-summary.md         # 发布风险总结
```

## 5 层深度边界速查

| 层级 | 主责 | 核心产出 | 边界说明 |
|------|------|---------|---------|
| **需求与设计定义层** | 项目管理/API/数据库/架构专家 | 需求定义、契约、数据模型 | 部署专家只消费，不定义 |
| **实现层** | 前端/后端开发专家 | 代码、构建产物 | 部署专家只校验产物，不写代码 |
| **审查与验证层** | 代码审查/联调/测试专家 | 审查结论、测试报告 | 部署专家消费结论作为发布前提 |
| **发布与运行保障层** | **部署运维专家（核心）** | 发布方案、回滚、监控、观察 | 本层全部职责 |
| **运行反馈层** | 部署运维专家（输出）→ 各专家 | 运行反馈、问题回流 | 提供反馈，不吞掉后续修复职责 |

**铁律**：向下只给运行约束和反馈，不越界写代码。向上只消费已确认的交付结论，不替上游补质量。

## 12 大能力方向覆盖索引

| # | 能力方向 | 流程步骤 | 详细参考 |
|---|---------|---------|---------|
| 1 | 校验发布前提 | Step 1-2 | references/prerequisites.md 发布前提 |
| 2 | 校验环境一致性 | Step 2 | references/prerequisites.md 环境一致性 |
| 3 | 校验配置/密钥/权限 | Step 3 | references/prerequisites.md 配置密钥权限 |
| 4 | 制定发布步骤 | Step 4 | references/release-execution.md 发布步骤 |
| 5 | 制定回滚方案 | Step 5 | references/rollback-recovery.md 回滚方案 |
| 6 | 校验健康检查 | Step 6 | references/observability.md 健康检查 |
| 7 | 校验日志/监控/告警 | Step 6 | references/observability.md 监控告警 |
| 8 | 制定发布观察计划 | Step 6 | references/observability.md 观察计划 |
| 9 | 评估发布风险 | Step 7 | references/checklists.md 风险评估 |
| 10 | 汇总发布 readiness | Step 7 | references/checklists.md readiness汇总 |
| 11 | 跟踪发布后异常 | Step 8 | references/checklists.md 异常跟踪 |
| 12 | 生成运行反馈回流清单 | Step 9 | references/checklists.md 反馈回流 |
