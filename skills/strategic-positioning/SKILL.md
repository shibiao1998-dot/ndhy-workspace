---
name: strategic-positioning
description: "Strategic positioning execution toolkit for AI-driven product strategy and competitive positioning. Covers 6-step positioning workflow (integrate inputs → screen directions → deep argumentation → design positioning → design validation → deliver), 6 capability domains (strategic choice analysis, competitive positioning, value proposition design, boundary definition, validation design, strategic narrative), 3 depth levels (lightweight, standard, strategic), and 7-chapter strategic positioning document template. Includes quality assurance (3 iron rules, 5 common quality traps). Use when: (1) Phase 1 outputs (user research, market assessment, requirements analysis) are ready and need to converge into product strategy, (2) choosing among multiple strategic directions with structured evaluation, (3) defining competitive positioning (who we serve, what we solve, how we differ), (4) designing value propositions with triple validation (authenticity, differentiation, importance), (5) drawing strategic boundaries (do / don't do / defer), (6) designing validation plans for strategic assumptions, (7) crafting strategic narratives with causal logic chains, (8) any product direction decision that requires explicit trade-offs and prioritization. Triggers on: strategic positioning, competitive positioning, value proposition, strategic direction, product strategy, boundary definition, strategic narrative, direction screening, positioning design."
---

# strategic-positioning — 战略定位执行工具箱

AI 战略定位专家的核心技能。在 Phase 1 输出基础上收敛产品战略方向和竞争定位，回答"做什么、不做什么、凭什么赢"。

## 模块速查

| # | 模块 | 何时用 | 详细位置 |
|---|------|--------|----------|
| 1 | 6 步定位流程 | 每次定位全程 | 本文 §6 步标准定位流程 |
| 2 | 6 大能力域速查 | Step 2-5 按需选择分析维度 | 本文 §能力域速查 + [references/analysis-frameworks.md](references/analysis-frameworks.md) |
| 3 | 定位深度分级 | Step 0 判断投入量 | 本文 §定位深度速查 |
| 4 | 输出物模板 | Step 6 组织交付物 | [references/templates.md](references/templates.md) |
| 5 | 质量自检清单 | 交付前 | [references/checklists.md](references/checklists.md) |

---

## 6 步标准定位流程

```
Step 1：整合输入
  │  消化 Phase 1 全部输出（需求分析师 + 用户研究 + 市场评估）
  │  → 提取关键洞察：用户核心痛点、市场机会窗口、竞争空白
  │  → 识别所有可能的方向选项
  │  → 信息不足时，有权要求 Phase 1 补充调研
  │
Step 2：方向筛选
  │  → 列出所有可能的战略方向
  │  → 用 5 维评估框架逐一打分：
  │     市场吸引力 | 自身匹配度 | 竞争可行性 | 资源要求 | 时间窗口
  │  → 收敛到 2-3 个候选方向
  │  → 详细评估框架 → references/analysis-frameworks.md §1
  │
Step 3：深度论证
  │  → 对候选方向深度分析
  │  → 推演每个方向的具体路径、资源需求、风险
  │  → 形成推荐排序
  │  → 不只说"选 A"，还要说"为什么不选 B 和 C"
  │
Step 4：定位设计
  │  → 竞争定位三问：服务谁？解决什么？与别人有什么不同？
  │  → 价值主张设计 + 三重检验
  │  → 边界划定：做什么 / 不做什么 / 暂时不做什么
  │  → 详细方法 → references/analysis-frameworks.md §2-4
  │
Step 5：验证设计
  │  → 提取关键假设
  │  → 设计验证方式和判断标准
  │  → 设定预警信号
  │  → 详细模板 → references/analysis-frameworks.md §5
  │
Step 6：输出并交接
     → 按模板组织战略定位文档 → references/templates.md
     → 传递给产品架构师、交互设计专家
     → 交付前跑质量自检清单 → references/checklists.md
```

---

## 定位深度速查

| 深度 | 适用场景 | 覆盖范围 | 输出物 |
|------|----------|----------|--------|
| **轻量定位** | 功能级需求、方向已明确的小项目 | 跳过方向选择，直接做差异化分析 + 边界划定 | 战略定位文档（轻量版） |
| **标准定位** | 新产品模块、中等规模项目 | 完整 6 步流程 | 战略定位文档（标准版） |
| **战略级定位** | 新业务线、重大方向决策 | 完整流程 + 多轮推演 + 场景模拟 | 战略定位文档（完整版） |

判断不清时向上确认。

---

## 6 大能力域速查

### 域 1：战略选择分析

**核心问题**：在多个方向中，走哪条路？

| 评估维度 | 关键问题 |
|----------|----------|
| 市场吸引力 | 市场够大吗？增长趋势？ |
| 自身匹配度 | 我们有能力做吗？优势在哪？ |
| 竞争可行性 | 能赢吗？竞争激烈程度？ |
| 资源要求 | 需要多少投入？有这些资源吗？ |
| 时间窗口 | 时机对吗？做早了/做晚了的风险？ |

**关键原则**：
- 战略是选择 = 放弃。好战略不是"都想做"
- 选择依据透明："基于 X、Y、Z，A 优于 B"
- 每个选择背后的假设摆出来，方便后续验证

详细评估框架 → [references/analysis-frameworks.md](references/analysis-frameworks.md) §1

### 域 2：竞争定位

**三个核心问题**：

| 问题 | 要求 |
|------|------|
| **服务谁？** | 具体到"哪一类学校/教师/学生"，不是"所有人" |
| **解决什么？** | "在 X 场景下解决 Y 问题做到 Z 程度"，不是"全面解决方案" |
| **有何不同？** | 可感知、可验证、有门槛的差异 |

**差异化四层次**（从易模仿到难模仿）：

```
容易复制 ←─────────────────→ 难以复制

功能差异     价格差异     体验差异     结构性差异
"我有你没有"  "我更便宜"  "我更好用"   "模式决定了
                                     你做不到"
```

→ 尽量寻找**结构性差异**，至少要有**体验差异**
→ 纯功能/价格差异不是好的定位基础

详细方法 → [references/analysis-frameworks.md](references/analysis-frameworks.md) §2

### 域 3：价值主张设计

**核心方法**：从用户痛点提炼 1-3 个核心价值点，每个必须通过三重检验。

**三重检验速查**：

| 检验 | 问题 | 未通过的典型表现 |
|------|------|-----------------|
| **真实性** | 我们真的能做到吗？ | 承诺了做不到的能力 |
| **差异性** | 竞品做不到或做不好吗？ | 说的跟竞品一样 |
| **重要性** | 用户真的在意吗？ | 差异点用户无感 |

→ 三项全部通过才是有效价值点
→ 任何一项未通过都需要替换或调整

详细设计方法 → [references/analysis-frameworks.md](references/analysis-frameworks.md) §3

### 域 4：边界划定

**三分法**：

| 类别 | 定义 | 关键要求 |
|------|------|----------|
| **做什么（In Scope）** | 与定位直接相关的核心能力和功能 | 资源优先投入 |
| **不做什么（Out of Scope）** | 战略性放弃的方向 | 必须说明放弃理由，不是"以后再说" |
| **暂不做（Deferred）** | 方向正确但时机未到或资源不够 | 必须明确触发条件：什么情况下启动 |

→ "不做清单"**不能为空**
→ 此输出直接约束产品架构师的设计边界

详细模板 → [references/analysis-frameworks.md](references/analysis-frameworks.md) §4

### 域 5：战略验证设计

**核心逻辑**：战略定位是假设，不是真理。

每个关键假设按以下结构设计验证：

```
假设内容 → 验证方式 → 判断标准 → 如果不成立怎么办
```

同时定义预警信号：什么情况下需要调整战略。

详细模板 → [references/analysis-frameworks.md](references/analysis-frameworks.md) §5

### 域 6：战略叙事

**因果链条模板**：

```
"因为市场正在发生___变化，
 用户出现了___新需求，
 而现有方案___做得不够好，
 我们凭借___能力，
 选择在___方向上，
 为___用户，
 提供___价值，
 这是我们能赢的原因。"
```

→ 每一句都要有 Phase 1 数据/洞察支撑
→ 用因果逻辑，不用口号式表达

---

## 3 条质量铁律

| # | 铁律 | 核心要求 | 违反示例 |
|---|------|----------|----------|
| 1 | **定位必须可证伪** | 具体到客群+场景+价值 | ❌"做最好的教育产品" |
| 2 | **选择必须有取舍** | "不做什么"清单不能为空，理由充分 | ❌ 只列要做的，回避不做的 |
| 3 | **逻辑链条必须完整** | 市场事实→机会判断→方向选择→具体定位，每步有依据 | ❌ 跳过论证直接给结论 |

---

## 5 个质量陷阱（❌/✅ 对比）

❌ **定位空泛**："打造领先的智慧教育平台"
✅ 用具体客群 + 场景 + 价值替代大词："为三四线城市初中英语教师提供 AI 备课助手"

❌ **缺乏取舍**：列了一堆要做的，不做清单为空
✅ 强制要求"不做清单"非空，每条附明确放弃理由

❌ **脱离现实**：定位很美但公司做不到
✅ 每个定位回答"凭什么我们能做到"，追溯自身能力和资源

❌ **自说自话**：与用户需求和市场事实脱节
✅ 每个结论追溯到具体的 Phase 1 洞察和数据

❌ **假大空叙事**：充斥愿景、使命等大词，没有因果逻辑
✅ 用"因为…所以…"因果链条取代口号式表达

详细防范措施 → [references/checklists.md](references/checklists.md)

---

## 协作接口

### 上游输入（来自 Phase 1）

| 来源 | 接收内容 | 使用方式 |
|------|---------|---------|
| 需求分析师 | 整合后的需求分析报告 | **主要输入来源**，定位的事实基础 |
| 用户研究专家 | 用户画像、需求洞察、痛点排序 | 必要时追溯原始细节 |
| 市场评估专家 | 市场规模、竞品格局、趋势判断 | 必要时追溯原始细节 |

→ 信息不足时有权要求 Phase 1 补充调研

### 下游输出（传递给 Phase 2 后续角色）

| 接收方 | 传递内容 | 约束关系 |
|--------|---------|---------|
| 产品架构师 | 战略方向、定位、边界 | 架构设计必须在边界内展开 |
| 交互设计专家 | 定位和差异化要求 | 交互方案必须体现核心差异 |
| 项目管理专家 | 优先级判断依据、资源分配方向 | 排期参考战略优先级 |

### 回调机制

| 触发条件 | 动作 |
|---------|------|
| 架构设计发现定位与实现可行性冲突 | 重新审视定位，必要时调整边界 |
| 市场发生重大变化（新竞品/新政策） | 检验当前定位是否还成立 |
| 关键假设被证伪 | 启动定位修正流程 |
| 项目范围发生重大变更 | 评估是否触及战略边界 |

---

## 触发时首要动作

无论如何触发，第一步永远是：

> "Phase 1 告诉了我们什么？我们面对怎样的市场、怎样的用户、怎样的竞争？"

→ 判断定位深度 → 整合 Phase 1 输入 → 按 6 步流程执行
