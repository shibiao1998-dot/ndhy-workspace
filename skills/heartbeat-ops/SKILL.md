---
name: heartbeat-ops
description: "Heartbeat monitoring, anomaly recovery, and daily closing operations for NDHY AI Agent Team. Use when: (1) processing heartbeat events, (2) monitoring sub-agent health status, (3) performing anomaly recovery (probe → restart → escalate), (4) executing daily closing routine (git backup, memory rules, capability gaps). NOT for: regular task execution or communication."
---

> 本 Skill 从 HEARTBEAT.md / AGENTS.md 提取，用于按需加载。

# 心跳运维

## 主动行为检查（心跳时轮查，不必每次全做）

- **模式识别**：近期是否有重复请求出现 3+ 次？有 → 记录到当天日志，下次汇报时向老板提议自动化
- **待办跟进**：是否有已承诺但未交付的事项？有 → 主动推进或提醒
- **主动建议**：基于近期项目上下文，是否有老板可能需要但还没提的事？有 → 准备简短提案，等合适时机提出

---

## 子 Agent 健康巡查（心跳时必查）

- **状态扫描**：用 `subagents` 工具检查所有活跃子 Agent，记录各自状态和运行时长
- **超时检测**：是否有子 Agent 超过预期时间仍未通告？有 → 按异常恢复协议处理（见下方）
  - 第一步：`sessions_send` 追问进度
  - 确认卡死：kill + 携带上下文重新 spawn
  - 连续失败 2 次：停止重试，上报人类
- **孤儿任务**：是否有子 Agent 已完成但通告未被处理？有 → 立即处理验收流程

### 巡查汇报格式

借鉴 CrewAI Agent 执行监控可视化，心跳巡查结果使用结构化格式汇报：

```
📊 **子 Agent 状态面板** [YYYY-MM-DD HH:MM]

| Agent | 标签 | 状态 | 运行时长 | 备注 |
|-------|------|------|----------|------|
| 🌐 林栈桥 | dev-xxx | ✅ 已完成 | 12m | 待验收 |
| 🔍 代码审查专家 | review-xxx | 🔄 进行中 | 5m | 正常 |
| 📝 技术文档专家 | doc-xxx | ⚠️ 超时 | 30m | 已追问 |

异常：[有/无] — [异常描述及处理动作]
```

**状态图标约定：** ✅ 已完成 | 🔄 进行中 | ⚠️ 超时/异常 | 💀 卡死已重启 | ⏸️ 等待中

---

## 异常恢复协议（从 AGENTS.md 提取）

子 Agent 不是永远可靠的。卡死、超时、无响应都会发生。Leader 必须有恢复手段，不能等它自己好起来。

### 恢复协议 3 阶段

| 阶段 | 动作 |
|------|------|
| **1. 追问** | 超过预期时间未完成 → `sessions_send` 追问进度（"当前进展？是否遇到阻塞？"） |
| **2. 重启** | 确认卡死（无响应或明确报错）→ kill 该子 Agent → 重新 spawn，task 中携带上次的上下文和已完成部分 |
| **3. 上报** | 同一任务连续失败 2 次 → 停止自动重试，上报人类决策（附失败原因和建议方案） |

### 重启上下文传递

新 spawn 的 task 中必须包含：
- 原始任务描述
- 前次执行的产出物路径
- 失败原因
- "请从 [断点] 继续"的明确指令

**不要让新 Agent 从头开始。**

---

## 每日收盘（深夜心跳时执行，每天一次）

> 把记忆规则从"纸面制度"变成"自动执行"。建议配合 cron 在每日 00:00 触发。

按顺序执行，任何一步失败记录报错但继续：

1. **备份**：`git add -A && git commit -m "daily: YYYY-MM-DD" && git push`（workspace 目录）。未配置 Git 仓库时跳过并提醒老板配置。
2. **回放**：读取当天 `memory/YYYY-MM-DD.md` 和会话记录，与 `MEMORY.md` 基线对比。
3. **执行记忆规则**：
   - **30 天降级**：扫描 `MEMORY.md`，超过 30 天未被引用的条目 → 移入对应日期的 WARM 层归档
   - **3 次晋升**：扫描近期 WARM 层日志，同一教训出现 3+ 次 → 提炼为规则写入 `MEMORY.md`
   - **过时清理**：已被后续决策覆盖的旧条目 → 合并或移除
4. **识别能力缺口**：今天是否有任务因缺少工具/技能而受阻？有 → 列出推荐的 Skill（**只列出，不自动安装**）
5. **微调配置**（按需）：发现明确痛点时，可优化 `AGENTS.md` 规则或 `TOOLS.md` 工具配置。**严禁改 `SOUL.md`**，改 `AGENTS.md` 需过改动决策护栏。
6. **更新 README**：检查组织架构是否有变化（新增/移除角色、Skill 增减、核心机制调整），有变化则同步更新 `README.md`。
7. **写简报**：将收盘结论追加到当天 `memory/YYYY-MM-DD.md`，格式：
   ```
   ## 每日收盘
   - **备份**：✅/❌ [状态]
   - **记忆变更**：[晋升/降级/清理了什么]
   - **能力缺口**：[缺什么 Skill，或"无"]
   - **配置调整**：[改了什么，或"无"]
   ```
