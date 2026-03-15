---
name: user-research
description: "User research execution toolkit for AI-driven user insight generation. Covers 6-step research workflow (scope → collect → validate → analyze → model → deliver), 5 autonomous collection methods, user persona construction (7 dimensions + 4-tier segmentation), journey mapping (6-dimension As-Is/To-Be), 3 need-inference methods (Role-Scene-Task chain, JTBD, Pain-point reverse), priority matrix (pain×breadth + 3 overlay dimensions), and insight-to-action conversion. Includes quality assurance (4 iron rules, 9-item checklist, 5 common traps). Use when: (1) a new project needs user insights before requirements analysis, (2) building user personas or journey maps, (3) inferring user needs from limited data, (4) prioritizing user needs, (5) validating user assumptions during design, (6) analyzing user feedback post-launch, (7) any education-domain user research (multi-layer stakeholder structure). Triggers on: user research, user persona, user journey, user insight, pain point analysis, need prioritization."
---

# user-research — 用户研究执行工具箱

AI 用户研究专家的核心技能。覆盖从研究界定到洞察交付的完整流程。

## 模块速查

| # | 模块 | 何时用 | 详细位置 |
|---|------|--------|----------|
| 1 | 6 步研究流程 | 每次研究全程 | 本文 §研究流程 |
| 2 | 采集手段 | Step 2 选择采集组合 | [references/research-methods.md](references/research-methods.md) §1 |
| 3 | 需求推演方法 | Step 4 数据不足时 | [references/research-methods.md](references/research-methods.md) §2 |
| 4 | 研究深度分级 | Step 1 判断投入量 | [references/research-methods.md](references/research-methods.md) §3 |
| 5 | 输出物模板 | Step 5 建模输出 | [references/templates.md](references/templates.md) |
| 6 | 质量自检清单 | Step 6 交付前 | [references/checklists.md](references/checklists.md) |
| 7 | 教育行业指南 | 教育项目研究时 | [references/education-domain.md](references/education-domain.md) |

---

## 6 步标准研究流程

```
Step 1：界定研究问题
  │  "需要了解关于用户的什么？"
  │  → 模糊问题 → 可研究的具体问题
  │  → 与项目目标对齐，排除无关问题
  │  → 判断研究深度（轻量/标准/深度）
  │
Step 2：多源信息采集
  │  → 根据问题选择采集手段组合
  │  → 至少 2 种独立信息源（铁律1）
  │  → 记录所有来源，标注时效性
  │
Step 3：数据整合与交叉验证
  │  → 多源数据按主题分类
  │  → 识别一致性和矛盾
  │  → 矛盾处标注"待验证"，不强行统一
  │
Step 4：分析推理
  │  → 提取模式和规律
  │  → 区分"数据支持的结论" vs "逻辑推演的假设"
  │  → 数据不足时用推演方法补位（必须标注）
  │
Step 5：建模输出
  │  → 构建画像/旅程地图/需求矩阵
  │  → 每个模型注明数据支撑强度
  │  → 模板见 references/templates.md
  │
Step 6：结论交付与建议
     → 每个洞察指向可执行建议
     → 每个建议追溯到用户数据
     → 声明研究局限性
     → 交付前跑质量自检清单
```

---

## 研究深度速查

| 深度 | 适用场景 | 输出物 |
|------|----------|--------|
| **轻量级** | 小需求、功能优化、方向明确 | 简要画像 + 核心痛点清单 |
| **标准级** | 新功能开发、中等规模项目 | 完整画像 + 旅程地图 + 需求矩阵 |
| **深度级** | 新产品规划、战略级项目、进入新市场 | 全套报告 + 多用户群画像 + 竞品对比 + 机会分析 |

判断不清时向上确认。详细说明 → [references/research-methods.md](references/research-methods.md) §3

---

## 5 种采集手段速查

| 手段 | 获取什么 | 适用场景 |
|------|----------|----------|
| **公开数据挖掘** | 用户规模、群体特征、市场趋势 | 行业报告、统计、政策文件 |
| **用户声音采集** | 真实痛点、不满、期望 | 评论、论坛、社交媒体、投诉 |
| **竞品用户体验分析** | 用户对同类产品的态度和偏好 | 竞品页面、评价、口碑对比 |
| **学术/行业研究整合** | 深层行为规律、理论框架 | 论文、白皮书、行业会议 |
| **已有数据二次分析** | 数据驱动的行为洞察 | 项目方历史数据、反馈、日志 |

**规则**：每次研究至少组合 2 种手段。详细操作 → [references/research-methods.md](references/research-methods.md) §1

---

## 用户画像构建要点

### 7 个维度

基础属性 → 核心目标 → 行为特征 → 痛点图谱 → 需求层次 → 技术素养 → 环境约束

### 4 类用户分群

| 分群 | 定义 | 设计策略 |
|------|------|----------|
| **核心用户群** | 主要服务对象 | 设计必须优先满足 |
| **次要用户群** | 重要但非首要 | 设计应兼顾 |
| **边缘用户群** | 偶尔/非典型场景 | 不为其牺牲核心体验 |
| **影响者群体** | 不直接使用但影响决策 | 需识别和理解 |

完整画像模板 → [references/templates.md](references/templates.md) §1

---

## 3 种需求推演方法速查

数据不足时用推演补位，**但必须标注"这是推演，不是事实"**。

### 方法 A：角色-场景-任务链

```
谁 → 什么情境 → 完成什么任务 → 遇到什么障碍 → 需要什么
```

### 方法 B：Jobs-to-be-Done

```
当我处于 [情境] 时，我想要 [完成任务]，这样我就能 [获得结果]。
```

### 方法 C：痛点反推

```
已知痛点 → 追问根本原因 → 推导深层需求 → 区分"表面要求"vs"真实需要"
```

详细操作步骤和示例 → [references/research-methods.md](references/research-methods.md) §2

---

## 需求优先级排序

### 痛感×影响面矩阵

```
              影响面（广度）
              广          窄
痛感   强   P0 立即解决   P1 优先解决
（深度）弱   P2 计划解决   P3 有余力再说
```

### 3 个叠加维度

- × **发生频率**：每天遇到 vs 偶尔遇到
- × **替代方案**：无替代 = 优先级↑
- × **项目契合度**：与项目目标的对齐程度

---

## 4 条质量铁律

| # | 铁律 | 核心要求 |
|---|------|----------|
| 1 | **三角验证** | 每个关键结论 ≥ 2 个独立数据源。单源结论标注"单源，待验证" |
| 2 | **假设标注** | 数据支撑 = 事实（标来源）；逻辑推演 = 假设（标逻辑）。绝不混淆 |
| 3 | **时效声明** | 所有数据标注时间。>2 年标注"可能已过时"。优先用近 1 年数据 |
| 4 | **局限声明** | 每份输出物必须包含局限性说明。主动说明"什么是我们不知道的" |

---

## 教育行业注意事项速查

教育项目用户研究必须额外考虑：

- **多层用户结构**：使用者（学生/教师）≠ 决策者（管理者）≠ 付费者（家长/学校）≠ 影响者（教研员）
- **效果滞后性**：用户满意度 ≠ 学习效果，不能以短期满意度替代长期价值
- **强政策属性**：政策变动直接改变用户需求，研究时必须纳入政策维度
- **强周期性**：学期、考试、招生等节奏影响用户行为
- **强地域差异**：一线城市和县城需求可能截然不同

完整教育行业指南 → [references/education-domain.md](references/education-domain.md)

---

## 协作接口

### 输出物传递

| 接收方 | 传递内容 |
|--------|----------|
| 需求分析专家 | 用户画像、需求优先级、痛点清单、用户声音 |
| 方案设计专家 | 用户旅程地图、场景描述、用户偏好、体验标准 |
| 流程设计专家 | 用户行为模式、触点地图、关键时刻 |
| 项目管理专家 | 用户视角的验收标准建议、优先级参考 |

### 回调机制

| 触发条件 | 回调内容 | 输出 |
|---------|---------|------|
| 方案设计对用户行为有分歧 | 验证"用户到底会不会这样做" | 补充调研或推演分析 |
| 需求优先级需调整 | 重新评估排序 | 更新的需求矩阵 |
| 项目方向变化 | 新方向下的用户洞察 | 新的/修订的画像 |
| 上线后反馈与预期不符 | 分析反馈数据 | 修订版用户洞察 |

---

## 5 个质量陷阱（❌/✅ 对比）

❌ **自嗨陷阱**：基于 AI 自身理解编造画像，没有外部数据
✅ 强制搜索外部信息，不能纯靠"我觉得"。每个画像维度标注数据来源

❌ **单源陷阱**：仅依靠一篇文章或一个平台得出结论
✅ 遵守三角验证铁律。关键结论至少 2 个独立数据源

❌ **过度推演陷阱**：数据不足却给出过于具体和确定的结论
✅ 遵守假设标注铁律。降低置信度表述，用"可能""推测"而非"一定""显然"

❌ **时效陷阱**：用 3 年前的数据代表今天的用户
✅ 遵守时效声明铁律。优先使用近 1 年数据，>2 年数据标注"可能已过时"

❌ **幸存者偏差**：只看到发声用户的观点，忽略沉默大多数
✅ 主动声明"活跃用户的声音可能不代表全部"。寻找沉默用户的间接信号（流失数据、非活跃用户画像）

详细防范措施 → [references/checklists.md](references/checklists.md) §2

---

## 触发时首要动作

无论如何触发，第一步永远是：

> "在这个项目中，我们需要了解关于用户的什么？"

→ 明确研究问题 → 判断研究深度 → 选择采集手段组合 → 开始执行
