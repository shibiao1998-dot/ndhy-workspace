# Design Tokens 完整体系

> Token = 设计决策的最小单位。把"用什么颜色、多大字号、多宽间距"这些决策变成有名字的变量。

## 命名规范

**三层命名结构**：`--{类别}-{语义}-{变体}`

```
全局 Token：  --color-blue-500          （基础色板，不直接使用）
语义 Token：  --color-primary            （语义命名，组件使用这一层）
组件 Token：  --button-bg-primary        （组件级别，可选）
```

**原则**：组件消费语义 Token，语义 Token 引用全局 Token。禁止组件直接使用全局 Token。

---

## 1. 颜色体系

### 1.1 基础色板

每个色系 11 级（50-950），遵循 Tailwind 色阶结构：

| 级别 | 用途 | 示例（Blue） |
|------|------|-------------|
| 50 | 最浅背景 | `#eff6ff` |
| 100 | 浅背景 | `#dbeafe` |
| 200 | 浅边框/悬停背景 | `#bfdbfe` |
| 300 | 边框 | `#93c5fd` |
| 400 | 次要文字/图标 | `#60a5fa` |
| 500 | 主色 | `#3b82f6` |
| 600 | 悬停态主色 | `#2563eb` |
| 700 | 按下态/深色文字 | `#1d4ed8` |
| 800 | 深背景 | `#1e40af` |
| 900 | 最深 | `#1e3a8a` |
| 950 | 极深 | `#172554` |

**推荐色系**：Primary / Secondary / Neutral(Gray) / Success(Green) / Warning(Amber) / Error(Red) / Info(Blue)

### 1.2 语义色

```css
/* 品牌色 */
--color-primary: var(--color-blue-600);
--color-primary-hover: var(--color-blue-700);
--color-primary-active: var(--color-blue-800);
--color-primary-light: var(--color-blue-50);
--color-secondary: var(--color-slate-600);

/* 功能色 */
--color-success: var(--color-green-600);
--color-warning: var(--color-amber-500);
--color-error: var(--color-red-600);
--color-info: var(--color-blue-500);

/* 背景色 */
--color-bg-primary: #ffffff;
--color-bg-secondary: var(--color-gray-50);
--color-bg-tertiary: var(--color-gray-100);
--color-bg-inverse: var(--color-gray-900);

/* 前景色（文字） */
--color-fg-primary: var(--color-gray-900);
--color-fg-secondary: var(--color-gray-600);
--color-fg-tertiary: var(--color-gray-400);
--color-fg-inverse: #ffffff;
--color-fg-link: var(--color-primary);

/* 边框色 */
--color-border-primary: var(--color-gray-200);
--color-border-secondary: var(--color-gray-100);
--color-border-focus: var(--color-primary);
--color-border-error: var(--color-error);
```

### 1.3 暗黑模式适配

暗黑模式通过覆盖语义 Token 的值实现，不改变名称：

```css
[data-theme="dark"] {
  --color-bg-primary: var(--color-gray-950);
  --color-bg-secondary: var(--color-gray-900);
  --color-fg-primary: var(--color-gray-50);
  --color-fg-secondary: var(--color-gray-400);
  --color-border-primary: var(--color-gray-800);
  /* ... 其他语义色覆盖 */
}
```

---

## 2. 字号体系

基于 `rem`，基准 `1rem = 16px`：

| Token 名 | 值 | px 等效 | 用途 |
|----------|-----|---------|------|
| `--font-size-xs` | `0.75rem` | 12px | 辅助文字、标签 |
| `--font-size-sm` | `0.875rem` | 14px | 正文辅助、表格内容 |
| `--font-size-base` | `1rem` | 16px | 正文默认 |
| `--font-size-lg` | `1.125rem` | 18px | 小标题、强调文本 |
| `--font-size-xl` | `1.25rem` | 20px | 二级标题 |
| `--font-size-2xl` | `1.5rem` | 24px | 一级标题 |
| `--font-size-3xl` | `1.875rem` | 30px | 页面标题 |
| `--font-size-4xl` | `2.25rem` | 36px | 英雄区标题 |
| `--font-size-5xl` | `3rem` | 48px | 大号展示标题 |

**字重**：

| Token 名 | 值 | 用途 |
|----------|-----|------|
| `--font-weight-normal` | `400` | 正文 |
| `--font-weight-medium` | `500` | 强调正文 |
| `--font-weight-semibold` | `600` | 小标题 |
| `--font-weight-bold` | `700` | 标题 |

**行高**：

| Token 名 | 值 | 用途 |
|----------|-----|------|
| `--line-height-tight` | `1.25` | 标题 |
| `--line-height-normal` | `1.5` | 正文 |
| `--line-height-relaxed` | `1.75` | 长文本 |

---

## 3. 间距体系

基于 **4px 倍数**，提供离散档位（禁止使用非标值）：

| Token 名 | 值 | px | 典型用途 |
|----------|-----|-----|---------|
| `--spacing-0` | `0` | 0 | 无间距 |
| `--spacing-1` | `0.25rem` | 4 | 图标与文字间距 |
| `--spacing-2` | `0.5rem` | 8 | 组件内紧凑间距 |
| `--spacing-3` | `0.75rem` | 12 | 组件内标准间距 |
| `--spacing-4` | `1rem` | 16 | 组件间间距 |
| `--spacing-5` | `1.25rem` | 20 | 卡片内边距 |
| `--spacing-6` | `1.5rem` | 24 | 区块间距 |
| `--spacing-8` | `2rem` | 32 | 大区块间距 |
| `--spacing-10` | `2.5rem` | 40 | 板块间距 |
| `--spacing-12` | `3rem` | 48 | 页面级间距 |
| `--spacing-16` | `4rem` | 64 | 大板块分隔 |
| `--spacing-20` | `5rem` | 80 | 英雄区上下间距 |
| `--spacing-24` | `6rem` | 96 | 超大分隔 |

---

## 4. 圆角体系

| Token 名 | 值 | 用途 |
|----------|-----|------|
| `--radius-none` | `0` | 无圆角（表格、分割线） |
| `--radius-sm` | `0.25rem` (4px) | 输入框、小元素 |
| `--radius-md` | `0.375rem` (6px) | 按钮、卡片（默认） |
| `--radius-lg` | `0.5rem` (8px) | 大卡片、弹窗 |
| `--radius-xl` | `0.75rem` (12px) | 大弹窗、模块容器 |
| `--radius-2xl` | `1rem` (16px) | 特殊卡片 |
| `--radius-full` | `9999px` | 圆形（头像、徽标） |

---

## 5. 阴影体系

| Token 名 | 值 | 用途 |
|----------|-----|------|
| `--shadow-none` | `none` | 无阴影 |
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | 按钮、输入框 |
| `--shadow-md` | `0 4px 6px -1px rgba(0,0,0,0.1)` | 悬浮卡片 |
| `--shadow-lg` | `0 10px 15px -3px rgba(0,0,0,0.1)` | 下拉菜单、弹出层 |
| `--shadow-xl` | `0 20px 25px -5px rgba(0,0,0,0.1)` | 模态弹窗 |

---

## 6. 断点体系

| Token 名 | 值 | 设备 |
|----------|-----|------|
| `--breakpoint-sm` | `640px` | 大屏手机（横屏） |
| `--breakpoint-md` | `768px` | 平板竖屏 |
| `--breakpoint-lg` | `1024px` | 平板横屏/小笔记本 |
| `--breakpoint-xl` | `1280px` | 桌面 |
| `--breakpoint-2xl` | `1536px` | 大桌面 |

> 注意：断点值不能直接用 CSS Custom Properties 在 media query 中引用（CSS 限制），但作为文档化的标准值，在 Tailwind config 和 JS 中使用。

---

## 7. 过渡与动画

| Token 名 | 值 | 用途 |
|----------|-----|------|
| `--transition-fast` | `150ms ease` | 按钮悬停、焦点 |
| `--transition-normal` | `200ms ease` | 下拉展开、标签切换 |
| `--transition-slow` | `300ms ease` | 模态出现、页面切换 |
| `--transition-timing` | `cubic-bezier(0.4, 0, 0.2, 1)` | 通用缓动函数 |

---

## 8. z-index 层级

| Token 名 | 值 | 用途 |
|----------|-----|------|
| `--z-base` | `0` | 普通内容 |
| `--z-dropdown` | `100` | 下拉菜单 |
| `--z-sticky` | `200` | 吸顶导航 |
| `--z-modal-backdrop` | `300` | 模态遮罩 |
| `--z-modal` | `400` | 模态弹窗 |
| `--z-popover` | `500` | 气泡、工具提示 |
| `--z-toast` | `600` | 全局通知 |
