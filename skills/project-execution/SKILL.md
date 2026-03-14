---
name: project-execution
description: "Project execution operations manual for AI project managers who dispatch stateless sub-agents. Covers the full lifecycle: project status archive creation, instruction pack assembly (5-layer structure + 5 techniques), dispatch decision trees (readiness check, serial vs parallel, dependency conflicts), two-layer quality inspection (form + content), 6-type exception handling (timeout, quality fail, missing dependency, context overflow, tool failure, design flaw), 3-tier context management (working area / summary pool / archive), progress reporting, and retrospective. Use when: (1) initializing a new project and creating status archives, (2) assembling instruction packs for sub-agents, (3) deciding dispatch order (serial/parallel), (4) inspecting sub-agent output quality, (5) handling execution exceptions, (6) managing project context to prevent overflow, (7) reporting progress or writing retrospectives, (8) any task involving multi-node project orchestration with stateless executors."
---

# project-execution — 项目执行操作手册

纪统辰的核心技能。覆盖项目执行全生命周期：从状态档案建立到复盘收尾。

## 模块速查

| # | 模块 | 何时用 | 详细位置 |
|---|------|--------|----------|
| 1 | 项目状态档案 | 项目启动时创建 | [references/templates.md](references/templates.md) §1 |
| 2 | 指令包模板 | 每次调度前组装 | [references/templates.md](references/templates.md) §2 |
| 3 | 调度决策树 | 每个调度节点前 | [references/checklists.md](references/checklists.md) §1 |
| 4 | 质量检查清单 | 产出返回后 | [references/checklists.md](references/checklists.md) §2 |
| 5 | 异常处理表 | 遇到异常时 | [references/troubleshooting.md](references/troubleshooting.md) |
| 6 | 上下文管理 | 贯穿全程 | [references/context-strategy.md](references/context-strategy.md) |
| 7 | 进度报告 | 节点完成后汇报 | [references/templates.md](references/templates.md) §3 |
| 8 | 复盘模板 | 项目交付后 | [references/templates.md](references/templates.md) §4 |

---

## 核心调度循环

```
项目启动
  │
  ├── 创建项目状态档案（模块 1）
  │
  ▼
调度循环（逐节点推进）
  │
  ├── 调度决策树（模块 3）→ 判断调度谁、串行/并行
  ├── 组装指令包（模块 2）→ 5 层结构，上下文精准注入
  ├── 上下文管理（模块 6）→ 控制注入量，防溢出
  │         │
  │         ▼ 调度执行（sessions_spawn）
  │         │
  │         ▼ 产出返回
  │
  ├── 质量检查（模块 4）→ 形式检查 → 内容检查
  │   ├── 通过 → 更新状态档案 → 生成摘要 → 进度报告（模块 7）
  │   └── 不通过 → 异常处理（模块 5）
  │         ├── 可重试（≤2次）→ 附修正指引，回到指令包组装
  │         └── 根本性问题 → 暂停，上报
  │
  ▼ 所有节点完成
  │
  ├── 整合交付
  └── 复盘（模块 8）
```

---

## 指令包组装要点

指令包质量 = 项目质量。执行专家的产出上限由指令包决定。

### 5 层结构

1. **角色设定**（SOUL.md + STANDARDS.md 完整注入）
2. **项目上下文**（精简版：项目名 + 目标 + 进度 + 本节点相关约束）
3. **上游产出物**（按注入决策选择内联/摘要+路径/仅路径）
4. **本节点任务说明**（目标 + 具体要求 + 输出要求 + 约束）
5. **验收标准**（每条必须是可回答"是/否"的命题）

完整模板 → [references/templates.md](references/templates.md) §2

### 上游产出物注入决策

```
上游产出物行数？
├── ≤ 50 行 → 直接内联到指令包
├── 51-200 行 → 摘要 + 文件路径（"完整内容见 [路径]，以下为核心摘要"）
└── > 200 行 → 仅摘要 + 文件路径（"请先阅读 [路径] 再开始工作"）
```

### 5 项核心技巧

| # | 技巧 | 关键点 |
|---|------|--------|
| 1 | 摘要代替原文 | 超 50 行用摘要池的结构化摘要，给路径让执行者按需深读 |
| 2 | 只给相关约束 | 10 条约束只相关 3 条 → 只注入 3 条 |
| 3 | 边界显式声明 | 明确"不要做 XX"，防止执行者越界帮忙做下游的活 |
| 4 | 验收标准可检验 | ❌ "代码质量要好" ✅ "所有函数有 JSDoc 注释" |
| 5 | 角色设定完整注入 | SOUL.md + STANDARDS.md 完整粘贴，不省略 |

---

## 质量检查速查

两层检查，第一层全通过才进第二层。

### 第一层：形式检查（必做）

- 文件存在于指定路径
- 格式正确，可正常解析
- 所有要求的产出项齐全
- 量级合理（不能 10 行完成 100 行的需求）
- 编码正常，无乱码
- 文件命名符合项目约定

### 第二层：内容检查（按需）

- 目标一致：回答了指令包核心问题
- 呼应上游：正确引用上游产出，无曲解
- 内部无矛盾
- 满足下游：能直接作为下游输入
- 验收标准逐条达标
- 无越界：未替下游做不该做的事

### 判定处理

| 判定 | 处理 |
|------|------|
| ✅ 合格 | 更新产出记录 → 生成摘要 → 继续 |
| 🟡 小问题 | 自行修正并标注（不算重试） |
| 🔴 方向性问题 | 重新调度 + 修正指引（≤2 次） |
| ⛔ 根本性问题 | 暂停 → 上报用户 |

详细检查项 → [references/checklists.md](references/checklists.md) §2

---

## 异常处理速查

核心原则：**不超过 2 次重试，解决不了就上报。失败产出不丢弃。**

```
遇到异常 →
├── 能自行解决？（形式问题、临时工具故障）
│   └── 是 → 解决并记录（不算重试）
├── 需要重新调度？（方向性问题、超时）
│   └── 重试 ≤ 2 次 → 附修正指引重新调度
│   └── 重试 > 2 次 → 上报
└── 根本性问题？（需求歧义、流程缺陷）
    └── 立即暂停 → 上报
```

| 异常类型 | 判断标准 | 首选处理 |
|----------|----------|----------|
| 执行超时 | 简单 >10min / 复杂 >30min | 追问进度 → 无响应 kill → 重试 |
| 产出不合格 | 质量检查未通过 | 按判定级别处理 |
| 依赖缺失 | 上游产出不存在/不完整 | 先调度上游 |
| 上下文溢出 | 指令包超上下文 60% | 压缩/拆分节点 |
| 工具故障 | API/文件/网络报错 | 临时性等 2min 重试；持续性找替代方案 |
| 根本性设计问题 | 需求歧义/流程缺陷 | 立即暂停，上报 |

6 种异常的完整处理步骤 → [references/troubleshooting.md](references/troubleshooting.md)

---

## 上下文管理要点

你是项目团队的唯一记忆体，上下文管理是防止"记忆崩溃"的生命线。

### 三级存储

| 级别 | 存储位置 | 内容 | 保留策略 |
|------|----------|------|----------|
| L1 当前工作区 | 指令包 + 当前节点摘要 | 正在执行的节点所需信息 | 节点完成后清空，转摘要 |
| L2 近期摘要 | PROJECT-STATUS.md 摘要池 | 已完成节点的结构化摘要 | 项目结束前保留 |
| L3 归档 | PROJECT-STATUS-ARCHIVE.md | 详细记录、完整异常日志 | 日常不加载 |

### 压缩触发阈值

```
上下文使用率：
├── < 40% → 🟢 正常
├── 40%-60% → 🟡 组装指令包时优先用摘要
├── 60%-80% → 🔴 执行降级压缩
└── > 80% → ⛔ 紧急压缩 + 考虑拆分节点
```

### 摘要生成 3 原则

1. **面向下游**：以"下游需要知道什么"为导向，不是活动流水账
2. **结论优先**：先写结论再写支撑
3. **标注局限**：已知不足显式写出，防下游基于错误假设工作

详细策略和模板 → [references/context-strategy.md](references/context-strategy.md)

---

## 关键易错点

以下是执行项目管理时 AI 最容易犯的错误：

❌ **把上游 300 行产出原封不动贴进指令包**
✅ 用摘要池的结构化摘要 + 文件路径，让执行者按需深读

❌ **只说"做 XX"不说"不做 YY"**
✅ 显式声明边界："不要做 XX"，防止执行者好心越界

❌ **无限重试失败节点**
✅ 最多 2 次重试，超过即上报。避免陷入死循环

❌ **摘要写成"XX 做了 YY"的流水账**
✅ 摘要面向下游：核心结论 + 关键数据 + 已知局限

❌ **发现流程问题自己修改**
✅ 记录问题 → 暂停受影响节点 → 上报。你的权限在流程之内

❌ **自己动手写代码/文档**
✅ 拆成指令包派给执行专家。你是调度中心，不是执行者
