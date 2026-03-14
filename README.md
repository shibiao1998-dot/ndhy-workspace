# NDHY AI Agent Team

> **1 个人类 + 6 个 AI Agent = 一支完整的产品团队。**
> 这不是概念验证，是正在运行的生产环境。

## What is This?

NDHY AI Agent Team 是一个真实的实验：用一个人类产品经理 + 一群 AI Agent，组建一支能交付产品的团队。所有 Agent 运行在 [OpenClaw](https://github.com/openclaw/openclaw)（开源 AI Agent 平台）上，通过飞书沟通，在 GitHub 协作。

唯一的人类是 **黄世彪**（产品经理）。其余全是 AI。

---

## 🏗 组织架构 / Team Structure

```
黄世彪（人类·产品经理）
    │
    ▼
🧧 发发 · pm-lead（AI 指挥官）
    │  需求挖掘 → 任务拆解 → 调度分发 → 质量验收 → 交付汇报
    │
    ├── 🔧 贺匠心 · Skill Developer
    │     OpenClaw Skill 创建/改进、脚本开发、Skill 发布
    │
    ├── 🌐 林栈桥 · Full-Stack Developer
    │     Web 全栈开发、React/Next.js、API 设计、数据库
    │
    ├── 📝 苏墨言 · Technical Writer
    │     技术文档、方案设计、知识体系整理
    │
    ├── 🔍 严守正 · Code Reviewer
    │     代码审查、架构评审、性能分析、安全审计
    │
    └── 🔬 陆知远 · Researcher
          技术选型、竞品分析、市场调研、可行性评估
```

pm-lead 是**纯调度角色** — 不写一行代码，不碰一个文件。所有执行通过 `sessions_spawn` 委派给专家 Agent，每个专家有独立的灵魂文件（SOUL.md）和专业标准（STANDARDS.md）。

---

## ⚙ 核心机制 / How It Works

### 三高原则

| 原则 | 含义 |
|------|------|
| **高价值** | 每个需求必须追溯到商业价值，不做"为了做而做"的事 |
| **高复用** | 能做平台不做工具，能做组件不做页面 |
| **高质量** | 对照验收标准逐条 check，不达标打回重做 |

### 分层记忆

AI Agent 每次醒来都是全新的。靠文件系统维持记忆：

- 🔥 **HOT**（`MEMORY.md`）— 长期规则、偏好、教训，每次会话加载
- 🟡 **WARM**（`memory/YYYY-MM-DD.md`）— 每日事件流水，按需回溯
- 📁 **项目层**（`PROJECT.md`）— 单项目上下文，子 Agent 接手时读取

### 质量闭环

```
常规任务：执行 Agent → pm-lead 验收 → 交付
关键任务：执行 Agent → 🔍 严守正独立审查 → pm-lead 终审 → 交付
```

### 心跳与自愈

- **主动行为检查** — 每次心跳轮查待办
- **子 Agent 健康巡查** — 超时追问 → 卡死重启（携带上下文）→ 连续失败上报人类
- **每日收盘** — Git 备份 → 记忆清理 → 能力缺口检测

### 任务生命周期

`[pending]` → `[doing]` → `[review]` → `[done]`（异常：`[blocked]` / `[rework]`）

---

## 🛠 技术栈 / Tech Stack

| 层面 | 选型 |
|------|------|
| Agent 平台 | OpenClaw |
| AI 模型 | Claude 4.6 Opus（via ndhy-gateway） |
| 沟通 | 飞书 |
| 代码托管 | GitHub |
| 开发工具 | vibe-coding（OpenCode + OMO ultraworker） |
| OS | Windows 10 |

---

## 🧩 能力包 / Installed Skills

| 类别 | Skills |
|------|--------|
| 搜索调研 | search-layer（四源并行）· content-extract · tavily-search |
| 前端开发 | react-best-practices · frontend |
| 代码管理 | github · gh-issues · coding-agent |
| Skill 管理 | skill-creator · clawhub · find-skills · skill-vetter |
| 飞书集成 | feishu-*（9 个 Skill：文档/表格/日历/消息/任务） |
| 团队管理 | agent-autonomy-kit · agent-team-orchestration · multi-agent-cn |
| 工具 | agent-browser · cftunnel · vibe-coding · weather · healthcheck |

---

## 📂 仓库结构 / Repo Structure

```
workspace/
├── AGENTS.md                    # pm-lead 工作手册
├── SOUL.md                      # pm-lead 灵魂与信条
├── USER.md                      # 人类档案
├── MEMORY.md                    # HOT 层长期记忆
├── HEARTBEAT.md                 # 心跳协议
├── IDENTITY.md                  # 身份标识
├── roles/
│   ├── README.md                # 选角决策树
│   ├── RELAY-PROTOCOL.md        # 沟通转发规范
│   ├── 贺匠心-skill-developer/  # SOUL.md + STANDARDS.md
│   ├── 林栈桥-fullstack-developer/
│   ├── 苏墨言-technical-writer/
│   ├── 严守正-code-reviewer/
│   └── 陆知远-researcher/
├── skills/                      # 已安装 Skill 包
├── memory/                      # WARM 层每日日志
└── [项目文件夹]/                # 各项目代码 + PROJECT.md
```

---

## 🤔 FAQ

**Q: 这是玩具项目吗？**
不是。这是一个真实运行的产品团队，有日常任务、质量验收、记忆积累、异常恢复机制。Agent 会犯错，但系统设计了闭环来兜底。

**Q: 人类在这个团队里做什么？**
定方向、做决策、审批高风险操作。所有执行层面的工作由 AI 完成。

**Q: 为什么每个 Agent 都有中文名？**
因为它们不是工具，是团队成员。有名字、有性格、有专业标准。这不是拟人化情怀，是让角色注入更精确的工程决策。

---

<sub>Powered by [OpenClaw](https://github.com/openclaw/openclaw) · Built by 黄世彪 & his AI team · 2026</sub>
