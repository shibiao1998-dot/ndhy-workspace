---
name: frontend-development
description: >-
  Use when 需要实现前端页面、组件拆分、状态管理、API接入，或编写组件测试。
  触发词：前端开发、页面实现、组件拆分、状态管理、表单校验、列表分页、loading状态。
---

# 前端开发

> 在既定的体验方案、接口契约、架构约束下，将用户交互和前端状态准确、可维护地实现为界面能力。

## 模块速查

| 场景 | 加载 | 路径 |
|------|------|------|
| 9步标准流程 + 职责边界 + 协作接口 | 📖 | [references/workflow.md](references/workflow.md) |
| 页面与组件设计 | 📖 | [references/page-component-design.md](references/page-component-design.md) |
| 状态与API集成 | 📖 | [references/state-api-integration.md](references/state-api-integration.md) |
| 表单与列表模式 | 📖 | [references/forms-lists-patterns.md](references/forms-lists-patterns.md) |
| 反馈与状态覆盖 | 📖 | [references/feedback-states.md](references/feedback-states.md) |
| 测试策略 | 📖 | [references/testing.md](references/testing.md) |
| 质量检查清单 | 📖 | [references/checklists.md](references/checklists.md) |
| 反模式速查 | 📖 | [references/anti-patterns.md](references/anti-patterns.md) |
| 交付模板 | 📖 | [references/templates.md](references/templates.md) |
| 设计指南 | 📖 | [references/design-guidelines.md](references/design-guidelines.md) |
| 教育行业适配 | 📖 | [references/education-frontend.md](references/education-frontend.md) |

## 深度分级

| 级别 | 适用场景 | 说明 |
|------|---------|------|
| L1 快速实现 | 单页面/单组件/小改动/Bug修复 | Step 1-3 重点 + 5-6 补齐 → 代码 + 简要说明 |
| L2 标准开发 | 新模块或重要功能 | 完整 9 步 → 完整交付包(6文档+代码) |
| L3 深度开发 | 全新产品/大规模重构/复杂交互 | 9 步 + 组件库设计 + 状态架构评审 → 交付包 + 设计文档 |

## 铁律

1. **组件边界清晰** — 按数据/行为/复用性拆分，不按视觉堆砌
2. **状态分层管理** — 服务端/客户端/UI/URL 状态分清，不混用全局 store
3. **异常状态是正式实现** — 每个组件必须处理 5 态(loading/empty/error/success/disabled)
4. **严格按契约消费** — 不猜接口、不脑补交互，信息不足就要求补充
5. **关键路径有测试** — 核心交互路径必须有组件测试或交互测试覆盖
