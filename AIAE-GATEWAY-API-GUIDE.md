# AIAE 网关 API 使用指南

> 本文档详细说明 AIAE AI 网关的所有可用模型及其调用方式，供 Openclaw 系统集成使用。

## 1. 基础连接信息

| 项目 | 值 |
|------|-----|
| **Base URL** | `https://ai-gateway.aiae.ndhy.com/v1` |
| **API Key** | 存放于 `.env` 文件中的 `AIAE_API_KEY` |
| **协议** | OpenAI Compatible API |
| **认证方式** | `Authorization: Bearer <API_KEY>` |
| **Content-Type** | `application/json` |

### 凭证管理

API Key 存放在项目根目录 `.env` 文件中（已被 `.gitignore` 排除，不会进入版本控制）：

```
# .env 文件内容
AIAE_API_KEY=sk-nd-xxxx...xxxx
AIAE_BASE_URL=https://ai-gateway.aiae.ndhy.com/v1
```

### 环境变量配置（推荐）

```bash
# 从 .env 加载，或手动 export
export OPENAI_API_KEY="$AIAE_API_KEY"
export OPENAI_BASE_URL="https://ai-gateway.aiae.ndhy.com/v1"
```

### Python SDK 初始化

```python
import os
from openai import OpenAI
from dotenv import load_dotenv  # pip install python-dotenv

load_dotenv()  # 自动读取 .env 文件

client = OpenAI(
    api_key=os.getenv("AIAE_API_KEY"),
    base_url=os.getenv("AIAE_BASE_URL", "https://ai-gateway.aiae.ndhy.com/v1"),
)
```

### 列出所有可用模型

```bash
curl https://ai-gateway.aiae.ndhy.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

---

## 2. 全部可用模型一览（138 个）

### 2.1 文本对话模型（Chat Completions）

#### OpenAI GPT 系列

| Model ID | 说明 |
|----------|------|
| `gpt-5.4-2026-03-05` | GPT-5.4 最新旗舰 |
| `gpt-5.2-2025-12-11` | GPT-5.2 |
| `gpt-5.1-2025-11-13` | GPT-5.1 |
| `gpt-5-2025-08-07` | GPT-5 |
| `gpt-4.1-2025-04-14` | GPT-4.1 |
| `gpt-4o-2024-11-20` | GPT-4o 多模态 |

#### OpenAI 推理系列

| Model ID | 说明 |
|----------|------|
| `o4-mini-2025-04-16` | O4-Mini 推理模型 |
| `o3-2025-04-16` | O3 推理模型 |
| `o3-mini-2025-01-31` | O3-Mini 轻量推理 |
| `o1-2024-12-17` | O1 推理模型 |

#### Claude 系列

| Model ID | 说明 |
|----------|------|
| `claude-opus-4-6` | Claude Opus 4.6 旗舰 |
| `claude-opus-4-5-20251101` | Claude Opus 4.5 |
| `claude-opus-4-1-20250805` | Claude Opus 4.1 |
| `claude-sonnet-4-6` | Claude Sonnet 4.6 |
| `claude-sonnet-4-5-20250929` | Claude Sonnet 4.5 |
| `claude-sonnet-4-20250514` | Claude Sonnet 4 |

#### Gemini 系列

| Model ID | 说明 |
|----------|------|
| `gemini-3.1-pro-preview` | Gemini 3.1 Pro |
| `gemini-3-pro-preview` | Gemini 3 Pro |
| `gemini-3-flash-preview` | Gemini 3 Flash |
| `gemini-2.5-pro` | Gemini 2.5 Pro |
| `gemini-2.5-flash` | Gemini 2.5 Flash |

#### DeepSeek 系列

| Model ID | 说明 |
|----------|------|
| `DeepSeek-R1-0528` | DeepSeek R1 推理 |
| `deepseek-r1-250528` | DeepSeek R1（别名） |
| `deepseek-v3.2-1201` | DeepSeek V3.2 |
| `deepseek-v3.2-1201-thinking` | DeepSeek V3.2 思考模式 |
| `deepseek-v3.1-terminus` | DeepSeek V3.1 Terminus |
| `deepseek-v3.1-terminus-thinking` | DeepSeek V3.1 思考模式 |
| `deepseek-v3-2-251201` | DeepSeek V3-2 |
| `deepseek-v3-250324` | DeepSeek V3 |
| `deepseek-v3-0324` | DeepSeek V3（别名） |
| `deepseek-v3-1-terminus` | DeepSeek V3-1 Terminus |

#### 通义千问 Qwen 系列

| Model ID | 说明 |
|----------|------|
| `qwen3.5-plus-2026-02-15` | Qwen 3.5 Plus 最新 |
| `qwen3.5-flash-2026-02-23` | Qwen 3.5 Flash |
| `qwen3-max-2025-09-23` | Qwen 3 Max |
| `qwen-max-2025-01-25` | Qwen Max |
| `qwen-max-2025-01-25-thinking` | Qwen Max 思考模式 |
| `qwen-plus-2025-09-11` | Qwen Plus |
| `qwen-plus-2025-09-11-thinking` | Qwen Plus 思考模式 |
| `qwen-plus-2025-07-28` | Qwen Plus（旧版） |
| `qwen-plus-2025-07-28-thinking` | Qwen Plus 思考模式 |
| `qwen-flash-2025-07-28` | Qwen Flash |
| `qwen-flash-2025-07-28-thinking` | Qwen Flash 思考模式 |
| `qwen-long` | Qwen Long 长上下文 |

#### 通义千问视觉模型

| Model ID | 说明 |
|----------|------|
| `qwen3-vl-235b-a22b-instruct` | Qwen3 VL 235B |
| `qwen3-vl-235b-a22b-thinking` | Qwen3 VL 235B 思考模式 |
| `qwen3-vl-plus-2025-09-23` | Qwen3 VL Plus |
| `qwen3-vl-plus-2025-09-23-thinking` | Qwen3 VL Plus 思考 |
| `qwen3-vl-flash-2025-10-15` | Qwen3 VL Flash |
| `qwen3-vl-flash-2025-10-15-thinking` | Qwen3 VL Flash 思考 |
| `qwen-vl-max-2025-08-13` | Qwen VL Max |
| `qwen3-omni-flash-2025-12-01` | Qwen3 Omni Flash 全模态 |

#### 豆包 Doubao 文本系列

| Model ID | 说明 |
|----------|------|
| `doubao-seed-2-0-pro-260215` | Doubao Seed 2.0 Pro 旗舰 |
| `doubao-seed-2-0-pro-preview-260115` | Doubao Seed 2.0 Pro Preview |
| `doubao-seed-2-0-mini-260215` | Doubao Seed 2.0 Mini |
| `doubao-seed-2-0-mini-preview-260115` | Doubao Seed 2.0 Mini Preview |
| `doubao-seed-2-0-lite-260215` | Doubao Seed 2.0 Lite |
| `doubao-seed-1.8-preview` | Doubao Seed 1.8 Preview |
| `doubao-seed-1-8-251228` | Doubao Seed 1.8 |
| `doubao-seed-1-8-251215` | Doubao Seed 1.8（旧版） |
| `doubao-seed-1-6` | Doubao Seed 1.6 |
| `doubao-seed-1-6-250615` | Doubao Seed 1.6（日期版） |
| `doubao-seed-1-6-flash` | Doubao Seed 1.6 Flash |
| `doubao-seed-1-6-flash-250828` | Doubao Seed 1.6 Flash（日期版） |
| `doubao-seed-1-6-vision-250815` | Doubao Seed 1.6 Vision |
| `doubao-1-5-pro-32k-250115` | Doubao 1.5 Pro 32K |
| `doubao-1-5-lite-32k-250115` | Doubao 1.5 Lite 32K |
| `doubao-1-5-vision-pro-32k-250115` | Doubao 1.5 Vision Pro |

#### Kimi 系列

| Model ID | 说明 |
|----------|------|
| `kimi-k2-250905` | Kimi K2 |

#### 可灵 Kling 系列（视频相关，见下文视频章节）

| Model ID | 说明 |
|----------|------|
| `K` | 可灵基础 |
| `K1` | 可灵 1.0 |
| `K1.5` | 可灵 1.5 |
| `K1.6` | 可灵 1.6 |
| `K2` | 可灵 2.0 |
| `K2.5-Turbo` | 可灵 2.5 Turbo |
| `K2.6` | 可灵 2.6 |
| `K21` | 可灵 21 |
| `K21-Master` | 可灵 21 Master |
| `KO1` | 可灵 O1 |
| `K-V2A` | 可灵 视频转音频 |

---

### 2.2 向量嵌入模型（Embeddings）

| Model ID | 说明 |
|----------|------|
| `bge-m3` | BGE-M3 多语言嵌入，支持稠密/稀疏/ColBERT |
| `doubao-embedding-vision-251215` | Doubao 多模态嵌入（文本+图像） |
| `text-embedding-3-large` | OpenAI Embedding 3 Large |
| `text-embedding-ada-002` | OpenAI Embedding Ada 002 |

### 2.3 重排序模型（Rerank）

| Model ID | 说明 |
|----------|------|
| `bge-reranker-v2-m3` | BGE Reranker V2 M3，多语言重排序 |

### 2.4 语音模型（TTS / ASR）

| Model ID | 说明 |
|----------|------|
| `seed-tts-2.0` | Doubao Seed TTS 2.0 语音合成 |
| `seed-tts-1.0` | Doubao Seed TTS 1.0 语音合成 |
| `volc.seedasr.auc` | 火山语音识别（ASR） |

### 2.5 图像生成模型（Image Generation）

| Model ID | 说明 |
|----------|------|
| `gemini-3.1-flash-image-preview` | Nano Banana 2（Gemini 3.1 Flash Image），4K 图像生成/编辑 |
| `gemini-3-pro-image-preview` | Nano Banana Pro（Gemini 3 Pro Image） |
| `gemini-2.5-flash-image` | Gemini 2.5 Flash Image |
| `gpt-image-1.5` | GPT Image 1.5 |
| `gpt-image-1` | GPT Image 1 |
| `doubao-seedream-5-0-260128` | Seedream 5.0 图像生成 |
| `doubao-seedream-4-5-251128` | Seedream 4.5 图像生成 |
| `doubao-seedream-4-0-250828` | Seedream 4.0 图像生成 |
| `doubao-seedream-3-0-t2i-250415` | Seedream 3.0 文生图 |
| `hunyuan-image-3` | 腾讯混元 Image 3 |
| `MidJourney` | MidJourney |

### 2.6 视频生成模型（Video Generation）

| Model ID | 说明 |
|----------|------|
| `sora-2` | OpenAI Sora 2 视频生成 |
| `doubao-seedance-1-5-pro-251215` | Seedance 1.5 Pro 视频生成 |
| `doubao-seedance-1-0-pro-250528` | Seedance 1.0 Pro |
| `doubao-seedance-1-0-pro-fast-251015` | Seedance 1.0 Pro Fast |
| `doubao-seedance-1-0-lite-t2v-250428` | Seedance 1.0 Lite 文生视频 |
| `doubao-seedance-1-0-lite-i2v-250428` | Seedance 1.0 Lite 图生视频 |
| `jimeng-seedance-dreamontage` | 即梦 Dreamontage 视频剪辑 |
| `Vira/text2video` | Vira 文生视频 |
| `Vira/image2video` | Vira 图生视频 |
| `Vira/reference2video` | Vira 参考视频生成 |
| `Vira/startEnd2video` | Vira 首尾帧生成视频 |

### 2.7 3D 生成模型

| Model ID | 说明 |
|----------|------|
| `hunyuan-3d-3.1` | 腾讯混元 3D 3.1 |
| `hunyuan-3d-3` | 腾讯混元 3D 3.0 |
| `hunyuan-3d-part` | 腾讯混元 3D 部件生成 |

### 2.8 数字人模型

| Model ID | 说明 |
|----------|------|
| `omnihuman-1.5` | OmniHuman 1.5 数字人驱动 |

### 2.9 其他工具模型

| Model ID | 说明 |
|----------|------|
| `saliency-seg` | 显著性分割（抠图） |

---

## 3. 各类型模型调用方式

### 3.1 文本对话（Chat Completions）

**端点**: `POST /v1/chat/completions`

适用模型: 所有 GPT、Claude、Gemini（非 image 变体）、DeepSeek、Qwen、Doubao Seed 文本系列、Kimi 等。

#### curl 示例

```bash
curl https://ai-gateway.aiae.ndhy.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "doubao-seed-2-0-pro-260215",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "你好，请介绍一下自己"}
    ],
    "temperature": 0.7,
    "max_tokens": 2048
  }'
```

#### Python 示例

```python
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
    api_key=os.getenv("AIAE_API_KEY"),
    base_url=os.getenv("AIAE_BASE_URL"),
)

# 普通对话
response = client.chat.completions.create(
    model="doubao-seed-2-0-pro-260215",
    messages=[
        {"role": "system", "content": "你是一个有帮助的助手。"},
        {"role": "user", "content": "你好"}
    ],
    temperature=0.7,
    max_tokens=2048,
)
print(response.choices[0].message.content)
```

#### 流式输出

```python
stream = client.chat.completions.create(
    model="gpt-5.4-2026-03-05",
    messages=[{"role": "user", "content": "写一首诗"}],
    stream=True,
)
for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```

#### 思考模式（Thinking）

部分模型带 `-thinking` 后缀，支持展示推理过程：

```python
response = client.chat.completions.create(
    model="deepseek-v3.2-1201-thinking",
    messages=[{"role": "user", "content": "9.11和9.9哪个大？请一步步推理。"}],
)
print(response.choices[0].message.content)
```

适用模型: `deepseek-v3.2-1201-thinking`, `deepseek-v3.1-terminus-thinking`, `qwen-max-2025-01-25-thinking`, `qwen-plus-*-thinking`, `qwen-flash-*-thinking`, `qwen3-vl-*-thinking`

#### 多模态（图片理解）

```python
response = client.chat.completions.create(
    model="gpt-4o-2024-11-20",  # 或 doubao-seed-1-6-vision-250815, qwen3-vl-* 等
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "请描述这张图片的内容"},
                {
                    "type": "image_url",
                    "image_url": {"url": "https://example.com/image.jpg"}
                }
            ]
        }
    ],
)
print(response.choices[0].message.content)
```

支持图片理解的模型: `gpt-4o-2024-11-20`, `gpt-5*`, `doubao-seed-1-6-vision-250815`, `doubao-1-5-vision-pro-32k-250115`, `qwen3-vl-*`, `qwen-vl-max-*`, `gemini-*`

---

### 3.2 向量嵌入（Embeddings）

**端点**: `POST /v1/embeddings`

#### curl 示例

```bash
curl https://ai-gateway.aiae.ndhy.com/v1/embeddings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "bge-m3",
    "input": "今天天气怎么样"
  }'
```

#### Python 示例

```python
# 单条文本嵌入
embedding = client.embeddings.create(
    model="bge-m3",
    input="今天天气怎么样",
)
vector = embedding.data[0].embedding
print(f"维度: {len(vector)}, 前5维: {vector[:5]}")

# 批量文本嵌入
embeddings = client.embeddings.create(
    model="bge-m3",
    input=["文本1", "文本2", "文本3"],
)
for item in embeddings.data:
    print(f"Index {item.index}: dim={len(item.embedding)}")
```

#### 多模态嵌入（doubao-embedding-vision）

```python
# 文本嵌入
embedding = client.embeddings.create(
    model="doubao-embedding-vision-251215",
    input="一只可爱的猫",
)

# 图像嵌入（通过 image_url 方式，需网关支持）
# 具体参数格式请参照火山引擎文档，可能需要 multimodal input 格式
```

#### 各嵌入模型对比

| Model ID | 维度 | 多语言 | 多模态 | 推荐场景 |
|----------|------|--------|--------|----------|
| `bge-m3` | 1024 | 100+ 语言 | 否 | RAG 检索、语义搜索 |
| `doubao-embedding-vision-251215` | 1024 | 中英 | 是（文本+图像） | 多模态搜索 |
| `text-embedding-3-large` | 3072 | 多语言 | 否 | 高精度语义匹配 |
| `text-embedding-ada-002` | 1536 | 多语言 | 否 | 通用嵌入 |

---

### 3.3 重排序（Rerank）

**端点**: `POST /v1/rerank`（Cohere 兼容格式）

#### curl 示例

```bash
curl https://ai-gateway.aiae.ndhy.com/v1/rerank \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "bge-reranker-v2-m3",
    "query": "什么是机器学习？",
    "documents": [
      "机器学习是人工智能的一个分支",
      "今天天气很好",
      "深度学习使用神经网络来学习数据表示",
      "我喜欢吃苹果"
    ],
    "top_n": 3,
    "return_documents": true
  }'
```

#### Python 示例（使用 requests）

```python
import os
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("AIAE_API_KEY")
BASE_URL = os.getenv("AIAE_BASE_URL", "https://ai-gateway.aiae.ndhy.com/v1")

resp = requests.post(
    f"{BASE_URL}/rerank",
    headers={
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    },
    json={
        "model": "bge-reranker-v2-m3",
        "query": "什么是机器学习？",
        "documents": [
            "机器学习是人工智能的一个分支",
            "今天天气很好",
            "深度学习使用神经网络来学习数据表示",
            "我喜欢吃苹果"
        ],
        "top_n": 3,
        "return_documents": True,
    },
)
results = resp.json()
for r in results.get("results", []):
    print(f"排名 {r['index']}: 相关性={r['relevance_score']:.4f}")
```

#### 典型 RAG 流程中的使用

```
用户查询 → BGE-M3 向量检索 Top-20 → BGE-Reranker 重排序 → 取 Top-5 → LLM 生成回答
```

---

### 3.4 语音合成（TTS）

**端点**: `POST /v1/audio/speech`（OpenAI TTS 兼容格式）

#### curl 示例

```bash
curl https://ai-gateway.aiae.ndhy.com/v1/audio/speech \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "seed-tts-2.0",
    "input": "你好，欢迎使用 AIAE 网关的语音合成服务！",
    "voice": "alloy"
  }' \
  --output speech.mp3
```

#### Python 示例

```python
response = client.audio.speech.create(
    model="seed-tts-2.0",
    input="你好，欢迎使用语音合成服务！",
    voice="alloy",  # 可选: alloy, echo, fable, onyx, nova, shimmer
)
response.stream_to_file("output.mp3")
```

> **注意**: Seed TTS 2.0 的 voice 参数可能支持火山引擎原生音色名称。如果 OpenAI 兼容格式不生效，请尝试直接使用火山引擎 TTS 协议调用。具体音色列表以网关实际支持为准。

---

### 3.5 语音识别（ASR）

**端点**: `POST /v1/audio/transcriptions`（OpenAI Whisper 兼容格式）

#### Python 示例

```python
audio_file = open("recording.mp3", "rb")
transcript = client.audio.transcriptions.create(
    model="volc.seedasr.auc",
    file=audio_file,
)
print(transcript.text)
```

---

### 3.6 图像生成（Image Generation）

#### 方式一：Gemini / GPT-Image 通过 Chat Completions 生成图像

部分图像模型（Gemini Image 系列）通过 Chat Completions 端点调用，在 response 中返回图像：

```python
response = client.chat.completions.create(
    model="gemini-3.1-flash-image-preview",  # Nano Banana 2
    messages=[
        {"role": "user", "content": "Generate an image of a sunset over mountains"}
    ],
)
# 响应中包含图像数据（base64 或 URL），具体格式取决于网关实现
print(response.choices[0].message.content)
```

#### 方式二：OpenAI Images 端点

**端点**: `POST /v1/images/generations`

```bash
curl https://ai-gateway.aiae.ndhy.com/v1/images/generations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-image-1",
    "prompt": "一只在月光下奔跑的白色柴犬，水彩风格",
    "n": 1,
    "size": "1024x1024"
  }'
```

```python
response = client.images.generate(
    model="gpt-image-1",
    prompt="一只在月光下奔跑的白色柴犬，水彩风格",
    n=1,
    size="1024x1024",
)
print(response.data[0].url)  # 或 response.data[0].b64_json
```

#### Seedream 图像生成

```python
response = client.images.generate(
    model="doubao-seedream-5-0-260128",
    prompt="一个未来城市的鸟瞰图，赛博朋克风格",
    n=1,
    size="1024x1024",
)
print(response.data[0].url)
```

#### 各图像模型对比

| Model ID | 来源 | 最大分辨率 | 特点 |
|----------|------|-----------|------|
| `gemini-3.1-flash-image-preview` | Google | 4K | Nano Banana 2，速度快，文字渲染好 |
| `gemini-3-pro-image-preview` | Google | 4K | Nano Banana Pro，质量最高 |
| `gpt-image-1.5` | OpenAI | - | GPT Image 最新 |
| `gpt-image-1` | OpenAI | - | GPT Image |
| `doubao-seedream-5-0-260128` | ByteDance | - | Seedream 5.0 最新 |
| `hunyuan-image-3` | Tencent | - | 混元 Image 3 |
| `MidJourney` | MidJourney | - | MidJourney |

---

### 3.7 视频生成（Video Generation）

视频生成通常为**异步任务**模式：提交生成请求 → 获取任务 ID → 轮询获取结果。

#### Sora 2

```bash
# 提交视频生成任务
curl https://ai-gateway.aiae.ndhy.com/v1/videos/generations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "sora-2",
    "prompt": "一只金毛犬在沙滩上奔跑，阳光明媚，电影级画质",
    "size": "1280x720",
    "duration": 5
  }'
```

```python
import os, requests, time
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("AIAE_API_KEY")
BASE_URL = os.getenv("AIAE_BASE_URL", "https://ai-gateway.aiae.ndhy.com/v1")

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
}

# 步骤1: 提交任务
resp = requests.post(
    f"{BASE_URL}/videos/generations",
    headers=headers,
    json={
        "model": "sora-2",
        "prompt": "一只金毛犬在沙滩上奔跑",
        "size": "1280x720",
        "duration": 5,
    },
)
task = resp.json()
task_id = task.get("id")
print(f"任务已提交: {task_id}")

# 步骤2: 轮询结果
while True:
    status_resp = requests.get(
        f"{BASE_URL}/videos/generations/{task_id}",
        headers=headers,
    )
    result = status_resp.json()
    if result.get("status") == "completed":
        print(f"视频URL: {result['data'][0]['url']}")
        break
    elif result.get("status") == "failed":
        print(f"生成失败: {result.get('error')}")
        break
    print(f"状态: {result.get('status')}，等待中...")
    time.sleep(10)
```

#### Seedance 视频生成

```python
# 文生视频
resp = requests.post(
    "https://ai-gateway.aiae.ndhy.com/v1/videos/generations",
    headers=headers,
    json={
        "model": "doubao-seedance-1-5-pro-251215",
        "prompt": "城市夜景的延时摄影，车流光轨",
    },
)
```

#### 各视频模型说明

| Model ID | 来源 | 类型 | 说明 |
|----------|------|------|------|
| `sora-2` | OpenAI | 文/图生视频 | Sora 2，带同步音频 |
| `doubao-seedance-1-5-pro-251215` | ByteDance | 文/图生视频 | Seedance 1.5 Pro |
| `doubao-seedance-1-0-pro-250528` | ByteDance | 文/图生视频 | Seedance 1.0 Pro |
| `doubao-seedance-1-0-pro-fast-251015` | ByteDance | 文/图生视频 | 快速版 |
| `doubao-seedance-1-0-lite-t2v-250428` | ByteDance | 文生视频 | 轻量版 |
| `doubao-seedance-1-0-lite-i2v-250428` | ByteDance | 图生视频 | 轻量版 |
| `jimeng-seedance-dreamontage` | ByteDance | 视频剪辑 | 即梦 Dreamontage |
| `Vira/text2video` | Vira | 文生视频 | - |
| `Vira/image2video` | Vira | 图生视频 | - |
| `Vira/reference2video` | Vira | 参考生成 | - |
| `Vira/startEnd2video` | Vira | 首尾帧 | - |
| `K`, `K1`~`K2.6`, `K21` 等 | 快手可灵 | 视频生成 | 可灵 AI 系列 |

---

### 3.8 3D 模型生成

```python
resp = requests.post(
    "https://ai-gateway.aiae.ndhy.com/v1/images/generations",  # 端点待确认
    headers=headers,
    json={
        "model": "hunyuan-3d-3.1",
        "prompt": "一个精致的中式茶壶，3D模型",
    },
)
```

> **注意**: 3D 生成和数字人模型的具体端点和参数格式，可能与标准 OpenAI 格式有差异，建议调用时先测试确认。

---

## 4. 推荐模型选用策略

### 按场景选模型

| 场景 | 推荐模型 | 备选 |
|------|---------|------|
| **日常对话** | `claude-opus-4-6` | `gpt-5.4-2026-03-05` |
| **代码生成** | `claude-opus-4-6`                | `gpt-5.4-2026-03-05`             |
| **复杂推理** | `claude-opus-4-6` | `gpt-5.4-2026-03-05` |
| **长文本处理** | `claude-sonnet-4-6` | `gemini-3.1-pro-preview` |
| **图片理解** | `claude-opus-4-6` | `gpt-5.4-2026-03-05` |
| **文本嵌入（RAG）** | `bge-m3` | `text-embedding-3-large` |
| **搜索重排序** | `bge-reranker-v2-m3` | - |
| **图像生成** | `gemini-3.1-flash-image-preview` | `doubao-seedream-5-0-260128` |
| **视频生成** | `sora-2` | `doubao-seedance-1-5-pro-251215` |
| **语音合成** | `seed-tts-2.0` | `seed-tts-1.0` |
| **语音识别** | `volc.seedasr.auc` | - |
| **3D 生成** | `hunyuan-3d-3.1` | - |
| **数字人** | `omnihuman-1.5` | - |
| **抠图/分割** | `saliency-seg` | - |
|                     |                                  |                                  |

---

## 5. 错误处理

### 常见错误码

| HTTP Code | 含义 | 处理方式 |
|-----------|------|---------|
| 401 | API Key 无效 | 检查 Key 是否正确 |
| 404 | 模型不存在 | 检查 model ID 是否拼写正确 |
| 429 | 请求过于频繁 | 增加请求间隔，实现指数退避 |
| 500 | 服务端错误 | 重试，或切换备选模型 |

### 重试策略示例

```python
import os, time
from openai import OpenAI, APIError, RateLimitError
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
    api_key=os.getenv("AIAE_API_KEY"),
    base_url=os.getenv("AIAE_BASE_URL"),
)

def chat_with_retry(model, messages, max_retries=3):
    for attempt in range(max_retries):
        try:
            return client.chat.completions.create(
                model=model,
                messages=messages,
            )
        except RateLimitError:
            wait = 2 ** attempt
            print(f"Rate limited, waiting {wait}s...")
            time.sleep(wait)
        except APIError as e:
            print(f"API error: {e}, retrying...")
            time.sleep(1)
    raise Exception("Max retries exceeded")
```

---

## 6. 注意事项

1. **所有文本对话模型**均通过 `/v1/chat/completions` 端点调用，参数完全兼容 OpenAI API 格式。
2. **嵌入模型**通过 `/v1/embeddings` 端点调用。
3. **重排序模型**通过 `/v1/rerank` 端点调用（Cohere 兼容格式）。
4. **语音合成**通过 `/v1/audio/speech` 端点调用。
5. **图像生成**根据模型不同，可能通过 `/v1/images/generations` 或 `/v1/chat/completions` 调用。
6. **视频/3D/数字人**等生成类模型通常为异步任务模式，具体端点和轮询方式以网关实际实现为准。
7. **Model ID 区分大小写**，请严格按照本文档中列出的 ID 填写。
8. 如遇到某个模型调用失败，可先通过 `GET /v1/models` 确认该模型在列表中。
