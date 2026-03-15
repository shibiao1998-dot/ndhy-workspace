---
name: api-design
description: >-
  API接口契约设计执行工具箱:将业务能力和系统边界转化为稳定清晰可扩展可联调可验证的接口契约。
  覆盖9步标准流程,10大能力方向,3级深度分级,4层职责边界,6条反模式防范,合格接口契约检查清单。
  Use when: (1) 需要从需求中抽取资源与能力边界,
  (2) 需要设计资源模型与动作模型,
  (3) 需要设计请求响应schema,
  (4) 需要设计错误码与异常模型,
  (5) 需要设计分页过滤排序搜索规范,
  (6) 需要设计幂等与重试语义,
  (7) 需要设计鉴权与权限边界契约,
  (8) 需要审查接口一致性,
  (9) 需要评估向后兼容风险,
  (10) 需要输出mock联调契约,
  (11) 用户提到API设计、接口契约、OpenAPI、错误码、mock契约.
  Triggers on: API设计, api design, 接口设计, 接口契约, OpenAPI, 资源模型,
  错误码, 异常模型, 分页规范, 幂等, mock契约, 联调, 接口一致性, 向后兼容,
  鉴权边界, schema设计.
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
