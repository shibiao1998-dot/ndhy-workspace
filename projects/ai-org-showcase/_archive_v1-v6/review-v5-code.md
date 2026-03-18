# V5 修复项逐条验证报告

> 🔍 代码审查专家 | 2026-03-17 | 审查范围: V5 Phase 2.1 + 2.2 全部修复项

## 审查结论: ⚠️ 有条件放行

问题统计: 🔴 0 | 🟡 3 | 🟢 0

---

## P0 阻断修复

**R1: GSAP ScrollTrigger scrub/pin** ✅
`section-triggers.ts` 完整实现: S2 Reveal 使用 `scrub: 1, pin: true, end: '+=120vh'`; S6 Vision 使用 `scrub: 0.5`; 含 `prefersReducedMotion` 守卫和完整 cleanup 链

**R2: 高潮爆发 5 步序列** ✅
S2 时间线完整: T+0 glow expansion(0.7) → T+200ms scale 1→1.03→1(0.72/0.77) → T+400ms boss node 入场(0.74) → T+800ms bottom text pop(0.8/0.82) → T+1300ms subtext fade(0.88); 后接 glow fade(0.92)

**R3: pathDraw SVG 描边动画** ✅
连接线 `strokeDasharray/strokeDashoffset` 初始化 + `tl.to(connectionLines, { strokeDashoffset: 0 })` 在 Phase 1(0→20%)实现; 后续 B7 flowing effects 切换为 `dasharray: '10 10'` + CSS `connectionFlow` 动画

**R4: TopologyGraph.tsx 零裸色值** ✅
grep `#[0-9a-fA-F]` 和 `rgba(` 均无匹配; 所有颜色通过 `var(--color-*)` 引用; `levelToFill/tierToColors` 函数全部返回 CSS 变量

**R5: TimelineAccordion.tsx 零裸 px** ✅
grep `\d+px` 无匹配; 所有尺寸通过 `var(--space-*)` / `var(--fs-*)` / `var(--radius-*)` 引用; CSS 类在 global.css 中定义

**R6: 按钮/卡片 5 态** ✅
global.css 定义了 `cta__email`(hover/active/focus-visible/disabled)、`cta__source`(同)、`timeline-card`(hover/active + header focus-visible)、`contrast-tag`(hover/active/focus-visible)、`topo-node`(hover/active/focus-visible); 每组均覆盖 4-5 态

**R7: 拓扑节点初始 opacity ≥0.3** ✅
`TopologyGraph.tsx` 第 167 行 `opacity: 0.3`; `section-triggers.ts` 第 131 行 `g.style.opacity = '0.3'`; 两处一致

---

## 老板反馈

**B3: 全部源文件零句号（。）** ✅
遍历 `src/` 下所有 `.ts/.tsx/.astro/.css` 文件, 匹配 U+3002 结果为空

**B10: GitHub 链接 = shibiao1998-dot/ndhy-workspace** ✅
`S7CtaSection.astro` 第 36 行: `href="https://github.com/shibiao1998-dot/ndhy-workspace"` 正确

---

## P2 建议

**S12: `*:focus-visible` 样式** ✅
global.css 定义了全局 `*:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }` + `button:focus-visible` 增强 glow; 各组件(timeline-trigger/topo-node/cta 按钮)有专属 focus-visible 覆盖

**S13: 时间线 header tabindex + role + aria-expanded** ✅
`TimelineAccordion.tsx`: `<button role="button" aria-expanded={isExpanded} aria-controls={panelId}>`; `S3TimelineSection.astro` SSR fallback: `<button aria-expanded="false" aria-controls="..." id="...">`; panel 有 `role="region" aria-labelledby`

**S18: createObserver.ts 存在 + Section 使用** 🟡
文件存在且实现完整(缓存 + `observeAll` 便捷方法), 但**8 个 .astro 文件均未 import 使用**, 各 Section 内联了独立的 `new IntersectionObserver`; `section-triggers.ts` 也有独立 IO 实现 → 存在 3 套 IO 逻辑并存

**S19: JS 失败 fallback** ✅
三层防护: ① `BaseLayout.astro` `<html class="no-js">` + inline script 移除; ② global.css `.no-js .anim-*` 强制可见; ③ `@media (scripting: none)` CSS 兜底

**N1: 等级徽章 + team-members rank 字段** ✅
`team-members.ts`: `TeamMember` 接口含 `rank: number` + `rankToTier()` 导出; `TopologyGraph.tsx`: 每个节点渲染 Rank Badge Pill(`<rect>` + `<text>` P{rank}), 颜色通过 `var(--color-rank-*)` 四级映射(junior/mid/senior/master); global.css 定义了 8 个 rank token

---

## 🟡 发现的问题

### 1. createObserver.ts 未被消费 🟡
文件已创建但零引用, 各 Section 的 `<script>` 块和 `section-triggers.ts` 各自创建 IO 实例 → 重复逻辑 × 3, 违背 DRY; 不阻断交付但增加维护成本

### 2. global.css 存在裸 oklch 值(非 @theme 区域) 🟡
- 第 757 行 `.topo-node:hover { border-color: oklch(0.70 0.15 265 / 0.10); }` 应改为 `var(--color-accent-subtle)`
- 第 790-820 行 `@keyframes nodeBreathing/leaderHalo/bossHalo` 中 `drop-shadow` 使用裸 oklch — CSS keyframe 内无法引用 custom property 的 `filter` 值, 可接受但应加注释说明

### 3. section-triggers.ts 内 GSAP inline 裸 oklch 🟡
第 133/188/202/287 行使用裸 oklch 字面量 — GSAP `to()` 的 `filter` 属性无法直接消费 CSS 变量; 技术限制可接受, 建议提取为 TS 常量并加注释标注与 token 的对应关系

---

## 总结

14 项检查: ✅ 12 项通过 | 🟡 2 项有条件通过(createObserver 未消费 + 少量裸色值) | ❌ 0 项失败

核心修复(R1-R7 + B3 + B10)全部到位, P2 建议大部分落地; 🟡 项为技术债, 建议后续迭代处理, 不阻断当前交付
