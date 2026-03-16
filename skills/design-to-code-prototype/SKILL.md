---
name: design-to-code-prototype
description: >-
  Use when 需要将设计规范转化为可预览的 HTML/CSS 原型代码，或为评审生成可交互页面预览。
  触发词：原型、prototype、HTML原型、设计转代码、页面预览、mockup。
---

# design-to-code-prototype

> 设计不是 PPT——做出来能看、能点、能在浏览器里跑的才是真设计。

## 模块速查

| 场景 | 加载 | 路径 |
|------|------|------|
| 5步标准流程+深度分级 | 📖 | [references/workflow.md](references/workflow.md) |
| 原型代码标准与输出规范 | 📖 | [references/code-standards.md](references/code-standards.md) |
| 原型评审流程 | 📖 | [references/review-process.md](references/review-process.md) |
| 质量自检清单 | 📖 | [references/checklist.md](references/checklist.md) |
| 常见页面原型模板 | 📖 | [references/page-templates.md](references/page-templates.md) |

## 深度分级

| 级别 | 适用场景 | 说明 |
|------|---------|------|
| L1 快速原型 | 验证布局想法、快速展示 | 单文件 HTML，核心布局 + 关键状态 |
| L2 标准原型 | PM 评审、方案确认 | 完整 5 步，全状态覆盖 + 响应式 + 可访问性基础 |
| L3 高保真原型 | 近生产级参考实现 | React + Tailwind，组件化 + 交互逻辑 + 动画 |

## 5步标准流程概览

```
Step 1: 确认输入  → 设计规范、Design Tokens、布局方案、组件清单
Step 2: 选择技术  → 单文件 HTML 或 React + Tailwind（根据深度级别）
Step 3: 编写原型  → 语义 HTML + Token 驱动的 CSS + 响应式 + 全状态
Step 4: 质量自检  → 对照清单逐项验证
Step 5: 评审交付  → 浏览器预览 → PM 反馈 → 迭代修改 → 交付前端
```

## 4大能力域

| 能力域 | 核心职责 |
|--------|---------|
| **代码标准** | HTML 语义化、CSS Token 变量、响应式 media query、全状态覆盖 |
| **原型输出** | 单文件 HTML 或 React + Tailwind，可直接浏览器打开/运行 |
| **评审协作** | 浏览器预览链接/文件 → PM 反馈 → 记录修改点 → 迭代 |
| **模板复用** | Dashboard/列表页/表单页/详情页/Landing Page 五大模板 |

## 核心原则

### 原型 ≠ 生产代码

```
原型的目标：验证设计方案、对齐视觉预期、收集反馈
生产代码目标：高性能、可维护、可测试、完整功能

原型 ──→ PM 确认 ──→ 前端开发专家基于原型重新实现
              ↑                    ↑
         设计方案验证          生产级代码标准
```

**原型可以**：
- 硬编码假数据
- 简化交互逻辑（点击跳转用 `alert()` 代替）
- 省略复杂状态管理
- 不处理边界异常

**原型不可以**：
- 不用 Design Tokens（硬编码颜色/字号）
- 不做响应式
- 只做 default 状态（必须覆盖 loading/empty/error）
- 不考虑可访问性
- 不可运行（必须能在浏览器直接打开/预览）

## 铁律

1. **Token 驱动**：所有颜色、字号、间距、圆角、阴影必须使用 CSS 变量，禁止硬编码
2. **语义 HTML**：使用正确的 HTML5 标签，`<button>` 不是 `<div onclick>`
3. **全状态覆盖**：至少 default + loading + empty + error，hover/focus 用 CSS 伪类实现
4. **响应式必做**：至少支持 Desktop(1024+) + Mobile(<768)，用 media query 实现
5. **可运行交付**：输出文件可以直接在浏览器打开（单文件 HTML）或 `npm run dev` 预览（React）
6. **原型不是终点**：原型是给 PM 看的预览、给前端开发的参考，不是直接上线的代码
