---
name: market-assessment
description: "Market assessment execution toolkit for AI-driven market feasibility analysis. Covers 5-step assessment workflow (scope → collect → analyze → judge → deliver), 6 capability domains (market sizing TAM/SAM/SOM, competitive landscape, trend & timing, opportunity & risk, differentiation positioning, commercial viability), 3 assessment depth levels (quick scan, standard, deep), source credibility 3-tier classification, and 3 output templates (market assessment report, competitive benchmarking table, quick scan summary). Includes quality assurance (4 iron rules, 9-item checklist, 5 common traps). Use when: (1) a new project needs market feasibility validation before committing resources, (2) sizing a market with TAM/SAM/SOM analysis, (3) analyzing competitive landscape and identifying differentiation opportunities, (4) evaluating market timing and trend alignment, (5) assessing opportunity attractiveness vs company fit, (6) conducting initial commercial viability check (business model + unit economics), (7) any education-domain market assessment (policy-driven, complex procurement, layered market), (8) responding to new competitor entry or policy changes mid-project. Triggers on: market assessment, market sizing, competitive analysis, market feasibility, TAM SAM SOM, competitive landscape, market timing, differentiation positioning, commercial viability."
---

# market-assessment — 市场评估执行工具箱

AI 市场评估专家的核心技能。覆盖从评估界定到结论交付的完整流程，为项目提供市场层面的现实校准。

## 模块速查

| # | 模块 | 何时用 | 详细位置 |
|---|------|--------|----------|
| 1 | 5 步评估流程 | 每次评估全程 | 本文 §评估流程 |
| 2 | 6 大能力域速查 | Step 3 按需选择分析维度 | 本文 §能力域速查 + [references/analysis-frameworks.md](references/analysis-frameworks.md) |
| 3 | 评估深度分级 | Step 1 判断投入量 | 本文 §评估深度速查 |
| 4 | 信息源可信度 | Step 2 选择信息源 | 本文 §信息源分级 |
| 5 | 输出物模板 | Step 5 组织交付物 | [references/templates.md](references/templates.md) |
| 6 | 质量自检清单 | 交付前 | [references/checklists.md](references/checklists.md) |
| 7 | 教育行业指南 | 教育项目评估时 | [references/education-market.md](references/education-market.md) |
| 8 | 联合工作模式 | 与用户研究专家协作时 | [references/joint-work-mode.md](references/joint-work-mode.md) |

---

## 5 步标准评估流程

```
Step 1：明确评估问题
  │  "这个项目需要我回答什么市场层面的问题？"
  │  → 评估类型：新市场进入 / 产品扩展 / 竞品响应 / 项目合理性验证
  │  → 确定评估深度（快速扫描 / 标准 / 深度）
  │  → 确定需要覆盖的能力域（不一定做全套）
  │  → 规划信息采集策略
  │
Step 2：信息采集
  │  → 搜索行业报告、政策文件、新闻、分析文章
  │  → 采集竞品信息（产品、口碑、商业动态）
  │  → 获取市场数据（规模、增速、结构）
  │  → 记录所有来源，标注时效（铁律1）
  │  → 先搜中文（国内实况）→ 再搜英文（全球视角）
  │  → 政策类直接搜政府网站
  │  → 数据不一致时取保守值或标注范围
  │
Step 3：结构化分析
  │  → 按评估深度选择分析维度（见 §能力域速查）
  │  → 市场规模与结构 → 竞争格局 → 趋势时机
  │  → 机会与风险 → 差异化方向 → 商业可行性
  │  → 每个维度严格区分事实/判断/假设（铁律2）
  │
Step 4：形成判断
  │  → 综合所有分析维度
  │  → 给出明确结论：做 / 不做 / 有条件做（铁律3）
  │  → 结论分层：确定性高的 vs 需进一步验证的
  │  → 证据不足时说"目前无法判断，因为___"（铁律4）
  │
Step 5：输出与传递
     → 按模板组织输出物 → references/templates.md
     → 传递给需求分析/方案设计/项目管理专家
     → 标注需后续跟踪的市场变化
     → 交付前跑质量自检清单 → references/checklists.md
```

---

## 评估深度速查

| 深度 | 适用场景 | 覆盖范围 | 输出物 |
|------|----------|----------|--------|
| **快速扫描** | 初步判断想法是否值得深入、功能级需求 | 粗略市场感知 + 主要竞品概览 | 1 页快速扫描摘要 |
| **标准评估** | 新功能/新模块开发、中等规模项目 | 市场规模 + 竞品分析 + 差异化建议 | 市场评估报告（标准版） |
| **深度评估** | 新产品/新业务线、战略级项目、重大投入决策 | 全 6 个能力域完整分析 | 市场评估报告（完整版）+ 竞品深度对标 |

判断不清时向上确认。

---

## 6 大能力域速查

### 域 1：市场规模与结构

**核心问题**：盘子有多大、怎么切的？

| 层次 | 回答的问题 | 方法 |
|------|-----------|------|
| **TAM（市场总量）** | 整体有多大？ | 行业报告、统计年鉴、上市公司财报 |
| **SAM（可触达）** | 以我们的能力能够到多大？ | 基于公司定位、渠道、产品形态裁剪 |
| **SOM（可争取）** | 现实能拿到多少？ | 基于竞争格局、资源投入、差异化程度 |
| **市场结构** | 怎么分层/分区？ | 按用户类型、地域、价格带、场景拆解 |

**关键原则**：
- 追求数量级正确，不追求精确 → "约 50 亿"比"52.3 亿"更诚实
- 标注数据来源和推算方法
- 比起绝对数字，更关注趋势方向（增长/萎缩/加速/放缓）

详细分析框架 → [references/analysis-frameworks.md](references/analysis-frameworks.md) §1

### 域 2：竞争格局

**核心问题**：谁在做、做得怎么样、我们跟他们有什么不同？

三层竞品：
- **直接竞品**：做同样的事、服务同样的人 → 头部/腰部/新进入者
- **间接竞品**：不同方式解决同一问题 → 替代方案
- **潜在竞品**：目前没做但有能力做 → 巨头切入风险

五维度分析：产品功能 | 价格 | 渠道 | 品牌口碑 | 技术资源

详细分析框架 + 信息采集矩阵 → [references/analysis-frameworks.md](references/analysis-frameworks.md) §2

### 域 3：趋势与时机

**核心问题**：风往哪吹、现在该不该上？

四层模型：
- **宏观趋势（3-5 年）**：政策、技术演进、社会变化、经济环境
- **行业趋势（1-3 年）**：热点、模式创新、标杆事件、资本流向
- **市场节奏（6-12 月）**：采购周期、政策窗口、竞品节奏
- **时机判断**：做早了的风险 vs 做晚了的代价 → 进入/加速/观望/退出

详细模型 → [references/analysis-frameworks.md](references/analysis-frameworks.md) §3

### 域 4：机会与风险

**核心问题**：值不值得投入、最怕什么？

机会评估：四象限模型（市场吸引力 × 自身适配度）
- 高吸引力 + 高适配 = ★核心机会，全力投入
- 高吸引力 + 低适配 = 值得争取，需补短板
- 低吸引力 + 高适配 = 防守型业务，维持不加码
- 低吸引力 + 低适配 = 放弃

风险评估：7 类风险（市场/竞争/政策/技术/渠道/执行/时机），每类评为致命/重大/可控

详细框架 + 7 类风险详表 → [references/analysis-frameworks.md](references/analysis-frameworks.md) §4 + [references/checklists.md](references/checklists.md) §3

### 域 5：差异化定位

**核心问题**：在竞争中我们应该成为什么？

三步法：
1. **绘制竞争地图** → 选 2 个最重要竞争维度为坐标轴，标注所有玩家，找空白区域
2. **评估空白区域** → 有无用户需求？（联动用户研究专家）我们有无能力？是否可持续？
3. **输出定位建议** → 一句话定位 + 1-3 个核心差异点 + 差异化支撑证据

详细步骤 → [references/analysis-frameworks.md](references/analysis-frameworks.md) §5

### 域 6：商业可行性初判

**核心问题**：能不能算过账？

商业模式草图检验 7 要素：价值主张 | 客户群体 | 收入模式 | 成本结构 | 渠道路径 | 竞争壁垒 | 单位经济

单位经济初判：CAC（获客成本） vs LTV（客户终身价值） → LTV > CAC？差多少？

⚠️ 这不是精确财务模型，是量级层面的合理性检验。

详细检验清单 → [references/analysis-frameworks.md](references/analysis-frameworks.md) §6

---

## 信息源可信度分级

| 等级 | 来源 | 处理方式 |
|------|------|----------|
| **一级（最可信）** | 政府统计、政策文件、上市公司财报/招股书、权威研究机构报告（艾瑞/IDC/Gartner）、学术论文 | 可直接引用 |
| **二级（较可信）** | 行业媒体报道、第三方分析师文章、行业会议分享、知名咨询公司公开报告 | 需交叉验证 |
| **三级（仅参考）** | 自媒体分析、论坛讨论、未验证行业传言、单一来源数据 | 不作为结论依据 |

**搜索策略**：
1. 先搜中文（国内市场实况） → 再搜英文（全球视角 + 方法论参考）
2. 政策类 → 直接搜政府网站
3. 竞品 → 综合官网、应用商店、新闻、用户评价
4. 市场数据 → 优先权威机构报告
5. 数据不一致 → 取保守值或标注范围

---

## 4 条质量铁律

| # | 铁律 | 核心要求 |
|---|------|----------|
| 1 | **数据溯源** | 每个市场数据必须标注来源和时间。不标来源的数字不允许出现。推算数字说明推算方法 |
| 2 | **区分事实与判断** | 市场数据=事实（标来源）；趋势分析=判断（标依据+置信度）；机会评估=观点（标推理链）。绝不把"我觉得"伪装成"数据显示" |
| 3 | **给结论不给信息堆** | 每次输出必须包含明确判断：做/不做/有条件做。无法判断则说清"缺什么信息才能判断" |
| 4 | **承认不知道** | 找不到数据就说找不到，不编造。"根据现有信息无法判断"是合格结论。主动标注信息盲区和置信度 |

---

## 教育行业注意事项速查

教育项目市场评估必须额外考虑：

- **强政策驱动**：教育政策直接塑造市场，政策分析是首要步骤。关注中央和地方两级（可能不同步）
- **复杂采购决策链**：B 端（学校/教育局）、C 端（家长）、G 端（政府项目）— 不同链条的市场规模和竞争格局完全不同
- **市场分层明显**：一线 vs 县镇、公立 vs 私立、K12 vs 高等 vs 职教 — 几乎是不同行业
- **周期性强**：预算年初定、学期制影响推广节奏、升学节点影响关注焦点
- **竞品分析特殊维度**：内容质量、教研能力、渠道关系、区域覆盖、合规性、教师接受度、数据积累

完整教育市场指南 → [references/education-market.md](references/education-market.md)

---

## 协作接口

### 输出物传递

| 接收方 | 传递内容 |
|--------|----------|
| 用户研究专家 | 市场规模数据、竞品满足同类需求情况、行业趋势对用户影响、竞品用户口碑 |
| 需求分析专家 | 市场可行性结论、竞品功能参考、差异化方向、优先级参考 |
| 方案设计专家 | 竞品设计参考、差异化要求、市场定位约束 |
| 流程设计专家 | 市场节奏、客户采购周期、推广渠道认知 |
| 项目管理专家 | 市场窗口期判断、竞品动态（影响优先级调整） |

### 回调机制

| 触发条件 | 回调内容 | 输出 |
|---------|---------|------|
| 出现新竞品或竞品重大更新 | 竞品动态快速评估 | 影响分析 + 是否调整方向 |
| 相关政策变化 | 政策影响评估 | 具体影响 + 建议 |
| 方案设计需要竞品参考 | 特定功能/设计的详细分析 | 针对性对标 |
| 项目范围变更 | 新范围下的市场可行性检验 | 更新后的评估 |
| 上线后表现不及预期 | 市场原因诊断 | 变化分析 + 调整建议 |

与用户研究专家的联合工作模式 → [references/joint-work-mode.md](references/joint-work-mode.md)

---

## 5 个质量陷阱（❌/✅ 对比）

❌ **乐观偏差**：只看到机会看不到风险，市场规模估计过于乐观
✅ 强制包含风险分析章节。数据取保守值。对 TAM 做 SAM/SOM 裁剪，不用 TAM 当市场机会

❌ **竞品低估**："他们做得不好所以我们有机会"— 但人家可能正在改进
✅ 关注竞品动态趋势，不只看当前状态。考虑竞品的资源储备和改进能力

❌ **数据过时**：用去年甚至前年的行业报告代表当前市场
✅ 所有数据标注时间。优先用最新数据。>2 年数据标注"可能已过时"

❌ **以偏概全**：基于一两篇文章就下宏观市场结论
✅ 多源交叉验证。标注来源数量。关键结论至少 2 个独立数据源

❌ **脱离自身**：分析了一堆市场数据，结论没考虑公司实际能力
✅ SAM 分析必须结合公司定位。差异化建议必须考虑公司实际能力和资源

详细防范措施 → [references/checklists.md](references/checklists.md) §2

---

## 触发时首要动作

无论如何触发，第一步永远是：

> "这个项目需要我回答什么市场层面的问题？"

→ 明确评估问题 → 判断评估深度 → 确定分析维度 → 规划采集策略 → 开始执行
