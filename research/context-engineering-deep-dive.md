# Context Engineering 深度调研报告

> **来源**: [davidkimai/Context-Engineering](https://github.com/davidkimai/Context-Engineering)（8.5K+ stars）
> **理论提出者**: Andrej Karpathy（前 Tesla AI 负责人, OpenAI 联合创始人）
> **调研日期**: 2026-03-16

---

## 一、Context Engineering vs Prompt Engineering：核心区别

| 维度 | Prompt Engineering | Context Engineering |
|------|-------------------|---------------------|
| **关注点** | "你对模型说了什么" | "模型看到的一切" |
| **范围** | 单条指令的措辞优化 | 整个上下文窗口的信息编排 |
| **比喻** | 写一封好邮件 | 设计整个信息生态系统 |
| **输入** | 一条 prompt | Instructions + Examples + Memory + Retrieval + Tools + State + Control Flow |
| **优化目标** | 让模型"理解意图" | 让模型"拥有足够信息做出正确决策" |
| **复杂度** | 文本级 | 系统工程级 |

**Karpathy 的原话**：
> "Context engineering is the delicate art and science of filling the context window with just the right information for the next step."

**核心洞察**：Prompt Engineering 只是 Context Engineering 的第一层（Atoms）。当你从"写好一句话"进化到"设计模型看到的完整信息环境"，你就进入了 Context Engineering 的领域。

### 关键公式

```
Context = A(c₁, c₂, ..., cₙ)
```

上下文不是单一信息，而是**多种信息源的结构化组装**：系统指令、示例、记忆、检索结果、工具输出、状态信息的有序组合。

---

## 二、9 层递进框架（生物学隐喻）

该框架用生物学层级结构来描述上下文工程的递进复杂度：

### Level 1：基础上下文工程

| 层级 | 名称 | 含义 | 对应实践 |
|------|------|------|---------|
| **L1 Atoms** | 原子 | 单条指令 = Task + Constraints + Output Format | 基础 prompt engineering |
| **L2 Molecules** | 分子 | 指令 + 示例（Few-shot） | Few-shot learning, 示例驱动 |
| **L3 Cells** | 细胞 | 指令 + 示例 + 记忆/状态 | 会话记忆、状态管理 |
| **L4 Organs** | 器官 | 多个 Cell 协作（多 Agent 系统） | Multi-agent 编排、专家协作 |

### Level 2：场论（Field Theory）

| 层级 | 名称 | 含义 | 对应实践 |
|------|------|------|---------|
| **L5 Neural Systems** | 神经系统 | 推理框架 + 验证工具 + 认知模式 | ReAct、Chain-of-Thought、认知工具 |
| **L6 Neural Fields** | 神经场 | 连续意义空间、语义吸引子 | 语义场理论、上下文持久化 |

### Level 3：协议系统（Protocol System）

| 层级 | 名称 | 含义 | 对应实践 |
|------|------|------|---------|
| **L7 Protocol Shells** | 协议壳 | 结构化模板、场操作、涌现协议 | 协议编排、模板系统 |
| **L8 Unified System** | 统一系统 | 协议集成、系统级涌现、自维护 | 自组织系统 |

### Level 4：元递归（Meta-Recursion）

| 层级 | 名称 | 含义 | 对应实践 |
|------|------|------|---------|
| **L9 Meta-Recursive** | 元递归 | 自我反思、递归改进、可解释进化 | 自我改进的智能系统 |

### 关键实践原则（贯穿所有层级）

1. **First Principles（第一性原理）**：从基本上下文开始
2. **Iterative Add-on（迭代增量）**：只增加模型真正缺的信息
3. **Measure Everything（度量一切）**：Token 成本、延迟、质量评分
4. **Delete Ruthlessly（果断删除）**：剪枝优于填充——上下文腐化（Context Rot）是真实威胁
5. **Token-Quality Power Law**：存在"最大 ROI 区间"，超过后递减甚至恶化

---

## 三、与 DJ 信息对称理念的对应关系

DJ（华渔教育董事长）的核心理念：**"结果不好都是信息不对称的问题"**

| DJ 的信息对称理念 | Context Engineering 的对应概念 | 说明 |
|-----------------|-------------------------------|------|
| **结果不好 = 信息不对称** | "填充上下文窗口以恰好包含下一步所需的信息" | 本质相同：输出质量取决于输入信息的完整性和精准性 |
| **确保执行者拥有足够上下文** | Memory + Retrieval + State + Tools | 技术实现路径：不只是"告诉他"，而是系统性地组装全部必要信息 |
| **信息不可压缩** | Token Budget 管理 + Context Rot 防范 | 关键信息不能丢，但也不能堆无关信息——"恰好够"才是最优 |
| **渐进式披露** | 分层上下文（设定/技能/详情按需加载） | 不是一次给全部，而是按需求层级递进提供 |
| **任务指令不可减** | Atoms 层的 Task + Constraints + Output Format | 任务描述的信息密度是底线，删减 = 信息丢失 = 产出质量下降 |

### 关键结论

**DJ 的"信息对称"是 Context Engineering 的商业直觉版表述。** Context Engineering 为这一直觉提供了工程化的实现框架：

- **信息对称 → 如何做到？** → 系统性的上下文组装（9 层框架）
- **信息不能丢 → 如何权衡？** → Token Budget + Quality Power Law
- **渐进式披露 → 如何实现？** → 设定（宪法）+ 技能（按需）+ References（深度）

---

## 四、对我们产品（提示词工程系统 v2）的具体启发

### 4.1 产品定位升级

我们正在做的**不只是**"提示词管理系统"，而是**上下文工程平台**。

| 旧定位 | 新定位 |
|--------|--------|
| 管理和优化 Prompt | 管理和编排完整 Context（Prompt + Memory + Examples + Tools + State） |
| 提示词模板库 | 上下文组装引擎 |
| 评估 Prompt 质量 | 评估 Context 质量（Token 效率 × 输出质量） |

### 4.2 核心功能启发

| Context Engineering 概念 | 产品功能映射 |
|------------------------|-------------|
| **Token Budget** | Token 预算可视化 + 自动优化建议 |
| **Context Rot** | 上下文健康度检测——信息越多不一定越好 |
| **Memory Management** | 记忆分层管理（Windowing / Summarization / Priority Pruning） |
| **Few-shot Learning** | 示例管理和自动选择 |
| **Multi-Agent Orchestration** | 多 Agent 上下文协调 |
| **Quality Power Law** | Token-Quality 曲线可视化，找到 ROI 最大区间 |

### 4.3 架构启发

```
上下文组装引擎 = RAG（检索增强） + Memory（记忆管理） + Tools（工具集成） + State（状态管理）
```

这四个支柱应该成为系统架构的核心模块。

---

## 五、对我们组织各专家的学习建议

### 5.1 所有专家（通识）

- **理解"上下文即产品"**：你交给子 Agent 的 task 描述，本质上就是在做 Context Engineering。信息越精准、结构越清晰，产出越好
- **内化 Token-Quality 曲线**：不是信息越多越好。存在最佳信息量，超过后反而恶化（Context Rot）

### 5.2 产品定义专家

- 将 Context Engineering 概念融入产品设计：产品不是"管理 prompt"，是"编排上下文"
- 产品概念卡中增加"上下文组装"视角：用户的核心场景是组装什么上下文？

### 5.3 技术架构专家

- 系统架构设计引入 Context Engineering 四支柱：RAG + Memory + Tools + State
- 设计 AI 集成方案时，上下文组装作为独立架构层（不是散落在各处的拼凑）

### 5.4 后端开发专家

- 上下文组装的工程实现：模板化、优先级排序、正反向分离（system prompt vs user context）、截断策略
- Token 预算管理作为 API 设计的一等公民

### 5.5 体验设计专家

- 用户界面要让"上下文可见"：用户应该能看到模型将看到什么
- 设计"上下文调试"体验：类似 Chrome DevTools 的调试面板

### 5.6 数据分析专家

- 建立 Context Quality 指标体系：Token 利用率、输出质量评分、成本效率
- Context Rot 的量化检测和预警

### 5.7 Leader / 项目管理专家

- 组织运营本身就是 Context Engineering：你给子 Agent 的 task 就是在组装上下文
- 信息对称原则 = Context Engineering 的商业直觉版。可以用 9 层框架来检查信息传递质量

---

## 六、总结

> **Context Engineering 不是新概念，而是对"让 AI 获得正确信息"这一朴素原则的系统化工程实践。**

我们组织已经在实践 Context Engineering 的很多理念（设定/技能/按需加载/信息对称），但缺乏系统化的理论框架。这个调研的价值在于：

1. **命名和框架化**：把我们的实践放进 9 层框架中，知道自己在哪、下一步去哪
2. **产品方向验证**：提示词工程系统 v2 应该定位为"上下文工程平台"
3. **工程实践深化**：上下文组装不是 prompt 拼接，是有原则、有度量、有优化的工程活动
4. **组织进化参照**：9 层框架也是我们组织能力进化的参照系——从 Atoms（基础指令）到 Meta-Recursion（自我改进的智能组织）

---

*参考来源：[davidkimai/Context-Engineering](https://github.com/davidkimai/Context-Engineering) · Andrej Karpathy · IBM Zurich · Singapore-MIT · Indiana University*
