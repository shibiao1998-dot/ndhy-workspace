# Token 格式输出规范

> 一份 Token 定义，输出三种格式——确保设计系统在任何技术栈都能使用。

## 三种输出格式

### 1. CSS Custom Properties（最终消费格式）

```css
/* tokens.css — Design Tokens */
:root {
  /* === Colors: Base Palette === */
  --color-blue-50: #eff6ff;
  --color-blue-100: #dbeafe;
  --color-blue-500: #3b82f6;
  --color-blue-600: #2563eb;
  --color-blue-700: #1d4ed8;
  /* ... */

  /* === Colors: Semantic === */
  --color-primary: var(--color-blue-600);
  --color-primary-hover: var(--color-blue-700);
  --color-primary-active: var(--color-blue-800);
  --color-primary-light: var(--color-blue-50);
  --color-success: #16a34a;
  --color-warning: #f59e0b;
  --color-error: #dc2626;
  --color-info: #3b82f6;

  /* === Colors: Background === */
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f9fafb;
  --color-bg-tertiary: #f3f4f6;

  /* === Colors: Foreground === */
  --color-fg-primary: #111827;
  --color-fg-secondary: #4b5563;
  --color-fg-tertiary: #9ca3af;

  /* === Colors: Border === */
  --color-border-primary: #e5e7eb;
  --color-border-focus: var(--color-primary);
  --color-border-error: var(--color-error);

  /* === Typography === */
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --font-size-4xl: 2.25rem;

  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;

  /* === Spacing === */
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-3: 0.75rem;
  --spacing-4: 1rem;
  --spacing-5: 1.25rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;
  --spacing-10: 2.5rem;
  --spacing-12: 3rem;
  --spacing-16: 4rem;
  --spacing-20: 5rem;
  --spacing-24: 6rem;

  /* === Border Radius === */
  --radius-none: 0;
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;
  --radius-full: 9999px;

  /* === Shadows === */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

  /* === Transitions === */
  --transition-fast: 150ms ease;
  --transition-normal: 200ms ease;
  --transition-slow: 300ms ease;

  /* === Z-Index === */
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-modal-backdrop: 300;
  --z-modal: 400;
  --z-popover: 500;
  --z-toast: 600;
}

/* === Dark Theme Override === */
[data-theme="dark"] {
  --color-bg-primary: #030712;
  --color-bg-secondary: #111827;
  --color-bg-tertiary: #1f2937;
  --color-fg-primary: #f9fafb;
  --color-fg-secondary: #9ca3af;
  --color-fg-tertiary: #6b7280;
  --color-border-primary: #374151;
}
```

### 2. JSON Token（单一数据源）

```json
{
  "$schema": "https://design-tokens.github.io/community-group/format/",
  "color": {
    "primary": { "$value": "#2563eb", "$type": "color", "$description": "主品牌色" },
    "primary-hover": { "$value": "#1d4ed8", "$type": "color" },
    "primary-active": { "$value": "#1e40af", "$type": "color" },
    "primary-light": { "$value": "#eff6ff", "$type": "color" },
    "success": { "$value": "#16a34a", "$type": "color" },
    "warning": { "$value": "#f59e0b", "$type": "color" },
    "error": { "$value": "#dc2626", "$type": "color" },
    "bg": {
      "primary": { "$value": "#ffffff", "$type": "color" },
      "secondary": { "$value": "#f9fafb", "$type": "color" },
      "tertiary": { "$value": "#f3f4f6", "$type": "color" }
    },
    "fg": {
      "primary": { "$value": "#111827", "$type": "color" },
      "secondary": { "$value": "#4b5563", "$type": "color" },
      "tertiary": { "$value": "#9ca3af", "$type": "color" }
    },
    "border": {
      "primary": { "$value": "#e5e7eb", "$type": "color" },
      "focus": { "$value": "{color.primary}", "$type": "color" },
      "error": { "$value": "{color.error}", "$type": "color" }
    }
  },
  "fontSize": {
    "xs": { "$value": "0.75rem", "$type": "dimension" },
    "sm": { "$value": "0.875rem", "$type": "dimension" },
    "base": { "$value": "1rem", "$type": "dimension" },
    "lg": { "$value": "1.125rem", "$type": "dimension" },
    "xl": { "$value": "1.25rem", "$type": "dimension" },
    "2xl": { "$value": "1.5rem", "$type": "dimension" },
    "3xl": { "$value": "1.875rem", "$type": "dimension" },
    "4xl": { "$value": "2.25rem", "$type": "dimension" }
  },
  "spacing": {
    "1": { "$value": "0.25rem", "$type": "dimension" },
    "2": { "$value": "0.5rem", "$type": "dimension" },
    "3": { "$value": "0.75rem", "$type": "dimension" },
    "4": { "$value": "1rem", "$type": "dimension" },
    "6": { "$value": "1.5rem", "$type": "dimension" },
    "8": { "$value": "2rem", "$type": "dimension" },
    "12": { "$value": "3rem", "$type": "dimension" },
    "16": { "$value": "4rem", "$type": "dimension" },
    "24": { "$value": "6rem", "$type": "dimension" }
  },
  "borderRadius": {
    "sm": { "$value": "0.25rem", "$type": "dimension" },
    "md": { "$value": "0.375rem", "$type": "dimension" },
    "lg": { "$value": "0.5rem", "$type": "dimension" },
    "xl": { "$value": "0.75rem", "$type": "dimension" },
    "full": { "$value": "9999px", "$type": "dimension" }
  }
}
```

### 3. Tailwind CSS 配置

```typescript
// tailwind.config.ts（扩展片段）
import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
          hover: "var(--color-primary-hover)",
          active: "var(--color-primary-active)",
          light: "var(--color-primary-light)",
        },
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        error: "var(--color-error)",
        info: "var(--color-info)",
        bg: {
          primary: "var(--color-bg-primary)",
          secondary: "var(--color-bg-secondary)",
          tertiary: "var(--color-bg-tertiary)",
        },
        fg: {
          primary: "var(--color-fg-primary)",
          secondary: "var(--color-fg-secondary)",
          tertiary: "var(--color-fg-tertiary)",
        },
        border: {
          DEFAULT: "var(--color-border-primary)",
          focus: "var(--color-border-focus)",
          error: "var(--color-border-error)",
        },
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
      },
    },
  },
};

export default config;
```

---

## 格式选择指南

| 场景 | 推荐格式 | 原因 |
|------|---------|------|
| Web 项目直接使用 | CSS Custom Properties | 零依赖、浏览器原生支持 |
| 多平台共享（Web + Native） | JSON Token | 平台无关的单一数据源 |
| 使用 Tailwind CSS | CSS + Tailwind config | Tailwind 消费 CSS 变量 |
| 需要构建工具转换 | JSON → Style Dictionary | 自动生成多平台代码 |

## 文件组织

```
design-system/
├── tokens/
│   ├── tokens.css          # CSS Custom Properties
│   ├── tokens.json         # JSON 单一数据源
│   └── dark-theme.css      # 暗黑模式覆盖
├── tailwind.config.ts      # Tailwind 配置
└── README.md               # 使用说明
```
