# Superpowers 框架深度调研 + 与 NDHY Skill 体系对比分析

> 调研人：🔬 技术调研专家 | 日期：2026-03-16 | 信息截止：同日

---

## 一、Superpowers 框架全面解析

### 1.1 基本信息

| 指标 | 数据 |
|------|------|
| 仓库 | [obra/superpowers](https://github.com/obra/superpowers) |
| 作者 | Jesse Vincent（obra），Perl/开源界知名开发者，Keyboardio 创始人 |
| Stars | ~82K（2026年3月中旬，1月中旬曾连续4天日增1400+） |
| Forks | ~6,400 |
| 当前版本 | v5.0.2（2026-03-11） |
| 许可证 | MIT |
| 定位 | **编码 Agent 的软件开发工作流框架 + 可组合技能系统** |

### 1.2 核心理念

Superpowers 的一句话定义：**"A complete software development workflow for your coding agents, built on top of a set of composable skills and some initial instructions that make sure your agent uses them."**

三个核心信条：
1. **先设计后编码（Design Before Code）**：Agent 不能直接写代码，必须先 brainstorm → 写 spec → 人类批准 → 写 plan → 再实现
2. **TDD 铁律（Test-Driven Development）**：RED-GREEN-REFACTOR，先写失败测试再写代码，无例外
3. **Subagent 隔离执行**：每个任务派一个全新 subagent，上下文隔离，两阶段审查（spec compliance + code quality）

### 1.3 技能文件结构

Superpowers 遵循 **Anthropic AgentSkills 开放规范**（agentskills.io），文件结构：

```
skills/
  skill-name/
    SKILL.md              # 入口文件（必须）
    supporting-file.*     # 辅助文件（按需）
    scripts/              # 可执行脚本（按需）
    references/           # 参考文档（按需）
```

**SKILL.md 格式**：
```yaml
---
name: brainstorming          # 仅支持小写字母+数字+连字符
description: "Use when..."    # 描述触发条件，≤1024 字符
---
# Skill Name
## Overview / When to Use / Core Pattern / ...
```

关键设计决策：
- **Frontmatter 只有 `name` + `description`**（Anthropic 规范额外支持 `license`、`compatibility`、`metadata`、`allowed-tools`）
- **Description 只写触发条件，不写工作流摘要**——实测发现如果 description 包含工作流描述，Claude 会走捷径跳过完整 SKILL.md 内容
- **Flat namespace**：所有 skill 在同一层级，不分子目录
- **大量使用 Graphviz dot 流程图**：关键流程用 `digraph` 编码，比纯文字更不容易被跳过
- **Token 效率极端关注**：getting-started 类 <150 词，常用 skill <200 词，其他 <500 词

### 1.4 工作流（软件开发方法论）

Superpowers 定义了一条**强制的开发管线**（不是建议，是必须）：

```
brainstorming → using-git-worktrees → writing-plans → subagent-driven-development → test-driven-development → requesting-code-review → finishing-a-development-branch
```

**核心技能清单（15 个）**：

| 类别 | 技能 | 作用 |
|------|------|------|
| **开发流程** | brainstorming | 苏格拉底式设计精炼，含可视化 companion |
| | writing-plans | 将设计拆成 2-5 分钟的小任务，含文件路径和验证步骤 |
| | subagent-driven-development | 每任务一个 subagent + 两阶段审查 |
| | executing-plans | 不支持 subagent 的平台降级方案 |
| | dispatching-parallel-agents | 并行 subagent 调度 |
| **工程实践** | test-driven-development | RED-GREEN-REFACTOR，含反模式参考 |
| | systematic-debugging | 四阶段根因分析 |
| | verification-before-completion | 确保真正修复 |
| **协作** | requesting-code-review | 提交审查前的检查清单 |
| | receiving-code-review | 如何响应审查反馈 |
| | using-git-worktrees | 并行开发分支管理 |
| | finishing-a-development-branch | 合并/PR/保留/丢弃决策 |
| **元** | writing-skills | TDD 方式创建技能 |
| | using-superpowers | 技能系统引导 |

### 1.5 与 AgentSkills 生态的关系

- **Superpowers 是 AgentSkills 规范的最大实践者**。AgentSkills 是 Anthropic 发起的开放标准（agentskills.io），已被 20+ 平台采纳（Claude Code, Cursor, Codex, Gemini CLI, VS Code Copilot, JetBrains Junie, OpenHands...）
- v5.0.1 版本明确将目录结构对齐 agentskills.io 规范（brainstorm-server 从 `lib/` 移入 `skills/brainstorming/scripts/`）
- Superpowers 跨平台：支持 Claude Code（官方插件市场）、Cursor、Codex、OpenCode、Gemini CLI

### 1.6 为什么 82K Stars？

基于社区反馈和分析，核心吸引力：

1. **解决了 Agent "直接写代码"的致命问题**：不 brainstorm、不测试、跳过设计的 Agent 产出质量很差。Superpowers 用强制工作流解决这个痛点
2. **Subagent 隔离 + 两阶段审查是杀手级设计**：比 Agent 自己边做边审效果好一个量级
3. **完全开源 + 跨平台**：MIT 许可，不锁定特定 Agent
4. **Jesse Vincent 的个人影响力**：Perl 社区 + Keyboardio + 技术写作建立的信誉
5. **时机好**：2025年10月 Claude Code 刚推出插件系统，Superpowers 是第一个成熟的插件
6. **TDD for Skills 理念新颖**：用压力测试验证技能有效性，Cialdini 说服原理应用于 LLM

---

## 二、与 NDHY Skill 体系深度对比

### 2.1 文件结构对比

| 维度 | Superpowers / AgentSkills 规范 | NDHY（OpenClaw Skills） |
|------|------|------|
| **入口文件** | `SKILL.md`（YAML frontmatter + Markdown） | `SKILL.md`（纯 Markdown，元数据在外部配置） |
| **Frontmatter** | `name` + `description`（YAML，在文件内） | 无 frontmatter，`description` 在 `available_skills` 外部配置 |
| **辅助目录** | `scripts/` + `references/` + `assets/` | `references/` + `scripts/` |
| **命名规范** | 小写+连字符，≤64字符 | 无强制命名规范 |
| **Token 预算** | 明确量化（<150/200/500 词） | 无明确预算 |
| **流程图** | Graphviz dot 格式内嵌 | 未使用 |

### 2.2 技能发现与加载机制

| 维度 | Superpowers | NDHY |
|------|-------------|------|
| **发现方式** | Session 启动时加载 `using-superpowers`，教会 Agent 查技能；Claude Code 通过 `Skill` tool 调用 | `available_skills` 列表注入 system prompt，Agent 匹配 description |
| **加载触发** | Agent 自主判断 + "1% 可能性就必须调用" 强制规则 | Agent 匹配 description → `read` SKILL.md |
| **强制性** | 极强——EXTREMELY-IMPORTANT 标记，反"合理化"规则表 | 中等——"技能优先" 原则但无防合理化机制 |
| **CSO（搜索优化）** | 体系化——description 只写触发条件，不写工作流；关键词覆盖策略 | 无体系化 CSO，description 风格不统一 |

### 2.3 可组合性

| 维度 | Superpowers | NDHY |
|------|-------------|------|
| **技能间引用** | `superpowers:skill-name` 格式，显式 `REQUIRED SUB-SKILL` / `REQUIRED BACKGROUND` 标记 | 无标准引用格式 |
| **管线编排** | 固定管线（brainstorm→plan→implement→review→finish），技能之间硬连接 | 由 Leader 动态编排，技能独立 |
| **上下文传递** | 上游技能生成 docs 文件（spec, plan），下游读文件 | 通过指令包 + 文件路径传递 |

### 2.4 与不同 Agent 框架的兼容性

| 平台 | Superpowers | NDHY |
|------|-------------|------|
| Claude Code | ✅ 官方插件市场 | ✅ 通过 ACP |
| Cursor | ✅ 插件市场 | ❌ |
| Codex | ✅ 手动安装 | ✅ 通过 ACP |
| Gemini CLI | ✅ 原生扩展 | ❌ |
| OpenCode | ✅ 手动安装 | ❌ |
| OpenClaw | ❌ | ✅ 原生 |

### 2.5 我们缺什么？他们缺什么？

**我们缺的（可从 Superpowers 借鉴）**：

| 缺失 | 影响 | 优先级 |
|------|------|--------|
| **Description 的 CSO 优化**——防止 Agent 走捷径 | 技能可能被错误跳过或简化执行 | 🔴 高 |
| **防合理化机制**——"1% 就必须调用" + 反合理化规则表 | Agent 在时间压力下跳过技能 | 🔴 高 |
| **Token 预算规范** | 技能过长浪费上下文 | 🟡 中 |
| **Graphviz 流程图**用于关键决策流程 | 纯文字指令容易被跳过或简化 | 🟡 中 |
| **跨平台兼容**（AgentSkills 规范对齐） | 仅在 OpenClaw 生态内可用 | 🟡 中 |
| **TDD for Skills**（压力测试技能有效性） | 技能写完不知道是否真的有效 | 🟡 中 |
| **标准化技能间引用格式** | 技能组合困难 | 🟢 低 |

**他们缺的（我们的优势）**：

| 优势 | 说明 |
|------|------|
| **多角色协作体系** | Superpowers 只有 1 人 + 1 Agent；我们有 1 人 + 28 AI 专家，角色有 SOUL.md + STANDARDS.md |
| **覆盖全产品链路** | Superpowers 只覆盖编码工作流；我们覆盖需求→设计→开发→测试→部署全链路（55+ 技能） |
| **Leader 调度层** | 我们有 Leader 做需求分诊、执行拓扑、指令包组装；Superpowers 没有这层 |
| **记忆系统** | MEMORY.md + 每日记忆 + 项目级 PROJECT.md；Superpowers 无记忆机制 |
| **非编码领域技能** | 竞品分析、市场评估、数据分析、增长运营等；Superpowers 纯编码 |
| **动态 available_skills 列表** | 按需加载，不固定管线；Superpowers 的管线固定 |

---

## 三、可借鉴的模式 + 具体改进建议

### 3.1 高优先级借鉴（建议立即实施）

#### ① Description 优化规范（CSO）

**Superpowers 发现**：description 如果包含工作流摘要，Agent 会走捷径——跟着 description 做，跳过 SKILL.md 正文。

**改进方案**：
- description 只写**触发条件**（"Use when..."），不写工作流
- 审计现有 55+ 技能的 description，剥离工作流描述
- 在 skill-creator 技能中增加此规范

```yaml
# ❌ 当前风格（部分技能）
description: "代码审查执行工具箱：对实现代码进行系统性审查，识别正确性、契约一致性..."

# ✅ 优化后
description: "Use when 需要对代码变更进行系统性审查，发现代码质量问题，或给出放行决策"
```

#### ② 反合理化机制

**Superpowers 的 using-superpowers 技能**包含一张"红旗"表，列出 Agent 常见的合理化借口和正确回应。

**改进方案**：在 AGENTS.md 的"技能优先"规则中增加类似机制：

| Agent 内心独白 | 正确做法 |
|----------------|---------|
| "这个任务很简单不需要技能" | 简单任务更容易出错。查技能。 |
| "我先看看代码再说" | 技能告诉你怎么看。先查。 |
| "我记得这个技能的内容" | 技能会更新。读当前版本。 |
| "时间紧，直接做" | 不用技能返工更浪费时间。 |

#### ③ Graphviz 流程图用于关键决策

**Superpowers 发现**：Agent 对 dot 格式流程图的遵循度远高于纯文字指令——因为流程图明确了决策分支和终止条件。

**改进方案**：对复杂流程技能（如 leader-workflow、code-review、quality-testing）的关键决策流程增加 Graphviz dot 图。

### 3.2 中优先级借鉴（下一迭代实施）

#### ④ Token 预算规范

为 SKILL.md 设定 Token 预算：
- 始终加载的技能（如 leader-workflow）：<200 词核心指令
- 常用技能：SKILL.md 主体 <500 词
- 详细操作放 `references/`

#### ⑤ AgentSkills 规范对齐

我们的 SKILL.md 目前没有 YAML frontmatter。对齐 agentskills.io 规范可以：
- 让我们的技能在 20+ 支持 AgentSkills 的平台上可用
- 让 Superpowers 社区的技能可直接引入

**兼容方案**（低改动成本）：
1. SKILL.md 增加 YAML frontmatter（`name` + `description`）
2. 保留现有 `available_skills` 外部配置作为 OpenClaw 专用增强
3. OpenClaw 加载时：优先读 frontmatter，没有则 fallback 到外部配置

```yaml
---
name: code-review
description: Use when 需要对代码变更进行系统性审查或给出放行决策
---
# 代码审查执行工具箱
...
```

#### ⑥ TDD for Skills

Superpowers 的"压力测试"理念极有价值——用 subagent 模拟真实场景，验证技能是否真的被遵循。

**改进方案**：在 skill-creator / skillforge 中增加验证步骤：
1. 写技能前先设计"压力场景"
2. 不加载技能让 subagent 做任务（基线）
3. 加载技能再做同一任务
4. 对比差异验证技能有效性

### 3.3 双向兼容评估

**可行性：中等偏高**

| 方向 | 可行性 | 方案 |
|------|--------|------|
| 我们的技能 → AgentSkills 格式 | ✅ 高 | 加 YAML frontmatter，目录结构已兼容 |
| AgentSkills → 我们的 available_skills | ✅ 高 | OpenClaw 读 frontmatter 自动生成 available_skills 条目 |
| Superpowers 管线技能 → 我们 | ⚠️ 有限 | 管线技能（brainstorming→plan→implement）绑定编码场景，适合导入为项目模板而非替代我们的 Leader 调度 |
| 我们的领域技能 → Superpowers 社区 | ✅ 高 | 编码相关技能（code-review, backend-development）可直接贡献 |

**建议**：不追求完全双向兼容，而是**单向对齐 AgentSkills 规范**——让我们的技能格式兼容开放标准，同时保留 OpenClaw 独有增强（available_skills 列表、角色体系、记忆系统）。

---

## 四、关键结论

### Superpowers 最值得学习的不是具体技能，而是三个元洞察：

1. **Agent 会合理化跳过规则**——必须设计防合理化机制（红旗表、强制调用规则）
2. **Description 决定技能是否被正确使用**——CSO（Claude Search Optimization）不是锦上添花，是生死攸关
3. **流程图比文字更难被跳过**——Graphviz dot 是 Agent 指令的最佳格式之一

### 对 NDHY 的总体建议：

我们的体系在**广度**（全产品链路）和**组织复杂度**（28 角色协作）上远超 Superpowers，但在**技能被 Agent 实际遵循的工程化保障**上可以向 Superpowers 学习。

**短期行动项**：
1. 审计所有技能 description，剥离工作流描述，只留触发条件
2. 在 AGENTS.md 增加反合理化规则表
3. 在 skill-creator/skillforge 中增加 CSO 规范
4. 为 3-5 个核心技能增加 Graphviz 决策流程图

**中期行动项**：
5. SKILL.md 加 YAML frontmatter 对齐 AgentSkills 规范
6. 建立 Token 预算规范
7. 试点 TDD for Skills（压力测试验证）

---

## 参考来源

| 来源 | URL | 获取日期 |
|------|-----|---------|
| GitHub 仓库 | https://github.com/obra/superpowers | 2026-03-16 |
| README.md | https://github.com/obra/superpowers/blob/main/README.md | 2026-03-16 |
| RELEASE-NOTES.md（v5.0.2） | https://github.com/obra/superpowers/blob/main/RELEASE-NOTES.md | 2026-03-16 |
| writing-skills SKILL.md | https://github.com/obra/superpowers/blob/main/skills/writing-skills/SKILL.md | 2026-03-16 |
| using-superpowers SKILL.md | https://github.com/obra/superpowers/blob/main/skills/using-superpowers/SKILL.md | 2026-03-16 |
| subagent-driven-development SKILL.md | https://github.com/obra/superpowers/blob/main/skills/subagent-driven-development/SKILL.md | 2026-03-16 |
| brainstorming SKILL.md | https://github.com/obra/superpowers/blob/main/skills/brainstorming/SKILL.md | 2026-03-16 |
| Jesse Vincent 博客 | https://blog.fsck.com/2025/10/09/superpowers/ | 2026-03-16 |
| AgentSkills 规范 | https://agentskills.io/specification.md | 2026-03-16 |
| BetterStack 评测 | https://betterstack.com/community/guides/ai/superpowers-framework/ | 2026-03-16 |
| ByteIota 分析（82K stars） | https://byteiota.com/superpowers-82k-stars-transform-claude-code-senior-dev/ | 2026-03-16 |
