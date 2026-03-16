# TOOLS.md — 环境专属配置

> Skills 定义工具怎么用，这个文件记录你的环境特有配置（设备名、地址、别名等）。
> 有新配置时直接往下加。

---

## ACP Runtime（Agent Communication Protocol）

ACP 已配置并可用，支持通过 `sessions_spawn` 启动外部编程 Agent 作为可交互会话。

**可用 Agent**

| agentId | 工具 | 版本 | 说明 |
|---------|------|------|------|
| `claude` | Claude Code | v2.1.37 | 默认 Agent，全权限（approve-all） |

**使用方式**

```json
// 一次性任务（完成后自动结束）
sessions_spawn({ runtime: "acp", agentId: "claude", mode: "run", task: "..." })

// 持久会话（需要 thread 绑定）
sessions_spawn({ runtime: "acp", agentId: "claude", mode: "session", thread: true, task: "..." })
```

**与 exec 模式的区别**

| 能力 | exec 模式 | ACP 模式 |
|------|----------|---------|
| 中途追加指令 | ❌ | ✅ `sessions_send` |
| 统一会话管理 | ❌ | ✅ `subagents list` |
| 自动完成通知 | ❌ | ✅ |
| 多轮交互 | ❌ | ✅ |

**注意事项**
- ACP 会话运行在宿主机上，不在沙箱内
- `permissionMode: approve-all` — Claude Code 可自由读写文件和执行命令
- 超时默认由 `runTimeoutSeconds` 控制（建议 ≥600s）
- 后续安装 Codex/Gemini 等，在 `openclaw.json` 的 `acp.allowedAgents` 中添加即可

## Claude Code MCP 替代工具

Claude Code 内置的 `web_search` 和 `web_fetch` 在当前网络环境下不可用（地域限制）。已配置 MCP 替代：

| 需求 | ❌ 禁止 | ✅ 改用 | 配置位置 |
|------|--------|--------|---------|
| 搜索网页 | `web_search` | `ddgs-search` MCP（DuckDuckGo） | `~/.claude.json` user scope |
| 抓取网页 | `web_fetch` | `fetch` MCP（mcp_server_fetch） | `~/.claude.json` user scope |
| 浏览器调试 | — | `chrome-devtools` MCP | `~/.claude.json` user scope |

**CLAUDE.md 已部署**：workspace 根目录 + 项目目录各一份，Claude Code 启动时自动读取。
所有通过 ACP spawn 的 Claude Code 任务，在 task 中**必须提醒**不要用内置 web_search/web_fetch。
