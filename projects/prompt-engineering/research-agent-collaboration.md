# AI Agent 多智能体协作通信方案深度调研报告

> 🔬 技术调研专家 | 2026-03-15
> 
> **调研目的**：为 NDHY AI Agent Team 解决开发阶段高频协作通信瓶颈，找到可落地的多 Agent 协作方案

---

## 一、问题定义

### 当前架构
```
Leader spawn 子 Agent → 子 Agent 独立完成任务 → 交付结果 → 消失
```

### 核心痛点
开发阶段需要**高频多轮协作**，但子 Agent 之间**无法直接通信**：
- 联调专家发现前后端不一致 → 需要开发专家**在线响应修复** → 修复后联调专家再验证 → 多轮
- 前端问后端 API 细节 → 需要后端专家**即时回答**
- 设计师和前端实时对齐视觉细节

### 本质需求
不是"让所有 Agent 自由聊天"，而是：
1. **任务内多轮协作**：两个或多个专家围绕同一问题反复沟通直到解决
2. **跨任务信息同步**：一个专家的产出变更，相关专家能及时感知
3. **修复-验证循环**：发现问题 → 修复 → 验证 → 可能再修复，直到通过

---

## 二、业界多智能体协作框架分析

### 2.1 MetaGPT（FoundationAgents）

**核心机制**：SOP（标准操作流程）+ 消息订阅 + 共享环境

| 维度 | 评估 |
|------|------|
| **协作模式** | 基于 SOP 的瀑布式协作。每个角色（PM→Architect→PM-Manager→Engineer）按序执行，通过 `_watch()` 订阅上游角色的 Action 输出 |
| **消息机制** | Publish-Subscribe：角色发布 Action 输出到共享环境，下游角色通过 `_watch(Action)` 订阅感兴趣的消息 |
| **共享状态** | 有 SharedEnvironment，所有角色共享内存 + 文件系统 |
| **多轮协作** | 原生支持有限。SOP 是线性流水线，回溯需要额外编排。2025 年 MGX 版本有改善 |
| **适用场景** | 一次性软件生成（从需求到代码），流水线式任务 |
| **GitHub Stars** | 50k+，活跃维护 |

**对 NDHY 的启示**：订阅机制值得借鉴（Agent 订阅感兴趣的事件），但 SOP 线性流程不适合多轮协作场景。

### 2.2 AutoGen / Microsoft Agent Framework

**核心机制**：多 Agent 对话 + 灵活编排模式

| 维度 | 评估 |
|------|------|
| **协作模式** | 多种编排模式：SelectorGroupChat（LLM 选择下一个发言者）、Swarm（基于工具的本地选择）、GraphFlow（有向图工作流）、RoundRobin |
| **消息机制** | 共享上下文广播：所有参与者看到完整对话历史，由 Selector 决定谁发言 |
| **AgentTool** | 2025 新增：将一个 Agent 包装为另一个 Agent 的工具，实现嵌套调用 |
| **多轮协作** | **原生支持**。SelectorGroupChat 天然支持多轮对话，直到满足终止条件 |
| **核心 API** | `autogen-core`：事件驱动 + 分布式运行时，支持跨语言（Python/.NET） |
| **适用场景** | 需要灵活对话的多 Agent 系统，研究探索 |
| **GitHub Stars** | 40k+，微软官方维护，2025 年升级为 Microsoft Agent Framework |

**对 NDHY 的启示**：SelectorGroupChat 模式最接近我们需要的"多专家围绕问题讨论"场景。AgentTool 模式（Agent-as-Tool）可用于嵌套调用。

### 2.3 CrewAI

**核心机制**：角色扮演 + 任务委派 + Flows 事件驱动

| 维度 | 评估 |
|------|------|
| **协作模式** | Crews（自主协作团队）+ Flows（事件驱动工作流）。Crews 支持 sequential/hierarchical/自主协作 |
| **消息机制** | 基于任务委派，Agent 之间通过 Task 输出传递信息。Hierarchical 模式有 Manager Agent 协调 |
| **Flows** | 2025 新增：Production-ready 事件驱动架构，支持条件分支、状态管理、与 Crews 组合 |
| **多轮协作** | Hierarchical 模式支持 Manager 协调多轮交互。Flows 支持循环和条件跳转 |
| **适用场景** | 企业级自动化，复杂工作流编排 |
| **GitHub Stars** | 27k+，独立框架（不依赖 LangChain） |

**对 NDHY 的启示**：Hierarchical 模式（Manager 协调）与我们的 Leader-专家模式高度契合。Flows 的事件驱动架构值得参考。

### 2.4 LangGraph

**核心机制**：状态图 + 消息传递 + 持久执行

| 维度 | 评估 |
|------|------|
| **协作模式** | 基于有向图的状态机。节点是 Agent/函数，边定义转换逻辑 |
| **消息机制** | 共享 State：所有节点读写同一个 TypedDict 状态对象 |
| **持久性** | 原生支持 checkpointing，可恢复中断的工作流 |
| **多轮协作** | 通过图的循环边（cycle）实现多轮。支持 human-in-the-loop |
| **子图** | 支持 subgraph 嵌套，类似子任务 |
| **适用场景** | 需要精确控制流程的长时间运行工作流 |
| **GitHub Stars** | 15k+，LangChain 官方维护 |

**对 NDHY 的启示**：状态图 + 共享 State 模型非常适合"修复-验证循环"场景。循环边天然支持多轮交互。

### 2.5 ChatDev 2.0

**核心机制**：角色扮演 + 对话链 + 可进化编排

| 维度 | 评估 |
|------|------|
| **协作模式** | 1.0：固定角色（CEO/CTO/Programmer/Tester）按 SOP 对话链协作。2.0：零代码多 Agent 编排平台 |
| **消息机制** | 两两对话（Chat Chain）：角色之间成对对话完成阶段任务 |
| **新进展** | 2025 年 MacNet：有向无环图拓扑，支持 1000+ Agent 协作。Puppeteer：RL 优化的中央编排器 |
| **多轮协作** | Chat Chain 天然是多轮的（两个角色反复对话直到达成共识） |
| **适用场景** | 软件开发模拟、需要严格对话协议的场景 |
| **GitHub Stars** | 26k+，清华/OpenBMB |

**对 NDHY 的启示**：两两对话模式（pair chat）适合"联调专家 ↔ 开发专家"的修复循环。Puppeteer 中央编排思路与 Leader 模式一致。

### 2.6 Manus AI

**核心机制**：任务分解 + Agent 编排 + 工具使用

| 维度 | 评估 |
|------|------|
| **协作模式** | 中央编排：将复杂任务分解为子任务，分配给专门的 Agent 执行 |
| **特点** | 端到端自动执行，支持代码执行、浏览器操作、文件操作。2025 年初爆火 |
| **通信** | 通过中央编排器转发，Agent 之间不直接通信 |
| **适用场景** | 通用任务自动化（类似一个能做所有事的超级 Agent） |

**对 NDHY 的启示**：Manus 本质上是"一个大 Agent + 工具"，不是真正的多 Agent 协作。参考价值有限。

### 2.7 其他值得关注的框架（2024-2026）

| 框架 | 核心思路 | 特点 |
|------|---------|------|
| **Microsoft Agent Framework** (2025) | AutoGen 升级版 | Python + .NET 双语言，Graph-based Workflows，企业级 |
| **OpenAI Swarm** (2024) | 轻量 Agent 交接 | Agent 之间通过 handoff 传递控制权，极简设计 |
| **Google A2A Protocol** (2025) | Agent-to-Agent 通信协议 | 标准化 Agent 间通信，跨平台互操作 |
| **Anthropic MCP** (2024-2025) | Model Context Protocol | 工具/数据源标准化接入，不是 Agent 协作但影响生态 |

---

## 三、协作通信模式对比

### 3.1 五种通信模式

| 模式 | 原理 | 延迟 | 复杂度 | Token 消耗 | 可靠性 | 适用场景 |
|------|------|------|--------|-----------|--------|---------|
| **直接对话** | Agent A ↔ Agent B 直接消息交换 | 低 | 低 | 中 | 高 | 两两协作、修复-验证循环 |
| **广播/订阅** | Agent 发布消息到频道，订阅者接收 | 中 | 中 | 高（所有订阅者都消耗） | 中 | 状态通知、变更广播 |
| **黑板模式** | 共享工作区，各 Agent 读写 | 低 | 低 | 低（只读需要的） | 高 | 共享文档/代码、API 契约同步 |
| **中介者模式** | 通过中央调度器转发 | 中 | 高 | 中 | 高 | 复杂编排、需要中央控制 |
| **事件驱动** | Agent 完成步骤触发下一个 Agent | 低 | 中 | 低 | 高 | 流水线式任务 |

### 3.2 NDHY 场景适配分析

| NDHY 场景 | 最佳模式 | 原因 |
|-----------|---------|------|
| 联调发现 bug → 开发修复 → 联调验证 | **直接对话** | 两个角色多轮交互，需要低延迟 |
| 前后端 API 契约变更通知 | **黑板模式** | 变更写入共享文件，相关方按需读取 |
| 代码审查反馈 → 开发修改 | **中介者模式** | Leader 转发审查意见，协调修改 |
| 设计 ↔ 前端视觉对齐 | **直接对话** | 密集多轮交互 |
| 后端 API 上线通知前端 | **事件驱动** | 完成触发下游 |

---

## 四、OpenClaw 现有能力评估

### 4.1 核心能力盘点

基于对 OpenClaw 文档的系统阅读，现有能力如下：

#### sessions_spawn（子 Agent 派发）
| 能力 | 详情 |
|------|------|
| 基本模式 | `mode: "run"`（一次性执行）和 `mode: "session"`（持久会话） |
| 嵌套 | 支持 `maxSpawnDepth: 2`，即 main → orchestrator → worker 三层 |
| 并发 | 默认 `maxConcurrent: 8`，`maxChildrenPerAgent: 5` |
| 线程绑定 | `thread: true` 可绑定到 Discord 线程（飞书暂不支持） |
| Announce | 子 Agent 完成后自动向请求者通告结果 |
| 超时 | 支持 `runTimeoutSeconds` |

#### sessions_send（跨会话消息）
| 能力 | 详情 |
|------|------|
| 基本功能 | 向任意 session 发送消息并等待回复 |
| 同步等待 | `timeoutSeconds > 0` 可等待目标会话回复 |
| **Ping-Pong** | **关键发现**：支持多轮来回对话（最多 `maxPingPongTurns`，默认 5 轮） |
| REPLY_SKIP | 回复 `REPLY_SKIP` 停止来回对话 |
| Announce | 对话结束后，目标 Agent 可发送 announce 到通道 |

#### Agent-to-Agent 配置
| 能力 | 详情 |
|------|------|
| 开关 | `tools.agentToAgent.enabled`（默认 false） |
| 白名单 | `tools.agentToAgent.allow` 指定允许互相通信的 Agent |
| 可见性 | `tools.sessions.visibility` 控制会话可见范围 |

#### 子 Agent 工具限制
| 限制 | 详情 |
|------|------|
| 默认无 session 工具 | 子 Agent 默认不能使用 `sessions_list`、`sessions_send`、`sessions_spawn` |
| 深度 1 可升级 | 当 `maxSpawnDepth >= 2` 时，深度 1 的 orchestrator 可获得 `sessions_spawn` 等工具 |
| 深度 2 绝对不能 | 深度 2 的 worker **永远**无法 spawn 子 Agent |

### 4.2 关键限制

| 限制 | 影响 | 严重程度 |
|------|------|---------|
| **子 Agent 默认无 sessions_send** | 子 Agent 之间不能直接通信 | 🔴 高 |
| **子 Agent 默认无 sessions_spawn** | 子 Agent 不能创建其他子 Agent | 🟡 中 |
| **飞书不支持 thread binding** | 无法在飞书上实现持久 session 绑定 | 🟡 中 |
| **子 Agent 无感知其他 Agent** | 无 `sessions_list`，不知道其他 Agent 存在 | 🟡 中 |
| **嵌套最大深度 5** | 多级编排有上限（但 2 层已够用） | 🟢 低 |
| **每 Agent 最多 5 个子 Agent** | 并发受限（可配置到 20） | 🟢 低 |

### 4.3 可突破的能力

**关键发现：`sessions_send` 的 Ping-Pong 机制是解决问题的核心钥匙。**

```
sessions_send 支持：
- 向目标 session 发消息
- 等待回复
- 自动来回对话最多 5 轮
- REPLY_SKIP 主动终止
```

这意味着：**如果 Leader/Orchestrator 持有两个子 Agent 的 session key，它可以作为中介在两者之间转发消息。**

**另一个突破口：`maxSpawnDepth: 2` + 给 orchestrator 赋予 session 工具。**

当 `maxSpawnDepth >= 2` 时，深度 1 的 orchestrator 自动获得 `sessions_spawn`、`sessions_list`、`sessions_history` 工具。虽然没有 `sessions_send`，但可以 spawn worker 并接收 announce。

---

## 五、可落地方案设计

### 方案 A：Orchestrator 中介模式（推荐 ⭐⭐⭐⭐⭐）

**原理**：利用 `maxSpawnDepth: 2`，Leader spawn 一个 Orchestrator（项目管理/联调专家），Orchestrator 负责 spawn 和协调多个 worker。

```
Leader（深度 0）
  └── Orchestrator（深度 1）— 持有 sessions_spawn + sessions_list + sessions_history
        ├── Worker A: 前端开发（深度 2）
        ├── Worker B: 后端开发（深度 2）
        └── Worker C: 联调专家（深度 2）
```

**协作流程**：
```
1. Orchestrator spawn Worker A（前端）和 Worker B（后端），各自开发
2. Worker A/B 完成后 announce 回 Orchestrator
3. Orchestrator 审查产出，发现需要修改 → spawn Worker C（联调专家）
4. Worker C 检查并 announce 发现的问题
5. Orchestrator 根据问题，spawn 新的 Worker A'（前端修复版）携带修复指令
6. Worker A' 修复后 announce → Orchestrator 再 spawn Worker C'（验证）
7. 循环直到通过
```

| 维度 | 评估 |
|------|------|
| **延迟** | 中等。每轮协作需要 spawn → execute → announce 的完整周期 |
| **复杂度** | 中。Orchestrator 需要足够聪明来管理多轮协作 |
| **Token 消耗** | 中高。每次 spawn 新 worker 需要重新注入上下文 |
| **可靠性** | 高。利用 OpenClaw 原生能力，不需要额外开发 |
| **改造成本** | 🟢 零。只需配置 `maxSpawnDepth: 2` |

**配置方式**：
```json5
{
  agents: {
    defaults: {
      subagents: {
        maxSpawnDepth: 2,
        maxChildrenPerAgent: 10,
        maxConcurrent: 8,
        runTimeoutSeconds: 900
      }
    }
  }
}
```

**优势**：
- ✅ 零开发成本，纯配置
- ✅ 完全利用 OpenClaw 现有能力
- ✅ Orchestrator 有全局视角，能做质量把关
- ✅ 支持并行（多个 worker 同时执行）
- ✅ Announce 机制保证结果回传

**劣势**：
- ❌ 每轮修复需要 spawn 新 worker（worker 无法持久化）
- ❌ 上下文需要每次重新注入（Token 损耗）
- ❌ Worker 之间仍然不能直接通信
- ❌ 多轮循环全依赖 Orchestrator 中转

### 方案 B：黑板 + 事件驱动模式（推荐 ⭐⭐⭐⭐）

**原理**：利用共享文件系统作为"黑板"，通过文件变更驱动协作。

```
共享工作区：projects/[project]/
  ├── contracts/api-spec.yaml      ← 后端写，前端读
  ├── issues/ISSUE-001.md          ← 联调专家写，开发者读
  ├── fixes/FIX-001.md             ← 开发者写修复记录
  └── signals/ready-for-review.md  ← 完成信号
```

**协作流程**：
```
1. Leader spawn 后端专家 → 后端写 API 契约到 contracts/api-spec.yaml
2. Leader spawn 前端专家（任务包含：读取 contracts/api-spec.yaml）
3. Leader spawn 联调专家 → 联调专家检查两者代码，发现问题写入 issues/ISSUE-001.md
4. Leader 读取 issues/ 目录，根据问题 spawn 对应开发专家（任务包含：读取 issue 并修复）
5. 开发专家修复后写入 fixes/FIX-001.md
6. Leader spawn 联调专家（任务包含：验证 fix）
```

| 维度 | 评估 |
|------|------|
| **延迟** | 中。依赖 Leader 轮询或 announce 触发 |
| **复杂度** | 低。文件就是通信媒介，简单直观 |
| **Token 消耗** | 低。通过文件共享上下文，不需要在消息中重复 |
| **可靠性** | 高。文件系统是最可靠的持久化机制 |
| **改造成本** | 🟢 零。约定文件规范即可 |

**优势**：
- ✅ 零开发成本
- ✅ Token 效率高（通过文件传递大段内容，而非消息）
- ✅ 天然持久化（文件不会消失）
- ✅ 审计友好（所有协作记录都在文件里）
- ✅ 与现有工作方式兼容

**劣势**：
- ❌ 不是实时的，需要 Leader 主动触发下一步
- ❌ Leader 需要理解文件规范并正确编排
- ❌ 复杂场景下文件管理可能混乱

### 方案 C：sessions_send Ping-Pong 模式（推荐 ⭐⭐⭐）

**原理**：利用 `sessions_send` 的 ping-pong 机制，让 Leader 作为消息中继在两个子 Agent 之间传递信息。

**前提**：需要子 Agent 以 `mode: "session"` 持久运行（当前需要 thread binding，飞书不支持）。

```
Leader 持有：
  - Session A（前端开发）的 session key
  - Session B（联调专家）的 session key

联调发现问题：
  1. Leader sessions_send 到 Session A："联调发现 xxx 问题，请修复"
  2. Session A 修复后回复
  3. Leader sessions_send 到 Session B："前端已修复 xxx，请验证"
  4. Session B 验证后回复
```

| 维度 | 评估 |
|------|------|
| **延迟** | 低。sessions_send 是同步等待回复 |
| **复杂度** | 中。需要 Leader 管理多个持久 session |
| **Token 消耗** | 高。每个持久 session 保持完整上下文 |
| **可靠性** | 中。依赖 session 存活 |
| **改造成本** | 🟡 中。需要解决飞书 thread binding 问题 |

**当前阻碍**：
- `mode: "session"` 需要 `thread: true`，飞书暂不支持 thread binding
- 子 Agent 默认没有 `sessions_send`，需要配置开放
- 持久 session 会持续消耗 Token 和内存

**优势**：
- ✅ 延迟最低（真正的实时对话）
- ✅ 持久上下文（Agent 不会忘记之前的对话）
- ✅ 最接近"人类团队协作"的模式

**劣势**：
- ❌ 飞书 channel 不支持 thread binding
- ❌ Token 消耗最高
- ❌ 持久 session 管理复杂
- ❌ 当前需要额外开发

### 方案 D：混合模式（最终推荐 ⭐⭐⭐⭐⭐）

**将方案 A + B 组合，取两者之长。**

```
架构层：
  Leader（深度 0）
    └── 项目管理专家 / Orchestrator（深度 1）
          ├── spawn worker 执行具体任务（深度 2）
          └── 通过共享文件协调跨 worker 信息

通信层：
  共享工作区（黑板）
    ├── contracts/     ← API 契约（后端写、前端读）
    ├── issues/        ← 问题记录（联调写、开发读）
    ├── decisions/     ← 设计决策（设计师写、前端读）
    └── status/        ← 进度状态（所有人写、Orchestrator 读）
```

**具体执行流程（以联调修复循环为例）**：

```
Phase 1: 并行开发
  Orchestrator spawn 前端 Worker + 后端 Worker（并行）
  → 后端 Worker 先完成 → 将 API 契约写入 contracts/api-v1.yaml → announce
  → 前端 Worker 读取 API 契约开发 → 完成 → announce

Phase 2: 联调
  Orchestrator 收到两个 announce → spawn 联调 Worker
  → 联调 Worker 读取前后端代码 + 契约，发现 3 个问题
  → 写入 issues/round-1.md（含问题详情、归因、修复建议）→ announce

Phase 3: 修复循环
  Orchestrator 读取 issues/round-1.md
  → 归因：2 个前端问题、1 个后端问题
  → spawn 前端修复 Worker（task 含 issue 详情 + 修复建议 + 已有代码路径）
  → spawn 后端修复 Worker（task 含 issue 详情 + 修复建议 + 已有代码路径）
  → 两者 announce 后 → spawn 联调验证 Worker
  → 通过 → announce → Orchestrator 汇报 Leader

Phase 4: 结果通知
  Leader 收到 Orchestrator announce → 向人类汇报
```

---

## 六、方案对比总结

| 维度 | 方案 A: Orchestrator | 方案 B: 黑板 | 方案 C: Ping-Pong | 方案 D: 混合（推荐） |
|------|---------------------|-------------|-------------------|-------------------|
| **改造成本** | 🟢 零配置 | 🟢 零配置 | 🔴 需开发 | 🟢 零配置 |
| **延迟** | 中 | 中 | 低 | 中 |
| **Token 效率** | 中 | 高 | 低 | 高 |
| **多轮支持** | ✅（循环 spawn） | ✅（循环触发） | ✅（原生对话） | ✅（循环 spawn + 文件） |
| **可靠性** | 高 | 高 | 中 | 高 |
| **可追溯** | 中 | 高（文件记录） | 中 | 高 |
| **并行能力** | ✅ | ✅ | ❌ | ✅ |
| **落地难度** | 低 | 低 | 高 | 低 |

---

## 七、最终推荐：方案 D（混合模式）

### 推荐理由

1. **零开发成本**：纯配置 + 文件规范约定
2. **利用现有能力**：`maxSpawnDepth: 2` + 共享文件系统，全是 OpenClaw 原生
3. **Token 效率**：通过文件传递上下文，避免在消息中重复大段代码
4. **可审计**：所有协作过程留痕（文件 + announce 记录）
5. **渐进演进**：先用混合模式跑通，未来 OpenClaw 支持飞书 thread binding 后可升级到方案 C

### 需要的配置

```json5
{
  agents: {
    defaults: {
      subagents: {
        maxSpawnDepth: 2,          // 允许 Orchestrator spawn worker
        maxChildrenPerAgent: 10,    // 每个 Orchestrator 最多 10 个 worker
        maxConcurrent: 8,           // 全局并发上限
        runTimeoutSeconds: 900      // 15 分钟超时
      }
    }
  }
}
```

### 需要的规范

#### 共享工作区文件规范
```
projects/[project-name]/
├── PROJECT.md              ← 项目概览和当前状态
├── contracts/              ← API 契约文件
│   ├── api-v1.yaml         ← OpenAPI 规范
│   └── CHANGELOG.md        ← 契约变更记录
├── issues/                 ← 联调/审查发现的问题
│   ├── round-1.md          ← 第一轮联调问题
│   └── round-2.md          ← 第二轮联调问题
├── fixes/                  ← 修复记录
│   ├── fix-001.md          ← 修复说明 + 验证结果
│   └── fix-002.md
├── decisions/              ← 设计决策记录
│   └── visual-spec.md      ← 视觉规范
└── src/                    ← 实际代码
    ├── frontend/
    └── backend/
```

#### Issue 文件模板
```markdown
# Issue: [简述]

## 发现者
联调集成专家，第 N 轮联调

## 问题描述
[具体描述不一致之处]

## 归因
- **责任方**: 前端/后端
- **根因**: [原因分析]

## 修复建议
[具体修复方案]

## 影响范围
[影响的文件/API/功能]

## 状态
- [ ] 已确认
- [ ] 修复中
- [ ] 已修复
- [ ] 已验证
```

### 开发阶段具体协作方案

#### 场景 1：前后端并行开发 + API 契约同步

```
1. Leader → spawn Orchestrator（项目管理专家）
   task: "管理前后端并行开发，API 契约在 contracts/api-v1.yaml"

2. Orchestrator:
   a. spawn 后端 Worker → 实现 API + 写入 contracts/api-v1.yaml
   b. 等待后端 announce → 验证 API 契约完整
   c. spawn 前端 Worker（task 含 "读取 contracts/api-v1.yaml"）
   d. 或：如果前端可以先做 UI 框架，两者并行 spawn

3. 如果后端修改了 API：
   a. 后端 Worker announce 中说明变更
   b. Orchestrator 读取新 contracts/api-v1.yaml
   c. spawn 新前端 Worker，task 明确 "API 契约有变更：[变更内容]"
```

#### 场景 2：联调发现问题 → 修复循环

```
1. Orchestrator spawn 联调 Worker
   task: "检查 src/frontend + src/backend 的一致性，对照 contracts/api-v1.yaml"

2. 联调 Worker 检查 → 写入 issues/round-1.md → announce

3. Orchestrator 读取 issues/round-1.md:
   - 前端问题 → spawn 前端修复 Worker（task 含 issue 详情 + 代码路径）
   - 后端问题 → spawn 后端修复 Worker（task 含 issue 详情 + 代码路径）

4. 修复 Workers announce → Orchestrator 更新 issues/round-1.md 状态

5. Orchestrator spawn 联调验证 Worker
   task: "验证 issues/round-1.md 中的问题是否已修复"

6. 如果还有问题 → 写入 issues/round-2.md → 重复循环
```

#### 场景 3：代码审查反馈 → 修改

```
1. Orchestrator spawn 代码审查 Worker
   task: "审查 src/ 代码质量，重点关注 [关注点]"

2. 审查 Worker → 写入 issues/review-1.md → announce

3. Orchestrator 读取审查结果，按问题分级处理：
   - P0（阻断）→ 立即 spawn 修复 Worker
   - P1（需修改）→ 按优先级 spawn 修复 Worker
   - P2/P3 → 记录但不阻塞

4. 修复后 → spawn 复查 Worker 验证
```

#### 场景 4：设计 ↔ 前端对齐

```
1. Orchestrator spawn 视觉设计 Worker
   task: "输出视觉规范到 decisions/visual-spec.md"

2. 设计 Worker → 写入视觉规范 → announce

3. Orchestrator spawn 前端 Worker
   task: "按照 decisions/visual-spec.md 实现页面"

4. 前端 Worker 遇到设计不明确之处 → 在 announce 中列出问题

5. Orchestrator spawn 新设计 Worker（task 含前端疑问）→ 补充说明

6. Orchestrator spawn 新前端 Worker → 继续实现
```

---

## 八、未来演进路径

### 短期（现在可做）
- ✅ 配置 `maxSpawnDepth: 2`
- ✅ 建立共享文件规范
- ✅ 让 Orchestrator 角色（项目管理专家 / 联调专家）承担协调职责

### 中期（等 OpenClaw 能力升级）
- 🔄 飞书支持 thread binding → 启用持久 session
- 🔄 子 Agent 获得 `sessions_send` 能力 → 直接通信
- 🔄 开发 OpenClaw Skill 封装"协作协议"

### 长期（架构级演进）
- 🔮 事件总线：OpenClaw 原生支持 Agent 间事件订阅
- 🔮 共享状态管理：类似 LangGraph 的 State 共享机制
- 🔮 Agent 持久在线：无需 spawn-announce 循环，Agent 长期驻留

---

## 九、附录：关键参考

| 来源 | 要点 |
|------|------|
| OpenClaw `subagents.md` | `maxSpawnDepth: 2` 启用嵌套；深度 1 获得 session 工具 |
| OpenClaw `session-tool.md` | `sessions_send` 支持 ping-pong（默认 5 轮） |
| OpenClaw `multi-agent.md` | `tools.agentToAgent.enabled` 控制 Agent 间通信 |
| MetaGPT | SOP + 订阅机制，线性流水线 |
| AutoGen | SelectorGroupChat + AgentTool，灵活多轮对话 |
| CrewAI | Hierarchical + Flows，Manager 协调模式 |
| LangGraph | State 图 + 循环边，精确流程控制 |
| ChatDev 2.0 | Puppeteer 中央编排 + RL 优化 |

---

> **结论**：在 OpenClaw 现有能力下，**方案 D（Orchestrator 中介 + 黑板共享文件）** 是最务实的选择。零开发成本、利用原生能力、Token 高效、可审计。唯一需要的配置改动是 `maxSpawnDepth: 2`。
