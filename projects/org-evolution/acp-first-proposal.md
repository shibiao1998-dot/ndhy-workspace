# 组织进化提案：ACP-First 架构

> Leader · 2026-03-16
> 级别：宪法级（老板批准）

---

## 一、发现

Claude Code 与我们的 subagent 使用完全相同的底层模型（Claude Opus 4.6），但执行效率差距巨大：

| 维度 | subagent | ACP (Claude Code) |
|------|----------|-------------------|
| 调用模式 | 1 次调用做完所有事 | N 次短调用，每次做一小步 |
| context 管理 | 用完即弃 | 自动压缩，无限续命 |
| 产出方式 | 最后一次性输出 | 每步增量写入文件 |
| 失败恢复 | 超时 = 全部丢失 | 中断也保留已写文件 |
| token 瓶颈 | output 128K 上限 | 每步输出很小，无上限问题 |
| 持久化 | 无 | CLAUDE.md + 文件系统 |

## 二、根因

差距不在模型，在编排。Claude Code 的三个关键机制：

1. **Agent Loop**：`while(tool_call) → execute → feed back → repeat`。每步独立、短小、可验证
2. **自动压缩**：context 接近 64-75% 时自动摘要旧对话，释放空间继续工作
3. **文件即记忆**：产出写入磁盘 = 永久保存，下一步需要时重新读取，不依赖 context 历史

## 三、ACP-First 架构规则

### 任务分派决策树

```
收到执行任务
  ├─ 产出 ≤ 15KB 且无需多轮迭代？
  │     → subagent（审查报告、文案、规范文档）
  │
  ├─ 产出 > 15KB 或需要多轮迭代？
  │     → ACP（开发、原型、大文件、联调）
  │
  └─ 不确定？
        → 默认 ACP（宁可用 ACP 多花一点，也不要 subagent 超时重做）
```

### 指令包升级（从 6 层 → 7 层）

| # | 层 | 内容 |
|---|---|------|
| 1 | 项目上下文 | 精简版项目背景和目标 |
| 2 | 上游产出物 | 本节点需要的输入 |
| 3 | 本节点任务说明 | 做什么、怎么判断做完了 |
| 4 | 输出要求与验收标准 | 产出格式、SMART 化 AC |
| 5 | 约束与注意事项 | 边界、禁区、注意点 |
| 6 | 必须使用的技能 | 强制使用的 Skill 列表 |
| **7** | **执行模式指令** | **ACP/subagent 选择 + CLAUDE.md 部署 + 增量写入要求** |

### CLAUDE.md 标准化

每个项目目录必须部署 CLAUDE.md，内容包括：
- 项目 Design Token / 编码规范
- 禁止使用的工具（web_search / web_fetch）
- 质量标准（零裸值 / 零句号 / Token 合规）
- 增量写入要求（每完成一个模块就写入文件，不要最后一次性输出）

### subagent 使用场景（仅限）

| 场景 | 示例 | 预估产出 |
|------|------|---------|
| 审查报告 | 代码审查、设计走查 | ≤5KB |
| 文案产出 | 内容更新、叙事分析 | ≤5KB |
| 规范文档 | 设计补丁、Token 定义 | ≤10KB |
| 评估报告 | 专家晋升评估、需求确认 | ≤5KB |
| 流程设计 | 执行流程编排 | ≤5KB |

**超过 15KB 的任何产出，一律 ACP**

### ACP 任务标准指令

所有 ACP 任务的 task 开头必须包含：

```
IMPORTANT: Do NOT use built-in web_search or web_fetch.
Use ddgs-search and fetch MCP tools if needed.

EXECUTION STYLE:
- Work in small incremental steps
- Write to files after EACH step (do not accumulate)
- Run build/test after significant changes
- If you hit an error, fix it immediately before moving on
```

## 四、实施清单

- [x] 写入 AGENTS.md（宪法）
- [x] 写入 MEMORY.md（规则）
- [x] 更新 HEARTBEAT.md（巡查规则适配）
- [ ] 更新全体专家 STANDARDS.md 的"执行模式"段落（后续批量）
- [ ] 模板化 CLAUDE.md 项目配置

---

> 老板批准时间：2026-03-16 23:50
> 生效范围：全组织所有任务
