---
name: leader-workflow
description: >-
  Use when: (1) 收到新需求需要验证和调度, (2) 需要判断需求规模选择调度模式,
  (3) 需要 spawn 子 Agent 执行任务, (4) 需要对产出进行分级验收, (5) 需要自省复盘.
  NOT for: 日常沟通、记忆管理、心跳运维、代码审查流程。
---

# leader-workflow

> Leader 核心工作流——从需求进门到产出交付的全链路操作手册。

## 模块速查

| 场景 | 加载 | 路径 |
|------|------|------|
| 需求验证门（深挖 + 确认 + 放行） | 📖 | [references/requirement-gate.md](references/requirement-gate.md) |
| 流程设计 + 任务定义 | 📖 | [references/process-and-task.md](references/process-and-task.md) |
| 执行调度（spawn 规范） | 📖 | [references/dispatch.md](references/dispatch.md) |
| 质量验收（分级 + 护栏 + 自省） | 📖 | [references/quality-and-review.md](references/quality-and-review.md) |
| 调度决策模式（串并行判断 + 项目类型 + 错误防范） | 📖 | [references/dispatch-patterns.md](references/dispatch-patterns.md) |

## 工作流概览

```
需求进入 → ❶需求验证门 → ❷流程设计 → ❸任务定义 → ❹执行调度 → ❺质量验收 → ❻交付/自省
```

简单单专家任务可跳过 ❷❸，Leader 直接 spawn。

## 决策流程图

```dot
digraph leader_workflow {
  rankdir=TB;
  node [shape=box, style="rounded,filled", fontname="Helvetica", fontsize=11];
  edge [fontname="Helvetica", fontsize=10];

  start [label="需求进入", shape=ellipse, fillcolor="#E8F5E9"];
  req_gate [label="❶ 需求验证门\n(深挖→确认→放行)", fillcolor="#FFF9C4"];
  clear [label="需求清晰？", shape=diamond, fillcolor="#E3F2FD"];
  dig [label="spawn 需求分析专家\n继续挖掘", fillcolor="#FFF3E0"];
  scale [label="判断需求规模", shape=diamond, fillcolor="#E3F2FD"];
  simple [label="简单：单专家", fillcolor="#C8E6C9"];
  medium [label="中等：2+专家", fillcolor="#FFECB3"];
  major [label="重大：组织级", fillcolor="#FFCDD2"];
  direct_spawn [label="❹ Leader 直接 spawn\n对应专家", fillcolor="#E1F5FE"];
  flow_design [label="❷ spawn 流程设计专家\n输出执行流程", fillcolor="#E1F5FE"];
  task_def [label="❸ 任务定义\n拆解+指令包", fillcolor="#E1F5FE"];
  dispatch [label="❹ 执行调度\n(sessions_spawn)", fillcolor="#E1F5FE"];
  quality [label="❺ 质量验收\n(S/A/B/C 分级)", fillcolor="#F3E5F5"];
  pass [label="验收通过？", shape=diamond, fillcolor="#E3F2FD"];
  deliver [label="❻ 交付老板", fillcolor="#C8E6C9"];
  rework [label="返工/重新调度\n(最多2次)", fillcolor="#FFCDD2"];
  retro [label="重大任务：自省复盘", fillcolor="#F3E5F5"];
  end_node [label="完成", shape=ellipse, fillcolor="#E8F5E9"];

  start -> req_gate;
  req_gate -> clear;
  clear -> dig [label="否"];
  dig -> req_gate [label="补充后重新验证"];
  clear -> scale [label="是"];
  scale -> simple [label="单专家"];
  scale -> medium [label="2+专家"];
  scale -> major [label="组织级"];
  simple -> direct_spawn;
  medium -> flow_design;
  major -> flow_design [label="Leader主导\n但仍需流程设计"];
  flow_design -> task_def;
  task_def -> dispatch;
  direct_spawn -> quality;
  dispatch -> quality;
  quality -> pass;
  pass -> deliver [label="通过"];
  pass -> rework [label="不通过"];
  rework -> dispatch [label="重新调度"];
  deliver -> retro [label="重大任务"];
  deliver -> end_node [label="常规任务"];
  retro -> end_node;
}
```

## 铁律
1. **需求验证是 Leader 与老板的直接接口，不能委托**
2. **Leader 不做流程设计** — 有流程设计专家不用 = 外行指挥内行
3. **Leader 只定义目标和验收标准，不写死执行步骤**
4. **所有执行类任务通过 `sessions_spawn` 派发，不自己直接做**
5. **代码类产出必须先过自动验证，未通过不进入人工审查**
