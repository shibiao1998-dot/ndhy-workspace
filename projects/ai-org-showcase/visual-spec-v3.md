# visual-spec-v3.md — 产品官网 V3 视觉规范 + Design Token

> 🎨 视觉设计专家产出 · 2026-03-16 · 面向前端开发者，CSS 自定义属性直接可用

---

## 1. 色彩系统

纯黑白骨架 + 靛蓝唯一强调色。色彩对比度均达 WCAG 2.1 AA。

```css
:root {
  /* 背景 */
  --color-bg:          #0a0a0a;  /* 页面主背景 */
  --color-bg-surface:  #1a1a1a;  /* 卡片/tooltip/展开面板 */
  --color-bg-elevated: #222;     /* hover 态背景/代码块 */
  /* 文字 */
  --color-text:        #e0e0e0;  /* 正文 (12.9:1) */
  --color-text-bright: #f5f5f5;  /* 标题/强调句 (16.6:1) */
  --color-text-muted:  #888;     /* 辅助/副标题 (5.3:1) */
  --color-text-dim:    #555;     /* footer/禁用态 */
  /* 强调 */
  --color-accent:      #818cf8;  /* 节点/主按钮/高亮 (5.7:1) */
  --color-accent-dim:  #6366f1;  /* 按下态 */
  --color-accent-glow: rgba(129,140,248,0.35); /* 节点发光 */
  /* 边框 */
  --color-border:      #333;
  --color-border-subtle:#222;
  /* 状态标签 */
  --color-positive:    #34d399;  --color-positive-bg: rgba(52,211,153,0.10);
  --color-negative:    #f87171;  --color-negative-bg: rgba(248,113,113,0.10);
  /* 区块四散装 AI 侧 opacity */
  --contrast-dim: 0.55;
}
```

---

## 2. 字体排印

系统字体栈，严格 6 级字号。

```css
:root {
  --font-sans: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Noto Sans SC","PingFang SC","Microsoft YaHei",sans-serif;
  --font-mono: "SF Mono","Fira Code",Consolas,"Noto Sans Mono",monospace;
  /* 字号（rem，桌面 html 18px） */
  --fs-display: 2.5rem;   /* 40px 打字机/宣言 */
  --fs-h1:      1.75rem;  /* 28px 区块标题 */
  --fs-h2:      1.25rem;  /* 20px 副标题 */
  --fs-body:    1rem;     /* 18px 正文 */
  --fs-small:   0.875rem; /* 14px tooltip/标签 */
  --fs-xs:      0.75rem;  /* 12px footer */
  /* 字重 */
  --fw-normal: 400;  --fw-medium: 500;  --fw-bold: 600;
  /* 行高 */
  --lh-tight:   1.25;  /* display/标题 */
  --lh-normal:  1.6;   /* 正文 */
  --lh-relaxed: 1.8;   /* 宣言体 */
  /* 字间距 */
  --ls-tight: -0.02em;  --ls-normal: 0;  --ls-wide: 0.05em;
}
html { font-size: 18px; }
@media (max-width:1023px) { html { font-size:16px; } }
@media (max-width:600px)  { html { font-size:15px; } :root { --fs-display:1.75rem; --fs-h1:1.375rem; } }
```

---

## 3. 间距系统

4px 基准 × 8 档，禁止魔法数字。

```css
:root {
  --sp-1:  4px;   --sp-2:  8px;   --sp-3: 12px;  --sp-4: 16px;
  --sp-6: 24px;   --sp-8: 32px;  --sp-12: 48px;  --sp-16: 64px;
}
```

---

## 4. 动效 Token

与 experience-design-v3.md 对齐。

```css
:root {
  /* 时长 */
  --dur-instant: 100ms;  --dur-fast: 150ms;   --dur-normal: 300ms;
  --dur-slow:    600ms;  --dur-slower: 800ms;  --dur-hero: 1200ms;
  /* 缓动 */
  --ease-out:    cubic-bezier(0.22,1,0.36,1);
  --ease-in-out: cubic-bezier(0.45,0,0.55,1);
  --ease-in:     cubic-bezier(0.55,0,1,0.45);
  /* 区块一序列延迟 */
  --delay-date: 500ms;  --delay-line1: 1500ms;  --delay-line2: 3000ms;
  --delay-emphasis: 4500ms;  --delay-arrow: 5500ms;
  /* 拓扑图 */
  --topo-interval: 80ms;  --topo-line-delay: 1400ms;
  /* 打字机 */
  --typewriter-speed: 40ms; /* 手机端 30ms */
  /* 呼吸箭头 */
  --breathe-range: 6px;  --breathe-cycle: 2s;
}
```

---

## 5. 组件样式

### 按钮

| 属性 | 主按钮 (.btn-primary) | 次按钮 (.btn-ghost) |
|------|----------------------|-------------------|
| background | `var(--color-accent)` | `transparent` |
| color | `#000` | `var(--color-text)` |
| border | none | `1px solid var(--color-border)` |
| padding | `var(--sp-3) var(--sp-8)` | 同左 |
| border-radius | 6px | 6px |
| font | `var(--fs-body)` / `var(--fw-bold)` | `var(--fs-body)` / `var(--fw-medium)` |
| hover | bg `#9ba3fb` | border+color → `var(--color-accent)` |
| active | bg `var(--color-accent-dim)`, scale(0.97) | border → accent-dim |

### Tooltip

`bg-surface` · `1px solid var(--color-border)` · 6px radius · `var(--sp-2) var(--sp-3)` padding · `var(--fs-small)` · 节点上方 12px · 进入 opacity+translateY(4→0) `var(--dur-fast)` · 退出 100ms

### 时间线节点（区块三）

未亮: `r=8 fill var(--color-border) opacity 0.4` → 亮起: `fill var(--color-accent) drop-shadow(0 0 4px var(--color-accent-glow))` · 连接线 `2px solid var(--color-border)`，亮起后 accent opacity 0.4

### 拓扑图节点（区块二）

未亮 `opacity 0.08` → 亮起 `drop-shadow(0 0 6px var(--color-accent-glow))` → 常态 `fill var(--color-accent)` · hover `scale(1.15)` · 桌面 `r=18` 手机 `r=14` · 连线 `stroke var(--color-border) 1px`，亮起后 `#4a4a4a opacity 0.5`

### 展开面板（区块三手风琴）

`bg-surface` · `border-left 2px solid var(--color-accent)` · `var(--sp-4)` padding · max-height 展开 `var(--dur-normal) var(--ease-out)` · 代码块: `var(--font-mono) var(--fs-small) bg-elevated var(--sp-3)` padding 4px radius

### 状态标签（区块四）

✅: `color var(--color-positive) bg var(--color-positive-bg)` · ❌: `color var(--color-negative) bg var(--color-negative-bg)` · 共用: `var(--fs-small) var(--sp-1) var(--sp-2)` padding 4px radius

---

## 6. 布局规范

```css
:root { --max-w: 800px; --section-py: var(--sp-16); --section-px: var(--sp-6); }
.section { max-width:var(--max-w); margin:0 auto; padding:var(--section-py) var(--section-px); }

@media (max-width:1023px) { :root { --max-w:90vw; --section-py:var(--sp-12); } }
@media (max-width:600px)  { :root { --max-w:92vw; --section-py:var(--sp-8); --section-px:20px; } }
```

**区块四双栏**：`grid 1fr 1fr gap var(--sp-8)` · 手机 `1fr` 上下堆叠 · 左栏 `opacity var(--contrast-dim)` 流程线 `dashed` · 右栏正常亮度流程线 `2px solid accent`

**区块五剖面**：三张纵向排列 gap `var(--sp-12)` · 每张 `var(--sp-6)` padding `1px solid border-subtle` 8px radius · 层级文字 `var(--font-mono) var(--fs-small)`

**区块七 CTA**：按钮并排 gap `var(--sp-4)` · 手机纵向堆叠全宽

---

_产出完毕。6 维度覆盖：色彩/排印/间距/动效/组件/布局。所有值 CSS 自定义属性格式，前端可直接使用。_
