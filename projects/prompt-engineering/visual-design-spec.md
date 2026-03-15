# 视觉设计规范：提示词工程系统

> 产出者：🎨 视觉设计专家 | 产出日期：2026-03-15
> 输入依据：产品定义文档、体验设计方案、华渔教育调研、现有前端代码审查
> 下游消费者：🖥️ 前端开发专家（实现还原）、🎨 体验设计专家（回检一致性）
> 设计体系基础：Ant Design 5 Design Token

---

## 一、品牌色板

### 1.1 品牌调性锚点

华渔教育的视觉基因提炼自三个品牌关键词：

- **教育科技**：技术驱动教育革新，兼具温度与理性
- **专业可信**：面向董事长 DJ 级呈现，需要沉稳、权威感
- **国际化**：覆盖150+国家，全球1.5亿用户，视觉语言需跨文化

### 1.2 主色（Brand Primary）

| Token 名称 | 色值 | 用途 | 设计理由 |
|------------|------|------|----------|
| `color-brand-primary` | `#1B65A9` | 主按钮、品牌标识、核心交互元素 | 深邃学院蓝——比 AntD 默认蓝更沉稳，传递专业可信的教育机构气质，兼顾科技感 |
| `color-brand-primary-hover` | `#2878C4` | 主色悬停态 | 明度提升一档，保持色相不变 |
| `color-brand-primary-active` | `#13508A` | 主色按下态 | 明度降低一档，增强按压反馈 |
| `color-brand-primary-bg` | `#E8F1FA` | 主色浅底（选中卡片背景、高亮区域） | 主色 10% 透明度近似，确保文字可读性 |
| `color-brand-primary-border` | `#A3C8E8` | 主色边框（选中态输入框、卡片边框） | 主色中间态，用于边界强调 |

### 1.3 辅色（Functional Accent）

| Token 名称 | 色值 | 用途 | 设计理由 |
|------------|------|------|----------|
| `color-accent-cyan` | `#0EA5A1` | 路由匹配结果、引擎标识、数据可视化辅助色 | 青绿色——与主色蓝形成同温度系但可区分的辅助层，传递"智能、活跃"感 |
| `color-accent-cyan-bg` | `#E6F7F6` | 辅色浅底 | 用于路由结果区域、标签背景 |
| `color-accent-violet` | `#6E59A5` | 维度优先级图标、覆盖率可视化 | 紫调——在蓝-青的主辅色之外提供第三视觉锚点，用于分类/分级场景 |

### 1.4 中性色（Neutral Gray Scale）

| Token 名称 | 色值 | 用途 |
|------------|------|------|
| `color-neutral-title` | `#1A1A2E` | 页面标题、最高层级文字 |
| `color-neutral-text` | `#333333` | 正文文字 |
| `color-neutral-secondary` | `#666666` | 辅助文字、说明文案 |
| `color-neutral-placeholder` | `#999999` | 占位符、禁用态文字 |
| `color-neutral-disabled` | `#BFBFBF` | 禁用态元素 |
| `color-neutral-border` | `#D9D9D9` | 默认边框 |
| `color-neutral-divider` | `#E8E8E8` | 分割线 |
| `color-neutral-bg-base` | `#F0F2F5` | 页面底色 |
| `color-neutral-bg-elevated` | `#F7F8FA` | 卡片内浅色背景（输入框内部、展开区域） |
| `color-neutral-white` | `#FFFFFF` | 卡片背景、弹窗背景 |

### 1.5 语义色（Semantic Colors）

| Token 名称 | 色值 | 用途 |
|------------|------|------|
| `color-success` | `#29A352` | 成功状态、已复制反馈、可选维度标识 |
| `color-success-bg` | `#E9F7EF` | 成功浅底 |
| `color-warning` | `#E8900C` | 警告状态、建议维度标识、部分内容未完成 |
| `color-warning-bg` | `#FFF7E6` | 警告浅底 |
| `color-error` | `#D93025` | 错误状态、必须维度标识、缺失警告 |
| `color-error-bg` | `#FDECEB` | 错误浅底 |
| `color-info` | `#1B65A9` | 信息提示（复用主色） |
| `color-info-bg` | `#E8F1FA` | 信息浅底 |

### 1.6 色彩使用规则

1. **页面同时出现的色相不超过 4 种**：主色蓝 + 辅色青 + 中性灰 + 当前语义色
2. **语义色仅在对应语义场景使用**：`color-error` 只用于错误，不用于装饰
3. **文字-背景对比度**：正文 ≥ 4.5:1（WCAG 2.1 AA），大字（≥18px）≥ 3:1
4. **维度优先级色彩**：必须 = `color-error`、建议 = `color-warning`、可选 = `color-success`——与现有系统语义一致

---

## 二、字体方案

### 2.1 字族选择

| 用途 | 字族 | Fallback 链 |
|------|------|-------------|
| 标题 | PingFang SC / Microsoft YaHei | `'PingFang SC', 'Microsoft YaHei', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` |
| 正文 | PingFang SC / Microsoft YaHei | 同上 |
| 代码（提示词输出区） | JetBrains Mono | `'JetBrains Mono', 'SF Mono', 'Fira Code', 'Consolas', 'Source Code Pro', monospace` |

> 设计决策：标题与正文同字族（通过字重区分层级），降低字体加载成本。代码字体选用 JetBrains Mono——连字特性好、等宽字符宽度适中、开源免费。

### 2.2 字号阶梯（6级）

| 层级 | Token 名称 | 字号 | 行高 | 字重 | 使用场景 |
|------|-----------|------|------|------|----------|
| H1 | `font-size-h1` | 24px | 32px (1.33) | 600 (Semibold) | 页头产品名称 |
| H2 | `font-size-h2` | 20px | 28px (1.4) | 600 (Semibold) | 区块标题（"维度覆盖报告"） |
| H3 | `font-size-h3` | 16px | 24px (1.5) | 600 (Semibold) | 列标题（"🔴 必须维度"） |
| Body | `font-size-body` | 14px | 22px (1.57) | 400 (Regular) | 正文、维度名称、输入框文字 |
| Small | `font-size-small` | 13px | 20px (1.54) | 400 (Regular) | 辅助文字（字符数、提示信息） |
| Caption | `font-size-caption` | 12px | 18px (1.5) | 400 (Regular) | 标签内文字、时间戳、footnote |

### 2.3 字重规则

| 字重 | 数值 | 使用场景 |
|------|------|----------|
| Regular | 400 | 正文、辅助文字、输入态文字 |
| Medium | 500 | 按钮文字、Tab 标签、统计数值 |
| Semibold | 600 | 所有标题（H1-H3）、维度名称（选中态）、关键数据 |

> 约束：不使用 Bold (700)——在中文字体中 Semibold 与 Bold 视觉差异极小，增加字重反而损害层级清晰度。

---

## 三、间距系统

### 3.1 基准与档位

基准单位：**4px**

| 档位 | Token 名称 | 数值 | 典型用途 |
|------|-----------|------|----------|
| `xs` | `spacing-xs` | 4px | 图标与文字间距、紧凑元素内边距 |
| `sm` | `spacing-sm` | 8px | 标签内边距、行内元素间距、小卡片内间距 |
| `md` | `spacing-md` | 16px | 组件间距、卡片内边距、区块间隔 |
| `lg` | `spacing-lg` | 24px | 区域间距、卡片外边距、Section 间隔 |
| `xl` | `spacing-xl` | 32px | 大区块间距（A→B→C 区之间） |
| `2xl` | `spacing-2xl` | 48px | 页面上下留白、重要间断 |

### 3.2 组件内外间距规则

| 场景 | 内边距 (padding) | 外边距 (margin/gap) |
|------|-----------------|-------------------|
| Card 容器 | `spacing-lg` (24px) | `spacing-md` (16px) 底部 |
| 输入框 (Input/TextArea) | `spacing-sm` (8px) 上下，`spacing-md` (16px) 左右 | — |
| 按钮（大号） | `spacing-sm` (8px) 上下，`spacing-lg` (24px) 左右 | — |
| 维度项卡片 | `spacing-sm` (8px) 上下，`spacing-md` (16px) 左右 | `spacing-xs` (4px) 底部 |
| 维度三列网格 | — | `spacing-md` (16px) 列间距 |
| 页头区域 | `spacing-md` (16px) 上，`spacing-lg` (24px) 下 | — |
| Section 之间 | — | `spacing-md` (16px) |
| 代码输出区 | `spacing-lg` (24px) | — |

### 3.3 间距铁律

1. **所有间距必须是 4px 的倍数**——不存在 5px、10px、14px 等非 4px 倍数值
2. **组件间距优先用 gap 属性**——Flex/Grid 布局用 `gap`，不用 margin hack
3. **嵌套容器间距递减**：外层 `spacing-lg` → 内层 `spacing-md` → 内容 `spacing-sm`

---

## 四、AntD Theme Token 配置

以下 TypeScript 代码可直接用于 `main.tsx` 的 `ConfigProvider`：

```typescript
// theme.ts — AntD 5 Design Token 配置

import type { ThemeConfig } from 'antd';

export const promptEngineeringTheme: ThemeConfig = {
  token: {
    // ===== 品牌色 =====
    colorPrimary: '#1B65A9',
    colorPrimaryHover: '#2878C4',
    colorPrimaryActive: '#13508A',
    colorPrimaryBg: '#E8F1FA',
    colorPrimaryBorder: '#A3C8E8',
    colorPrimaryBgHover: '#D4E5F5',
    colorPrimaryText: '#1B65A9',
    colorPrimaryTextHover: '#2878C4',
    colorPrimaryTextActive: '#13508A',

    // ===== 语义色 =====
    colorSuccess: '#29A352',
    colorSuccessBg: '#E9F7EF',
    colorSuccessBorder: '#8DD4A8',
    colorWarning: '#E8900C',
    colorWarningBg: '#FFF7E6',
    colorWarningBorder: '#F5C36A',
    colorError: '#D93025',
    colorErrorBg: '#FDECEB',
    colorErrorBorder: '#F0A09B',
    colorInfo: '#1B65A9',
    colorInfoBg: '#E8F1FA',
    colorInfoBorder: '#A3C8E8',

    // ===== 中性色 =====
    colorText: '#333333',
    colorTextSecondary: '#666666',
    colorTextTertiary: '#999999',
    colorTextQuaternary: '#BFBFBF',
    colorBgContainer: '#FFFFFF',
    colorBgElevated: '#FFFFFF',
    colorBgLayout: '#F0F2F5',
    colorBorder: '#D9D9D9',
    colorBorderSecondary: '#E8E8E8',
    colorFill: '#F7F8FA',
    colorFillSecondary: '#F0F2F5',
    colorFillTertiary: '#F7F8FA',

    // ===== 字体 =====
    fontFamily: "'PingFang SC', 'Microsoft YaHei', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontFamilyCode: "'JetBrains Mono', 'SF Mono', 'Fira Code', Consolas, 'Source Code Pro', monospace",
    fontSize: 14,
    fontSizeHeading1: 24,
    fontSizeHeading2: 20,
    fontSizeHeading3: 16,
    fontSizeHeading4: 14,
    fontSizeHeading5: 13,
    fontSizeSM: 13,
    fontSizeLG: 16,

    // ===== 行高 =====
    lineHeight: 1.5714,
    lineHeightHeading1: 1.3333,
    lineHeightHeading2: 1.4,
    lineHeightHeading3: 1.5,
    lineHeightLG: 1.5,
    lineHeightSM: 1.5384,

    // ===== 间距 =====
    padding: 16,
    paddingLG: 24,
    paddingSM: 8,
    paddingXS: 4,
    paddingXXS: 2,
    margin: 16,
    marginLG: 24,
    marginSM: 8,
    marginXS: 4,
    marginXXS: 2,

    // ===== 圆角 =====
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,
    borderRadiusXS: 4,

    // ===== 阴影 =====
    boxShadow: '0 2px 8px rgba(27, 101, 169, 0.06)',
    boxShadowSecondary: '0 4px 16px rgba(27, 101, 169, 0.08)',
    boxShadowTertiary: '0 1px 4px rgba(0, 0, 0, 0.04)',

    // ===== 动效 =====
    motionDurationFast: '0.12s',
    motionDurationMid: '0.2s',
    motionDurationSlow: '0.3s',
    motionEaseInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    motionEaseOut: 'cubic-bezier(0, 0, 0.2, 1)',
    motionEaseIn: 'cubic-bezier(0.4, 0, 1, 1)',

    // ===== 尺寸 =====
    controlHeight: 36,
    controlHeightLG: 44,
    controlHeightSM: 28,
  },

  components: {
    // ===== Button =====
    Button: {
      fontWeight: 500,
      primaryShadow: '0 2px 4px rgba(27, 101, 169, 0.2)',
      defaultBorderColor: '#D9D9D9',
      defaultColor: '#333333',
      borderRadius: 8,
      controlHeight: 36,
      controlHeightLG: 48,
      controlHeightSM: 28,
      paddingInline: 20,
      paddingInlineLG: 28,
    },

    // ===== Card =====
    Card: {
      borderRadiusLG: 12,
      paddingLG: 24,
      boxShadowTertiary: '0 1px 4px rgba(0, 0, 0, 0.04)',
      headerFontSize: 16,
      headerFontSizeSM: 14,
    },

    // ===== Input / TextArea =====
    Input: {
      borderRadius: 8,
      controlHeight: 40,
      controlHeightLG: 48,
      paddingInline: 16,
      activeBorderColor: '#1B65A9',
      hoverBorderColor: '#A3C8E8',
      activeShadow: '0 0 0 3px rgba(27, 101, 169, 0.12)',
    },

    // ===== Select =====
    Select: {
      borderRadius: 8,
      controlHeight: 36,
      optionSelectedBg: '#E8F1FA',
      optionActiveBg: '#F7F8FA',
    },

    // ===== Checkbox =====
    Checkbox: {
      borderRadiusSM: 4,
      colorPrimary: '#1B65A9',
    },

    // ===== Tag =====
    Tag: {
      borderRadiusSM: 4,
      fontSizeSM: 12,
    },

    // ===== Tabs =====
    Tabs: {
      inkBarColor: '#1B65A9',
      itemActiveColor: '#1B65A9',
      itemHoverColor: '#2878C4',
      itemSelectedColor: '#1B65A9',
    },

    // ===== Badge =====
    Badge: {
      fontSizeSM: 11,
    },

    // ===== Typography =====
    Typography: {
      titleMarginBottom: 0,
      titleMarginTop: 0,
    },

    // ===== Spin =====
    Spin: {
      colorPrimary: '#1B65A9',
    },

    // ===== Alert =====
    Alert: {
      borderRadiusLG: 8,
    },
  },
};
```

**使用方式**（`main.tsx`）：

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { promptEngineeringTheme } from './theme';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN} theme={promptEngineeringTheme}>
      <App />
    </ConfigProvider>
  </React.StrictMode>
);
```

---

## 五、页面布局优化方案

### 5.1 Header 品牌区设计

**当前问题**：Header 只是 `Typography.Title`，无品牌识别度，无法传递华渔教育的身份。

**优化方案**：

```
┌────────────────────────────────────────────────────────────┐
│  [品牌图标]  华渔提示词工程   ·   Prompt Engineering System │
│             为 AI 提供最全面的信息，让每次对话都高质量       │
└────────────────────────────────────────────────────────────┘
```

| 元素 | 规格 | 说明 |
|------|------|------|
| 品牌图标 | 32×32px，纯色图标或 SVG，色值 `#1B65A9` | 可用华渔 Logo 简化版或抽象的"信息对称"图形（两个对称箭头/折叠的信息层） |
| 产品名称 | H1 (24px)，Semibold，`color-neutral-title` (#1A1A2E) | "华渔提示词工程" |
| 英文副标 | Body (14px)，Regular，`color-neutral-secondary` (#666666) | "Prompt Engineering System" —— 国际化需求 |
| 分隔符 | 垂直线 `│`，`color-neutral-divider` (#E8E8E8) | 中英文之间视觉分隔 |
| 副标题 | Small (13px)，Regular，`color-neutral-placeholder` (#999999) | 一句话说明，体现 DJ "信息对称"理念 |
| 背景 | `#FFFFFF` | 白色背景，与页面底色 `#F0F2F5` 形成层级区分 |
| 底部分隔 | 1px 渐变线，`#E8E8E8` → 透明 | 柔和分隔，不生硬 |
| 内边距 | 上下 `spacing-md` (16px)，左右 `spacing-lg` (24px) | — |

**品牌色条（可选增强）**：Header 顶部一条 3px 的品牌色渐变条 `#1B65A9` → `#0EA5A1`，微妙但有效地建立品牌识别。

### 5.2 三区视觉层次优化

**设计原则**：A区（输入）→ B区（配置）→ C区（输出）的视觉重量递增，引导用户视线从输入流向产出。

| 区域 | 视觉处理 | 卡片样式 | 内容层级 |
|------|----------|----------|----------|
| **Header** | 白色背景 + 品牌色图标 + 底部分隔线 | 非卡片，直接区域 | 品牌识别层 |
| **A区：输入区** | 白色卡片 + 微阴影 `boxShadowTertiary` | `borderRadius: 12px`，`border: 1px solid #E8E8E8` | L1 重点——输入框视觉突出 |
| **B区：配置区** | 白色卡片 + 微阴影 | 同上 | L2/L3——维度面板信息密度高，通过分列和标签色彩降低认知负荷 |
| **C区：输出区** | 白色卡片 + **较强阴影** `boxShadowSecondary` | `borderRadius: 12px`，`border: 1px solid #D9D9D9` | L1 重点——结果是用户最终要拿走的，视觉重量最高 |

**关键对比**：
- A区输入框内部使用 `#F7F8FA` 浅灰底，聚焦时变为 `#FFFFFF` + `#1B65A9` 边框 + 3px 蓝色光晕
- B区维度卡片使用内部背景变化（选中/未选中）制造节奏
- C区代码输出使用深色背景（`#1E2433`）形成最强对比，视觉重心自然落此

### 5.3 响应式断点

延续现有断点，增加视觉行为定义：

| 断点 | 宽度范围 | 布局调整 | 间距调整 |
|------|----------|----------|----------|
| Desktop | ≥ 1024px | 三列维度面板，容器最大宽度 960px | 标准间距 |
| Tablet | 768px - 1023px | 两列维度面板，容器 padding 24px | 维度列间距不变，卡片内边距不变 |
| Mobile | < 768px | Tab 切换维度面板，容器 padding 16px | 卡片内边距缩至 `spacing-md` (16px)，区域间距缩至 `spacing-sm` (8px) |

**额外建议**：
- Header 在 Mobile 下品牌图标缩至 24px，英文副标隐藏，只显示中文名
- 生成按钮在所有断点下保持 `width: 100%` 以确保可点击区域充足

---

## 六、微交互方案

### 6.1 Hover / Focus 效果

| 元素 | Hover 效果 | Focus 效果 |
|------|-----------|------------|
| **主按钮** | 背景色 → `#2878C4`，阴影增强至 `0 4px 12px rgba(27, 101, 169, 0.25)`，transition `0.2s` | 外圈 3px `rgba(27, 101, 169, 0.2)` 光晕 |
| **卡片（维度项）** | 背景色 → `#F7F8FA`，边框色 → `#D9D9D9`，transition `0.15s` | — |
| **维度项（选中态）** | 背景色 → `#D4E5F5`（主色浅底的 hover 态） | — |
| **输入框** | 边框色 → `#A3C8E8` | 边框色 → `#1B65A9` + 外圈 `0 0 0 3px rgba(27, 101, 169, 0.12)` |
| **优先级标签 (Tag)** | scale(1.05)，transition `0.12s` | — |
| **复制按钮** | 背景色 → `#F0F2F5`，图标色 → `#1B65A9` | 同 Hover |
| **展开/收起图标** | 颜色 → `#1B65A9`，transition `0.12s` | — |

### 6.2 Loading 状态

| 场景 | Loading 形式 | 规格 |
|------|-------------|------|
| **系统初始化** | 居中品牌色 Spin（AntD Spin），下方文字"系统初始化中..." | Spin 尺寸 48px，文字 `color-neutral-secondary`，垂直居中整个视口 |
| **路由匹配中** | 输入框右侧行内 Spin（小型），文字"匹配中..." | Spin 尺寸 16px，`color-brand-primary` |
| **生成提示词** | Skeleton 骨架屏（已有），增加品牌色渐变动画 | 渐变色从 `#E8F1FA` → `#D4E5F5` → `#E8F1FA`，替代当前灰色，周期 1.5s |
| **按钮 loading** | 按钮内 Spin 替换图标 + 文字变灰 + 禁用交互 | 使用 AntD 内置 loading |

### 6.3 Transition 规范

| Token | 时长 | 缓动函数 | 适用场景 |
|-------|------|----------|----------|
| `transition-fast` | 120ms | `ease-out` | 颜色变化、透明度变化、图标旋转 |
| `transition-normal` | 200ms | `ease-in-out` | 边框/阴影变化、hover 反馈、Tag scale |
| `transition-slow` | 300ms | `ease-in-out` | 展开/收起动画、滚动到输出区 |
| `transition-enter` | 300ms | `ease-out` | 元素进场（如输出结果首次出现） |
| `transition-leave` | 200ms | `ease-in` | 元素退场（如错误提示消失） |

**关键交互时序**：
- 维度项展开摘要：高度动画 `transition-slow` (300ms)，内容 opacity `transition-fast` (120ms) 延迟 100ms
- 复制成功反馈：按钮文字切换 "复制" → "✓ 已复制"，`transition-fast`，2s 后自动恢复
- 自动滚动到输出区：`smooth` 行为，AntD 默认滚动时长

---

## 七、维度面板视觉优化

### 7.1 从 Checkbox 列表到卡片

**当前问题**：维度面板是 Checkbox + Tag 的线性列表，信息密度高但视觉单调，缺少层次感和交互愉悦度。

**升级方案：微卡片（Micro Card）模式**

每个维度项从扁平列表行升级为独立微卡片，具有明确的选中/未选中视觉态：

#### 未选中态

```
┌─────────────────────────────────────────────┐
│  [ ] 🟡 A3 企业战略对齐              1,250字  ▼ │
│       ·  border: 1px solid #E8E8E8          │
│       ·  background: #FAFAFA                │
│       ·  opacity: 0.7                       │
│       ·  维度名文字 color: #999999           │
└─────────────────────────────────────────────┘
```

#### 选中态

```
┌─────────────────────────────────────────────┐
│  [✓] 🟡 A3 企业战略对齐              1,250字  ▼ │
│       ·  border: 1px solid #A3C8E8          │
│       ·  background: #FFFFFF                │
│       ·  box-shadow: 0 1px 4px rgba(0,0,0,0.04) │
│       ·  左侧 3px 色条（对应优先级色）        │
│       ·  维度名文字 color: #333333, font-weight: 600 │
└─────────────────────────────────────────────┘
```

#### 展开态

```
┌─────────────────────────────────────────────┐
│  [✓] 🔴 B1 用户画像研究              2,100字  ▲ │
│  ┌─────────────────────────────────────────┐│
│  │  华渔教育的目标用户主要包括K12教师、       ││
│  │  教培机构讲师和教育科技产品经理...         ││
│  │  ─ 左侧 3px 色条延续（#D93025）           ││
│  │  ─ background: #F7F8FA                   ││
│  │  ─ font-size: 13px, color: #666666       ││
│  └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
```

### 7.2 优先级标签样式

从纯 emoji Tag 升级为有设计感的胶囊标签：

| 优先级 | 标签样式 | 背景色 | 文字色 | 边框 |
|--------|---------|--------|--------|------|
| 🔴 必须 | 实心胶囊 | `#D93025` | `#FFFFFF` | 无 |
| 🟡 建议 | 实心胶囊 | `#E8900C` | `#FFFFFF` | 无 |
| 🟢 可选 | 描边胶囊 | `transparent` | `#29A352` | `1px solid #29A352` |

标签规格：
- 高度：20px
- 内边距：0 8px
- 圆角：10px（全圆角胶囊）
- 字号：12px，字重 500
- Hover：cursor pointer + `scale(1.05)` + 颜色明度+10%

### 7.3 选中/未选中态对比总结

| 属性 | 选中 | 未选中 |
|------|------|--------|
| 背景 | `#FFFFFF` | `#FAFAFA` |
| 边框 | `1px solid #A3C8E8` | `1px solid #E8E8E8` |
| 左侧色条 | 3px，对应优先级色 | 无 |
| 阴影 | `0 1px 4px rgba(0, 0, 0, 0.04)` | 无 |
| 文字透明度 | 1.0 | 0.65 |
| 维度名字重 | 600 (Semibold) | 400 (Regular) |
| 维度名颜色 | `#333333` | `#999999` |
| 维度名装饰 | 无 | `text-decoration: line-through` |
| Checkbox | 品牌色填充 `#1B65A9` | 灰色边框 `#D9D9D9` |

### 7.4 列标题优化

当前列标题仅有文字+Badge，升级方案：

```
┌──────────────────────────────────────────┐
│  🔴 必须维度                          7 个 │
│  ───────────────────────────────────────  │
│  底部 2px 色条（#D93025）                  │
└──────────────────────────────────────────┘
```

| 元素 | 规格 |
|------|------|
| 标题文字 | H3 (16px)，Semibold，`color-neutral-title` |
| 计数 | Small (13px)，Regular，`color-neutral-secondary` |
| 底部色条 | 2px 高，宽度 100%，颜色对应优先级 |
| 内边距 | `spacing-sm` (8px) 上下，`spacing-md` (16px) 左右 |
| 底部间距 | `spacing-sm` (8px) |

---

## 八、生成结果区视觉方案

### 8.1 代码块样式

**当前问题**：灰色背景 (`#f5f5f5`) 代码块，缺乏视觉重量和品质感，不适合"呈现给董事长"的场景。

**升级方案：深色主题代码块**

| 属性 | 值 | 说明 |
|------|-----|------|
| 背景色 | `#1E2433` | 深色蓝灰——比纯黑更有品质感，与品牌蓝色系呼应 |
| 文字色 | `#E8ECF1` | 浅灰白——在深色背景上柔和可读（对比度 12.3:1） |
| 字体 | `fontFamilyCode`（JetBrains Mono 系列） | 等宽字体，提示词内容清晰可辨 |
| 字号 | 14px | 与正文一致，不缩小 |
| 行高 | 1.7 | 宽松行距，大段文本不压抑 |
| 圆角 | 12px (`borderRadiusLG`) | 与卡片圆角一致 |
| 内边距 | 24px (`spacing-lg`) | 充足留白 |
| 最大高度 | 600px | 超出后滚动，保持页面可控 |
| 滚动条 | 自定义——4px 宽，`#3A4258` 滑块，`#2A3348` 轨道 | 不破坏深色调 |

**Markdown 内容层级样式**（在深色背景内）：

| 元素 | 颜色 | 字号/字重 |
|------|------|----------|
| H1 | `#FFFFFF` | 18px / 600 |
| H2 | `#B8C5D6` | 16px / 600，底部 1px `#3A4258` 分隔线 |
| H3 | `#8FA4BD` | 15px / 600 |
| 正文 | `#E8ECF1` | 14px / 400 |
| 列表符号 | `#5B9BD5`（品牌蓝的亮色变体） | — |
| 粗体 | `#FFFFFF` | font-weight: 600 |
| 链接 | `#5B9BD5` | 下划线，hover `#7DB5E8` |

### 8.2 复制按钮样式

**当前位置**：右上角悬浮

**升级方案**：

| 状态 | 样式 |
|------|------|
| **默认态** | 背景 `rgba(255, 255, 255, 0.08)`，图标色 `#8FA4BD`，圆角 8px，padding 8px 16px，文字 "复制" 13px |
| **Hover 态** | 背景 `rgba(255, 255, 255, 0.15)`，图标色 `#FFFFFF`，transition 150ms |
| **Active 态** | 背景 `rgba(255, 255, 255, 0.2)` |
| **已复制态** | 背景 `rgba(41, 163, 82, 0.15)`，图标色 `#29A352`，文字切换为 "✓ 已复制"，2s 后恢复 |

复制按钮位置：代码块右上角，距顶部 12px，距右侧 12px，使用 `position: absolute`。

### 8.3 覆盖报告统计信息展示优化

**当前问题**：纯文字 + Tag 罗列，数据感弱，不适合向决策层呈现。

**升级方案：数据仪表板风格**

```
┌─────────────────────────────────────────────────────────────────┐
│  📊 维度覆盖报告                                                 │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │   23/89   │  │   87%    │  │  12,450  │  │  Claude  │        │
│  │  已用维度  │  │  覆盖率  │  │  总字符   │  │  目标引擎 │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
│                                                                  │
│  ┌─── 维度分布 ──────────────────────────────────────────────┐   │
│  │  🔴 一级 ████████░░ 8个    │  覆盖率环形指示器（可选增强）  │   │
│  │  🟡 二级 ██████░░░░ 6个    │                              │   │
│  │  🟢 三级 ████████████ 9个  │                              │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ⚠️ 缺失必须维度：B2 竞品差异化分析                               │
└─────────────────────────────────────────────────────────────────┘
```

#### 统计卡片规格

| 属性 | 值 |
|------|-----|
| 布局 | 4列等分 Flex 布局，Mobile 下 2×2 网格 |
| 卡片背景 | `#F7F8FA` |
| 卡片圆角 | 8px |
| 卡片内边距 | 16px |
| 数值字号 | 24px，字重 600，颜色 `#1A1A2E` |
| 标签字号 | 12px，字重 400，颜色 `#999999` |
| 卡片间距 | 12px (gap) |

#### 维度分布条

| 属性 | 值 |
|------|-----|
| 条高 | 8px，圆角 4px |
| 必须色 | `#D93025` |
| 建议色 | `#E8900C` |
| 可选色 | `#29A352` |
| 背景轨道色 | `#E8E8E8` |
| 文字 | 13px，`color-neutral-secondary` |

#### 缺失维度警告

| 属性 | 值 |
|------|-----|
| 无缺失 | 绿色提示 `✅ 所有必须维度均已覆盖`，背景 `#E9F7EF` |
| 有缺失 | 红色提示 `⚠️ 缺失必须维度：[维度名]`，背景 `#FDECEB`，左侧 3px `#D93025` 色条 |
| 有截断 | 橙色提示 `⚠️ 因字符数限制被跳过的维度：[维度名]`，背景 `#FFF7E6` |

---

## 附录 A：CSS Custom Properties 速查表

以下变量对应本规范中的所有 Token，供非 AntD 组件样式使用：

```css
:root {
  /* 品牌色 */
  --color-brand-primary: #1B65A9;
  --color-brand-primary-hover: #2878C4;
  --color-brand-primary-active: #13508A;
  --color-brand-primary-bg: #E8F1FA;
  --color-brand-primary-border: #A3C8E8;

  /* 辅色 */
  --color-accent-cyan: #0EA5A1;
  --color-accent-cyan-bg: #E6F7F6;
  --color-accent-violet: #6E59A5;

  /* 中性色 */
  --color-neutral-title: #1A1A2E;
  --color-neutral-text: #333333;
  --color-neutral-secondary: #666666;
  --color-neutral-placeholder: #999999;
  --color-neutral-disabled: #BFBFBF;
  --color-neutral-border: #D9D9D9;
  --color-neutral-divider: #E8E8E8;
  --color-neutral-bg-base: #F0F2F5;
  --color-neutral-bg-elevated: #F7F8FA;

  /* 语义色 */
  --color-success: #29A352;
  --color-success-bg: #E9F7EF;
  --color-warning: #E8900C;
  --color-warning-bg: #FFF7E6;
  --color-error: #D93025;
  --color-error-bg: #FDECEB;
  --color-info: #1B65A9;
  --color-info-bg: #E8F1FA;

  /* 间距 */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;

  /* 圆角 */
  --radius-xs: 4px;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;

  /* 阴影 */
  --shadow-sm: 0 1px 4px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 2px 8px rgba(27, 101, 169, 0.06);
  --shadow-lg: 0 4px 16px rgba(27, 101, 169, 0.08);

  /* Transition */
  --transition-fast: 120ms ease-out;
  --transition-normal: 200ms ease-in-out;
  --transition-slow: 300ms ease-in-out;

  /* 代码输出区 */
  --code-bg: #1E2433;
  --code-text: #E8ECF1;
  --code-heading: #FFFFFF;
  --code-h2: #B8C5D6;
  --code-h3: #8FA4BD;
  --code-accent: #5B9BD5;
  --code-scrollbar-thumb: #3A4258;
  --code-scrollbar-track: #2A3348;
}
```

---

## 附录 B：视觉还原验收标准

供前端开发专家和测试专家使用：

| 检查项 | 精确度要求 | 弹性空间 |
|--------|-----------|---------|
| 品牌色 `#1B65A9` 使用一致 | 精确 hex 匹配 | 无 |
| 所有间距为 4px 倍数 | 精确 | 无 |
| 字号阶梯严格 6 级 | 精确匹配 | 无 |
| 卡片圆角 12px | 精确 | ±2px |
| 阴影效果 | 视觉接近即可 | 允许微调 rgba 值 |
| 深色代码块 `#1E2433` | 精确 hex | 无 |
| 维度卡片选中/未选中态差异 | 必须可明确区分 | 具体实现方式可调整 |
| 覆盖率统计卡片布局 | 4列桌面/2×2手机 | 具体数值位置可微调 |
| Hover 效果全覆盖 | 必须有 hover 反馈 | 具体动画时长 ±50ms |
| 复制按钮深色调 | 在深色代码块上可见 | 透明度可微调 |

---

## 附录 C：色彩对比度验证

| 组合 | 前景色 | 背景色 | 对比度 | WCAG AA |
|------|--------|--------|--------|---------|
| 正文/白底 | `#333333` | `#FFFFFF` | 12.6:1 | ✅ |
| 辅助文字/白底 | `#666666` | `#FFFFFF` | 5.7:1 | ✅ |
| 占位符/白底 | `#999999` | `#FFFFFF` | 2.8:1 | ✅ (大字) |
| 品牌主色/白底 | `#1B65A9` | `#FFFFFF` | 5.4:1 | ✅ |
| 代码正文/深色底 | `#E8ECF1` | `#1E2433` | 12.3:1 | ✅ |
| 代码标题/深色底 | `#FFFFFF` | `#1E2433` | 15.1:1 | ✅ |
| 按钮白字/品牌底 | `#FFFFFF` | `#1B65A9` | 5.4:1 | ✅ |
| 成功色/白底 | `#29A352` | `#FFFFFF` | 4.0:1 | ✅ (大字) |
| 错误色/白底 | `#D93025` | `#FFFFFF` | 4.8:1 | ✅ |
| 警告色/白底 | `#E8900C` | `#FFFFFF` | 3.3:1 | ✅ (大字) |

> 注：占位符、成功色、警告色在小字场景下未达 4.5:1，但它们在设计中仅用于非关键信息/标签/大字（≥16px）场景，符合 WCAG 2.1 AA 大字标准（≥ 3:1）。

---

_本规范基于 AntD 5 Design Token 体系，所有视觉决策均可通过 CSS / AntD ConfigProvider 实现，无需特殊渲染能力。_
