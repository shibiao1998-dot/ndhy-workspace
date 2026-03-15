# 长上下文利用技巧

> 来源：Anthropic 官方文档 — Context Windows, Long Context Prompting, Prompting Best Practices

## 模型上下文窗口

| 模型 | 上下文窗口 | 最大输出 | 备注 |
|------|-----------|---------|------|
| Claude Opus 4.6 | 1M tokens | 128K tokens | |
| Claude Sonnet 4.6 | 1M tokens | 128K tokens | |
| Claude Sonnet 4.5 | 200K → 1M | 64K tokens | 1M 需要 beta header + tier 4 |
| Claude Haiku 4.5 | 200K tokens | 64K tokens | |

> 1M token ≈ 约 400 万个英文字符 ≈ 约 5000 页文档

---

## 核心策略

### 1. 长文档放顶部，查询放底部

这是最重要的长上下文技巧——可提升 30% 响应质量（Anthropic 测试数据）：

```text
[长文档内容放在这里]
[更多文档...]
[更多文档...]

---

Based on the documents above, answer the following question:
{{USER_QUERY}}
```

### 2. 用 XML 标签结构化多文档

```xml
<documents>
  <document index="1">
    <source>annual_report_2023.pdf</source>
    <document_content>
      {{ANNUAL_REPORT}}
    </document_content>
  </document>
  <document index="2">
    <source>competitor_analysis_q2.xlsx</source>
    <document_content>
      {{COMPETITOR_ANALYSIS}}
    </document_content>
  </document>
</documents>

Analyze the annual report and competitor analysis.
Identify strategic advantages and recommend Q3 focus areas.
```

### 3. 先引用再分析（Ground in Quotes）

对长文档任务，要求 Claude 先引用相关段落，再执行分析。这帮助 Claude 从文档噪音中提取关键信息：

```xml
<instructions>
Find quotes from the documents that are relevant to answering the question.
Place these in <quotes> tags.
Then, based on these quotes, provide your analysis in <analysis> tags.
</instructions>

<documents>
  {{LONG_DOCUMENTS}}
</documents>

<question>
{{USER_QUESTION}}
</question>
```

---

## 上下文工程关键原则

### Context Rot（上下文腐烂）
随着 token 数增长，准确率和召回率会下降。核心原则：

> **管理上下文中有什么，和管理上下文有多大一样重要。**

- 不要因为有 1M token 就把所有东西塞进去
- 精心策展上下文内容
- 定期清理不再需要的上下文

### Context Awareness（上下文感知）
Claude Sonnet 4.6, Sonnet 4.5, Haiku 4.5 支持上下文感知——能跟踪剩余 token 预算，据此管理行为。

在 agent 系统中，告诉 Claude 上下文会被自动压缩：

```text
Your context window will be automatically compacted as it approaches its limit,
allowing you to continue working indefinitely from where you left off.
Therefore, do not stop tasks early due to token budget concerns.
As you approach your token budget limit, save your current progress and state
to memory before the context window refreshes.
```

---

## 多上下文窗口工作流

对跨越多个上下文窗口的长任务：

### 1. 首个窗口建框架
用第一个上下文窗口建立测试、脚本等基础设施，后续窗口迭代。

### 2. 结构化测试文件
```json
// tests.json — 让 Claude 跟踪测试状态
{
  "tests": [
    { "id": 1, "name": "auth_flow", "status": "passing" },
    { "id": 2, "name": "user_mgmt", "status": "failing" },
    { "id": 3, "name": "data_export", "status": "not_started" }
  ]
}
```

> ⚠️ "永远不要删除或编辑已有测试——这可能导致功能缺失或 bug。"

### 3. 创建启动脚本
鼓励 Claude 创建 `init.sh` 之类的脚本，避免每次重新启动时重复工作。

### 4. 新窗口 vs 压缩
新上下文窗口有时比压缩更好——Claude 4.6 擅长从文件系统中恢复状态。提供明确的启动指令：
```text
Call pwd; you can only read and write files in this directory.
Review progress.txt, tests.json, and the git logs.
Manually run through a fundamental integration test before moving on.
```

### 5. 用 Git 跟踪状态
Git 提供操作日志和可恢复的检查点，Claude 4.6 特别擅长利用 git 跨 session 跟踪状态。

### 6. 鼓励充分利用上下文
```text
This is a very long task, so it may be beneficial to plan out your work clearly.
It's encouraged to spend your entire output context working on the task -
just make sure you don't run out of context with significant uncommitted work.
```

---

## Extended Thinking 与上下文窗口

- 思考 token 计入上下文窗口限制
- 前一轮的思考块会自动从上下文计算中剥离
- API 自动处理，不需要手动剥离
- 有效计算：`context_window = (input_tokens - previous_thinking_tokens) + current_turn_tokens`

### 工具调用时的思考块处理
- 发送工具结果时，**必须**包含对应的完整思考块（含签名）
- 工具调用循环完成后，思考块可以丢弃
- 思考块有加密签名验证，修改会导致 API 报错

---

## 每个请求的限制

- 最多 600 张图片或 PDF 页面（200K 模型限 100）
- 大量图片/文档可能先触及请求大小限制
- 1M token 上下文需要模型支持 + 适当的 tier

---

## 实战建议

| 场景 | 策略 |
|------|------|
| 单文档问答 | 文档在前，问题在后，要求引用 |
| 多文档分析 | XML 标签结构化，每个文档标注来源 |
| 代码库分析 | 分模块加载，用 XML 标注文件路径 |
| 长对话 | 定期压缩或用新窗口 + 状态文件 |
| Agent 循环 | 上下文感知 + 自动压缩 + 进度文件 |
