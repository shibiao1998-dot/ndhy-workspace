# TOOLS.md — 环境专属配置

> Skills 定义工具怎么用，这个文件记录你的环境特有配置（设备名、地址、别名等）。
> 有新配置时直接往下加。

---

## ACP Runtime（Agent Communication Protocol）

ACP 已配置并可用，支持通过 `sessions_spawn` 启动外部编程 Agent 作为可交互会话。

**可用 Agent**

| agentId | 工具 | 版本 | 说明 |
|---------|------|------|------|
| `claude` | Claude Code | v2.1.77 | 默认 Agent，全权限（approve-all） |

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
| 框架文档 | — | `context7` MCP（实时 React/Astro/GSAP 文档） | `~/.claude.json` user scope |
| GitHub 管理 | — | `github` MCP（PR/Issue/Branch） | `~/.claude.json` user scope |
| E2E 测试 | — | `playwright` MCP（浏览器自动化+截图） | `~/.claude.json` user scope |
| 增强推理 | — | `sequential-thinking` MCP | `~/.claude.json` user scope |

**CLAUDE.md 已部署**：workspace 根目录 + 项目目录各一份，Claude Code 启动时自动读取。
所有通过 ACP spawn 的 Claude Code 任务，在 task 中**必须提醒**：
1. 不要用内置 web_search/web_fetch
2. **网页开发/测试任务必须使用内置浏览器控制功能实际打开页面验证**（v2.1.77+），不允许只读代码就声称测试通过

## AIAE 网关（多模型路由）

AIAE AI 网关已配置，提供 138 个模型的统一 OpenAI Compatible API 接入。

| 项目 | 值 |
|------|-----|
| Base URL | `https://ai-gateway.aiae.ndhy.com/v1` |
| API Key | `.env` 文件中 `AIAE_API_KEY` |
| 协议 | OpenAI Compatible API |

**核心模型速查**（详见 Skill: model-router）：

| 场景 | 推荐模型 |
|------|---------|
| **设计/规划/审查** | **`claude-opus-4-6`**（SWE-Bench 81.4%） |
| **ACP 开发** | **`claude-sonnet-4-6`**（64K output，成本更低） |
| 中文内容创作 | `doubao-seed-2-0-pro-260215` |
| 高吞吐中文 | `qwen3.5-plus-2026-02-15` |
| 深度推理 | `o3-2025-04-16` / `o4-mini-2025-04-16` |
| UI/产品图 | `gemini-3.1-flash-image-preview`（Nano Banana 2） |
| 高品质图 | `gemini-3-pro-image-preview` / `MidJourney` |
| 视频生成 | `sora-2` / `doubao-seedance-1-5-pro-251215` |
| 语音合成 | `seed-tts-2.0` |
| RAG 嵌入 | `bge-m3` + `bge-reranker-v2-m3` |
| 深度推理 | `o3-2025-04-16` / `o4-mini-2025-04-16` |
| UI/产品图 | `gemini-3.1-flash-image-preview`（Nano Banana 2） |
| 高品质图 | `gemini-3-pro-image-preview` / `MidJourney` |
| 视频生成 | `sora-2` / `doubao-seedance-1-5-pro-251215` |
| 语音合成 | `seed-tts-2.0` |
| RAG 嵌入 | `bge-m3` + `bge-reranker-v2-m3` |

**API 已验证连通**（2026-03-18）：文本对话 ✅ 图像生成 ✅ 模型列表 ✅

## OpenClaw 版本

**当前版本**：2026.3.13（2026-03-17 升级）

### 3.13 新增能力（与我们相关的）

| 能力 | 说明 | 影响 |
|------|------|------|
| **Live Chrome Session Attach** | `profile="user"` 直接接入已登录的 Chrome 会话，零扩展零设置 | 走查/测试可用真实浏览器环境 |
| `profile="chrome-relay"` | 扩展中继模式，通过 Browser Relay 工具栏按钮 attach | 备选方案 |
| **Browser act 批量操作** | 支持 batched actions、selector 定位、延迟点击 | 自动化走查效率提升 |
| Docker `OPENCLAW_TZ` | 容器时区覆盖 | 未来容器化部署可用 |
| Windows Gateway 修复 | schtasks 超时兜底、Startup 文件夹回退、状态检测准确 | 当前 Windows 环境直接受益 |
| `gateway status --require-rpc` | 自动化探测可硬失败 | 健康检查脚本可用 |

### 3.13 安全加固
- PowerShell `-File`/`-f` 审批识别
- 零宽字符标记绕过修复
- 设备配对码改为一次性使用
- Skill 自动信任绑定到可执行文件路径
