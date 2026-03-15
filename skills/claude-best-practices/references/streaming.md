# 流式输出最佳实践

> 来源：Anthropic 官方文档 — Streaming Messages API

## 基本流式调用

### Python

```python
import anthropic

client = anthropic.Anthropic()

with client.messages.stream(
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello"}],
    model="claude-opus-4-6",
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
```

### TypeScript

```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

await client.messages
  .stream({
    messages: [{ role: "user", content: "Hello" }],
    model: "claude-opus-4-6",
    max_tokens: 1024,
  })
  .on("text", (text) => {
    console.log(text);
  });
```

---

## 获取完整消息（不处理流事件）

当你不需要实时处理文本，但需要流式传输避免 HTTP 超时（尤其是大 `max_tokens` 值时）：

```python
# Python
with client.messages.stream(
    max_tokens=128000,
    messages=[{"role": "user", "content": "Write a detailed analysis..."}],
    model="claude-opus-4-6",
) as stream:
    message = stream.get_final_message()
print(message.content[0].text)
```

```typescript
// TypeScript
const stream = client.messages.stream({
  max_tokens: 128000,
  messages: [{ role: "user", content: "Write a detailed analysis..." }],
  model: "claude-opus-4-6",
});
const message = await stream.finalMessage();
```

---

## SSE 事件流结构

每个流使用以下事件序列：

```
1. message_start          → 包含空 content 的 Message 对象
2. content_block_start    → 内容块开始
   content_block_delta    → 内容增量（可能多个）
   content_block_stop     → 内容块结束
3. message_delta          → 顶层 Message 变更（累积的 usage 数据）
4. message_stop           → 流结束
```

> ⚠️ `message_delta` 中的 `usage` 字段是**累积的**。

### 事件类型详解

#### Text Delta
```json
{
  "type": "content_block_delta",
  "index": 0,
  "delta": {"type": "text_delta", "text": "ello frien"}
}
```

#### Tool Use Input JSON Delta
```json
{
  "type": "content_block_delta",
  "index": 1,
  "delta": {"type": "input_json_delta", "partial_json": "{\"location\": \"San Fra"}
}
```

> 工具调用的 JSON 是增量的 partial JSON。用 Pydantic partial parsing 或 SDK helper 解析。
> 当前模型每次输出一个完整的 key-value 对。

#### Thinking Delta（Extended Thinking 开启时）
```json
{
  "type": "content_block_delta",
  "index": 0,
  "delta": {"type": "thinking_delta", "thinking": "Let me analyze step by step..."}
}
```

#### Signature Delta（Thinking 块结束前）
```json
{
  "type": "content_block_delta",
  "index": 0,
  "delta": {"type": "signature_delta", "signature": "EqQBCgIYA..."}
}
```

---

## 流式 + Extended Thinking

```python
with client.messages.stream(
    model="claude-sonnet-4-6",
    max_tokens=16000,
    thinking={"type": "enabled", "budget_tokens": 10000},
    messages=[{"role": "user", "content": "Complex question..."}],
) as stream:
    for event in stream:
        if event.type == "content_block_delta":
            if event.delta.type == "thinking_delta":
                print(f"[思考] {event.delta.thinking}", end="", flush=True)
            elif event.delta.type == "text_delta":
                print(event.delta.text, end="", flush=True)
```

---

## 错误处理

流中可能出现错误事件（如高负载时的 `overloaded_error`，等同于非流式的 HTTP 529）：

```json
{
  "type": "error",
  "error": {"type": "overloaded_error", "message": "Overloaded"}
}
```

### 推荐的错误处理策略

```python
import anthropic

client = anthropic.Anthropic()

try:
    with client.messages.stream(
        max_tokens=1024,
        messages=[{"role": "user", "content": "Hello"}],
        model="claude-opus-4-6",
    ) as stream:
        for text in stream.text_stream:
            print(text, end="", flush=True)
except anthropic.APIStatusError as e:
    if e.status_code == 529:
        # 过载，稍后重试
        print("Service overloaded, retrying...")
    elif e.status_code == 429:
        # 限流
        print(f"Rate limited. Retry after: {e.response.headers.get('retry-after')}s")
    else:
        raise
```

---

## SSE 前端集成模式

### 原生 EventSource（浏览器端）

```javascript
// 注意：EventSource 不支持 POST，用 fetch + ReadableStream
async function streamClaude(prompt) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    // 解析 SSE 格式
    const lines = chunk.split('\n');
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));
        if (data.type === 'content_block_delta' && data.delta.type === 'text_delta') {
          appendToUI(data.delta.text);
        }
      }
    }
  }
}
```

### 代理服务端模式（推荐）

```python
# FastAPI 代理端
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import anthropic

app = FastAPI()
client = anthropic.Anthropic()

@app.post("/api/chat")
async def chat(request: ChatRequest):
    async def generate():
        with client.messages.stream(
            model="claude-opus-4-6",
            max_tokens=1024,
            messages=request.messages,
        ) as stream:
            for text in stream.text_stream:
                yield f"data: {json.dumps({'text': text})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")
```

---

## 关键要点

| 要点 | 说明 |
|------|------|
| 大 max_tokens 必须流式 | SDK 要求，否则 HTTP 超时 |
| Tool JSON 是增量的 | 用 partial parsing 或 SDK helper |
| Thinking 有 signature | 必须保留完整签名 |
| 处理未知事件类型 | API 会新增事件类型，代码要优雅处理 |
| usage 是累积的 | `message_delta` 中的 token 计数是累积值 |
| 错误处理 | 流中可能出现 error 事件 |
