# 视觉设计 — UI 组件视觉规范

## 组件规范总则

每个组件必须定义以下四个维度：

| 维度 | 内容 |
|------|------|
| **尺寸变体** | Large / Medium(默认) / Small / Mini |
| **状态变体** | Default / Hover / Active(Pressed) / Focus / Disabled / Loading |
| **色彩变体** | Primary / Secondary / Tertiary(Ghost) / Danger |
| **形状参数** | 高度 / padding / 圆角 / 阴影 / 边框 |

## 按钮（Button）

### 尺寸矩阵

| 变体 | 高度 | 字号 | 水平padding | 圆角 | 图标尺寸 |
|------|------|------|-----------|------|---------|
| **Large** | 48px | 16px | 24px | radius-md | 20px |
| **Medium** | 40px | 14px | 16px | radius-md | 16px |
| **Small** | 32px | 13px | 12px | radius-md | 16px |
| **Mini** | 24px | 12px | 8px | radius-sm | 14px |

### 色彩变体

| 变体 | 背景 | 文字 | 边框 | 悬停 |
|------|------|------|------|------|
| **Primary** | brand-primary-500 | white | 无 | brand-primary-600 |
| **Secondary** | neutral-100 | neutral-800 | neutral-300 | neutral-200 |
| **Tertiary/Ghost** | transparent | brand-primary-500 | 无 | brand-primary-50 |
| **Danger** | semantic-error | white | 无 | error-dark |

### 状态变体

| 状态 | 视觉变化 |
|------|---------|
| **Default** | 基础样式 |
| **Hover** | 背景色加深一阶（如 500→600），cursor: pointer |
| **Active/Pressed** | 背景色再加深（如 600→700），微缩 scale(0.98) |
| **Focus** | 外围 2px focus ring（brand-primary-500, 50% opacity） |
| **Disabled** | opacity: 0.4，cursor: not-allowed |
| **Loading** | 文字替换为 spinner，按钮宽度不变 |

## 输入框（Input）

### 尺寸矩阵

| 变体 | 高度 | 字号 | 水平padding | 圆角 |
|------|------|------|-----------|------|
| **Large** | 48px | 16px | 16px | radius-md |
| **Medium** | 40px | 14px | 12px | radius-md |
| **Small** | 32px | 13px | 12px | radius-sm |

### 状态变体

| 状态 | 边框 | 背景 | 标注 |
|------|------|------|------|
| **Default** | neutral-300 | white | — |
| **Hover** | neutral-400 | white | — |
| **Focus** | brand-primary-500 (2px) | white | 可选: focus shadow |
| **Error** | semantic-error | error-bg-light | 底部显示错误文字 |
| **Disabled** | neutral-200 | neutral-100 | 文字 neutral-400 |
| **Readonly** | neutral-200 | neutral-50 | 文字 neutral-700 |

### 表单字段组成

```
[Label]          — 字号 Body-S(13px)，色 neutral-700，底距 space-1(4px)
[Input]          — 对应尺寸变体
[Helper/Error]   — 字号 Caption(12px)，色 neutral-500 或 error，顶距 space-1(4px)
```

## 卡片（Card）

| 参数 | 值 |
|------|-----|
| **背景** | white (亮色模式) / surface (暗色模式) |
| **圆角** | radius-lg (12px) |
| **阴影** | shadow-sm (默认) → shadow-md (悬停，如可交互) |
| **边框** | 可选: neutral-200, 1px (扁平风格替代阴影) |
| **内边距** | space-4(16px) ~ space-6(24px) |
| **卡片间距** | space-4(16px) ~ space-6(24px) |

### 卡片内容层级

```
[Image/Header Area]     — 可选，顶部通栏
[Title]                 — H3 或 H4，底距 space-1(4px)
[Subtitle/Description]  — Body-S，色 neutral-600，底距 space-3(12px)
[Content]               — 主体内容
[Footer/Actions]        — 底部操作区，顶部 border-top 分隔
```

## 导航（Navigation）

### 顶部导航栏

| 参数 | 值 |
|------|-----|
| **高度** | 56px (Mobile) / 64px (Desktop) |
| **背景** | white + shadow-xs 或 border-bottom |
| **Logo 区** | 左侧，高度 32px |
| **导航项** | 字号 Body(14px)，Medium(500)，间距 space-6(24px) |
| **活跃项** | brand-primary-500 文字 + 底部 2px indicator |

### 侧边导航

| 参数 | 值 |
|------|-----|
| **宽度** | 240px (展开) / 64px (收起) |
| **导航项高度** | 40px |
| **导航项 padding** | space-3(12px) 水平 |
| **活跃项** | brand-primary-50 背景 + brand-primary-500 文字 + 左侧 3px indicator |
| **分组标题** | Overline 样式，色 neutral-500 |

## 弹窗与浮层（Dialog & Overlay）

### 对话框（Modal Dialog）

| 参数 | 值 |
|------|-----|
| **宽度** | Small: 400px / Medium: 540px / Large: 720px |
| **圆角** | radius-lg (12px) |
| **阴影** | shadow-lg |
| **内边距** | space-6(24px) |
| **遮罩** | #000, opacity 0.5 |
| **Header** | H3 标题 + 右侧关闭按钮 |
| **Footer** | 右对齐按钮组，主操作在右 |

### Toast / Notification

| 参数 | 值 |
|------|-----|
| **位置** | 右上角，距顶 space-4(16px) |
| **宽度** | 360px (固定) |
| **圆角** | radius-md (8px) |
| **阴影** | shadow-xl |
| **左侧色条** | 4px，使用对应语义色 |
| **自动消失** | 信息类 3s / 成功 3s / 警告 5s / 错误不自动消失 |

## 表格（Table）

| 参数 | 值 |
|------|-----|
| **表头** | 背景 neutral-50，字号 Caption(12px)，字重 Medium(500) |
| **行高** | Small: 40px / Medium: 48px / Large: 56px |
| **单元格 padding** | 水平 space-4(16px)，垂直按行高自动 |
| **行分割** | border-bottom neutral-200 |
| **交替行** | 可选: 偶数行 neutral-50 背景 |
| **悬停行** | neutral-100 背景 |
| **选中行** | brand-primary-50 背景 |

## 通用组件规则

1. **同一页面的同类组件必须使用相同尺寸变体**
2. **相邻按钮尺寸一致**：主次区分用色彩变体，不用尺寸
3. **图标与文字垂直居中对齐**：视觉居中，非数学居中
4. **触控目标 ≥ 44px**：即使视觉上更小，点击区域也要足够
5. **所有可交互元素必须有 hover/focus 态**
