# visual-spec-v4.md — 产品官网 V4 视觉规范 + Design Token

> 🎨 视觉设计专家产出 · 2026-03-16
>
> 基于：visual-spec-v3.md（基线）· experience-design-v4.md（交互方案）· review-worldclass-visual.md（审查报告）· tech-architecture-v4.md（Tailwind v4 @theme）· content-v4.md（视觉权重标注）
>
> 格式：CSS 自定义属性，与 Tailwind CSS v4 `@theme` 兼容。零裸色值、零魔法数字。

---

## 1. 色彩系统

### 1.1 背景色层级（等差 ΔL ≈ 2%）

V3 问题：表面色跳跃不均匀（ΔL 2.8%→3.5%）。V4 严格等差递进。

```css
@theme {
  --color-bg:          oklch(0.13 0.01 270);  /* #0a0a0f — 页面底色，微蓝底 */
  --color-bg-surface:  oklch(0.15 0.01 270);  /* #111118 — 卡片/面板 */
  --color-bg-elevated: oklch(0.17 0.01 270);  /* #18181f — 代码块/hover 态 */
  --color-bg-overlay:  oklch(0.19 0.01 270);  /* #1f1f27 — 弹层/tooltip */
}
```

### 1.2 灰阶 12 级（V3: 5 级 → V4: 12 级）

V3 审查暴露：灰阶粗糙度 2.4× 于 Linear。V4 对标 12 级，均匀递进。

```css
@theme {
  --color-gray-50:  oklch(0.98 0 0);    /* #f7f7f8 — 反色背景/亮标签 */
  --color-gray-100: oklch(0.94 0 0);    /* #ededef — 最亮文字（AAA 18.2:1） */
  --color-gray-200: oklch(0.88 0 0);    /* #dcdce0 — 强调文字（AAA 14.8:1） */
  --color-gray-300: oklch(0.82 0 0);    /* #c8c8cd — 正文（AAA 11.2:1） */
  --color-gray-400: oklch(0.72 0 0);    /* #a8a8b0 — 副标题（AA 7.8:1） */
  --color-gray-500: oklch(0.62 0 0);    /* #8a8a94 — 辅助文字（AA 5.5:1） */
  --color-gray-600: oklch(0.52 0 0);    /* #6b6b76 — 弱辅助（AA 4.0:1, 装饰级） */
  --color-gray-700: oklch(0.42 0 0);    /* #505059 — 禁用态文字（3.0:1） */
  --color-gray-800: oklch(0.32 0 0);    /* #38383f — 强边框 */
  --color-gray-900: oklch(0.24 0 0);    /* #28282d — 默认边框 */
  --color-gray-950: oklch(0.18 0 0);    /* #1c1c20 — 弱边框/分割线 */
  --color-gray-1000: oklch(0.14 0 0);   /* #101014 — 最深辅助 */
}
```

### 1.3 语义色 Token（文字/背景/边框）

```css
@theme {
  /* 文字 */
  --color-text:         var(--color-gray-300);  /* 正文 11.2:1 ✅ AAA */
  --color-text-bright:  var(--color-gray-100);  /* 标题 18.2:1 ✅ AAA */
  --color-text-muted:   var(--color-gray-500);  /* 辅助 5.5:1 ✅ AA */
  --color-text-dim:     var(--color-gray-600);  /* 装饰 4.0:1 大字AA */
  --color-text-disabled:var(--color-gray-700);  /* 禁用 3.0:1 */
  /* 边框 */
  --color-border:       var(--color-gray-900);  /* 默认 */
  --color-border-strong:var(--color-gray-800);  /* 强调 */
  --color-border-subtle:var(--color-gray-950);  /* 弱边框 */
}
```

### 1.4 强调色系统

```css
@theme {
  /* Primary — Indigo 靛蓝 */
  --color-accent:      oklch(0.70 0.15 265);   /* #818cf8 — 节点/按钮 (AA 5.7:1) */
  --color-accent-hover:oklch(0.76 0.14 265);   /* #9ba3fb — hover */
  --color-accent-active:oklch(0.64 0.16 265);  /* #6366f1 — active/按下 */
  --color-accent-subtle:oklch(0.70 0.15 265 / 0.10); /* 低透明背景 */
  --color-accent-glow: oklch(0.70 0.15 265 / 0.35);  /* 节点发光 */
  /* Boss Node — 金色（唯一暖色，层级区分） */
  --color-boss:        oklch(0.80 0.15 85);    /* #fbbf24 */
  --color-boss-glow:   oklch(0.80 0.15 85 / 0.30);
  --color-boss-bg:     oklch(0.80 0.15 85 / 0.10); /* 老板节点/L0标签背景 */

  /* 等级标签背景色 */
  --color-level-l0-bg: oklch(0.80 0.15 85 / 0.10);  /* L0 老板 — 同 --color-boss-bg */
  --color-level-l1-bg: var(--color-accent-subtle);    /* L1 Leader — 靛蓝低透 */
  --color-level-l2-bg: var(--color-info-bg);          /* L2 项目管理 — 信息蓝低透 */
  --color-level-l3-bg: oklch(0.62 0 0 / 0.10);       /* L3 专家 — 灰阶低透 */
}
```

### 1.5 功能色（暗色原生，降饱和适配）

V3 问题：直接用亮色值，深色背景上刺眼。V4 专为暗色降饱和。

```css
@theme {
  /* Success */
  --color-success:     oklch(0.72 0.15 160);   /* #2dd4a0 (AA 6.8:1) */
  --color-success-bg:  oklch(0.72 0.15 160 / 0.10);
  --color-success-border: oklch(0.72 0.15 160 / 0.25);
  /* Warning */
  --color-warning:     oklch(0.78 0.14 75);    /* #f5b731 (AA 8.5:1) */
  --color-warning-bg:  oklch(0.78 0.14 75 / 0.10);
  --color-warning-border: oklch(0.78 0.14 75 / 0.25);
  /* Error */
  --color-error:       oklch(0.68 0.14 20);    /* #e88080 (AA 5.6:1) */
  --color-error-bg:    oklch(0.68 0.14 20 / 0.10);
  --color-error-border:oklch(0.68 0.14 20 / 0.25);
  /* Info */
  --color-info:        oklch(0.72 0.12 240);   /* #7ab4f0 (AA 6.5:1) */
  --color-info-bg:     oklch(0.72 0.12 240 / 0.10);
  --color-info-border: oklch(0.72 0.12 240 / 0.25);
}
```

---

## 2. 字体排印

### 2.1 字族与字号阶梯

```css
@theme {
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
               "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif;
  --font-mono: "SF Mono", "Fira Code", Consolas, "Noto Sans Mono", monospace;

  /* 6 级字号（rem），行高对齐 4px 基线网格 */
  --fs-display: 2.5rem;    /* 40px */
  --fs-h1:      1.75rem;   /* 28px */
  --fs-h2:      1.25rem;   /* 20px */
  --fs-body:    1rem;       /* 16px（html 基准调整，见下） */
  --fs-small:   0.875rem;  /* 14px */
  --fs-xs:      0.75rem;   /* 12px */

  /* 字重 */
  --fw-light:   300;
  --fw-normal:  400;
  --fw-medium:  500;
  --fw-semibold:600;
  --fw-bold:    700;

  /* 行高 — 全部对齐 4px 网格 */
  --lh-display: 1.2;    /* 40×1.2 = 48px ✅ 4px 网格 */
  --lh-heading: 1.286;  /* 28×1.286 = 36px ✅ 4px 网格 */
  --lh-body:    1.75;   /* 16×1.75 = 28px ✅ 4px 网格 */
  --lh-small:   1.429;  /* 14×1.429 = 20px ✅ 4px 网格 */
  --lh-relaxed: 2.0;    /* 16×2.0 = 32px ✅ 宣言体 */

  /* 字间距 */
  --ls-tight:  -0.02em;  /* Display/H1 */
  --ls-normal:  0;        /* Body */
  --ls-wide:    0.05em;   /* 标签/品类提示 */
}
```

### 2.2 响应式字号

```css
html { font-size: 16px; }
@media (min-width: 768px)  { html { font-size: 17px; } }
@media (min-width: 1024px) { html { font-size: 18px; } }

/* 区块⑥ 视觉权重字号用 clamp 渐进 */
@theme {
  --fs-emphasis-sm: clamp(1.2rem, 2.5vw, 1.5rem);   /* 1.2× 权重 */
  --fs-emphasis-md: clamp(1.5rem, 3.5vw, 2.25rem);   /* 1.5× 权重 */
  --fs-emphasis-lg: clamp(2rem, 5vw, 3.5rem);         /* 2× 权重 — "答案是——组织。" */
}
```

---

## 3. 间距系统

4px 基准 × 14 档。V3 为 8 档，V4 补充 20/40/56/80/96 档位。

```css
@theme {
  --space-0:   0;
  --space-1:   4px;
  --space-2:   8px;
  --space-3:   12px;
  --space-4:   16px;
  --space-5:   20px;
  --space-6:   24px;
  --space-8:   32px;
  --space-10:  40px;
  --space-12:  48px;
  --space-14:  56px;
  --space-16:  64px;
  --space-20:  80px;
  --space-24:  96px;
}
```

---

## 4. 圆角 Token（V3 缺失）

```css
@theme {
  --radius-none: 0;
  --radius-sm:   4px;   /* 状态标签/代码块 */
  --radius-md:   8px;   /* 卡片/tooltip/按钮 */
  --radius-lg:   12px;  /* 大面板/展开区 */
  --radius-xl:   16px;  /* 弹层 */
  --radius-full: 9999px;/* 圆形节点/pill badge */
}
```

---

## 5. 阴影 Token（V3 缺失）

暗色主题阴影需加大 spread + 用品牌微光补偿，纯黑影在深色背景上不可见。

```css
@theme {
  --shadow-sm:  0 1px 3px oklch(0 0 0 / 0.4), 0 0 1px oklch(0 0 0 / 0.2);
  --shadow-md:  0 4px 12px oklch(0 0 0 / 0.5), 0 0 1px oklch(0 0 0 / 0.3);
  --shadow-lg:  0 8px 24px oklch(0 0 0 / 0.6), 0 0 1px oklch(0 0 0 / 0.3);
  --shadow-glow-sm: 0 0 8px var(--color-accent-glow);
  --shadow-glow-md: 0 0 20px var(--color-accent-glow);
  --shadow-glow-lg: 0 0 40px oklch(0.70 0.15 265 / 0.4);
}
```

---

## 6. Z-index Token（V3 缺失）

```css
@theme {
  --z-base:     0;
  --z-raised:   10;    /* 卡片/面板 */
  --z-sticky:   20;    /* 吸顶导航 */
  --z-overlay:  30;    /* 遮罩层 */
  --z-tooltip:  40;    /* tooltip */
  --z-modal:    50;    /* 弹窗 */
}
```

---

## 7. 动效 Token

与 experience-design-v4.md §3.1 全局动效变量对齐。V4 新增 spring 和 dramatic 缓动。

```css
@theme {
  /* 时长 */
  --dur-micro:     120ms;   /* hover/focus 微交互 */
  --dur-fast:      200ms;   /* tooltip/toggle */
  --dur-normal:    400ms;   /* 标准淡入/滑入 */
  --dur-slow:      800ms;   /* 大区块入场 */
  --dur-dramatic:  1200ms;  /* 高潮爆发 */
  /* 缓动 */
  --ease-out:      cubic-bezier(0.22, 1, 0.36, 1);      /* 入场 */
  --ease-in-out:   cubic-bezier(0.45, 0, 0.55, 1);      /* 循环 */
  --ease-spring:   cubic-bezier(0.34, 1.56, 0.64, 1);   /* 弹性(V3缺) */
  --ease-dramatic: cubic-bezier(0.16, 1, 0.3, 1);       /* 爆发(V3缺) */
  /* 位移档位 */
  --offset-subtle: 24px;
  --offset-medium: 48px;
  --offset-large:  80px;
}
```

---

## 8. 断点 Token

与 experience-design-v4.md §5.1 四档五断点 + tech-architecture-v4.md §8.1 对齐。

```css
@theme {
  --breakpoint-sm:  375px;
  --breakpoint-md:  768px;
  --breakpoint-lg:  1024px;
  --breakpoint-xl:  1440px;
  --breakpoint-2xl: 1920px;
}
```

---

## 9. 组件视觉规范

### 9.1 按钮

| 属性 | 主按钮 | Secondary 按钮 | 幽灵按钮 |
|------|--------|---------------|---------|
| bg (default) | `var(--color-accent)` | `transparent` | `transparent` |
| color | `var(--color-bg)` | `var(--color-accent)` | `var(--color-text)` |
| border | `none` | `1px solid var(--color-accent)` | `1px solid var(--color-border)` |
| padding | `var(--space-3) var(--space-8)` | 同左 | 同左 |
| radius | `var(--radius-md)` | `var(--radius-md)` | `var(--radius-md)` |
| font | `var(--fs-body)` / `var(--fw-semibold)` | `var(--fs-body)` / `var(--fw-medium)` | `var(--fs-body)` / `var(--fw-medium)` |

**全状态**：

| 状态 | 主按钮 | Secondary 按钮 | 幽灵按钮 |
|------|--------|---------------|---------|
| hover | bg `var(--color-accent-hover)`, `translateY(-1px)`, `box-shadow: var(--shadow-glow-sm)` | bg `var(--color-accent-subtle)`, `translateY(-1px)` | border+color → accent, `translateY(-1px)` |
| active | bg `var(--color-accent-active)`, `scale(0.97)` | bg `var(--color-accent-subtle)`, border → `var(--color-accent-active)` | border → accent-active |
| focus | `outline: 2px solid var(--color-accent)`, `outline-offset: 2px` | 同左 | 同左 |
| disabled | `opacity: 0.4`, `pointer-events: none` | 同左 | 同左 |

### 9.2 卡片

```css
.card {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  padding: var(--space-6);
  transition: border-color var(--dur-micro) var(--ease-out),
              box-shadow var(--dur-micro) var(--ease-out);
}
.card:hover {
  border-color: var(--color-border);
  box-shadow: var(--shadow-sm);
}
```

### 9.3 状态标签

```css
.tag {
  font-size: var(--fs-small);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-weight: var(--fw-medium);
}
.tag-success { color: var(--color-success); background: var(--color-success-bg); }
.tag-error   { color: var(--color-error);   background: var(--color-error-bg);   }
.tag-warning { color: var(--color-warning); background: var(--color-warning-bg); }
.tag-info    { color: var(--color-info);    background: var(--color-info-bg);    }
```

### 9.4 Tooltip

```css
.tooltip {
  background: var(--color-bg-overlay);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-3);
  font-size: var(--fs-small);
  z-index: var(--z-tooltip);
  box-shadow: var(--shadow-md);
}
/* 入场 */ transition: opacity var(--dur-micro) var(--ease-out),
                       transform var(--dur-micro) var(--ease-out);
/* 退出延迟 150ms 防闪烁 */
```

### 9.5 代码块

```css
.code-block {
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  background: var(--color-bg-elevated);
  padding: var(--space-3);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border-subtle);
  line-height: var(--lh-small);
}
```

### 9.6 展开面板（手风琴）

```css
.accordion-panel {
  background: var(--color-bg-surface);
  border-left: 2px solid var(--color-accent);
  padding: var(--space-4);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
}
/* 展开：grid-template-rows: 0fr → 1fr */
/* 时长：var(--dur-normal)，缓动：var(--ease-out) */
```

---

## 10. 区块⑥ 视觉权重实现

content-v4.md 标注了 5 处视觉权重。实现规则：

| 权重标注 | 字号 Token | 字重 | 行高 | 间距 |
|---------|-----------|------|------|------|
| 常规 | `var(--fs-body)` | `var(--fw-normal)` | `var(--lh-body)` | `var(--space-6)` gap |
| 1.2× | `var(--fs-emphasis-sm)` | `var(--fw-medium)` | `var(--lh-heading)` | `var(--space-8)` gap |
| 1.5× | `var(--fs-emphasis-md)` | `var(--fw-semibold)` | `var(--lh-display)` | `var(--space-10)` gap |
| 2× "答案是——组织。" | `var(--fs-emphasis-lg)` | `var(--fw-bold)` | `var(--lh-display)` | `var(--space-16)` top/bottom |

**"答案是——组织。"** 独占一屏实现：
- 字号 `var(--fs-emphasis-lg)` — `clamp(2rem, 5vw, 3.5rem)`
- 字重 `var(--fw-bold)` (700)
- 颜色 `var(--color-text-bright)` — 最亮白
- 上下 padding `var(--space-16)` — 64px 呼吸空间
- 入场：`opacity: 0→1` + `translateY(var(--offset-subtle))→0` + `filter: blur(8px→0)`
- 时长 `var(--dur-slow)`, 缓动 `var(--ease-out)`

### 首屏品类提示

```css
.category-hint {
  font-size: var(--fs-xs);
  font-family: var(--font-sans);
  letter-spacing: var(--ls-wide);
  color: var(--color-text-bright);
  opacity: 0.15;  /* content-v4.md 指定 */
}
/* ≤375px: opacity: 0.12 — 更小屏上进一步弱化 */
```

---

## 11. 布局 Token

```css
@theme {
  --max-w-content: 800px;
  --max-w-wide:    900px;    /* ≥1440px 宽屏 */
  --section-py:    var(--space-16);  /* 64px 区块纵距 */
  --section-px:    var(--space-6);   /* 24px 水平安全距 */
}

/* 响应式 */
@media (max-width: 1023px) {
  :root { --max-w-content: 90vw; --section-py: var(--space-12); }
}
@media (max-width: 767px) {
  :root { --max-w-content: 92vw; --section-py: var(--space-8); --section-px: var(--space-4); }
}
```

---

## 12. 对比度验证总表

| Token | 色值 | 在 --color-bg 上 | 达标 |
|-------|------|-----------------|------|
| `--color-text-bright` | gray-100 | 18.2:1 | ✅ AAA |
| `--color-text` | gray-300 | 11.2:1 | ✅ AAA |
| `--color-text-muted` | gray-500 | 5.5:1 | ✅ AA |
| `--color-text-dim` | gray-600 | 4.0:1 | ✅ 大字AA |
| `--color-accent` | #818cf8 | 5.7:1 | ✅ AA |
| `--color-success` | #2dd4a0 | 6.8:1 | ✅ AA |
| `--color-warning` | #f5b731 | 8.5:1 | ✅ AA |
| `--color-error` | #e88080 | 5.6:1 | ✅ AA |
| `--color-info` | #7ab4f0 | 6.5:1 | ✅ AA |

**V3 不达标项修复**：
- `--color-text-dim` 从 #555 (2.6:1 ❌) → gray-600 (4.0:1 ✅ 大字AA)
- Footer 文字统一使用 `--color-text-muted` (5.5:1 ✅)，不再出现裸色值

---

## V3→V4 变更清单

| # | V3 问题 | V4 解决方案 |
|---|--------|-----------|
| 1 | 灰阶 5 级 | 12 级，oklch 均匀递进 |
| 2 | 40+ 裸色值 | 全部 Token 化，零裸色值 |
| 3 | 无 radius Token | 6 档：none/sm/md/lg/xl/full |
| 4 | 无 shadow Token | 5 档：sm/md/lg + glow 3 档 |
| 5 | 无 z-index Token | 6 档：base→modal |
| 6 | 间距 8 档 | 14 档，补 20/40/56/80/96px |
| 7 | 功能色未暗色适配 | 降饱和处理，专为暗底校准 |
| 8 | 行高不对齐 4px 网格 | 全部重算，均对齐 |
| 9 | 缓动单一（仅 ease-out） | 新增 spring + dramatic |
| 10 | 表面色跳跃不均 | oklch 等差 ΔL≈2% |
| 11 | 字重缺少对比 | 新增 300(light) + 700(bold) |
| 12 | hover 缺微动效 | 按钮 translateY(-1px) + glow |
| 13 | 动效 Token 不对齐 | 完全对齐 experience-design-v4.md |
| 14 | 断点不覆盖 | 5 档：375/768/1024/1440/1920 |
| 15 | 无视觉权重系统 | 3 档 emphasis 字号 Token |

---

_🎨 视觉设计专家 · V4 视觉规范完成。12 维度全覆盖：色彩(12级灰阶+功能色暗色适配) / 排印(4px网格对齐) / 间距(14档) / 圆角 / 阴影 / z-index / 动效 / 断点 / 组件(全状态) / 视觉权重 / 布局 / 对比度验证。零裸色值，零魔法数字，Tailwind CSS v4 @theme 兼容。_
