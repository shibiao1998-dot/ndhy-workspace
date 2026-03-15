# 结构化输出

> 来源：Anthropic 官方文档 — Structured Outputs, Prompting Best Practices

## 三种获取结构化输出的方式

| 方式 | 可靠性 | 适用场景 |
|------|--------|---------|
| `output_config.format` (JSON Schema) | 🟢 最高 — 保证 schema 合规 | 需要严格 JSON 结构 |
| XML 标签 + prompt 指令 | 🟡 高 — Claude 原生擅长 | 灵活的半结构化输出 |
| Tool Use with `strict: true` | 🟢 最高 — 保证 schema 验证 | 工具调用场景 |

---

## 方式一：JSON Schema（推荐）

使用 `output_config.format` 参数，Claude 通过 constrained decoding 保证输出符合 schema：

```python
import anthropic

client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": "Extract info: John Smith (john@example.com) wants Enterprise plan.",
        }
    ],
    output_config={
        "format": {
            "type": "json_schema",
            "schema": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "email": {"type": "string"},
                    "plan_interest": {"type": "string"},
                    "demo_requested": {"type": "boolean"},
                },
                "required": ["name", "email", "plan_interest", "demo_requested"],
                "additionalProperties": False,
            },
        }
    },
)
```

### 使用 Pydantic（Python SDK 推荐方式）

```python
from pydantic import BaseModel
from anthropic import Anthropic

class ContactInfo(BaseModel):
    name: str
    email: str
    plan_interest: str
    demo_requested: bool

client = Anthropic()
response = client.messages.parse(
    model="claude-opus-4-6",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Extract: ..."}],
    output_format=ContactInfo,
)
print(response.parsed_output)  # ContactInfo 实例
```

### 使用 Zod（TypeScript SDK 推荐方式）

```typescript
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

const ContactSchema = z.object({
  name: z.string(),
  email: z.string(),
  plan_interest: z.string(),
  demo_requested: z.boolean(),
});

const client = new Anthropic();
const response = await client.messages.parse({
  model: "claude-opus-4-6",
  max_tokens: 1024,
  messages: [{ role: "user", content: "Extract: ..." }],
  ...zodOutputFormat(ContactSchema),
});
```

### 为什么用结构化输出
- ✅ 不再有 `JSON.parse()` 错误
- ✅ 保证字段类型和必需字段
- ✅ 无需 retry 处理 schema 违规
- ✅ Zero Data Retention (ZDR) 处理

---

## 方式二：XML 标签（Claude 特有优势）

Claude 对 XML 标签有原生理解能力。当你需要灵活的半结构化输出时，XML 是首选：

```xml
<!-- Prompt 中使用 -->
Please analyze the text and output in this format:
<analysis>
  <sentiment>positive/negative/neutral</sentiment>
  <confidence>0.0-1.0</confidence>
  <key_topics>
    <topic>topic name</topic>
  </key_topics>
  <summary>Brief summary</summary>
</analysis>
```

### XML 标签最佳实践

1. **使用描述性标签名**：`<customer_feedback>` 优于 `<data>`
2. **保持一致性**：整个 prompt 中标签命名风格统一
3. **层级嵌套**：有自然层级关系的内容使用嵌套标签

```xml
<documents>
  <document index="1">
    <source>annual_report_2023.pdf</source>
    <document_content>
      {{ANNUAL_REPORT}}
    </document_content>
  </document>
  <document index="2">
    <source>competitor_analysis.xlsx</source>
    <document_content>
      {{COMPETITOR_ANALYSIS}}
    </document_content>
  </document>
</documents>
```

3. **用 XML 标签包裹示例**：

```xml
<examples>
  <example>
    <input>What's the weather?</input>
    <output>{"intent": "weather_query", "entities": []}</output>
  </example>
  <example>
    <input>Book a flight to Tokyo</input>
    <output>{"intent": "flight_booking", "entities": ["Tokyo"]}</output>
  </example>
</examples>
```

---

## 方式三：Strict Tool Use

当你需要 Claude 通过工具调用返回结构化数据：

```python
tools = [
    {
        "name": "extract_info",
        "description": "Extract structured information from text",
        "strict": True,  # 保证 schema 验证
        "input_schema": {
            "type": "object",
            "properties": {
                "name": {"type": "string"},
                "sentiment": {"type": "string", "enum": ["positive", "negative", "neutral"]},
            },
            "required": ["name", "sentiment"],
        },
    }
]
```

---

## XML vs JSON 选择指南

| 维度 | XML 标签 | JSON Schema |
|------|----------|-------------|
| 可靠性 | 高（需要好的 prompt） | 最高（constrained decoding） |
| 灵活性 | 高（可嵌套、可混合自由文本） | 受限（严格 schema） |
| 解析难度 | 中（需要 XML parser） | 低（直接 `JSON.parse()`） |
| 适用场景 | 混合自由文本+结构数据 | 纯结构化数据提取 |
| Claude 偏好 | ✅ 原生擅长 | ✅ API 级保证 |

**经验法则**：
- 纯数据提取 → JSON Schema (`output_config.format`)
- 混合分析+数据 → XML 标签
- 分类任务 → Tool Use with enum 或 JSON Schema
- 需要自由文本+结构数据 → XML 标签

---

## Prefill 已弃用（Claude 4.6+）

从 Claude 4.6 开始，不再支持 prefilled responses。迁移方案：

| 旧用法 | 新方案 |
|--------|--------|
| 强制 JSON 格式 | `output_config.format` 或 Structured Outputs |
| 消除前言 | System prompt: "Respond directly without preamble." |
| 避免拒绝 | Claude 4.6 已改善，直接 prompt 即可 |
| 续写 | 在 user message 中提供上次中断的内容 |
