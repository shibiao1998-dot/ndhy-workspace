# Description 审计报告

> 审计人：🔧 Skill 开发专家 | 日期：2026-03-16
> 背景：Superpowers 调研发现，description 包含工作流描述会导致 Agent 走捷径跳过 SKILL.md 正文。description 应只回答"什么时候该用这个技能"（触发条件），不包含"怎么做"。

---

## 审计标准

**CSO 原则**（Claude Search Optimization）：
- ✅ description 只含触发条件（什么时候用）
- ❌ description 含工作流/步骤描述（怎么用）
- ❌ description 含内部结构说明（有什么）
- 长度建议 ≤ 3 行（约 50-150 词）

**问题分级**：
- 🔴 严重：description 包含完整工作流/步骤，Agent 大概率跳过正文
- 🟡 中等：description 包含部分内部结构描述，存在跳过正文风险
- 🟢 合格：description 只含触发条件，不暴露工作流

---

## 审计结果总览

| 分级 | 数量 | 占比 |
|------|------|------|
| 🔴 严重 | 18 | 38% |
| 🟡 中等 | 13 | 27% |
| 🟢 合格 | 17 | 35% |
| **总计** | **48** | 100% |

> 注：只审计 workspace/skills/ 下的技能 + system-level 技能（skill-creator, coding-agent 等）。飞书相关技能因属于外部插件不在此次审计范围。

---

## 🔴 严重问题（18 个）— description 暴露工作流/步骤

### 1. api-design

**当前 description**：
> API接口契约设计执行工具箱:将业务能力和系统边界转化为稳定清晰可扩展可联调可验证的接口契约。 覆盖9步标准流程,10大能力方向,3级深度分级,4层职责边界,6条反模式防范,合格接口契约检查清单。 Use when: (1) 需要从需求中抽取资源与能力边界, ... (11) 用户提到API设计...

**问题诊断**：暴露了"9步标准流程、10大能力方向、3级深度分级"等工作流结构。Agent 看到这些数字后可能直接在心中构建简化版流程，跳过 SKILL.md 正文。

**建议的新 description**：
> Use when 需要设计 API 接口契约、资源模型、错误码、分页规范，或审查接口一致性和向后兼容性。触发词：API设计、接口契约、OpenAPI、资源模型、错误码、mock契约。

---

### 2. backend-development

**当前 description**：
> 后端服务实现执行工具箱：在既定的数据模型、接口契约、架构约束下...覆盖9步标准流程...13大能力方向...3级深度分级...5层深度边界...标准输出物为实现交付包（6文档+代码）...包含10条反模式防范...

**问题诊断**：暴露"9步标准流程、13大能力方向、3级深度、6文档+代码"等内部结构。极高跳过风险。

**建议的新 description**：
> Use when 需要实现后端 handler/service/repository 层、添加输入校验/权限控制/错误处理，或编写后端测试。触发词：后端开发、服务实现、handler、controller、repository。

---

### 3. code-review

**当前 description**：
> 代码审查执行工具箱：对实现代码进行系统性审查...覆盖8步标准流程...12大审查方向...3级审查深度...5层深度边界...4级问题分级...标准输出物为审查交付包（6文档）...包含8条反模式防范...

**问题诊断**：同上模式，暴露了完整工作流骨架。

**建议的新 description**：
> Use when 需要对代码变更进行系统性审查，检查正确性、契约一致性、安全和性能风险，或生成放行决策。触发词：代码审查、code review、审查报告、放行决策。

---

### 4. competitive-analysis

**当前 description**：
> 竞品调研与分析全流程操作手册：从明确调研目的到输出高质量竞品分析报告。包含 6 步调研 SOP、4 圈信息来源地图、7 个分析框架工具箱和 7 模块报告结构模板。

**问题诊断**：暴露"6步SOP、4圈信息源、7个框架、7模块"等内部结构。

**建议的新 description**：
> Use when 需要竞品调研、竞争格局分析、产品对比，或输出竞品分析报告。触发词：竞品、竞争对手、市场调研、行业分析、产品对比。

---

### 5. data-analysis

**当前 description**：
> 数据分析执行工具箱：将业务问题转化为数据问题...覆盖6步标准流程，7大能力域，14种分析方法，3级深度分级，6条铁律。含教育行业特殊分析模型。

**问题诊断**：暴露"6步流程、14种方法、3级深度、6条铁律"。

**建议的新 description**：
> Use when 需要数据分析、指标体系设计、A/B测试、埋点规划、分析报告或数据看板。含教育行业专项分析。触发词：数据分析、北极星指标、漏斗分析、留存分析、归因分析。

---

### 6. database-design

**当前 description**：
> 数据库设计执行工具箱：将业务需求转化为稳定、可扩展...覆盖9步标准流程，12大能力方向，3级深度分级，4层深度边界。含9条反模式防范...

**问题诊断**：暴露"9步流程、12大能力、4层边界、9条反模式"。

**建议的新 description**：
> Use when 需要数据库设计、数据建模、表结构设计，或审查 schema 质量。触发词：数据库设计、数据建模、表结构、字段设计、schema、索引策略。

---

### 7. deployment-ops

**当前 description**：
> 部署运维执行工具箱：将交付物安全、可控、可观测地部署到目标环境...覆盖9步标准流程，3级深度分级，12大能力方向，含反模式防范...

**问题诊断**：暴露"9步流程、12大能力方向"。

**建议的新 description**：
> Use when 需要部署发布、运维监控、回滚操作，或执行发布前检查。触发词：部署、发布、上线、运维、回滚、监控告警、发布检查。

---

### 8. design-to-code-prototype

**当前 description**：
> 设计到代码原型执行工具箱...采用 Code-First 工作流...覆盖5步标准流程，4大能力域，3级深度分级。包含原型代码标准、输出规范、评审流程、质量自检清单和常见页面模板。

**问题诊断**：暴露"5步流程、4大能力域、Code-First工作流"。

**建议的新 description**：
> Use when 需要将设计规范转化为可预览的 HTML/CSS 原型代码，或为评审生成可交互页面预览。触发词：原型、prototype、HTML原型、设计转代码、页面预览。

---

### 9. experience-design

**当前 description**：
> 体验设计执行工具箱：将产品定义转化为用户可感知的使用体验。覆盖8步标准流程，7大能力域，3级深度分级，标准输出物为体验设计文档（7章节）。

**问题诊断**：暴露"8步流程、7大能力域、7章节"。

**建议的新 description**：
> Use when 产品定义已完成、需要设计用户体验，包括信息架构、交互模式、体验语言和页面布局。触发词：体验设计、信息架构、交互模式、体验地图、可用性。

---

### 10. frontend-development

**当前 description**：
> 前端开发执行工具箱...覆盖9步标准流程...13大能力方向...3级深度分级...5层深度边界...标准输出物为前端实现交付包（6文档+代码）...包含10条反模式防范...

**问题诊断**：与 backend-development 同模式，暴露完整内部结构。

**建议的新 description**：
> Use when 需要实现前端页面、组件拆分、状态管理、API接入，或编写组件测试。触发词：前端开发、页面实现、组件拆分、状态管理、表单、列表。

---

### 11. growth-operations

**当前 description**：
> 增长运营执行工具箱：将产品定义转化为可持续的用户增长和运营体系。覆盖6步标准流程，7大能力域，3级深度分级，5条铁律。含教育增长飞轮...

**问题诊断**：暴露"6步流程、7大能力域、5条铁律"。

**建议的新 description**：
> Use when 需要增长运营策略、用户获取/激活/留存方案，或增长实验设计。触发词：增长运营、AARRR、用户获取、用户留存、增长实验、增长飞轮。

---

### 12. integration-testing

**当前 description**：
> 联调集成执行工具箱...覆盖8步标准流程...12大能力方向...3级联调深度...5层深度边界...归因决策树...标准输出物为联调交付包（6文档）...包含8条反模式防范...

**问题诊断**：暴露完整工作流骨架。

**建议的新 description**：
> Use when 需要前后端联调、端到端验证、契约对齐、集成问题归因，或判断是否可进入下一阶段。触发词：联调、集成测试、端到端验证、契约对齐。

---

### 13. iteration-optimization

**当前 description**：
> 迭代优化执行工具箱...覆盖五阶段迭代循环，优先级排序框架（ABCD+ICE），4源改进信号，MVP与渐进式交付...含10条反模式防范、迭代检查清单。

**问题诊断**：暴露"五阶段循环、ABCD+ICE框架、4源信号"等内部工具。

**建议的新 description**：
> Use when 需要迭代优化、版本规划、需求优先级排序、MVP拆解，或迭代复盘。触发词：迭代优化、优先级排序、版本规划、MVP拆解、迭代复盘。

---

### 14. quality-testing

**当前 description**：
> 质量测试执行工具箱：基于需求、设计、实现和联调结果...覆盖9步标准流程...12大能力方向...3级深度分级...6层深度边界...标准输出物为测试交付包（7文档）...包含9条反模式防范...缺陷分级框架(P0-P3)...

**问题诊断**：暴露"9步流程、12大能力方向、7文档"等完整骨架。

**建议的新 description**：
> Use when 需要制定测试策略、设计测试用例、记录缺陷、回归验证，或评估发布风险和验收结论。触发词：测试、测试用例、缺陷、回归、发布风险、验收。

---

### 15. release-strategy

**当前 description**：
> 发布策略执行工具箱：设计产品从'开发完成'到'用户成功用起来'的全过程策略。覆盖9步标准流程，8大能力域，3级深度分级，含6条铁律...

**问题诊断**：暴露"9步流程、8大能力域、6条铁律"。

**建议的新 description**：
> Use when 需要发布策略、灰度发布方案、用户培训计划、数据迁移，或发布复盘。触发词：发布策略、灰度发布、版本规划、变更管理、hotfix。

---

### 16. page-layout-design

**当前 description**：
> 页面布局设计执行工具箱：从需求分析到响应式适配的完整布局设计方法论。覆盖7步标准流程，6大能力域，3级深度分级。包含栅格系统、断点策略、布局模式库...

**问题诊断**：暴露"7步流程、6大能力域"和内部组件列表。

**建议的新 description**：
> Use when 需要设计页面布局、栅格系统、响应式适配，或处理视觉层级和留白策略。触发词：页面布局、栅格系统、响应式、断点、布局模式。

---

### 17. product-definition

**当前 description**：
> 产品定义执行工具箱：将战略定位转化为具体可执行的产品蓝图。覆盖8步标准流程，6大能力域，3级深度分级，标准输出物为产品定义文档（6章节）。

**问题诊断**：暴露"8步流程、6大能力域、6章节"。

**建议的新 description**：
> Use when 战略定位已完成、需要转化为具体产品定义，包括产品概念、场景、功能范围、MVP和成功标准。触发词：产品定义、产品概念、功能范围、MVP、产品蓝图。

---

### 18. project-execution

**当前 description**：
> Project execution operations manual for AI project managers... Covers the full lifecycle: project status archive creation, instruction pack assembly (5-layer structure + 5 techniques), dispatch decision trees (readiness check, serial vs parallel, dependency conflicts), two-layer quality inspection (form + content), 6-type exception handling...

**问题诊断**：暴露了完整工作流内部结构：5层指令包、调度决策树、两层质检、6种异常处理。Agent 看到这些后可能跳过正文直接按骨架执行。

**建议的新 description**：
> Use when 管理多节点项目执行：组装指令包、调度子Agent、质量检查、异常处理、进度报告或复盘。触发词：项目执行、指令包、调度、质量检查、异常处理、复盘。

---

## 🟡 中等问题（13 个）— description 包含部分内部结构

### 19. requirement-mining

**当前 description**：
> 需求挖掘全流程操作手册：从接收模糊需求到输出结构化需求文档。包含 10 维扫描清单、7 大深层挖掘技法、5 轮迭代对话模型和引导技巧集。

**问题诊断**：暴露了"10维扫描、7大技法、5轮模型"等内部工具名称。虽然触发条件清晰，但内部结构暴露可能导致 Agent 自行构建简化版而跳过正文。

**建议的新 description**：
> Use when 收到模糊需求需要系统性挖掘，用户描述不清需要提问澄清，或需要输出结构化需求文档。触发词：需求、想做、能不能做、我有个想法、帮我分析。

---

### 20. process-design

**当前 description**：
> 流程设计全流程操作手册：从方案产出物分析到输出完整的专家角色清单、协作拓扑和执行流程。包含 5 项核心能力模型...7 步工作方法论、6 个领域角色池和 6 条关键约束。

**问题诊断**：暴露了"5项能力模型、7步方法论、6个角色池"。

**建议的新 description**：
> Use when 方案已确定、需要拆解执行所需的专家角色、协作关系和执行流程。触发词：流程设计、角色拆解、谁来做、怎么配合、团队组建。

---

### 21. role-creation

**当前 description**：
> 专家角色创造全流程操作手册：从专家池匹配到创造完整角色设定...包含 5 步工作流程、3 维匹配判断、7 模块设定结构、质量检查清单和专家池管理。

**问题诊断**：暴露了"5步流程、3维匹配、7模块结构"。

**建议的新 description**：
> Use when 需要匹配或创造专家角色、编写角色设定（SOUL.md + STANDARDS.md），或组建项目团队。触发词：创造角色、角色设定、专家池匹配、SOUL.md。

---

### 22. leader-workflow

**当前 description**：
> Leader 核心工作流操作手册：需求验证、流程设计、任务定义、执行调度、质量验收、自省改进的完整操作流程。Use when: (1)...

**问题诊断**：第一句暴露了完整工作流步骤链（需求验证→流程设计→任务定义→执行调度→质量验收→自省改进）。触发条件部分合格，但前缀泄漏了工作流骨架。

**建议的新 description**：
> Use when: (1) 收到新需求需要验证和调度, (2) 需要判断需求规模选择调度模式, (3) 需要 spawn 子 Agent 执行任务, (4) 需要对产出进行分级验收, (5) 需要自省复盘. NOT for: 日常沟通、记忆管理、心跳运维、代码审查流程。

---

### 23. expert-leveling

**当前 description**：
> AI 专家等级评估与晋升管理。覆盖产出评估记录、综合等级计算、晋升提案生成、设定进化执行。

**问题诊断**：第二句暴露了 4 个流程模块名称。触发条件清晰，但内部结构部分暴露。

**建议的新 description**：
> Use when 任务完成后需要记录专家产出评估、执行月度评审、生成晋升提案，或更新专家设定文件。触发词：评估、晋升、等级、评审、P0-P12、胜任力。

---

### 24. skillforge

**当前 description**：
> Systematic 7-step Skill generation engine and 3-step fix pipeline with 10-dimension quality audit...

**问题诊断**：暴露了"7步生成、3步修正、10维度审计"等内部流水线结构。

**建议的新 description**：
> Use when creating skills systematically from scratch, fixing/improving existing skills with rigorous quality audit, or when skill-creator's base spec needs advanced generation capabilities. Triggers: "forge a skill", "generate skill systematically", "fix this skill", "audit skill quality".

---

### 25. education-domain

**当前 description**：
> 教育领域深度专业知识工具箱：为教育产品设计和开发提供 K12 教育理论、学习心理学、 教学设计、学科教学法、实验教学、教育政策、教育技术、学习目标、教育评价 9 大能力域的专业支撑。

**问题诊断**：暴露了"9大能力域"的完整列表。但这些更多是主题分类而非工作流步骤，风险中等。

**建议的新 description**：
> Use when 教育产品设计需要专业知识支撑：教育理论、学习心理学、教学设计、学科教学法、教育政策、教育评价等。触发词：教育理论、建构主义、布鲁姆、新课标、双减、AI教育。

---

### 26. context-management

**当前 description**：
> Context window and memory management for NDHY AI Agent Team. Use when: (1) context usage exceeds ~60%... (2) capturing learning signals... (3) evaluating pattern promotion (3x confirmation → rule) or demotion (30-day unused → archive)... (4) managing MEMORY.md entries.

**问题诊断**：暴露了"3x confirmation → rule"和"30-day unused → archive"等内部规则。

**建议的新 description**：
> Use when 上下文使用率偏高需要压缩、需要捕获学习信号写入记忆、或需要管理 MEMORY.md 条目的晋升/降级。NOT for: 常规对话或任务执行。

---

### 27. search-layer

**当前 description**：
> DEFAULT search tool for ALL search/lookup needs. Multi-source search and deduplication layer with intent-aware scoring. Integrates Brave Search (web_search), Exa, Tavily, and Grok...

**问题诊断**：暴露了内部实现（具体集成哪些搜索源）。Agent 可能跳过正文直接按描述的搜索源分发。

**建议的新 description**：
> DEFAULT search tool for ALL web search and lookup needs. Use instead of raw web_search for any factual lookup, research, news, comparison, or "what is X" query. Provides multi-source high-coverage results with deduplication.

---

### 28. content-extract

**当前 description**：
> Robust URL-to-Markdown extraction... Uses a cheap probe via web_fetch first, then falls back to the official MinerU API...

**问题诊断**：暴露了内部实现策略（probe → fallback 路径）。

**建议的新 description**：
> Use when extracting/summarizing/converting a webpage to markdown, especially for blocked or messy pages (e.g., mp.weixin.qq.com). Returns traceable markdown with source links.

---

### 29. market-assessment

**当前 description**：
> 市场评估执行工具箱：覆盖从评估界定到结论交付的完整流程...覆盖5步评估流程，6大能力域，3级深度分级，3级信息源可信度分类。

**问题诊断**：暴露"5步流程、6大能力域、3级深度"。

**建议的新 description**：
> Use when 新项目需要市场可行性验证、TAM/SAM/SOM 市场规模分析、竞争格局评估，或商业可行性初判。触发词：市场评估、market sizing、competitive landscape。

---

### 30. project-management

**当前 description**：
> Project management for NDHY AI Agent Team. Use when: (1) creating or updating PROJECT.md, (2) managing task tracking with Task Ledger format, (3) compressing PROJECT.md over 80 lines, (4) decomposing large requirements into three-level structure (requirement → module → subtask), (5) managing project folders and naming conventions.

**问题诊断**：暴露了"Task Ledger format"和"三级结构(requirement → module → subtask)"等内部方法论。

**建议的新 description**：
> Use when 创建或更新 PROJECT.md、管理任务状态跟踪、分解大需求为子任务，或管理项目文件结构。NOT for: 简单文件编辑或非项目任务。

---

### 31. heartbeat-ops

**当前 description**：
> Heartbeat monitoring, anomaly recovery, and daily closing operations... Use when: (1) processing heartbeat events, (2) monitoring sub-agent health... (3) performing anomaly recovery (probe → restart → escalate), (4) executing daily closing routine (git backup, memory rules, capability gaps).

**问题诊断**：暴露了"probe → restart → escalate"异常恢复路径和"git backup, memory rules, capability gaps"日终流程。

**建议的新 description**：
> Use when 处理心跳事件、监控子Agent健康状态、执行异常恢复，或执行日终收尾操作。NOT for: 常规任务执行。

---

## 🟢 合格（17 个）— description 只含触发条件

以下技能的 description 符合 CSO 原则，无需修改或只需微调：

| # | 技能名 | 评估 |
|---|--------|------|
| 32 | skill-creator | ✅ 合格。描述了什么时候用，没有暴露内部结构 |
| 33 | coding-agent | ✅ 合格。清晰的 Use when / NOT for 边界 |
| 34 | github | ✅ 合格 |
| 35 | gh-issues | ✅ 合格（含命令参数但属于使用接口） |
| 36 | weather | ✅ 合格 |
| 37 | session-logs | ✅ 合格 |
| 38 | clawhub | ✅ 合格 |
| 39 | healthcheck | ✅ 合格 |
| 40 | code-quality-gate | ✅ 合格。触发条件清晰，无工作流暴露 |
| 41 | find-skills | ✅ 合格 |
| 42 | skill-vetter | ✅ 合格 |
| 43 | Agent Browser | ✅ 合格 |
| 44 | claude-best-practices | ✅ 合格 |
| 45 | react-best-practices | ✅ 合格 |
| 46 | relay-protocol | ✅ 合格 |
| 47 | web-fetch | 🔍 需确认（未在 available_skills 中列出，可能是工具级） |
| 48 | web-search | 🔍 需确认（同上） |

---

## 修改建议汇总

### 统一模式

所有 description 应遵循以下模式：

```
Use when [触发条件 1-5 个，用逗号或编号分隔]。
触发词：[关键词列表]。
NOT for: [排除条件]（可选）。
```

### 批量修改清单

| 优先级 | 技能 | 当前长度(估) | 建议长度(估) | 压缩比 |
|--------|------|-------------|-------------|--------|
| 🔴 P0 | api-design | ~280 词 | ~40 词 | 86% |
| 🔴 P0 | backend-development | ~300 词 | ~35 词 | 88% |
| 🔴 P0 | frontend-development | ~300 词 | ~35 词 | 88% |
| 🔴 P0 | code-review | ~280 词 | ~35 词 | 88% |
| 🔴 P0 | quality-testing | ~290 词 | ~35 词 | 88% |
| 🔴 P0 | integration-testing | ~300 词 | ~35 词 | 88% |
| 🔴 P0 | database-design | ~250 词 | ~35 词 | 86% |
| 🔴 P0 | deployment-ops | ~250 词 | ~30 词 | 88% |
| 🔴 P0 | project-execution | ~200 词 | ~35 词 | 83% |
| 🔴 P0 | competitive-analysis | ~200 词 | ~30 词 | 85% |
| 🔴 P0 | data-analysis | ~200 词 | ~35 词 | 83% |
| 🔴 P0 | growth-operations | ~200 词 | ~30 词 | 85% |
| 🔴 P0 | iteration-optimization | ~200 词 | ~30 词 | 85% |
| 🔴 P0 | release-strategy | ~200 词 | ~30 词 | 85% |
| 🔴 P0 | experience-design | ~180 词 | ~30 词 | 83% |
| 🔴 P0 | product-definition | ~180 词 | ~30 词 | 83% |
| 🔴 P0 | page-layout-design | ~200 词 | ~30 词 | 85% |
| 🔴 P0 | design-to-code-prototype | ~200 词 | ~30 词 | 85% |
| 🟡 P1 | requirement-mining | ~150 词 | ~35 词 | 77% |
| 🟡 P1 | process-design | ~150 词 | ~30 词 | 80% |
| 🟡 P1 | role-creation | ~150 词 | ~30 词 | 80% |
| 🟡 P1 | leader-workflow | ~120 词 | ~50 词 | 58% |
| 🟡 P1 | expert-leveling | ~100 词 | ~40 词 | 60% |
| 🟡 P1 | skillforge | ~80 词 | ~40 词 | 50% |
| 🟡 P1 | education-domain | ~120 词 | ~40 词 | 67% |
| 🟡 P1 | context-management | ~80 词 | ~40 词 | 50% |
| 🟡 P1 | search-layer | ~60 词 | ~35 词 | 42% |
| 🟡 P1 | content-extract | ~60 词 | ~30 词 | 50% |
| 🟡 P1 | market-assessment | ~100 词 | ~35 词 | 65% |
| 🟡 P1 | project-management | ~80 词 | ~35 词 | 56% |
| 🟡 P1 | heartbeat-ops | ~80 词 | ~30 词 | 63% |

### 预估 Token 节省

批量修改后，available_skills 列表的总 token 占用预计从 ~4,500 token 减少到 ~1,800 token，**节省约 60%**。这些 token 可以让 system prompt 腾出空间给更重要的上下文。

---

## 附：共性反模式

审计中发现的 description 反模式：

| 反模式 | 出现次数 | 说明 |
|--------|---------|------|
| **"覆盖X步标准流程"** | 14 | 暴露工作流步骤数 |
| **"X大能力方向/能力域"** | 13 | 暴露内部模块结构 |
| **"X级深度分级"** | 12 | 暴露分级体系 |
| **"标准输出物为XX（N文档）"** | 6 | 暴露交付物结构 |
| **"含X条反模式防范"** | 8 | 暴露防护措施数量 |
| **"XX执行工具箱"** | 15 | 统一前缀但无触发价值 |

**最大的系统性问题**："XX执行工具箱：[做什么]。覆盖X步标准流程，X大能力方向..."——这个模式在 15 个技能中重复出现，是一个批量模板导致的系统性问题。修正时可批量替换。

---

> ⚠️ 本报告为审计建议，所有修改需 Leader 确认后执行。
