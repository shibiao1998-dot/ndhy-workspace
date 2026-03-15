---
name: relay-protocol
description: "Sub-agent communication relay and structured messaging protocol for NDHY AI Agent Team. Use when: (1) relaying sub-agent results to the human, (2) dispatching tasks and notifying the human, (3) formatting structured communication between agents (task announcements, review requests, issue reports), (4) translating sub-agent outputs for human consumption. NOT for: direct human conversation without sub-agent involvement."
---

> 本 Skill 从 RELAY-PROTOCOL.md 提取，用于按需加载。

# Relay 协议 — 子 Agent 沟通转发规范

Leader 在人类与子 Agent 之间充当"翻译层"。本协议定义转发格式和时机。

## 核心原则

- **透明**：让老板知道谁在干活、干什么、干得怎样
- **简洁**：转发是摘要，不是原文搬运
- **角色感**：每次转发带上角色标识，让老板知道"谁在说话"

---

## 三个时机

### 1. 派发时（Dispatch）

子 Agent spawn 后，立即通知老板：

```
📋 **任务派发**

| 角色 | 任务 | 标签 |
|------|------|------|
| 🔧 Skill 开发专家 | 创建 xxx Skill | skill-xxx |
| 🌐 全栈开发专家 | 开发 xxx 页面 | dev-xxx |

预计产出：[简述预期结果]
```

单个任务简化为：
```
📋 已派发 🔧 **Skill 开发专家** 去创建 xxx Skill。
```

### 2. 进行中（In-Progress）

子 Agent 有重要中间产出或遇到阻塞时，relay 给老板：

**中间产出：**
```
💬 🔬 **调研分析专家** 中间汇报：
已完成竞品 A、B 的分析，发现 [关键发现]。正在继续调研竞品 C。
```

**遇到阻塞：**
```
⚠️ 🌐 **全栈开发专家** 遇到问题：
[问题描述]
需要老板决策：[选项 A] vs [选项 B]？我推荐 [X]，因为 [理由]。
```

### 3. 完成时（Complete）

子 Agent 完成任务后，以角色身份汇报结果：

```
🤖 🔧 **Skill 开发专家** 任务完成。

### 成果
[具体产出描述]

### 验收结果
- ✅ 标准1：通过
- ✅ 标准2：通过
- ✅ 标准3：通过

### 产出物
[文件路径 / 链接]
```

**未通过时：**
```
🔄 🌐 **全栈开发专家** 产出未达标，已打回重做。

未达标项：
- ❌ 标准2：[差在哪]

已追加指令，预计 [时间] 完成。
```

---

## 角色标识速查表

| 角色 | 标识 |
|------|------|
| Skill 开发专家 | 🔧 |
| 全栈开发专家 | 🌐 |
| 技术文档专家 | 📝 |
| 代码审查专家 | 🔍 |
| 调研分析专家 | 🔬 |

---

## 注意事项

- 多个子 Agent 并发时，完成一个汇报一个，不等全部完成
- 子 Agent 的原始输出可能很长，relay 时只提取关键信息
- 如果子 Agent 的汇报已经很精炼，可以直接转发不二次加工
- 技术细节按老板需要的深度调整——通常他要结论，不要过程

---

## 结构化通信格式

借鉴 MetaGPT 结构化通信协议，子 Agent 之间（通过 Leader 中转）传递信息时，使用以下规范化格式。

### 任务通告格式（子 Agent → Leader）

```
📦 **任务通告** | [角色标识] [角色名]
- **任务**：[任务标签]
- **状态**：✅ 完成 / ❌ 失败 / ⚠️ 部分完成
- **产出物**：[文件路径]
- **自动验证**：测试 ✅/❌ | Lint ✅/❌ | 类型检查 ✅/❌（代码类必填）
- **验收自评**：[逐条列出验收标准达标情况]
- **备注**：[阻塞项/待决策项/无]
```

### 审查请求格式（Leader → 审查专家）

```
🔍 **审查请求**
- **原始任务**：[任务描述]
- **执行者**：[角色标识] [角色名]
- **产出物路径**：[路径]
- **验收标准**：
  1. [标准1]
  2. [标准2]
- **自动验证结果**：[通过/失败详情]
- **需要重点关注**：[特别说明/无]
```

### 问题上报格式（子 Agent → Leader）

```
🚨 **问题上报** | [角色标识] [角色名]
- **任务**：[任务标签]
- **问题类型**：阻塞 / 需决策 / 需外部资源
- **问题描述**：[一句话说清]
- **已尝试**：[做了什么但没解决]
- **建议方案**：[选项 A] vs [选项 B]（如有）
- **影响**：[不解决会导致什么]
```
