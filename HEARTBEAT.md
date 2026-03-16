# HEARTBEAT.md

收到心跳时，按以下优先级执行：

## 1. 活跃任务巡查（最高优先级）
检查是否有活跃的子 Agent 或 ACP 任务：
- `subagents list` 查子 Agent
- 检查最近 spawn 的 ACP 会话是否仍在运行

**如果有活跃任务**：
- 检查文件产出（目标目录最近 5 分钟是否有新文件）
- 连续 2 次无产出（10 分钟）→ 终止 + 拆分重派
- ACP 开发任务额外检查：build 状态、Design Token 遵循度、关键功能实现

## 2. 常规巡查
- 子 Agent 状态扫描
- 有异常 → 处理
- 无异常 → HEARTBEAT_OK

## 3. 日终收尾（每日最后一次心跳）
加载 Skill: heartbeat-ops 执行：
- git 备份
- 记忆规则检查：**压缩昨天的 memory/YYYY-MM-DD.md**（不是今天的）
- 能力缺口记录

## 4. 每日专家职级评估（凌晨 1:00 Cron 自动触发）
收到"每日专家职级评估"系统事件时：
- 读取当天 memory/YYYY-MM-DD.md
- 用 sessions_list 查当天所有 subagent 会话
- 加载 expert-leveling Skill（D:\code\openclaw-home\workspace\skills\expert-leveling\SKILL.md）
- 评估维度：任务完成质量、技能使用率、产出复杂度、协作表现
- 产出评估建议，不自动晋升（需老板批准）
- 写入 memory/expert-eval-YYYY-MM-DD.md
- 有值得晋升的专家 → 通知老板

## 关键铁律
- **有任务派发时每 5 分钟巡查一次**——不是建议，是必须执行的铁律
- 心跳频率（30 分钟）不够密集时，在收到心跳后手动设置 5 分钟计时器持续巡查
- 巡查不到位 = 失职
