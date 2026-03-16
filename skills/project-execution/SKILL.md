---
name: project-execution
description: >-
  Use when 管理多节点项目执行：组装指令包、调度子Agent、质量检查、异常处理、进度报告或复盘。
  触发词：项目执行、指令包、调度、质量检查、异常处理、进度报告、复盘。
---

# 项目执行操作手册

> 项目管理专家的核心技能，覆盖项目执行全生命周期：从状态档案建立到复盘收尾。

## 决策流程图

```dot
digraph project_execution {
  rankdir=TB;
  node [shape=box, style="rounded,filled", fontname="Helvetica", fontsize=11];
  edge [fontname="Helvetica", fontsize=10];

  start [label="收到项目任务\n(含需求包+执行流程)", shape=ellipse, fillcolor="#E8F5E9"];
  init [label="初始化\n创建PROJECT.md + 状态档案", fillcolor="#FFF9C4"];
  depth [label="判断深度级别", shape=diamond, fillcolor="#E3F2FD"];
  l1 [label="L1 轻量\n简化档案+核心循环", fillcolor="#C8E6C9"];
  l2 [label="L2 标准\n完整循环+质检+异常", fillcolor="#FFECB3"];
  l3 [label="L3 深度\n+精细上下文+复盘", fillcolor="#FFCDD2"];
  readiness [label="调度就绪检查\n上游产出 + 依赖 + 工具", fillcolor="#FFF9C4"];
  ready [label="就绪？", shape=diamond, fillcolor="#E3F2FD"];
  block [label="标记阻塞\n等待依赖/上报", fillcolor="#FFCDD2"];
  pack [label="组装指令包\n5层结构注入", fillcolor="#E1F5FE"];
  topo [label="判断拓扑", shape=diamond, fillcolor="#E3F2FD"];
  serial [label="串行调度\nA完成→B", fillcolor="#E1F5FE"];
  parallel [label="并行调度\nA∥B→合并", fillcolor="#E1F5FE"];
  spawn [label="sessions_spawn\n派发执行者", fillcolor="#E1F5FE"];
  wait [label="等待产出", fillcolor="#FFF9C4"];
  inspect [label="两层质检\n形式检查 + 内容检查", fillcolor="#F3E5F5"];
  pass [label="质检通过？", shape=diamond, fillcolor="#E3F2FD"];
  exception [label="异常处理\n6种类型分流", fillcolor="#FFCDD2"];
  retry [label="重试次数≤2？", shape=diamond, fillcolor="#E3F2FD"];
  escalate [label="上报Leader\n附失败产出", fillcolor="#FFCDD2"];
  more_nodes [label="还有下游节点？", shape=diamond, fillcolor="#E3F2FD"];
  summarize [label="摘要产出\n更新状态档案", fillcolor="#FFF9C4"];
  report [label="进度报告", fillcolor="#F3E5F5"];
  retro [label="项目复盘\n(L3必做)", fillcolor="#F3E5F5"];
  done [label="项目完成\n交付Leader", shape=ellipse, fillcolor="#E8F5E9"];

  start -> init;
  init -> depth;
  depth -> l1 [label="≤3 执行者"];
  depth -> l2 [label="5-8 执行者"];
  depth -> l3 [label="10+ 节点"];
  l1 -> readiness;
  l2 -> readiness;
  l3 -> readiness;
  readiness -> ready;
  ready -> block [label="否"];
  block -> readiness [label="依赖就绪后"];
  ready -> pack [label="是"];
  pack -> topo;
  topo -> serial [label="有依赖"];
  topo -> parallel [label="无依赖"];
  serial -> spawn;
  parallel -> spawn;
  spawn -> wait;
  wait -> inspect;
  inspect -> pass;
  pass -> more_nodes [label="✅ 通过"];
  pass -> exception [label="❌ 不通过"];
  exception -> retry;
  retry -> pack [label="≤2次\n附修正指引"];
  retry -> escalate [label=">2次"];
  more_nodes -> readiness [label="有"];
  more_nodes -> summarize [label="无"];
  summarize -> report;
  report -> retro [label="L3 深度"];
  report -> done [label="L1/L2"];
  retro -> done;
}
```

## 模块速查

| 场景 | 加载 | 路径 |
|------|------|------|
| 项目状态档案 + 指令包 + 进度报告 + 复盘模板 | 📖 | references/templates.md |
| 调度决策树 + 质量检查清单 | 📖 | references/checklists.md |
| 6 种异常完整处理步骤 | 📖 | references/troubleshooting.md |
| 上下文管理策略 | 📖 | references/context-strategy.md |
| 执行框架 | 📖 | references/framework.md |
| 调度循环 + 指令包要点 + 质量/异常/上下文速查 | 📖 | references/workflow-and-patterns.md |

## 深度分级

| 级别 | 适用场景 | 说明 |
|------|---------|------|
| L1 轻量 | 单节点、2-3 个执行者 | 简化状态档案，核心调度循环 |
| L2 标准 | 多节点串并行、5-8 个执行者 | 完整调度循环 + 质量检查 + 异常处理 |
| L3 深度 | 复杂项目、10+ 节点 | 完整流程 + 精细上下文管理 + 复盘 |

## 铁律
1. **指令包质量 = 项目质量** — 5 层结构完整注入，验收标准必须可回答"是/否"
2. **不超过 2 次重试** — 解决不了就上报，失败产出不丢弃
3. **你是调度中心不是执行者** — 不自己写代码/文档，拆成指令包派给专家
4. **摘要面向下游** — 核心结论 + 关键数据 + 已知局限，不写流水账
