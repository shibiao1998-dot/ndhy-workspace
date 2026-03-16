---
name: api-design
description: >-
  Use when 需要设计 API 接口契约、资源模型、错误码、分页规范，或审查接口一致性和向后兼容性。
  触发词：API设计、接口契约、OpenAPI、资源模型、错误码、异常模型、mock契约、幂等、鉴权边界。
---

# API 接口契约设计

> 把业务能力和系统边界转化为稳定、清晰、可扩展、可联调、可验证的接口契约。

## 模块速查

| 场景 | 加载 | 路径 |
|------|------|------|
| 9步标准流程 + 职责边界 + 协作接口 | 📖 | [references/workflow.md](references/workflow.md) |
| 资源建模方法 | 📖 | [references/resource-modeling.md](references/resource-modeling.md) |
| Schema 设计 | 📖 | [references/schema-design.md](references/schema-design.md) |
| 错误码与通用策略 | 📖 | [references/error-and-policies.md](references/error-and-policies.md) |
| 鉴权与集成 | 📖 | [references/auth-and-integration.md](references/auth-and-integration.md) |
| 质量检查清单 | 📖 | [references/checklists.md](references/checklists.md) |
| 反模式速查 | 📖 | [references/anti-patterns.md](references/anti-patterns.md) |
| 交付模板 | 📖 | [references/templates.md](references/templates.md) |
| 教育行业适配 | 📖 | [references/education-api.md](references/education-api.md) |

## 深度分级

| 级别 | 适用场景 | 说明 |
|------|---------|------|
| L1 快速契约 | 单接口/小功能/错误码补全/mock补充 | Step 1-3 重点 + 4 概述 → OpenAPI 片段 |
| L2 标准设计 | 新模块或重要改版 | 完整 9 步 → 完整交付包(6文档) |
| L3 深度设计 | 全新产品/大规模重构/外部开放API | 9 步 + 多方案对比 + 兼容性预研 → 交付包 + 演进路线图 |

## 铁律

1. **契约先行** — 语义一致优先于临时拼凑，边界清晰优先于实现方便
2. **向下只给契约和约束** — 不越界写实现代码
3. **向上只承接确认的业务边界** — 不替产品做需求决策
4. **信息不足就要求补充** — 不猜测、不假设
5. **每次变更附兼容性评估** — 破坏性变更必须有迁移方案
