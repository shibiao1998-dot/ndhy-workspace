# 视频 / 语音 / 3D / 特种模型详解

## 目录
- [视频生成模型](#视频生成模型)
- [语音模型](#语音模型)
- [3D 模型](#3d-模型)
- [特种模型](#特种模型)

---

## 视频生成模型

> 视频生成为**异步任务**：提交请求 → 获取 task_id → 轮询获取结果

### 对比矩阵

| 模型 | 来源 | 最大分辨率 | 最长时长 | 音频 | 品质 | 速度 |
|------|------|-----------|---------|------|------|------|
| `sora-2` | OpenAI | 1080p | 25s | ✅ 同步音频 | ⭐⭐⭐⭐⭐ | 慢 |
| `doubao-seedance-1-5-pro-251215` | ByteDance | 1080p | — | — | ⭐⭐⭐⭐ | 中 |
| `doubao-seedance-1-0-pro-250528` | ByteDance | — | — | — | ⭐⭐⭐ | 中 |
| `doubao-seedance-1-0-pro-fast-251015` | ByteDance | — | — | — | ⭐⭐⭐ | 快 |
| `K2.6` | 快手可灵 | 4K@60fps | — | — | ⭐⭐⭐⭐ | 中 |
| `K21-Master` | 快手可灵 | — | — | — | ⭐⭐⭐⭐⭐ | 慢 |
| `Vira/text2video` | Vidu | — | — | — | ⭐⭐⭐ | 中 |

### 场景选型

| 场景 | 推荐模型 | 理由 |
|------|---------|------|
| 电影级演示视频 | `sora-2` | 最自然运镜、同步音频、电影感 |
| 产品演示 | `doubao-seedance-1-5-pro-251215` | 性价比好 |
| 快速视频原型 | `doubao-seedance-1-0-pro-fast-251015` | 速度快 |
| 高清视频（4K） | `K2.6` | 原生 4K |
| 大师级品质 | `K21-Master` | 可灵最强 |
| 图生视频 | `doubao-seedance-1-0-lite-i2v-250428` / `Vira/image2video` | — |
| 首尾帧视频 | `Vira/startEnd2video` | 精确控制 |
| 视频剪辑 | `jimeng-seedance-dreamontage` | 即梦 Dreamontage |

### 调用示例（Sora 2）

```python
import requests, time

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
}

# 步骤1: 提交任务
resp = requests.post(f"{BASE_URL}/videos/generations", headers=headers, json={
    "model": "sora-2",
    "prompt": "产品演示动画，现代办公场景",
    "size": "1280x720",
    "duration": 5,
})
task_id = resp.json().get("id")

# 步骤2: 轮询结果（建议间隔 10s）
while True:
    result = requests.get(f"{BASE_URL}/videos/generations/{task_id}", headers=headers).json()
    if result.get("status") == "completed":
        video_url = result["data"][0]["url"]
        break
    elif result.get("status") == "failed":
        raise Exception(f"Failed: {result.get('error')}")
    time.sleep(10)
```

---

## 语音模型

### 语音合成（TTS）

| 模型 | 版本 | 端点 |
|------|------|------|
| `seed-tts-2.0` | 最新 | `/v1/audio/speech` |
| `seed-tts-1.0` | 旧版 | `/v1/audio/speech` |

**调用示例**：
```python
response = client.audio.speech.create(
    model="seed-tts-2.0",
    input="欢迎使用 NDHY AI Agent Team！",
    voice="alloy",  # alloy/echo/fable/onyx/nova/shimmer
)
response.stream_to_file("output.mp3")
```

### 语音识别（ASR）

| 模型 | 端点 |
|------|------|
| `volc.seedasr.auc` | `/v1/audio/transcriptions` |

```python
with open("recording.mp3", "rb") as f:
    transcript = client.audio.transcriptions.create(model="volc.seedasr.auc", file=f)
print(transcript.text)
```

---

## 3D 模型

| 模型 | 能力 |
|------|------|
| `hunyuan-3d-3.1` | 腾讯混元 3D 最新版 |
| `hunyuan-3d-3` | 腾讯混元 3D 3.0 |
| `hunyuan-3d-part` | 3D 部件生成 |

> 注意：3D 生成端点和参数可能与标准 OpenAI 格式有差异，建议先测试。

---

## 特种模型

| 模型 | 能力 | 场景 |
|------|------|------|
| `omnihuman-1.5` | 数字人驱动 | 视频数字人、虚拟主播 |
| `saliency-seg` | 显著性分割（抠图） | 图片处理、背景移除 |
| `K-V2A` | 视频转音频 | 为无声视频配音 |

---

## 嵌入与重排序

### 嵌入模型对比

| 模型 | 维度 | 多语言 | 多模态 | 场景 |
|------|------|--------|--------|------|
| `bge-m3` | 1024 | 100+ 语言 | ❌ | RAG 语义搜索（推荐） |
| `text-embedding-3-large` | 3072 | 多语言 | ❌ | 高精度语义匹配 |
| `text-embedding-ada-002` | 1536 | 多语言 | ❌ | 通用嵌入 |
| `doubao-embedding-vision-251215` | 1024 | 中英 | ✅ | 多模态搜索 |

### 重排序模型

| 模型 | 能力 |
|------|------|
| `bge-reranker-v2-m3` | 多语言重排序，RAG 必备 |

### 典型 RAG Pipeline

```
用户查询 → bge-m3 向量检索 Top-20 → bge-reranker-v2-m3 重排序 → 取 Top-5 → LLM 生成回答
```
