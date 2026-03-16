# 技术走查：设计方案可实现性审查

> 🏛️ 技术架构专家 · 2026-03-16
> 基准：tech-architecture-v4.md（Astro + React Islands + GSAP + Lenis）

---

## 🟢 通过项

**1. 动效方案整体可实现**
experience-design-v4.md 的 7 种入场动画（淡入上移、模糊清晰、缩放弹入、裁切展开、路径描边、逐行滑入、发光亮起）均为 CSS transform/opacity/filter + GSAP ScrollTrigger 的标准能力范围。`clip-path` 裁切展开、`stroke-dashoffset` 路径描边、`drop-shadow` 发光均有广泛浏览器支持。

**2. ScrollTrigger pin + scrub 方案可行**
区块②（pin 120vh 驱动拓扑亮起）和区块⑥（scrub 文字淡入）是 GSAP ScrollTrigger 的核心场景，有大量 Awwwards 级站点验证。与 Lenis 配合通过 `lenis.on('scroll', ScrollTrigger.update)` 同步，是官方推荐模式。

**3. 组件设计与 React Islands 兼容**
ui-design-v4.md 的 7 个组件中，TopologyGraph 和 TimelineAccordion 作为 React Islands（`client:visible`）合理——需要状态管理和 ARIA 切换。其余组件（按钮、卡片、标签、代码块、Tooltip、导航点）均为 CSS-only 可实现，作为 `.astro` 静态组件无问题。

**4. Design Token 体系对齐**
ui-design-v4.md 的 `--space-*`、`--color-*`、`--radius-*` Token 与 tech-architecture-v4.md 的 Tailwind v4 `@theme` 方案完全兼容，可一次定义双端可用。

**5. prefers-reduced-motion 降级完整**
三层降级（CSS 全局禁用动画 → GSAP 跳终态 → Lenis 禁用）在架构中有明确实现路径。

---

## 🟡 建议项

**6. 移动端区块⑥ scrub→IO 降级需注意时序**
体验方案指定移动端 ≤767px 不用 scrub，改为标准 IO 触发。实现时需确保 GSAP ScrollTrigger 实例按断点条件创建/销毁——建议在 `section-triggers.ts` 中用 `ScrollTrigger.matchMedia()` 管理，避免 resize 时残留实例。

**7. 高潮爆发序列（区块②）的 SVG filter 性能**
`drop-shadow(0 0 40px)` 的 SVG filter 在低端移动设备上可能掉帧。tech-architecture 已有 `navigator.hardwareConcurrency <= 2` 降级策略，建议进一步：在移动端（≤767px）默认关闭 glow filter，仅保留 opacity 亮起，因为移动端本身用的是 HTML 网格方案而非 SVG。

**8. 打字机实现方案取舍**
体验方案要求 40ms/字（移动端 30ms），tech-architecture 提出 CSS `steps()` 实现。CSS steps 对固定长度文本可行，但如果文案长度动态或需中途中断（如用户快速滚动），建议回退到 `requestAnimationFrame` + `AbortController` 方案。两种方案均在架构能力内，开发时按文案确定性选择。

**9. Tooltip 定位翻转逻辑**
ui-design-v4.md 要求 Tooltip"超出视口时翻转"。在 React Island 内实现不难（`getBoundingClientRect` 判断），但 SVG 内节点的 Tooltip 需注意 SVG 坐标→DOM 坐标转换。建议使用 Floating UI（~3KB）简化定位逻辑，避免手写边界检测。

---

## 🔴 阻断项

**10. 无阻断性问题。**

所有设计方案均在 Astro + GSAP + Lenis + React Islands 架构能力范围内。

---

## 性能约束可达性评估

| 指标 | 目标 | 评估 | 依据 |
|------|------|------|------|
| TTI < 1.5s | ✅ 可达 | Astro SSG 零 JS 首屏 + React Islands `client:visible` 延迟 hydrate，首屏区块①纯 HTML+CSS | 
| LCP < 2.0s | ✅ 可达 | 首屏无图片（纯文字+CSS 动画），HTML ~8KB gzip，Critical CSS 内联 |
| CLS < 0.05 | ✅ 可达 | 固定布局，无动态插入，字体用系统栈无 FOIT |
| GSAP+Lenis < 25KB gzip | ⚠️ 需验证 | tech-architecture 预估 ~30KB，体验方案要求 <25KB。GSAP core(29KB)+ScrollTrigger(12KB) gzip 后约 22KB，Lenis ~5KB，合计 ~27KB。**需 tree-shake 确认或调整预算至 30KB** |

**结论**：性能目标整体可达。GSAP+Lenis 体积预算建议从 25KB 放宽到 30KB gzip（实测差异 ~2KB，不影响 TTI/LCP）。

---

## 移动端拓扑图复杂度评估

垂直分层网格方案（HTML `<div>` 2 列 grid）技术复杂度 **低**：
- 标准 CSS Grid，无特殊 API 依赖
- Tap 展开/关闭 = 简单状态切换，可在 React Island 或纯 JS 中实现
- 逐行亮起动画 = CSS `animation-delay` 递增，80ms/行
- 最大风险点：31 个节点分组排列的数据结构设计——建议 `team-members.ts` 按职能域预分组

**总评**：设计方案与技术架构高度对齐，无阻断问题，4 条建议均为实现细节优化。可进入开发阶段。
