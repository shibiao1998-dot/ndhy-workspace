# Phase 2 审查报告 — UI 组件还原度

> 🖌️ UI 设计专家 · 2026-03-16
> 基准：ui-design-v4.md · 审查范围：sections/ 7 区块 + components/ 4 组件

---

## 🔴 阻断（3 项，必须修复）

### 1. TimelineAccordion.tsx 大量硬编码裸值

`padding: '12px 16px'`、`gap: 16`、`width: 32`、`height: 32`、`fontSize: 14` 等全部使用裸 px 值，未引用 `--space-*` / `--fs-*` Token。**规范要求零裸间距**（§1.3），此组件违规 20+ 处。`panelContent` 的 `marginLeft: 16, marginRight: 16, marginBottom: 16` 同理。

**修复**：全部改为 CSS 变量引用（`var(--space-3)` / `var(--space-4)` 等），建议改用 CSS 类替代 inline style 对象。

### 2. TopologyGraph.tsx 硬编码颜色 + 裸尺寸

- 颜色硬编码：`COLOR_BOSS = '#fbbf24'`、`COLOR_ACCENT = '#818cf8'` 等直接写色值，未引用 `--color-boss` / `--color-accent` Token
- tooltip 样式：`background: 'rgba(25, 25, 35, 0.95)'`、`borderRadius: 8`、`padding: '8px 14px'`、`fontSize: 14` 均为裸值
- SVG 节点尺寸（`r: 28/24/20/14`）、布局坐标（`cx/cy`）未使用 Token

**修复**：颜色改用 CSS 变量（SVG 中 `fill="var(--color-boss)"` 可行）；tooltip 样式对齐规范 §2.5（`--color-bg-overlay`、`--radius-md`、`--space-2 --space-3`、`--fs-small`）。

### 3. 按钮/卡片/标签 5 态实现缺失

- **按钮**：S7CtaSection 的 `.cta__email` 和 `.cta__source` 只有 hover 态，**缺 active / focus-visible / disabled 三个状态**
- **时间线卡片**：`.timeline-card` 有 hover + is-open 态，**缺 focus-visible / disabled / active 态**
- **标签**：S4ContrastSection 的 `.contrast__tag` 零交互状态（无 hover/active/focus/disabled），规范 §2.3 要求 5 态
- **拓扑节点（移动端）**：`.topo-node` 无 hover / active / focus-visible / disabled 定义

**修复**：为上述组件补全 5 态 CSS（参照 ui-design-v4.md §2.1–2.3 的状态定义表）。

---

## 🟡 建议（4 项，强烈建议修复）

### 4. 响应式断点覆盖不完整

规范要求 4 档：375 / 768 / 1024 / 1440。实际实现：
- 大部分区块只用 `max-width: 767px` 和 `min-width: 1024px`，**缺 768–1023px（平板）中间断点**
- **≥1440px 断点完全缺失**（规范 §4.1 要求 xl 断点用 `max-width: 900px` 居中容器 + `--space-8` 列间距）
- S1 缺 `375px` 小屏额外适配

**修复**：补充 `@media (min-width: 768px) and (max-width: 1023px)` 和 `@media (min-width: 1440px)` 断点样式。

### 5. 全局 focus-visible 样式未定义

规范 §5.1 要求全局 `*:focus-visible` 统一样式和增强版 focus（按钮 + 拓扑节点加 `box-shadow: 0 0 0 4px var(--color-accent-glow)`）。当前各组件中只有 `ScrollArrow.astro` 定义了 `:focus-visible`，其余组件**均未实现**。

**修复**：在 `global.css` 添加全局 `*:focus-visible` 规则 + 增强版类。

### 6. 键盘导航缺陷

- `.timeline-card__header` 是 `<div>` + click 事件，**非 `<button>`**，键盘不可达（无 `tabindex`、无 `role="button"`、无 `aria-expanded`）
- 拓扑移动端节点（`.topo-node`）无 `tabindex="0"` / `role="button"`，规范 §5.2 要求 Enter/Space 打开 tooltip
- SkipLink 组件已实现 ✅，但未见 `#main-content` 锚点 ID 在页面中定义

**修复**：时间线 header 改用 `<button>` 或添加 `tabindex="0"` + `role="button"` + keyboard handler；移动端拓扑节点添加交互属性。

### 7. S4ContrastSection 对比栏左右布局断点偏差

规范 §4.2-④ 要求 **≥768px 左右双栏**，实际实现是 `min-width: 1024px` 才切换为 `flex-direction: row`。平板端（768–1023px）仍为上下堆叠。

---

## 🟢 通过（6 项）

| 检查项 | 结果 |
|--------|------|
| 移动端拓扑图使用垂直分层网格（非 SVG 缩放） | ✅ HTML 网格 + `@media (min-width: 768px)` 切换 |
| 移动端触控目标 ≥ 48×48px | ✅ `min-height: var(--space-12)` 正确应用 |
| Astro 组件间距使用 Token | ✅ sections/ 中所有 `.astro` 文件零裸 px（除 border-width） |
| 语义化 HTML 标签 | ✅ `<section>` / `<article>` / `<footer>` / `role` / `aria-label` 使用得当 |
| 对比度 Token 使用 | ✅ 正文/标题/辅助色均引用语义 Token |
| ScrollArrow 组件规范 | ✅ 48×48px + focus-visible + Token 引用 |

---

**总结**：Astro 模板层 Token 使用规范度高，但 **React 岛组件（TSX）是重灾区**——硬编码颜色和裸间距严重违反零裸值铁律。5 态覆盖和键盘导航是第二优先级。建议优先修复 🔴 三项阻断后再推进部署。
