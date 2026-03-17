# Agent 协作方案精华

> **来源**：`research-agent-collaboration.md`（AI Agent多智能体协作通信方案深度调研）
> **日期**：2026-03-15 调研，2026-03-16 提取
> **提取者**：组织学习专家

---

## 一、4大框架协作机制对比

| 维度 | MetaGPT | AutoGen | CrewAI | LangGraph |
|------|---------|---------|--------|-----------|
| **协作模式** | SOP 瀑布式流水线，`_watch()` 订阅上游输出 | 多种编排：SelectorGroupChat / Swarm / GraphFlow | Crews + Flows，支持 sequential / hierarchical / 自主协作 | 状态图有向图，节点=Agent，边=转换逻辑 |
| **消息机制** | Publish-Subscribe，共享环境 | 共享上下文广播，Selector 决定谁发言 | 基于 Task 输出传递，Hierarchical 有 Manager 协调 | 共享 State（TypedDict），所有节点读写同一状态 |
| **多轮协作** | ❌ 原生有限，SOP 是线性的 | ✅ 天然支持（SelectorGroupChat 直到终止条件） | ✅ Hierarchical + Flows 支持循环/条件 | ✅ 循环边（cycle）天然多轮 |
| **GitHub Stars** | 50K+ | 40K+（升级为 MS Agent Framework） | 27K+ | 15K+ |
| **对 NDHY 的价值** | 订阅机制可借鉴 | SelectorGroupChat 最接近"多专家讨论" | **Hierarchical 与 Leader-专家模式高度契合** | 状态图适合"修复-验证循环" |

### 框架选型结论
- **不直接采用任何框架**——NDHY 基于 OpenClaw，有自己的运行时
- **借鉴 CrewAI 的 Hierarchical 模式**（Manager 协调）→ 已在用（Leader-Orchestrator-Worker）
- **借鉴 LangGraph 的循环边思路**→ 通过 Orchestrator 循环 spawn 实现
- **借鉴 MetaGPT 的结构化通信**→ 用文件（而非自由对话）传递信息

---

## 二、5种通信模式与 NDHY 场景匹配

| 模式 | 原理 | NDHY 最佳场景 |
|------|------|--------------|
| **直接对话** | A ↔ B 消息交换 | 联调↔开发修复循环、设计↔前端对齐 |
| **广播/订阅** | 发布到频道，订阅者接收 | 状态通知、变更广播（未来） |
| **黑板模式** | 共享工作区读写 | **API 契约同步、Issue 记录**（当前最佳） |
| **中介者模式** | 中央调度器转发 | 代码审查反馈→开发修改 |
| **事件驱动** | 完成触发下一步 | 后端完成→前端开始 |

---

## 三、NDHY 当前最佳实践（OpenClaw 限制下）

### 核心限制
- 子 Agent 之间**不能直接通信**（无 `sessions_send`）
- 飞书**不支持 thread binding**（无法持久 session）
- 每次协作需要**重新 spawn**（上下文重注入）

### 推荐方案：Orchestrator 中介 + 黑板共享文件（方案 D）

**架构**：
```
Leader（深度 0）
  └── 项目管理专家 / Orchestrator（深度 1）— 有 sessions_spawn
        ├── Worker A: 前端开发（深度 2）
        ├── Worker B: 后端开发（深度 2）
        └── Worker C: 联调专家（深度 2）
```

**配置**（仅需一行）：
```json5
{ agents: { defaults: { subagents: { maxSpawnDepth: 2 } } } }
```

**共享文件规范**：
```
projects/[project]/
├── contracts/     ← API 契约（后端写、前端读）
├── issues/        ← 问题记录（联调写、开发读）
├── decisions/     ← 设计决策（设计师写、前端读）
└── status/        ← 进度状态（所有人写、Orchestrator 读）
```

### 4 个关键协作场景的执行方案

| 场景 | 方案 |
|------|------|
| **前后端并行开发** | 后端先写 API 契约 → 前端读取后开发 → 或两者并行（前端先做 UI 框架） |
| **联调修复循环** | 联调 Worker 写 issues → Orchestrator 读取归因 → spawn 修复 Worker → spawn 验证 Worker → 循环直到通过 |
| **代码审查→修改** | 审查 Worker 写 issues（含分级 P0-P3）→ Orchestrator 按分级 spawn 修复 |
| **设计↔前端对齐** | 设计 Worker 写 visual-spec → 前端 Worker 读取实现 → 有疑问在 announce 中列出 → Orchestrator 再 spawn 设计 Worker 补充 |

### 当前方案的代价
- 每轮修复需要 spawn 新 Worker → Token 消耗（上下文重注入）
- Worker 之间不能直接交流 → Orchestrator 是瓶颈
- 多轮循环全靠 Orchestrator 判断和转发

---

## 四、未来协作架构演进路径

| 阶段 | 时间 | 能力 | 解锁的协作模式 |
|------|------|------|---------------|
| **现在** | 立即 | `maxSpawnDepth: 2` + 共享文件 | Orchestrator 中介 + 黑板 |
| **短期** | 等 OpenClaw 升级 | 飞书 thread binding | 持久 session → 真正的多轮对话 |
| **中期** | 子 Agent 获得 `sessions_send` | Agent-to-Agent 直接通信 | 直接对话模式（联调↔开发） |
| **长期** | 事件总线 + 共享状态管理 | Agent 持久在线 + 事件订阅 | 类 LangGraph 的状态图模式 |

### 关键发现：`sessions_send` 的 Ping-Pong 机制
- 支持向目标 session 发消息并等待回复
- 最多 5 轮自动来回对话
- **是未来直接通信的核心钥匙**
- 当前需要 `tools.agentToAgent.enabled = true` 才能开启

---

## 五、立即可行动清单

- [x] 确认 `maxSpawnDepth: 2` 已配置
- [ ] 建立项目共享文件规范（contracts / issues / decisions / status）
- [ ] 制定 Issue 文件模板（发现者、问题描述、归因、修复建议、状态）
- [ ] 在下一个开发项目中实践 Orchestrator 中介模式
- [ ] 观察实际 Token 消耗和轮次，积累数据优化
