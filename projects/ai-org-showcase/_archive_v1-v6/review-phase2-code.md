# 代码审查报告 — Phase 2：代码质量

## 审查摘要
- **变更**：website-v4 全站源码（CSS / Astro / React / TS）
- **审查范围**：`styles/` `pages/` `sections/` `components/` `animations/` `data/`
- **结论**：⚠️ **有条件放行** — 无阻断问题，存在可改进项和少量技术债
- **问题统计**：🔴 0 个 | 🟡 5 个 | 🟢 3 个

---

## 🟡 建议改进

### 1. IntersectionObserver 重复创建（DRY 违规）
**位置**：`BreathingPoint.astro`、`S2RevealSection.astro`、`S3TimelineSection.astro`、`S4ContrastSection.astro` 各自内联 `<script>` 中  
**问题**：4 个 Section 各自创建独立的 IntersectionObserver 做完全相同的事（添加 `.is-visible`）。同时 `section-triggers.ts` 已有全局统一的 `initScrollAnimations()` 在 `index.astro` 中调用，功能完全重叠。  
**风险**：同一元素可能被重复观察；维护时修一处漏另一处。  
**改进**：删除各 Section 内联脚本中的重复 Observer，统一由 `section-triggers.ts` 处理。S2 拓扑节点的 stagger 动画可通过 `data-delay` 属性复用全局机制。

### 2. S5ArchSection 无滚动动画触发脚本
**位置**：`S5ArchSection.astro`  
**问题**：使用了 `anim-fade-up`、`anim-blur-reveal`、`anim-clip-expand` 等 CSS 类，但未包含 `<script>` 触发动画。依赖 `index.astro` 的全局 `initScrollAnimations()` — 这本身没问题，但与其他 Section 各自有内联脚本的模式不一致。  
**风险**：如果全局脚本加载失败，此 Section 所有内容将保持 `opacity: 0` 不可见（无降级）。  
**改进**：统一策略（建议方案见 🟡1）。同时为动画元素设置 `<noscript>` 或 CSS fallback，确保 JS 失败时内容仍可见。

### 3. TopologyGraph 节点初始 opacity 硬编码 + 无滚动触发
**位置**：`TopologyGraph.tsx` 第 178 行 `opacity: 0.05`  
**问题**：SVG 节点的初始 opacity 设为 0.05（几乎不可见），预期由滚动动画渐显。但 React 组件内部没有 IntersectionObserver，S2 的内联脚本只处理 `.topology-mobile` 的 DOM 节点（`[data-topo-node]`），不会触达 React Island 内部的 SVG `<g>` 元素。  
**风险**：桌面端拓扑图节点可能始终为半透明 0.05，几乎不可见。  
**改进**：在 `TopologyGraph.tsx` 内部添加 IntersectionObserver（`useEffect`），检测 SVG 容器进入视口后将节点 opacity 渐变到目标值。

### 4. 事件监听清理不完整
**位置**：`S3TimelineSection.astro` 内联脚本 — accordion click 事件  
**问题**：`document.querySelectorAll('.timeline-card__header').forEach(header => header.addEventListener('click', ...))` 添加了事件监听但无清理机制。对于 Astro MPA 这通常无害（页面卸载即销毁），但如果未来改为 SPA 路由或使用 View Transitions，会导致监听器累积。  
**改进**：将 accordion 逻辑迁入 React Island `TimelineAccordion.tsx`（已存在但未被使用），或在 `beforeunload` 回调中统一清理。

### 5. `TimelineAccordion.tsx` 未被使用
**位置**：`components/TimelineAccordion.tsx`  
**问题**：组件已完整实现（含键盘操作、ARIA 标签、动画），但 `S3TimelineSection.astro` 使用的是静态 HTML + 内联脚本的 fallback 方案，未引入此 React Island。  
**风险**：死代码增加维护负担；静态 fallback 的 accordion 缺少键盘可访问性（`<li>` 非 focusable）。  
**改进**：引入 `<TimelineAccordion client:visible steps={timelineSteps} />`，或删除未使用的组件。

---

## 🟢 小建议

1. **`ScrollArrow.astro` 未被使用** — S1HeroSection 内联了 SVG 箭头，未使用该组件。建议复用或删除。
2. **`comparison-data.ts` 标签文案偏长** — `aiOrgTags` 单条标签最长 ~40 字，移动端可能溢出。建议移动端缩短或换行。
3. **`TopologyGraph.tsx` 颜色硬编码** — `COLOR_BOSS = '#fbbf24'` 等未使用 CSS 变量（SVG 内联样式限制），可在注释中标注对应 Token 名，方便未来同步。

---

## ✅ 亮点

- **零 `any`、零 `innerHTML`、零 `\uFFFD` 乱码** — 类型安全和编码质量优秀
- **Design Token 体系完整** — `global.css` 使用 oklch 色彩空间 + Tailwind v4 `@theme`，零裸值，语义化命名清晰
- **无障碍意识强** — `aria-label`、`role`、`sr-only`、`skip-link`、`prefers-reduced-motion` 降级全覆盖
- **动画降级完备** — `reduced-motion.ts` + CSS `@media (prefers-reduced-motion)` 双重保障
- **数据与视图分离** — `data/` 目录独立管理内容数据，类型定义完整（`TeamMember`、`TimelineStep`、`ComparisonItem`）
- **清理机制到位** — `scroll-setup.ts` 的 `cleanupSmoothScroll()` 正确销毁 Lenis + ScrollTrigger；`index.astro` 在 `beforeunload` 中调用清理

---

## Follow-up 项

| # | 问题 | 优先级 | 建议处理时机 |
|---|------|--------|-------------|
| 1 | 统一 IntersectionObserver 方案 | 中 | 下一迭代 |
| 2 | TopologyGraph 桌面端节点可见性 | 中 | 上线前验证 |
| 3 | 决定 TimelineAccordion 去留 | 低 | 下一迭代 |
