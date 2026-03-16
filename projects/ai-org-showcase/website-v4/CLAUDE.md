# CLAUDE.md — 官网 V4 项目指令

## 网络工具替代规则（强制）

**禁止使用内置 `web_search` 和 `web_fetch` 工具**——它们在当前网络环境下不可用。

| 需求 | ❌ 禁止 | ✅ 改用 |
|------|--------|--------|
| 搜索 | `web_search` | `ddgs-search` MCP |
| 抓取 | `web_fetch` | `fetch` MCP |

## 设计文档路径
所有设计文档在 `D:\code\openclaw-home\workspace\projects\ai-org-showcase\`：
- content-v4.md, tech-architecture-v4.md, experience-design-v4.md, visual-spec-v4.md, ui-design-v4.md
