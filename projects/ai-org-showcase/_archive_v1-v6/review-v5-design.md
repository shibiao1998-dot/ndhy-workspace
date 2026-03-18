# V5 设计走查报告

> 🎨 体验设计专家 + 🎨 视觉设计专家 · 2026-03-17
>
> 基准：design-patch-animation-v5.md · design-patch-visual-ui-v5.md
>
> 检查对象：section-triggers.ts · global.css · TopologyGraph.tsx

---

## 一、动效精度

### 🟢 ScrollTrigger scrub 参数 — 通过

`section-triggers.ts` 区块② ScrollTrigger 配置完全对齐补丁规格：`trigger: section`、`start: 'top top'`、`end: '+=120vh'`、`scrub: 1`、`pin: true`、`anticipatePin: 1`。区块⑥ 同样对齐：`scrub: 0.5`、`start: 'top 80%'`、`end: 'bottom 20%'`、`matchMedia` 桌面/移动端分流均已实现。

### 🟢 高潮序列 5 步时序 — 通过

逐项核对 7 个时间线节点：S1 Glow（0.70, dur 0.08, `power3.out`）✅ · S2 Scale-up（0.72, dur 0.05, `back.out(1.7)`）✅ · S2b Scale 回落（0.77, dur 0.05, `power2.inOut`）✅ · S3 Boss 淡入（0.74, dur 0.06, `power3.out`）✅ · S5 第二句（0.88, dur 0.08, `power2.out`）✅ · Glow 消退（0.92, dur 0.10, `power2.out`）✅。

S4 底文弹出：补丁规格要求 `headline` 在 **0.80** 启动，代码实际在 **0.82**。同时 `bottomText` 容器在 0.80（补丁要求有此独立控制 ✅），headline 紧跟在 0.82。时序偏差 2%，在 scrub 驱动下体感极微，不构成阻断。

### 🟢 pathDraw dasharray/dashoffset — 通过

`connectionLines` 逐条动态计算 `Math.sqrt((x2-x1)²+(y2-y1)²)` → 设为 `stroke-dasharray` 和 `stroke-dashoffset`，`strokeDashoffset: 0` 动画、`stagger: 0.02`、`opacity: 0→0.3`、`duration: 0.20`、`ease: 'power2.out'`，全部与补丁一致。

### 🟢 节点亮起 drop-shadow glow — 通过

非 Boss 节点亮起时 `filter: 'drop-shadow(0 0 8px oklch(0.70 0.15 265 / 0.6))'` 已补齐，初始态 `filter: 'drop-shadow(0 0 0px oklch(0.70 0.15 265 / 0))'` 透明 glow 作为起始值 ✅。

### 🟢 Boss 节点 translateY 入场 — 通过

`gsap.set(bossNode, { opacity: 0, y: -30 })` + `tl.to(bossNode, { opacity: 1, y: 0 }, 0.74)` 完全对齐 V4 §3.3 的 `translateY(-30px)→0` 规格。

---

## 二、视觉精度

### 🟢 N1 等级徽章 — 通过

**4 段色彩**：`rankToTier()` 正确映射 P0–P3→junior、P4–P6→mid、P7–P9→senior、P10–P12→master ✅。`tierToColors()` 返回对应 CSS 变量（含 master 的 glow）✅。

**Pill 形状**：`rx={pillHeight/2}`（即 `6px` → 实际效果等价 `radius-full`）✅。

**双尺寸**：拓扑图节点旁 `20×12px`（P10+ 为 `24×12px`），通过 `badgeText.length > 2` 条件动态调整宽度 ✅。悬停 Tooltip 内也渲染了徽章（`padding: space-1 space-2`、`fontSize: fs-xs`、`borderRadius: radius-full`）✅。

**定位**：`badgeX = node.r + 4`、`badgeY = -(node.r - 4)` 对齐规格要求的 `(r+4px, -(r-4px))` 偏移 ✅。

### 🟢 5 态交互 Token 值 — 通过

global.css 中 4 组组件 5 态实现逐项核对：

- **CTA Email**（`.cta__email`）：hover `shadow-glow-sm` + `translateY(-1px)` ✅、active `scale(0.97)` ✅、focus-visible `outline 2px + box-shadow 4px` ✅、disabled `opacity: 0.4` + `pointer-events: none` ✅。
- **CTA Source**（`.cta__source`）：hover `color: accent` + `translateY(-1px)` ✅、active `color: accent-active` ✅、focus-visible 同上 ✅、disabled 同上 ✅。
- **时间线卡片**：hover `border → border, shadow-sm` ✅、active `border-strong, shadow-md, scale(0.99)` ✅、展开态 `border-left: 2px accent` ✅。header focus-visible `box-shadow: 4px glow` ✅。
- **对比标签**（`.contrast-tag`）：hover `brightness(1.15)` ✅、active `brightness(0.9)` ✅、focus-visible `outline: 2px solid currentColor` ✅。
- **拓扑移动节点**（`.topo-node`）：hover `bg-elevated + shadow-sm` ✅、active `accent border + glow-sm + scale(0.97)` ✅、focus-visible 增强版 ✅。

### 🟢 focus-visible 样式 — 通过

**基础层**：`*:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px }` ✅。  
**增强层**：`button:focus-visible, [role="button"]:focus-visible { box-shadow: 0 0 0 4px var(--color-accent-glow) }` ✅，以及 `.timeline-trigger:focus-visible, .topo-node:focus-visible` 的组合声明 ✅。  
outline 无 transition（焦点环立即出现）✅。

### 🟢 新增 Token（徽章色彩）— 通过

global.css `@theme` 内已定义全部 11 个徽章 Token：`--color-rank-junior/bg`、`--color-rank-mid/bg`、`--color-rank-senior/bg`、`--color-rank-master/bg/glow`，色值与补丁规格 1:1 匹配 ✅。

---

## 三、建议项

### 🟡 S4 headline 时间线微偏（0.80 → 0.82）

补丁规格 headline 在 `0.80` 启动，代码实际 `bottomText` 在 0.80、`headline` 在 0.82。scrub 模式下 2% 偏差用户几乎不可感知，但如追求精确可将 headline 对齐到 0.80、bottomText 改为 0.78。**不阻断**。

### 🟡 拓扑图节点旁徽章高度

补丁规格节点旁徽章 `20×12px`，但 `pillHeight = 12` 不含 padding — SVG `<rect>` 直接画 12px 高即为外框尺寸，内部文字 10px 被 rect 裁切空间仅 1px。实测渲染可能文字贴顶。建议将 `pillHeight` 调至 `14` 或为 `<text>` 添加 `dy` 微调。**不阻断**。

### 🟡 `.topo-node:hover` border-color 使用裸值

`oklch(0.70 0.15 265 / 0.10)` 硬编码而非引用 `--color-accent-subtle`（值相同）。补丁 §2.4 规格写的是 `--color-accent-subtle`。建议替换为 Token 引用，保持零裸值原则。**不阻断**。

---

## 结论

**🟢 全部通过，0 项阻断。** 3 项建议可在后续迭代中优化。V5 动效补丁和视觉补丁的核心规格已精确落地。
