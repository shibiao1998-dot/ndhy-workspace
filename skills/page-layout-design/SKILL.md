---
name: page-layout-design
description: >-
  Use when 需要设计页面布局、栅格系统、响应式适配，或处理视觉层级和留白策略。
  触发词：页面布局、栅格系统、响应式、断点、布局模式、视觉层级。
---

# page-layout-design

> 布局是页面的骨架——决定用户先看什么、后看什么、怎么找到想要的东西。

## 模块速查

| 场景 | 加载 | 路径 |
|------|------|------|
| 7步标准流程+深度分级 | 📖 | [references/workflow.md](references/workflow.md) |
| 栅格系统与断点策略 | 📖 | [references/grid-system.md](references/grid-system.md) |
| 布局模式库 | 📖 | [references/layout-patterns.md](references/layout-patterns.md) |
| 视觉层级与留白规则 | 📖 | [references/visual-hierarchy.md](references/visual-hierarchy.md) |
| 全状态布局方案 | 📖 | [references/state-layouts.md](references/state-layouts.md) |
| 可访问性布局 | 📖 | [references/accessibility.md](references/accessibility.md) |
| 质量检查清单 | 📖 | [references/checklist.md](references/checklist.md) |

## 深度分级

| 级别 | 适用场景 | 说明 |
|------|---------|------|
| L1 快速布局 | 已有设计系统、常规页面 | 选布局模式 + 栅格适配，复用现有断点 |
| L2 标准布局 | 新模块/新页面类型 | 完整 7 步流程，含信息架构和全状态设计 |
| L3 深度布局 | 全新产品/复杂信息架构 | 7 步 + 用户动线分析 + 可访问性审查 + 多端极限测试 |

## 7步标准流程概览

```
Step 1: 需求分析     → 页面目标、用户任务、内容类型、设备分布
Step 2: 信息架构     → 内容分组、优先级排序、导航结构
Step 3: 区块划分     → 页面分区、模块边界、内容层级
Step 4: 栅格布局     → 栅格选择、列数分配、间距定义
Step 5: 留白与视觉重心 → 留白层级、F/Z 型动线、视觉焦点
Step 6: 响应式适配   → 断点策略、布局变体、内容重排
Step 7: 全状态 + 可访问性 → loading/empty/error + 焦点/对比度/语义
```

## 6大能力域

| 能力域 | 核心职责 |
|--------|---------|
| **信息架构** | 内容分组、优先级排序、导航层级、面包屑路径 |
| **栅格系统** | 12/8/4 列栅格、列间距、页面边距、内容最大宽度 |
| **布局模式** | 英雄区/双栏/卡片网格/时间线/瀑布流等模式选择与组合 |
| **视觉层级** | F/Z 型阅读模式、留白比例、视觉重心引导、信息密度控制 |
| **响应式适配** | Mobile First、断点策略、布局折叠/重排/隐藏规则 |
| **全状态覆盖** | Loading Skeleton / Empty State / Error State / 首次引导布局 |

## 铁律

1. **Mobile First**：从最小屏幕开始设计，逐步扩展。不是"桌面版缩小"
2. **内容优先于装饰**：先确定内容是什么、优先级如何，再决定布局形式
3. **一屏一焦点**：每个视口高度内只有一个视觉焦点，不分散注意力
4. **留白是设计元素**：留白不是"空着的地方"，是主动设计的呼吸空间
5. **全状态必须设计**：loading / empty / error / 首次使用 / 无权限——每个状态都需要布局方案
6. **可访问性不是附加题**：焦点顺序、对比度、语义标签——从布局设计阶段就开始考虑
7. **极限测试**：在 320px 宽度和 2560px 宽度上都能正常使用
