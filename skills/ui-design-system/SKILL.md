---
name: ui-design-system
description: >-
  设计系统执行工具箱：定义 Design Tokens、规划组件库、管理设计系统全生命周期。
  覆盖6步标准流程，5大能力域，3级深度分级。
  采用 Code-First 工作流，直接输出 CSS Custom Properties + JSON Tokens + Markdown 规范。
  Use when: (1) 需要为项目建立设计系统（Design Tokens + 组件库规划）,
  (2) 需要定义颜色/字号/间距/圆角/阴影/断点等 Tokens,
  (3) 需要规划基础组件/组合组件/页面模板的组件体系,
  (4) 需要输出 CSS Custom Properties 或 JSON Token 文件,
  (5) 需要基于 Shadcn UI / Radix UI / Tailwind CSS 定制设计系统,
  (6) 需要管理设计系统的版本演进.
  Triggers on: 设计系统, design system, Design Tokens, 组件库,
  CSS 变量, 设计规范, 主题定制, Shadcn, Tailwind, 设计令牌.
---

# ui-design-system

> 从零定义设计系统——Design Tokens 是骨架，组件库是肌肉，规范文档是神经。

## 模块速查

| 场景 | 加载 | 路径 |
|------|------|------|
| 6步标准流程+深度分级 | 📖 | [references/workflow.md](references/workflow.md) |
| Design Tokens 完整体系 | 📖 | [references/design-tokens.md](references/design-tokens.md) |
| 组件库规划方法论 | 📖 | [references/component-library.md](references/component-library.md) |
| Token 格式输出规范（CSS + JSON） | 📖 | [references/token-format.md](references/token-format.md) |
| 开源组件库定制指南 | 📖 | [references/open-source-customization.md](references/open-source-customization.md) |
| 版本管理与演进策略 | 📖 | [references/versioning.md](references/versioning.md) |
| 质量检查清单 | 📖 | [references/checklist.md](references/checklist.md) |

## 深度分级

| 级别 | 适用场景 | 说明 |
|------|---------|------|
| L1 快速建立 | 小项目、MVP、已有设计语言可复用 | 基础 Tokens + 核心组件清单，复用 Shadcn/Tailwind 默认值 |
| L2 标准建立 | 新产品/重要改版 | 完整 6 步流程，全套 Tokens + 组件库规划 + 输出规范 |
| L3 深度建立 | 多产品线/设计系统平台化 | 6 步 + 多主题支持 + 版本管理 + 组件文档 + 演进策略 |

## 6步标准流程概览

```
Step 1: 理解产品上下文 → 品牌调性、用户群、技术栈、设计约束
Step 2: 定义 Design Tokens → 颜色/字号/间距/圆角/阴影/断点
Step 3: 规划组件体系 → 基础组件 → 组合组件 → 页面模板
Step 4: 输出 Token 文件 → CSS Custom Properties + JSON + Tailwind config
Step 5: 定制开源组件库 → 基于 Shadcn UI / Radix UI + Tailwind CSS
Step 6: 质量检查与交付 → 对照检查清单逐项验证
```

## 5大能力域

| 能力域 | 核心职责 |
|--------|---------|
| **Token 定义** | 颜色语义命名、字号层级、间距档位、圆角、阴影、断点体系 |
| **组件规划** | 原子→分子→组织→页面的层级拆分，接口定义，状态覆盖 |
| **格式输出** | CSS Custom Properties、JSON Token、Tailwind config 三种格式 |
| **开源定制** | Shadcn UI / Radix UI 组件覆写、Tailwind 主题扩展 |
| **版本演进** | 语义化版本、变更日志、废弃策略、多主题管理 |

## 铁律

1. **语义命名 > 具体值**：`--color-primary` 而非 `--color-blue-500`，Token 名称表达用途不表达外观
2. **单一数据源**：所有视觉值从 Token 文件派生，禁止硬编码 `#hex` 或 `16px`
3. **先 Token 后组件**：Token 体系确定后才开始组件规划，不倒序
4. **全状态定义**：每个组件必须覆盖 default / hover / active / disabled / focus / error 状态
5. **可验证交付**：输出的 Token 文件必须能直接 import 使用，不是"示意图"
6. **约束优于自由**：设计系统的价值在于约束——间距只用 4/8/12/16/24/32/48/64，不用 13 或 37
