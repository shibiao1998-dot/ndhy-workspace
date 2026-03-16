# CLAUDE.md — Claude Code 项目级指令

## 网络工具替代规则（强制）

**禁止使用内置 `web_search` 和 `web_fetch` 工具**——它们在当前网络环境下不可用，会返回 `fetch failed` 错误。

替代方案（已配置为 MCP Server，可直接调用）：

| 需求 | ❌ 禁止使用 | ✅ 改用 |
|------|-----------|--------|
| 搜索网页 | `web_search` | `ddgs-search` MCP（DuckDuckGo 搜索） |
| 抓取网页内容 | `web_fetch` | `fetch` MCP（mcp_server_fetch） |
| 浏览器调试 | — | `chrome-devtools` MCP（已配置） |

## 项目上下文

- 工作空间：`D:\code\openclaw-home\workspace`
- 平台：Windows 10
- Node.js：v24.13.0
- 所有产出使用 UTF-8 编码
