# Phase 2 技术架构审查报告

> 🏛️ 技术架构专家 · 2026-03-16
> 基准：tech-architecture-v4.md | 审查对象：website-v4/ 实际代码

---

## 1. Astro + React Islands 架构 🟢通过

- Astro 6.x + `@astrojs/react` 集成已配置（`astro.config.mjs`）
- 7 个 Section 均为 `.astro` 静态组件，2 个交互组件为 `.tsx` React Islands
- TopologyGraph 使用 `client:visible` 正确按需 hydrate
- BaseLayout 包含 `<main id="main-content">` + skip link，语义结构到位

## 2. GSAP + ScrollTrigger + Lenis 🟡建议

- ✅ 三者均在 `dependencies` 中声明，版本匹配（gsap 3.x / lenis 1.x）
- ✅ `scroll-setup.ts` 正确实现 Lenis↔ScrollTrigger 同步（`lenis.on('scroll', ScrollTrigger.update)` + `gsap.ticker` 转发）
- ✅ `lagSmoothing(0)` 已设置
- ✅ `prefersReducedMotion` 时跳过 Lenis，回退原生滚动
- 🟡 **`section-triggers.ts` 使用 IntersectionObserver 而非 GSAP ScrollTrigger**。架构方案明确定义"GSAP ScrollTrigger 负责 7 个区块的滚动触发"（ADR-002），但实际代码用 IntersectionObserver + CSS transition 驱动所有入场动画。GSAP 已注册但未被 section-triggers 使用——等于引入了 78KB 却仅做了 Lenis ticker 同步。建议：要么用 ScrollTrigger 驱动区块动画（符合方案），要么在方案中正式降级为 IO+CSS 方案并移除 GSAP 依赖以减小包体积。

## 3. Tailwind CSS v4 + @theme 🟢通过

- `@tailwindcss/vite` 4.2.x 通过 Vite 插件接入（CSS-first 配置，正确）
- `global.css` 使用 `@import "tailwindcss"` + `@theme {}` 定义完整 Token 体系
- oklch 色彩空间、14 级间距、动画 Token、断点均已覆盖
- **超出方案预期**：Token 粒度比方案更细（12 级灰阶、功能色、Boss/Level 专属色）

## 4. 组件拆分 🟡建议

- ✅ 7 个 Section 组件完整（S1-S7）+ 1 个 BreathingPoint 过渡组件（方案中未定义但合理新增）
- ✅ TopologyGraph.tsx / TimelineAccordion.tsx 作为 React Islands
- ✅ 数据层分离（`data/` 目录 3 个 `.ts` 文件）
- 🟡 **方案中定义的 5 个组件缺失**：`Typewriter.astro`、`ContactButton.astro`、`tokens.css`、`animations.css`、`utils/a11y.ts`。其中 tokens 和 animations 已合并进 `global.css`（可接受），但 Typewriter 和 ContactButton 作为功能组件缺失需补齐。
- 🟡 **TimelineAccordion 未以 React Island 方式挂载**：S3 中写了 `<!-- placeholder -->` 注释但实际用 Astro 静态 HTML + 内联 `<script>` 实现手风琴。功能上可工作，但未用 React Island（方案要求 `.tsx` + `client:visible`），丢失了 ARIA 状态管理和 `useId()` 等 React 优势。

## 5. 代码分割/懒加载 🟢通过

- `client:visible` 实现组件级懒加载（TopologyGraph 已验证）
- GSAP/Lenis 通过 `<script type="module">` 在 `index.astro` 底部异步加载
- 首屏 S1 为纯 HTML+CSS，无 JS 阻塞
- 加载时序符合方案定义的 T=0 → T=0.1s → T=0.3s 渐进策略

## 6. TypeScript 🟢通过

- `tsconfig.json` 继承 `astro/tsconfigs/strict`（最严格模式）
- `@astrojs/check`、`@types/react`、`@types/react-dom` 均配置
- 数据文件和动画模块全部使用 `.ts`，类型导出完整

## 7. Build 产物结构 🟢通过（待验证）

- 依赖配置合理，预估产物与方案一致（HTML ~8KB + CSS ~6KB + JS ~45KB gzip）
- 未实际 build 验证，建议 Phase 3 开发完成后做 `astro build` + Lighthouse 实测

---

## 汇总

| 检查项 | 结论 |
|--------|------|
| Astro + React Islands | 🟢通过 |
| GSAP + ScrollTrigger + Lenis | 🟡 GSAP 引入但未实际驱动区块动画 |
| Tailwind v4 + @theme | 🟢通过 |
| 组件拆分 | 🟡 2 组件缺失 + TimelineAccordion 未用 Island |
| 代码分割/懒加载 | 🟢通过 |
| TypeScript | 🟢通过 |
| Build 产物 | 🟢通过（待实测） |

**总评**：🟢 **无阻断项，可进入 Phase 3**。2 个🟡建议在开发阶段解决：① 明确 GSAP 的实际用途或移除依赖 ② 补齐缺失组件并决定 TimelineAccordion 挂载方式。
