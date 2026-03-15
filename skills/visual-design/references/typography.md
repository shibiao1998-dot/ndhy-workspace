# 视觉设计 — 字体排印规范

## 字体选择

### 字体家族组合

| 用途 | 说明 | 选择原则 |
|------|------|---------|
| **中文字体** | 正文与标题 | 优选系统字体（无需额外加载），Web 自定义需考虑字体文件大小 |
| **英文字体** | 英文/数字显示 | 与中文字体视觉协调，x-height 相近 |
| **等宽字体** | 代码/数据展示 | 数字等宽，0 和 O 可区分 |

### 推荐系统字体栈

```css
/* 中英文通用 */
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
  "Helvetica Neue", Arial, "Noto Sans SC", "PingFang SC",
  "Microsoft YaHei", sans-serif;

/* 等宽 */
font-family: "JetBrains Mono", "SF Mono", "Fira Code",
  "Cascadia Code", Consolas, monospace;
```

**自定义字体注意事项**：
- 中文字体文件通常 5~15MB，必须做子集化或使用 CDN
- 优先使用 Variable Font（可变字体），减少文件数量
- 定义 font-display: swap 避免 FOIT（不可见文字闪烁）

## 字体层级体系

### 标准层级定义

| 层级 | 用途 | 字号(Desktop) | 字重 | 行高 | 字距 |
|------|------|--------------|------|------|------|
| **Display** | 营销页大标题 | 36~48px | Bold (700) | 1.2 | -0.02em |
| **H1** | 页面标题 | 28~32px | Bold (700) | 1.3 | -0.01em |
| **H2** | 区块标题 | 22~24px | Semibold (600) | 1.35 | 0 |
| **H3** | 卡片/模块标题 | 18~20px | Semibold (600) | 1.4 | 0 |
| **H4** | 小标题 | 16px | Medium (500) | 1.4 | 0 |
| **Body-L** | 大段正文 | 16px | Regular (400) | 1.6~1.75 | 0 |
| **Body** | 标准正文 | 14px | Regular (400) | 1.5~1.7 | 0 |
| **Body-S** | 小号正文 | 13px | Regular (400) | 1.5 | 0 |
| **Caption** | 辅助说明 | 12px | Regular (400) | 1.5 | 0.01em |
| **Overline** | 标签/分类 | 12px | Medium (500) | 1.5 | 0.05em |

### 行高规则

| 字号范围 | 推荐行高 | 说明 |
|---------|---------|------|
| ≥ 28px | 1.2~1.3 | 大标题紧凑 |
| 18~24px | 1.35~1.4 | 小标题适中 |
| 14~16px | 1.5~1.75 | 正文宽松便于阅读 |
| ≤ 13px | 1.5 | 小号文字保持可读 |

**中文特殊处理**：中文方块字特性要求行高比纯英文大 0.1~0.2，推荐正文行高 1.6~1.75。

### 字距规则

| 场景 | 字距 | 说明 |
|------|------|------|
| 大标题（≥28px） | -0.02em ~ -0.01em | 紧缩让大字更紧凑 |
| 正文 | 0 | 默认即可 |
| Overline/全大写 | 0.05em~0.1em | 加宽提高全大写可读性 |
| 中文正文 | 0 | 中文字距不调整 |

## 中英文混排规则

| 规则 | 处理 | 示例 |
|------|------|------|
| **中英文间距** | 中英文之间自动加 0.25em 间距（CSS `text-autospace` 或手动处理） | 使用 React 组件 → 使用 React 组件 |
| **中文标点** | 使用全角标点，连续标点缩进 | 正确：你好，世界！ |
| **数字字体** | 数字使用等宽数字（tabular figures）以保持对齐 | `font-variant-numeric: tabular-nums` |
| **混排行高** | 以中文行高为准（中文字高 > 英文） | 行高 1.6~1.75 |
| **链接与代码** | 英文链接/代码保持英文字体 | URL、code 不用中文字体 |

## 段落排版规范

| 参数 | 值 | 说明 |
|------|-----|------|
| **段间距** | 1em ~ 1.5em | 段落之间留足呼吸空间 |
| **最大行宽** | 60~80 字符 | 超过 80 字符阅读效率下降 |
| **对齐方式** | 左对齐（中英文通用） | 不用两端对齐（易产生 river） |
| **首行缩进** | 不缩进 | Web 端用段间距替代缩进 |
| **列表间距** | 列表项间 0.25em~0.5em | 列表不宜太松或太紧 |

## 字体 Token 产出格式

```
// Font Family
font-family-sans: "Inter", "Noto Sans SC", sans-serif
font-family-mono: "JetBrains Mono", monospace

// Font Size
font-size-display: 48px
font-size-h1: 32px
font-size-h2: 24px
font-size-h3: 20px
font-size-h4: 16px
font-size-body-l: 16px
font-size-body: 14px
font-size-body-s: 13px
font-size-caption: 12px
font-size-overline: 12px

// Font Weight
font-weight-regular: 400
font-weight-medium: 500
font-weight-semibold: 600
font-weight-bold: 700

// Line Height
line-height-tight: 1.2
line-height-snug: 1.35
line-height-normal: 1.5
line-height-relaxed: 1.6
line-height-loose: 1.75

// Letter Spacing
letter-spacing-tight: -0.02em
letter-spacing-normal: 0
letter-spacing-wide: 0.05em
```
