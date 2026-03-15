---
name: project-management
description: "Project management for NDHY AI Agent Team. Use when: (1) creating or updating PROJECT.md, (2) managing task tracking with Task Ledger format, (3) compressing PROJECT.md over 80 lines, (4) decomposing large requirements into three-level structure (requirement → module → subtask), (5) managing project folders and naming conventions. NOT for: simple file edits or non-project tasks."
---

> 本 Skill 从 AGENTS.md 提取，用于按需加载。

# 项目管理

## 项目文件夹管理

- **所有任务产出统一放在 `D:\code\openclaw-home\workspace\` 下**
- **新需求** → 在 workspace 下新建文件夹，命名规范：`英文小写-连字符`（如 `landing-page`、`data-dashboard`）
- **旧需求迭代** → 找到已有文件夹，在原基础上继续。判断依据：任务描述与已有项目的主题/目标匹配
- Leader 在派发任务时负责判断新旧，并在 task 中明确指定工作目录

---

## 项目记忆（PROJECT.md）

每个项目文件夹中维护一份 `PROJECT.md`，作为该项目的完整上下文。子 Agent 接手项目时读它，完成任务后更新它。

### PROJECT.md 模板

子 Agent 首次进入一个新项目文件夹时，按此模板创建 `PROJECT.md`：

```markdown
# PROJECT.md — [项目名]

## 概述
[一句话说明：这个项目是什么、解决什么问题]

## 技术栈
[语言、框架、数据库、部署方式]

## 关键决策
- [YYYY-MM-DD] [决策] — 原因：[为什么]

## 迭代记录
- [YYYY-MM-DD] v1: [做了什么，关键变更]

## 当前状态
[正在进行/已完成/暂停]

## 已知问题 / TODO

（借鉴 Magentic-One Task Ledger 结构化任务追踪）

| 任务 | 负责人 | 状态 | 预计完成 | 实际完成 |
|------|--------|------|----------|----------|
| [任务描述] | [Agent名/pending] | `[pending]` | YYYY-MM-DD | — |
| [任务描述] | [Agent名] | `[doing]` | YYYY-MM-DD | — |

## 子 Agent 须知
[接手这个项目时必须知道的上下文]
```

---

## 任务状态标签

每条 TODO 用状态标签标记当前进度，避免靠文字猜测。

| 标签 | 含义 |
|------|------|
| `[pending]` | 待分配，还没人接 |
| `[doing]` | 执行中 |
| `[review]` | 已完成，审查中 |
| `[done]` | 完成 |
| `[blocked]` | 阻塞，等待外部条件 |
| `[rework]` | 审查未通过，返工中 |

Leader 和子 Agent 在更新 PROJECT.md 时，同步更新对应 TODO 的状态标签。

---

## 任务拆解模板

把大任务拆成可执行的小任务。每个任务携带：

- **具体任务描述**：做什么，产出什么（不是岗位头衔，是任务）
- **上下文信息**：前序任务产出、需求背景、技术约束
- **验收标准**：3-5 条，具体可检验

```
# 任务拆解模板
## 任务：[任务名]
### 描述
[具体做什么，产出什么]
### 上下文
[前序产出、需求背景、技术约束]
### 验收标准
- [ ] 标准1
- [ ] 标准2
- [ ] 标准3
```

---

## 大型需求三级拆解

当需求涉及 **3 个以上功能模块** 时，两级拆解（需求 → 子任务）粒度不够，容易遗漏依赖关系。此时增加「模块」中间层：

```
需求（目标）
  └─ 模块 A（功能边界清晰的独立单元）
  │    ├─ 子任务 A-1
  │    └─ 子任务 A-2
  └─ 模块 B
       ├─ 子任务 B-1
       └─ 子任务 B-2
```

**何时用三级：** 涉及 3+ 功能模块、多个子 Agent 需要并行、模块间存在数据/接口依赖。
**何时仍用两级：** 小型需求、单一功能、一个子 Agent 能独立完成。不强制三级，按需升级。

三级拆解时，先定义模块边界和模块间接口，再拆子任务。模块边界 = spawn 的自然分割线。

---

## 记忆压缩机制

**PROJECT.md 上限 80 行。** 超过时触发压缩流程：

1. **关键决策**：已被后续决策覆盖的旧条目 → 合并为一条（保留最终结论，注明曾变更）
2. **迭代记录**：超过 3 个版本的详细记录 → 保留最近 3 条完整记录，更早的合并为摘要行（如 `v1-v3: 完成基础框架搭建、API 设计、前端骨架`）
3. **已知问题**：已解决的 → 移除（解决方案如有复用价值，提炼到「子 Agent 须知」）
4. **子 Agent 须知**：过长 → 保留当前最关键的 5 条，其余归档

**归档去向**：被压缩的详细内容移入同目录下 `PROJECT-ARCHIVE.md`（无上限，按需查阅）。

**压缩原则：**
- 保留"是什么"和"为什么"，压缩"怎么做的过程细节"
- 保留当前有效的决策，压缩已被推翻的历史决策（但注明曾变更）
- 保留未解决的问题，压缩已解决的问题
- **绝不删除**，只是从 PROJECT.md 移到 PROJECT-ARCHIVE.md
