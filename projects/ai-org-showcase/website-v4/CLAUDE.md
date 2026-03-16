# CLAUDE.md — NDHY Website V4/V5

## 工具限制
- **禁止使用** 内置 `web_search` 和 `web_fetch`（地域限制不可用）
- **替代方案**：`ddgs-search`（搜索）、`fetch`（抓取）、`context7`（框架文档）

## 可用 MCP 工具
- `context7` — 实时获取 Astro/React/GSAP/Tailwind 最新文档（优先使用！）
- `playwright` — 浏览器自动化测试 + 截图验证
- `ddgs-search` — DuckDuckGo 搜索
- `fetch` — 网页抓取
- `chrome-devtools` — 浏览器调试
- `sequential-thinking` — 复杂逻辑增强推理

## 执行风格
- **使用 Agent Team**：多文件修改时 spawn teammates 并行处理独立文件
- **增量写入**：每完成一个组件/区块就写入文件
- **每步 build**：每改完 2-3 个文件就跑 `npm run build` 验证

## 质量标准
- 所有颜色使用 CSS 变量（`var(--color-*)`），零裸色值
- 所有间距使用 CSS 变量（`var(--space-*)`），零裸 px
- TypeScript strict 模式，零 any
- 中文内容无句尾句号（。）
- GitHub 链接：https://github.com/shibiao1998-dot/ndhy-workspace
- 邮箱：shibiao1998@gmail.com

## 技术栈
- Astro 6.x + React Islands
- Tailwind CSS v4 + @theme Design Token
- GSAP + ScrollTrigger + Lenis
- TypeScript strict

## Design Token 参考
- 完整 Token 定义：src/styles/global.css 的 @theme 块
- 视觉规范：../../visual-spec-v4.md
- 交互设计：../../experience-design-v4.md
