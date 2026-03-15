# 视觉设计 — 8 大能力域速查

## 域 1：色彩体系设计

**核心问题**：产品的色彩如何传达品牌、区分信息层级、引导用户注意力？

三个核心任务：
- **品牌色定义**：主色 + 品牌辅助色，确立品牌视觉锚点
- **语义色系统**：成功/警告/错误/信息，与功能绑定而非随意选取
- **中性色阶梯**：背景/文字/边框/分割线的灰阶体系

→ 详细方法 [color-system.md](color-system.md)

## 域 2：字体排印规范

**核心问题**：文字如何传达信息层级、保证阅读舒适、兼容中英文？

三个核心任务：
- **字体选择**：中文/英文/等宽字体家族，及 fallback 策略
- **字体层级**：从 Display 到 Caption，每级的字号/字重/行高明确定义
- **混排规则**：中英文间距、标点处理、数字字体

→ 详细方法 [typography.md](typography.md)

## 域 3：空间系统与网格

**核心问题**：元素之间的间距如何保持节奏一致、空间呼吸有序？

三个核心任务：
- **间距阶梯**：基于 Base Unit 的倍数体系（4px/8px 为基础）
- **网格系统**：栏数/槽宽/边距，适配不同屏幕
- **视觉重量分配**：留白策略——越重要的内容周围留白越多

→ 详细方法 [spacing-grid.md](spacing-grid.md)

## 域 4：UI 组件视觉规范

**核心问题**：每个组件长什么样、有几种状态、尺寸怎么变化？

四个维度：
- **尺寸变体**：Large/Medium/Small/Mini，适配不同场景
- **状态变体**：Default/Hover/Active/Focus/Disabled/Loading
- **色彩应用**：Primary/Secondary/Tertiary/Danger/Ghost 变体
- **形状参数**：圆角/阴影/边框的具体数值

→ 详细方法 [component-visuals.md](component-visuals.md)

## 域 5：图标与插画风格定义

**核心问题**：图标和插画如何与整体视觉语言保持一致？

图标三要素：
- **风格**：线性/面性/双色，统一不混用
- **规格**：网格尺寸、笔触粗细、圆角规则
- **使用规范**：最小尺寸、安全区域、颜色使用

插画三要素（如适用）：
- **风格**：扁平/2.5D/手绘/几何
- **色彩**：来源于品牌色板，不引入新色
- **使用场景**：空状态/引导页/品牌展示

→ 详细方法 [icon-illustration-motion.md](icon-illustration-motion.md)

## 域 6：动效视觉语言

**核心问题**：界面运动如何传达信息、增强体验而非干扰？

三个核心要素：
- **过渡类型**：淡入淡出/滑入滑出/缩放/展开折叠
- **缓动函数**：ease-out（进入）/ease-in（退出）/ease-in-out（移动）
- **时长阶梯**：快速(100-200ms)/标准(200-300ms)/慢速(300-500ms)

**节制原则**：动效服务于理解，不服务于装饰。能不加就不加。

→ 详细方法 [icon-illustration-motion.md](icon-illustration-motion.md)

## 域 7：设计 Token 输出

**核心问题**：视觉决策如何转化为前端可直接消费的变量？

三层 Token 架构：
- **Global Token**：原始值（color-blue-500: #3B82F6）
- **Alias Token**：语义映射（color-primary: {color-blue-500}）
- **Component Token**：组件绑定（button-bg-primary: {color-primary}）

→ 详细方法 [design-tokens.md](design-tokens.md)

## 域 8：响应式视觉适配

**核心问题**：视觉规范在不同屏幕尺寸下如何保持品质？

三个适配维度：
- **断点策略**：Mobile/Tablet/Desktop/Wide 断点值与适配规则
- **弹性元素**：字体/间距/网格在断点间的缩放规则
- **取舍策略**：小屏幕下哪些视觉元素降级、隐藏或重排

→ 包含在 [spacing-grid.md](spacing-grid.md) §响应式适配 和 [checklists.md](checklists.md) §响应式检查
