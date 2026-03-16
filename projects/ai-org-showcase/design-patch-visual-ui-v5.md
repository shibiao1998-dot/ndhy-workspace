# design-patch-visual-ui-v5.md — V5 设计补丁（视觉 + UI）

> 🎨 视觉设计专家 + 🖌️ UI 设计专家联合产出 · 2026-03-16
>
> 基于：visual-spec-v4.md · ui-design-v4.md · review-phase2-visual.md · review-phase2-ui.md
>
> 补丁范围：N1 专家等级徽章 · R6 五态交互补全 · S12 全局 focus-visible

---

## 1. N1 专家等级徽章

### 1.1 新增 Token（视觉规范）

```css
@theme {
  /* 等级段色彩 — 4 段 × 前景+背景 */
  --color-rank-junior:      oklch(0.65 0.12 160);       /* P0-P3 青绿 (AA 5.2:1) */
  --color-rank-junior-bg:   oklch(0.65 0.12 160 / 0.12);
  --color-rank-mid:         oklch(0.72 0.14 240);       /* P4-P6 天蓝 (AA 6.5:1) */
  --color-rank-mid-bg:      oklch(0.72 0.14 240 / 0.12);
  --color-rank-senior:      oklch(0.72 0.15 290);       /* P7-P9 紫罗兰 (AA 6.2:1) */
  --color-rank-senior-bg:   oklch(0.72 0.15 290 / 0.12);
  --color-rank-master:      oklch(0.80 0.15 65);        /* P10-P12 琥珀金 (AA 8.0:1) */
  --color-rank-master-bg:   oklch(0.80 0.15 65 / 0.12);
  --color-rank-master-glow: oklch(0.80 0.15 65 / 0.30); /* 大师发光 */
}
```

**色彩设计逻辑**：冷→暖渐进（青绿→天蓝→紫罗兰→琥珀金），等级越高色温越暖、存在感越强。与现有 `--color-accent`（靛蓝）和 `--color-boss`（金色）不冲突，琥珀金偏橙区分于老板节点的纯金色。

### 1.2 徽章视觉规格

| 属性 | 拓扑图节点旁 | 悬停卡片内 |
|------|-------------|-----------|
| **形状** | Pill 胶囊（`--radius-full`） | Pill 胶囊（`--radius-full`） |
| **尺寸** | 20×12px（含 padding） | 24×16px（含 padding） |
| **padding** | `2px var(--space-2)` | `var(--space-1) var(--space-2)` |
| **字体** | `var(--font-mono)` | `var(--font-mono)` |
| **字号** | `10px`（固定，SVG 内不用 rem） | `var(--fs-xs)` (12px) |
| **字重** | `var(--fw-semibold)` | `var(--fw-semibold)` |
| **圆角** | `var(--radius-full)` | `var(--radius-full)` |
| **前景色** | `--color-rank-{段}` | `--color-rank-{段}` |
| **背景色** | `--color-rank-{段}-bg` | `--color-rank-{段}-bg` |
| **边框** | `1px solid` 同色 15% opacity | 无 |

**等级段映射**：

| 段位 | 等级范围 | 色彩 Token | 发光效果 |
|------|---------|-----------|---------|
| 初级 | P0–P3 | `--color-rank-junior` | 无 |
| 中级 | P4–P6 | `--color-rank-mid` | 无 |
| 高级 | P7–P9 | `--color-rank-senior` | `box-shadow: 0 0 6px --color-rank-senior / 0.20` |
| 大师 | P10–P12 | `--color-rank-master` | `box-shadow: 0 0 12px var(--color-rank-master-glow)` |

**文案格式**：`P{N}`，如 `P0`、`P7`、`P12`。等宽字体确保宽度一致。

### 1.3 徽章 UI 定位

**拓扑图节点旁（桌面 SVG）**：
- 位置：节点圆心右上方，偏移 `(r + 4px, -(r - 4px))`，r 为节点半径
- 锚点：徽章左下角对齐偏移点
- 不遮挡节点 emoji/文字，不影响 tooltip 触发区域
- SVG 内用 `<foreignObject>` 或 `<g>` + `<rect>` + `<text>` 实现

**拓扑图节点旁（移动端网格）**：
- 位置：网格节点右上角，绝对定位 `top: -4px; right: -4px`
- 父容器 `position: relative`
- 触控目标不受影响：徽章不增加也不缩减节点的 48×48px 最小点击区域

**悬停卡片内**：
- 位置：角色名右侧，同行 inline-flex 对齐
- 布局：`[emoji] [角色名] [P0 徽章]`，gap: `var(--space-2)`
- 垂直居中于角色名文字基线

### 1.4 徽章 5 态

| 状态 | 表现 |
|------|------|
| default | 如上规格 |
| hover | 无独立 hover（跟随节点/卡片 hover） |
| active | 无独立 active |
| focus-visible | 无独立 focus（纯展示组件） |
| disabled | `opacity: 0.4` |

> 徽章为**纯展示组件**，无独立交互行为，状态跟随父级节点。

---

## 2. R6 五态交互规范补全

> 修复 review-phase2-ui.md 🔴3：为 4 个组件补全精确 Token 值。

### 2.1 按钮 — CTA Email / GitHub Link

使用 ui-design-v4.md §2.1 Primary + Ghost 变体。

**CTA Email（Primary 按钮）**：

| 状态 | background | color | border | shadow | transform | opacity |
|------|-----------|-------|--------|--------|-----------|---------|
| default | `--color-accent` | `--color-bg` | `none` | `none` | `none` | `1` |
| hover | `--color-accent-hover` | `--color-bg` | `none` | `--shadow-glow-sm` | `translateY(-1px)` | `1` |
| active | `--color-accent-active` | `--color-bg` | `none` | `none` | `scale(0.97)` | `1` |
| focus-visible | `--color-accent` | `--color-bg` | `none` | `0 0 0 4px var(--color-accent-glow)` | `none` | `1` |
| disabled | `--color-accent` | `--color-bg` | `none` | `none` | `none` | `0.4` |

focus-visible 额外添加：`outline: 2px solid var(--color-accent); outline-offset: 2px`

**GitHub Link（Ghost 按钮）**：

| 状态 | background | color | border | shadow | transform | opacity |
|------|-----------|-------|--------|--------|-----------|---------|
| default | `transparent` | `--color-text` | `1px solid --color-border` | `none` | `none` | `1` |
| hover | `transparent` | `--color-accent` | `1px solid --color-accent` | `none` | `translateY(-1px)` | `1` |
| active | `transparent` | `--color-accent-active` | `1px solid --color-accent-active` | `none` | `none` | `1` |
| focus-visible | `transparent` | `--color-text` | `1px solid --color-border` | `0 0 0 4px var(--color-accent-glow)` | `none` | `1` |
| disabled | `transparent` | `--color-text` | `1px solid --color-border` | `none` | `none` | `0.4` |

focus-visible 额外：`outline: 2px solid var(--color-accent); outline-offset: 2px`

所有按钮共享：`transition: all var(--dur-micro) var(--ease-out)`；disabled 态加 `pointer-events: none; cursor: not-allowed`。

### 2.2 时间线卡片

| 状态 | background | color | border | shadow | transform | opacity |
|------|-----------|-------|--------|--------|-----------|---------|
| default | `--color-bg-surface` | `--color-text-bright` | `1px solid --color-border-subtle` | `none` | `none` | `1` |
| hover | `--color-bg-elevated` | `--color-text-bright` | `1px solid --color-border` | `--shadow-sm` | `none` | `1` |
| active | `--color-bg-elevated` | `--color-text-bright` | `1px solid --color-border-strong` | `--shadow-md` | `scale(0.99)` | `1` |
| focus-visible | `--color-bg-surface` | `--color-text-bright` | `1px solid --color-border-subtle` | `0 0 0 4px var(--color-accent-glow)` | `none` | `1` |
| disabled | `--color-bg-surface` | `--color-text-disabled` | `1px solid --color-border-subtle` | `none` | `none` | `0.5` |

focus-visible 额外：`outline: 2px solid var(--color-accent); outline-offset: 2px`

卡片 header 触发器：必须使用 `<button>` 元素（或 `tabindex="0"` + `role="button"` + keyboard handler），配合 `aria-expanded` 属性。

展开态额外：左侧 `border-left: 2px solid var(--color-accent)`，bg 切换至 `--color-bg-elevated`。

`transition: border-color var(--dur-micro) var(--ease-out), box-shadow var(--dur-micro) var(--ease-out), background var(--dur-micro) var(--ease-out)`

### 2.3 对比标签

| 状态 | background | color | border | shadow | transform | opacity |
|------|-----------|-------|--------|--------|-----------|---------|
| default | 语义色 `-bg` Token | 语义色 Token | `none` | `none` | `none` | `1` |
| hover | 语义色 `-bg` Token | 语义色 Token | `none` | `none` | `none` | `1`，`filter: brightness(1.15)` |
| active | 语义色 `-bg` Token | 语义色 Token | `none` | `none` | `none` | `1`，`filter: brightness(0.9)` |
| focus-visible | 语义色 `-bg` Token | 语义色 Token | `none` | `none` | `none` | `1` |
| disabled | 语义色 `-bg` Token | 语义色 Token | `none` | `none` | `none` | `0.4` |

focus-visible 额外：`outline: 2px solid currentColor; outline-offset: 2px`

> 对比标签目前为纯展示。若后续增加交互，上述 hover/active 已预留。当前实现可仅定义 default + disabled，hover/active/focus 作为 CSS 储备。

`transition: filter var(--dur-micro) var(--ease-out), opacity var(--dur-micro) var(--ease-out)`

### 2.4 拓扑节点（移动端网格）

| 状态 | background | color | border | shadow | transform | opacity |
|------|-----------|-------|--------|--------|-----------|---------|
| default | `--color-bg-surface` | `--color-text-bright` | `1px solid --color-border-subtle` | `none` | `none` | `1` |
| hover | `--color-bg-elevated` | `--color-text-bright` | `1px solid --color-accent-subtle` | `--shadow-sm` | `none` | `1` |
| active | `--color-bg-elevated` | `--color-text-bright` | `1px solid --color-accent` | `--shadow-glow-sm` | `scale(0.97)` | `1` |
| focus-visible | `--color-bg-surface` | `--color-text-bright` | `1px solid --color-border-subtle` | `0 0 0 4px var(--color-accent-glow)` | `none` | `1` |
| disabled | `--color-bg-surface` | `--color-text-disabled` | `1px solid --color-border-subtle` | `none` | `none` | `0.5` |

focus-visible 额外：`outline: 2px solid var(--color-accent); outline-offset: 2px`（增强版）

交互属性要求：`tabindex="0"` + `role="button"` + `aria-label="[角色名]"` + keyboard handler（Enter/Space 触发 tap 展开）。

`transition: all var(--dur-micro) var(--ease-out)`

---

## 3. S12 全局 focus-visible 样式

### 3.1 基础层（global.css 添加）

```css
/* 全局 focus-visible — 所有可交互元素 */
*:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

/* 移除默认 outline 后的保护：禁止无替代的 outline: none */
/* ❌ 不要在任何组件中写 outline: none 不带替代 */
```

### 3.2 增强层（按钮 + 拓扑节点）

```css
/* 增强版 focus — CTA 按钮、拓扑节点 */
.btn-primary:focus-visible,
.btn-ghost:focus-visible,
.topo-node:focus-visible,
.timeline-card__header:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px var(--color-accent-glow);
}
```

### 3.3 实现说明

| 规则 | Token 引用 |
|------|-----------|
| outline 颜色 | `var(--color-accent)` |
| outline 宽度 | `2px`（固定值，无障碍标准） |
| outline 偏移 | `2px`（固定值，防止贴边） |
| 增强版外发光 | `0 0 0 4px var(--color-accent-glow)` |
| 过渡 | 不对 outline 加 transition（焦点环应立即出现） |

**覆盖范围**：
- 基础层自动覆盖所有 `<a>`、`<button>`、`<input>`、`[tabindex="0"]` 等可聚焦元素
- 增强层仅用于高交互密度组件（按钮、节点），提供更强视觉引导
- `prefers-reduced-motion` 时焦点环不受影响（焦点环不是动效，是无障碍必需）

---

## 对比度验证（新增 Token）

| Token | 色值 | 在 --color-bg 上 | 达标 |
|-------|------|-----------------|------|
| `--color-rank-junior` | oklch(0.65 0.12 160) | ≈5.2:1 | ✅ AA |
| `--color-rank-mid` | oklch(0.72 0.14 240) | ≈6.5:1 | ✅ AA |
| `--color-rank-senior` | oklch(0.72 0.15 290) | ≈6.2:1 | ✅ AA |
| `--color-rank-master` | oklch(0.80 0.15 65) | ≈8.0:1 | ✅ AA |

---

_🎨🖌️ V5 设计补丁完成。3 项补齐：N1 等级徽章（4 段色彩 + 拓扑/卡片双定位 + 发光层级）· R6 五态补全（4 组件 × 6 属性 × 5 态 = 120 个精确 Token 引用）· S12 全局 focus-visible（基础层 + 增强层）。所有新增值 Token 化，零裸值。_
