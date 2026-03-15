---
name: react-best-practices
model: standard
version: 1.0.0
description: >
  React and Next.js performance optimization guidelines from Vercel Engineering.
  57 rules across 8 categories for writing, reviewing, and refactoring React code.
tags: [react, nextjs, performance, optimization, ssr, bundle, rendering]
license: MIT
author: vercel
---

# React Best Practices

> React/Next.js 性能优化指南，57 条规则按 8 类优先级排列（Vercel Engineering）。

## 模块速查

| 场景 | 加载 | 路径 |
|------|------|------|
| 57 条规则分类速查表 | 📖 | references/rules-by-category.md |
| 代码示例 + NEVER Do 清单 | 📖 | references/code-examples.md |
| 完整规则（含详细代码） | 📖 | AGENTS.md |
| 单条规则详解 | 📖 | rules/[rule-name].md |

## 规则优先级

| 优先级 | 类别 | 影响 | 规则前缀 |
|--------|------|------|----------|
| 1 | Eliminating Waterfalls | CRITICAL | `async-` |
| 2 | Bundle Size | CRITICAL | `bundle-` |
| 3 | Server-Side Performance | HIGH | `server-` |
| 4 | Client-Side Fetching | MEDIUM-HIGH | `client-` |
| 5 | Re-render Optimization | MEDIUM | `rerender-` |
| 6 | Rendering Performance | MEDIUM | `rendering-` |
| 7 | JavaScript Performance | LOW-MEDIUM | `js-` |
| 8 | Advanced Patterns | LOW | `advanced-` |

## 铁律
1. **NEVER await sequentially** — 独立操作用 `Promise.all()`
2. **NEVER import from barrel files** — 直接导入具体模块
3. **NEVER skip auth in Server Actions** — 等同 API routes 处理
4. **NEVER pass entire objects to client components** — 只传需要的字段
