# HEARTBEAT.md

收到心跳时，加载 Skill: heartbeat-ops 执行完整巡查流程。

如果 Skill 未加载，执行最小检查：
- 子 Agent 状态扫描（`subagents` 工具）
- 有异常 → 处理；无异常 → HEARTBEAT_OK
