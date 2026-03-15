# 视觉设计 — 设计 Token 输出规范

## Token 是什么

设计 Token 是视觉决策的**原子化、结构化表达**，是设计与开发之间的契约语言。

**核心理念**：所有视觉属性值（颜色、间距、字号、圆角、阴影等）不以原始值出现在代码中，而是通过 Token 引用。

## 三层 Token 架构

```
┌─────────────────────────────────────────────┐
│  Component Token (组件级)                     │
│  button-bg-primary: {color-interactive}       │
│  → 绑定到具体组件的具体属性                       │
├─────────────────────────────────────────────┤
│  Alias Token (语义级)                         │
│  color-interactive: {color-brand-primary-500} │
│  → 语义化命名，表达"用途"                         │
├─────────────────────────────────────────────┤
│  Global Token (全局级)                        │
│  color-brand-primary-500: #3B82F6             │
│  → 原始值，表达"是什么"                           │
└─────────────────────────────────────────────┘
```

### 各层职责

| 层级 | 命名方式 | 修改频率 | 谁使用 |
|------|---------|---------|-------|
| **Global** | `{category}-{property}-{variant}` | 极少改（换品牌时） | 仅被 Alias 引用 |
| **Alias** | `{category}-{semantic-role}` | 偶尔改（主题切换） | 通用样式、布局 |
| **Component** | `{component}-{property}-{state}` | 按需改 | 组件样式 |

### 为什么需要三层

- **Global 变 → Alias 自动跟**：换品牌色时只改 Global，Alias 自动更新
- **Alias 变 → 暗色模式**：亮/暗色模式只需切换 Alias 层映射
- **Component 层 → 组件独立性**：组件有自己的 Token，不直接绑定全局值

## Token 命名规范

### 命名结构

```
{category}-{property}-{variant}-{state}

示例：
color-bg-primary          → 类别:颜色, 属性:背景, 变体:主要
color-text-secondary      → 类别:颜色, 属性:文字, 变体:次要
space-padding-md          → 类别:间距, 属性:内边距, 变体:中等
button-bg-primary-hover   → 组件:按钮, 属性:背景, 变体:主要, 状态:悬停
```

### 命名规则

| 规则 | 说明 | ✅ 正确 | ❌ 错误 |
|------|------|--------|--------|
| **kebab-case** | 全小写，连字符分隔 | `color-bg-primary` | `colorBgPrimary` |
| **语义优先** | 表达用途，非外观 | `color-text-secondary` | `color-gray-600` |
| **不含原始值** | 名称里不包含具体值 | `space-md` | `space-16px` |
| **一致前缀** | 同类 Token 前缀统一 | `color-*`, `space-*` | 混用 `bg-*`, `color-bg-*` |

## Token 完整清单

### 颜色 Token

```
// === Global ===
color-brand-primary-{50~900}
color-brand-secondary-{50~900}
color-semantic-success-{light|default|dark}
color-semantic-warning-{light|default|dark}
color-semantic-error-{light|default|dark}
color-semantic-info-{light|default|dark}
color-neutral-{50~900}

// === Alias ===
// 背景
color-bg-primary          // 页面底色
color-bg-secondary        // 区块/卡片背景
color-bg-tertiary         // 内嵌区域背景
color-bg-inverse          // 深色背景
color-bg-brand            // 品牌色背景
color-bg-success          // 成功态背景
color-bg-warning          // 警告态背景
color-bg-error            // 错误态背景

// 文字
color-text-primary        // 主文字
color-text-secondary      // 次要文字
color-text-tertiary       // 辅助文字
color-text-disabled       // 禁用文字
color-text-inverse        // 深色背景上的文字
color-text-brand          // 品牌色文字
color-text-success
color-text-warning
color-text-error
color-text-link           // 链接文字

// 边框
color-border-default      // 默认边框
color-border-strong       // 强调边框
color-border-focus        // 聚焦态边框
color-border-error        // 错误态边框

// 交互
color-interactive-primary       // 主要交互元素
color-interactive-primary-hover
color-interactive-primary-active
color-interactive-secondary
color-interactive-secondary-hover
color-interactive-danger
color-interactive-danger-hover
```

### 间距 Token

```
space-{0|1|2|3|4|5|6|8|10|12|16|20}
// 值: 0/4/8/12/16/20/24/32/40/48/64/80 px
```

### 字体 Token

```
font-family-{sans|mono}
font-size-{display|h1|h2|h3|h4|body-l|body|body-s|caption|overline}
font-weight-{regular|medium|semibold|bold}
line-height-{tight|snug|normal|relaxed|loose}
letter-spacing-{tight|normal|wide}
```

### 形状 Token

```
radius-{none|sm|md|lg|xl|full}
shadow-{xs|sm|md|lg|xl}
border-width-{thin|default|thick}   // 1px / 1.5px / 2px
```

### 动效 Token

```
ease-{default|in|out|in-out}
duration-{instant|fast|normal|slow|slower}
```

## 输出格式

### JSON 格式（设计工具 / 通用）

```json
{
  "color": {
    "brand": {
      "primary": {
        "50":  { "value": "#EFF6FF" },
        "500": { "value": "#3B82F6" },
        "900": { "value": "#1E3A5F" }
      }
    },
    "bg": {
      "primary": { "value": "{color.neutral.50}" }
    }
  },
  "space": {
    "1": { "value": "4px" },
    "2": { "value": "8px" }
  }
}
```

### CSS Custom Properties

```css
:root {
  --color-brand-primary-500: #3B82F6;
  --color-bg-primary: var(--color-neutral-50);
  --space-1: 4px;
  --space-2: 8px;
  --radius-md: 8px;
  --shadow-sm: 0 2px 4px rgba(0,0,0,0.06);
}

[data-theme="dark"] {
  --color-bg-primary: var(--color-neutral-900);
  --color-text-primary: var(--color-neutral-50);
}
```

### Tailwind CSS Config

```js
module.exports = {
  theme: {
    colors: {
      brand: {
        primary: {
          50: '#EFF6FF',
          500: '#3B82F6',
          900: '#1E3A5F',
        },
      },
    },
    spacing: {
      1: '4px',
      2: '8px',
      3: '12px',
      4: '16px',
    },
    borderRadius: {
      sm: '4px',
      md: '8px',
      lg: '12px',
    },
  },
}
```

## Token 治理规则

1. **新增 Token 必须归类**：不允许游离的 one-off Token
2. **废弃 Token 标记 deprecated**：不直接删除，先标记，下个版本删
3. **Token 改名需全局搜索替换**：确认所有引用都已更新
4. **定期审计**：检查未使用的 Token 和重复的 Token
5. **文档同步**：Token 文件与 Token 文档必须同步更新
