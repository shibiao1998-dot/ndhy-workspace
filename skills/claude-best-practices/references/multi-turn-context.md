# 多轮对话上下文管理

> 来源：Anthropic 官方文档 — Context Windows, Prompting Best Practices, Agentic Systems

## Messages API 对话结构

Claude 使用无状态的 Messages API。每次请求都需要发送完整对话历史：

```python
import anthropic

client = anthropic.Anthropic()

messages = [
    {"role": "user", "content": "我在做一个教育 SaaS 产品"},
    {"role": "assistant", "content": "明白了。请问是面向 K12 还是高等教育？"},
    {"role": "user", "content": "K12，主要是物理和化学虚拟实验"},
]

response = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=4096,
    system="You are a product design expert specializing in education technology.",
    messages=messages,
)

# 将响应追加到对话历史
messages.append({"role": "assistant", "content": response.content[0].text})
```

---

## 上下文增长与管理

### 线性增长问题
每一轮对话，所有历史消息都被完整保留并发送：
- 轮次 1：user msg → assistant response
- 轮次 2：user msg + assistant msg + new user msg → assistant response
- 轮次 N：所有前 N-1 轮 + 新消息 → assistant response

这意味着 token 用量线性增长，最终会触及上下文窗口限制。

### 三种管理策略

#### 策略一：Compaction（服务端压缩，推荐）

Anthropic 官方推荐的主要策略。对长对话和 agentic 工作流最有效：

```text
# 在 system prompt 中告知 Claude 压缩行为
Your context window will be automatically compacted as it approaches its limit,
allowing you to continue working indefinitely from where you left off.
Do not stop tasks early due to token budget concerns.
Save your current progress and state to memory before context refreshes.
```

#### 策略二：滑动窗口（手动裁剪）

保留最近 N 轮对话 + 始终保留 system prompt：

```python
MAX_TURNS = 20

def manage_context(messages, new_user_msg):
    messages.append({"role": "user", "content": new_user_msg})

    # 保留最近 MAX_TURNS 轮（每轮 = user + assistant）
    if len(messages) > MAX_TURNS * 2:
        # 可选：用 Claude 生成摘要保留关键信息
        summary = summarize_old_messages(messages[:-(MAX_TURNS * 2)])
        messages = [
            {"role": "user", "content": f"[Previous conversation summary: {summary}]"},
            {"role": "assistant", "content": "Understood, I have the context from our previous discussion."},
        ] + messages[-(MAX_TURNS * 2):]

    return messages
```

#### 策略三：新上下文窗口 + 状态文件

对于长期 agent 任务，有时全新窗口比压缩更好：

```python
# 在上一个窗口结束前保存状态
state = {
    "progress": "completed steps 1-5 of 10",
    "current_task": "implementing auth module",
    "key_decisions": ["chose JWT over sessions", "PostgreSQL for DB"],
    "blockers": [],
}
save_to_file("progress.json", state)

# 新窗口启动时
system_prompt = """
Review progress.json and git logs to understand current state.
Continue from where you left off.
Run tests before implementing new features.
"""
```

---

## System Prompt 注入时机

### 静态系统信息
始终放在 system prompt 中：

```python
system = """
You are a product assistant for NDHY Education Platform.
Always respond in Chinese.
Current date: {today}.
"""
```

### 动态上下文注入
通过 user message 注入，不要用已弃用的 assistant prefill：

```python
# ✅ 正确做法：通过 user message 注入上下文
messages.append({
    "role": "user",
    "content": f"[Context refresh: Current project status is {status}. "
               f"Last completed task: {last_task}. "
               f"Pending decisions: {pending}]"
})

# ❌ 错误做法（Claude 4.6 不再支持）
# 不要通过 assistant prefill 注入上下文
```

### 工具驱动的上下文注入
在 agentic 系统中，通过工具提供上下文：

```python
# 暴露一个 "get_context" 工具
tools = [
    {
        "name": "get_project_context",
        "description": "Retrieve current project status, recent decisions, and pending tasks.",
        "input_schema": {
            "type": "object",
            "properties": {
                "scope": {
                    "type": "string",
                    "enum": ["full", "recent", "decisions_only"],
                },
            },
        },
    }
]
# 让 Claude 在需要上下文时主动调用此工具
```

---

## 对话摘要策略

当对话过长需要压缩时，使用分层摘要：

```python
def summarize_conversation(messages, client):
    """将长对话压缩为摘要"""
    response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=2000,
        system="Summarize the conversation. Preserve: key decisions, action items, "
               "unresolved questions, and user preferences. Be concise but complete.",
        messages=[
            {
                "role": "user",
                "content": f"Summarize this conversation:\n\n"
                           + format_messages(messages),
            }
        ],
    )
    return response.content[0].text
```

---

## Token 计算与优化

### 估算 Token 用量
```python
# 粗略估算：1 token ≈ 4 个英文字符 ≈ 1.5 个中文字符
estimated_tokens = len(text) / 4  # 英文
estimated_tokens = len(text) / 1.5  # 中文

# 精确计算：使用 Anthropic 的 token counting API
response = client.messages.count_tokens(
    model="claude-opus-4-6",
    messages=messages,
    system=system_prompt,
)
print(f"Token count: {response.input_tokens}")
```

### 优化 Token 使用

| 策略 | 节省幅度 | 适用场景 |
|------|---------|---------|
| Prompt Caching | 高 | 重复的 system prompt 和长文档 |
| 滑动窗口 | 中 | 长对话 |
| 摘要压缩 | 中-高 | 超长对话 |
| 精简 system prompt | 低 | 总是有效 |
| 去除冗余上下文 | 中 | 每轮检查 |

---

## Agentic 系统的上下文管理

### 长期自主任务

```text
# System prompt 中的上下文管理指令
Always be persistent and autonomous. Complete tasks fully even if the end
of your budget is approaching. Never artificially stop any task early.

When approaching context limits:
1. Save current progress to progress.txt
2. Commit any code changes to git
3. Update tests.json with current test status
4. Write a brief handoff note for the next context window
```

### 增量进度跟踪

```text
# 鼓励结构化跟踪
Use structured formats for state data (JSON for tests, task status).
Use unstructured text for progress notes.
Focus on incremental work — make steady advances on a few things at a time
rather than attempting everything at once.
```

---

## 关键要点

| 要点 | 说明 |
|------|------|
| 无状态 API | 每次请求都需发送完整对话历史 |
| Compaction 优先 | 官方推荐的长对话管理策略 |
| 上下文 ≠ 越多越好 | Context rot 是真实问题 |
| 新窗口有时更好 | Claude 4.6 善于从文件系统恢复状态 |
| 不再支持 prefill | 用 user message 或工具注入上下文 |
| 思考块自动剥离 | 不占用后续轮次的上下文空间 |
