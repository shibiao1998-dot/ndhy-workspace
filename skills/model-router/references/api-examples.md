# API 调用示例

## 目录
- [环境配置](#环境配置)
- [文本对话](#文本对话)
- [图像生成](#图像生成)
- [嵌入与重排序](#嵌入与重排序)
- [PowerShell 调用技巧](#powershell-调用技巧)
- [错误处理](#错误处理)

---

## 环境配置

```bash
# .env 文件
AIAE_API_KEY=sk-nd-xxxx
AIAE_BASE_URL=https://ai-gateway.aiae.ndhy.com/v1
```

```python
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(
    api_key=os.getenv("AIAE_API_KEY"),
    base_url=os.getenv("AIAE_BASE_URL"),
)
```

---

## 文本对话

### 基础对话
```python
response = client.chat.completions.create(
    model="doubao-seed-2-0-pro-260215",
    messages=[
        {"role": "system", "content": "你是专业助手"},
        {"role": "user", "content": "你好"}
    ],
    temperature=0.7,
    max_tokens=2048,
)
print(response.choices[0].message.content)
# 成本追踪
print(f"费用: ¥{response.usage.total_price}")
```

### 流式输出
```python
stream = client.chat.completions.create(
    model="claude-sonnet-4-6",
    messages=[{"role": "user", "content": "写一篇技术文档"}],
    stream=True,
)
for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```

### 思考模式
```python
response = client.chat.completions.create(
    model="deepseek-v3.2-1201-thinking",
    messages=[{"role": "user", "content": "分析这个架构方案的优劣"}],
)
# reasoning_content 包含推理过程
print(response.choices[0].message.reasoning_content)
print(response.choices[0].message.content)
```

### 图片理解
```python
response = client.chat.completions.create(
    model="qwen3-vl-235b-a22b-instruct",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "描述这张UI设计图的布局和配色"},
            {"type": "image_url", "image_url": {"url": "https://example.com/ui.png"}}
        ]
    }],
)
```

---

## 图像生成

### Gemini Image（chat/completions 端点）
```python
response = client.chat.completions.create(
    model="gemini-3.1-flash-image-preview",
    messages=[{"role": "user", "content": "Generate a dark-theme dashboard UI"}],
    max_tokens=4096,
)
# 响应内容可能包含 base64 图片数据
```

### GPT Image / Seedream（images/generations 端点）
```python
response = client.images.generate(
    model="gpt-image-1.5",
    prompt="现代办公 SaaS 产品 UI，深色主题",
    n=1,
    size="1024x1024",
)
# b64_json 或 url
image_data = response.data[0].b64_json or response.data[0].url
```

### 保存图片
```python
import base64

b64 = response.data[0].b64_json
with open("output.png", "wb") as f:
    f.write(base64.b64decode(b64))
```

---

## 嵌入与重排序

### 文本嵌入
```python
embedding = client.embeddings.create(model="bge-m3", input="机器学习入门")
vector = embedding.data[0].embedding  # 1024 维
```

### 批量嵌入
```python
embeddings = client.embeddings.create(model="bge-m3", input=["文本1", "文本2", "文本3"])
```

### 重排序
```python
import requests

resp = requests.post(f"{BASE_URL}/rerank", headers=headers, json={
    "model": "bge-reranker-v2-m3",
    "query": "什么是机器学习",
    "documents": ["机器学习是AI分支", "今天天气好", "深度学习用神经网络"],
    "top_n": 3,
    "return_documents": True,
})
```

---

## PowerShell 调用技巧

> PowerShell 的 JSON 转义容易出错，推荐**写文件再引用**。

```powershell
# 设置环境变量
$env:AIAE_API_KEY = (Get-Content .env | Select-String "AIAE_API_KEY" | ForEach-Object { $_.Line.Split("=",2)[1] })

# 写入请求体到临时文件（避免转义问题）
@'
{"model":"gemini-3.1-flash-image-preview","messages":[{"role":"user","content":"Generate a UI mockup"}],"max_tokens":4096}
'@ | Out-File -Encoding utf8NoBOM req.json

# 调用 API
curl.exe -s "$env:AIAE_BASE_URL/chat/completions" `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $env:AIAE_API_KEY" `
  -d "@req.json" | Out-File -Encoding utf8 result.json
```

---

## 错误处理

```python
from openai import APIError, RateLimitError

def call_with_retry(fn, max_retries=3):
    for attempt in range(max_retries):
        try:
            return fn()
        except RateLimitError:
            wait = 2 ** attempt
            time.sleep(wait)
        except APIError as e:
            if attempt == max_retries - 1:
                raise
            time.sleep(1)
    raise Exception("Max retries exceeded")
```

| HTTP Code | 含义 | 处理 |
|-----------|------|------|
| 401 | API Key 无效 | 检查 Key |
| 404 | 模型不存在 | 检查 Model ID 大小写 |
| 429 | 频率限制 | 指数退避重试 |
| 500 | 服务端错误 | 重试或切换备选模型 |
