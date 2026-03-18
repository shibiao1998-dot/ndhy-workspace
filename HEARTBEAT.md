# HEARTBEAT.md

## 当前活跃任务
<!-- Leader 每次 spawn 任务时在此写入，任务完成后清除 -->
<!-- 无活跃任务时保持为空，心跳直接 HEARTBEAT_OK -->

<!-- 无活跃任务 -->

---

收到心跳时，按以下优先级执行：

## 1. 日终收尾（每日最后一次心跳）
加载 Skill: heartbeat-ops 执行：
- git 备份
- 记忆规则检查：**压缩昨天的 memory/YYYY-MM-DD.md**（不是今天的）
- 能力缺口记录

## 2. 每日专家职级评估（凌晨 1:00 Cron 自动触发）
收到"每日专家职级评估"系统事件时：
- 读取当天 memory/YYYY-MM-DD.md
- 用 sessions_list 查当天所有 subagent 会话
- 加载 expert-leveling Skill（D:\code\openclaw-home\workspace\skills\expert-leveling\SKILL.md）
- 评估维度：任务完成质量、技能使用率、产出复杂度、协作表现
- 产出评估建议，不自动晋升（需老板批准）
- 写入 memory/expert-eval-YYYY-MM-DD.md
- 有值得晋升的专家 → 通知老板

## 默认行为
- 无上述触发条件时 → HEARTBEAT_OK
