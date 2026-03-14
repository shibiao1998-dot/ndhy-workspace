---
name: skillforge
description: "Systematic 7-step Skill generation engine and 3-step fix pipeline with 10-dimension quality audit. Use when creating new skills from scratch OR fixing/improving existing skills. Includes structured requirement analysis (5-dimension framework), architecture decisions, metadata refinement, progressive disclosure planning, quality scoring, and final assembly. Complements skill-creator (base spec) as an advanced generation engine. Triggers: \"forge a skill\", \"generate skill systematically\", \"fix this skill\", \"audit skill quality\", \"skillforge\", or when a skill needs rigorous multi-step creation beyond simple authoring."
---

# SkillForge — 系统化 Skill 生成引擎

Skill 的进阶创建与修正工具。提供 7 步生成流水线、3 步修正流水线和 10 维度质量审计。
与 `skill-creator` 的关系：**先读 `skill-creator` 了解 AgentSkills 基础规范（目录结构、frontmatter、渐进式披露），再用 SkillForge 执行系统化生成。** `skill-creator` 是底线标准，SkillForge 是进阶引擎。

## 核心设计原则

1. **简洁至上** — Context window 是公共资源。只写 AI 不知道的内容
2. **Description 是触发器** — 决定 Skill 是否被选中。必须包含 WHAT + WHEN
3. **渐进式披露** — SKILL.md < 500 行。详细内容拆到 scripts/、references/、templates/
4. **代码示例 > 文字说明**
5. **反面案例必不可少** — 用 ❌/✅ 对比格式展示
6. **祈使语气** — "执行"而非"你应该执行"
7. **不加辅助文件** — 不创建 README.md、CHANGELOG.md

## 两条流水线

### 流水线 A：7 步生成（从零创建）

| 步骤 | 名称 | 核心产出 |
|------|------|----------|
| 1 | 需求深度挖掘 | 5 维需求文档（定位/边界/场景/知识缺口/依赖） |
| 2 | 架构决策引擎 | 5 大决策（模式/自由度/资源/披露策略/质量方案） |
| 3 | 元数据精炼 | 3 候选 description → 打分 → 最终 YAML frontmatter |
| 4 | SKILL.md 主体生成 | 概述→工作流→规则→示例→边界→输出→检查清单 |
| 5 | 质量审计与优化 | 10 维度评分，< 8 分自动修复 |
| 6 | 配套资源生成 | scripts/、references/、templates/ |
| 7 | 最终组装与交付 | 格式验证 + 内容验证 + 最佳实践验证 |

**执行**：按顺序走完 7 步。每步产出作为下一步输入。
**详细 prompt 模板**：读 [references/step-prompts.md](references/step-prompts.md)

### 流水线 B：3 步修正（修正已有 Skill）

| 步骤 | 名称 | 核心产出 |
|------|------|----------|
| 1 | 问题诊断 | 对照最佳实践逐项检查，输出诊断报告 + 评分 |
| 2 | SKILL.md 重写 | 保留原始意图，按最佳实践重写 |
| 3 | 质量审计 | 10 维度评分验证重写质量 |

**详细 prompt 模板**：读 [references/fix-prompts.md](references/fix-prompts.md)

### 质量审计（通用）

10 维度加权评分卡，每维度 1-10 分，低于 8 分必须修复。
**详细评分标准**：读 [references/quality-audit.md](references/quality-audit.md)

## 知识缺口分析框架（Step 1 核心）

这是整个流程最关键的一步。创建 Skill 前必须分三类：

| 类别 | 处理方式 | 示例 |
|------|----------|------|
| **AI 已知** | 不写进 SKILL.md | Python 语法、HTTP 协议 |
| **AI 不知道** | SKILL.md 核心内容 | 公司内部 API、专有流程 |
| **AI 易犯错** | 用 ❌/✅ 反面案例覆盖 | 常见误用、隐含陷阱 |

## 反面案例格式规范

```markdown
❌ 错误做法：
​```yaml
description: "A skill for doing stuff"
​```

✅ 正确做法：
​```yaml
description: "Generate PDF reports from SQL query results. Use when user asks to export data as PDF, create report documents, or convert query output to printable format."
​```
```

## 输出标准

### 目录结构
```
skill-name/
├── SKILL.md              # 主入口 < 500 行
├── references/           # 详细参考文档
│   └── *.md
├── scripts/              # 可执行脚本
│   └── *.py / *.sh
└── templates/            # 模板文件
    └── *
```

### SKILL.md 必须包含
- YAML frontmatter（name + description）
- 概述（2-3 句）
- 核心工作流或规则
- 至少 1 组 ❌/✅ 反面案例
- 引用文件的加载说明（何时读、读哪个）

### YAML Frontmatter 规范

❌ 错误：
```yaml
---
name: my skill
version: 1.0
author: someone
description: "Does things"
---
```

✅ 正确：
```yaml
---
name: my-skill
description: "Precise description with WHAT + WHEN. 30-200 words covering core functionality and trigger scenarios."
---
```

只保留 `name` 和 `description`，不加其他字段。

## 验证清单

完成 Skill 后逐条检查：

- [ ] description 包含 WHAT + WHEN，30-200 词
- [ ] SKILL.md < 500 行
- [ ] name 为 hyphen-case
- [ ] 无 README.md / CHANGELOG.md 等辅助文件
- [ ] 超 100 行的详细内容已拆到 references/
- [ ] 所有引用文件在 SKILL.md 中有加载说明
- [ ] 至少 1 组 ❌/✅ 反面案例
- [ ] 祈使语气，无"你应该"
- [ ] 不含 AI 已知的常识性内容
- [ ] 10 维度质量审计全部 ≥ 8 分
