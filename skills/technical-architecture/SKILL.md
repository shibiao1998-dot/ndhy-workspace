---
name: technical-architecture
description: >-
  技术架构设计执行工具箱：将产品目标和体验方案转化为可交付、可演进、可治理的技术实现蓝图。
  覆盖9步标准流程，10大能力域，3级深度分级，标准输出物为架构交付包（7文档+ADR）。
  Use when: (1) 需要设计技术架构, (2) 需要技术选型评估,
  (3) 需要系统分层和模块划分, (4) 需要AI集成设计,
  (5) 需要NFR/DevOps方案, (6) 需要ADR架构决策记录.
  Triggers on: 技术架构, technical architecture, 架构设计, 技术选型, 系统分层,
  模块划分, AI集成, 架构模式, ADR, 架构决策, 性能设计, 安全架构.
---

# technical-architecture

> 将产品目标和体验方案转化为可交付、可演进、可治理的技术实现蓝图。

## 模块速查

| 场景 | 加载 | 路径 |
|------|------|------|
| 9步标准流程+深度分级+决策树 | 📖 | [references/workflow.md](references/workflow.md) |
| 10大能力域速查 | 📖 | [references/capability-domains.md](references/capability-domains.md) |
| 架构模式与分层 | 📖 | [references/architecture-patterns.md](references/architecture-patterns.md) |
| 技术选型框架 | 📖 | [references/tech-selection.md](references/tech-selection.md) |
| AI集成架构 | 📖 | [references/ai-integration.md](references/ai-integration.md) |
| NFR设计（性能/安全/可靠性） | 📖 | [references/nfr-design.md](references/nfr-design.md) |
| DevOps与交付 | 📖 | [references/devops-delivery.md](references/devops-delivery.md) |
| 检查清单与反模式 | 📖 | [references/checklists.md](references/checklists.md) |
| 输出物模板+ADR模板 | 📖 | [references/templates.md](references/templates.md) |
| 教育行业适配 | 📖 | [references/education-tech.md](references/education-tech.md) |
| 协作接口与职责边界 | 📖 | [references/collaboration.md](references/collaboration.md) |

## 深度分级

| 级别 | 适用场景 | 说明 |
|------|---------|------|
| L1 快速评估 | 技术可行性判断、小功能 | Step 1-2-5 重点，输出架构评估简报 |
| L2 标准设计 | 新模块或重要改版 | 完整9步，输出标准7文档+ADR |
| L3 深度设计 | 全新产品/大规模重构 | 9步+多方案对比+原型验证+演进路线图 |

## 铁律
1. **架构 = 决策**：每个选择有理由、有替代方案、有退出成本
2. **团队能驾驭**：方案复杂度匹配团队能力，不炫技
3. **先跑通再优化**：MVP用模块化单体，验证后按需拆分
4. **NFR不后补**：性能/安全/可靠性/监控在架构阶段设计，不留"后面再说"
5. **AI有控制**：AI集成必须有中间层+成本上限+降级方案
