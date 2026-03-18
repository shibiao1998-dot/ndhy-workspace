---
name: voice-transcribe
description: |
  飞书语音消息处理：自动转文字 + 语音回复。
  收到语音消息（audio/ogg）时用 Qwen3 Omni Flash 识别文字（¥0.0005/条）。
  需要语音回复时用 edge-tts 生成 MP3（免费，Azure 级音质）。
  **触发条件**：消息包含 [Audio:] 标记或 .ogg/.opus 附件
---

# Voice — 语音识别 + 语音回复

## 一、语音识别（听）

### 触发条件
消息包含 `[Audio: ...]` 标记或 `.ogg`/`.opus` 附件。

### 执行流程

```powershell
# 1. 读取音频文件并转 base64
$audioBytes = [IO.File]::ReadAllBytes("<音频路径>")
$audioB64 = [Convert]::ToBase64String($audioBytes)

# 2. 构建请求
$body = @{
    model = "qwen3-omni-flash-2025-12-01"
    messages = @(@{
        role = "user"
        content = @(
            @{ type = "text"; text = "请将这段语音转录为文字。只输出转录的文字内容。" }
            @{ type = "input_audio"; input_audio = @{ data = "data:audio/ogg;base64,$audioB64"; format = "ogg" } }
        )
    })
    max_tokens = 500
} | ConvertTo-Json -Depth 5
[IO.File]::WriteAllText("$env:TEMP\asr-req.json", $body)

# 3. 调用 AIAE 网关
$env:AIAE_API_KEY = "<从 .env 读取>"
curl.exe -s "https://ai-gateway.aiae.ndhy.com/v1/chat/completions" `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $env:AIAE_API_KEY" `
  -d "@$env:TEMP\asr-req.json"

# 4. 提取 choices[0].message.content 即为转录文字
```

| 项目 | 值 |
|------|-----|
| 模型 | `qwen3-omni-flash-2025-12-01` |
| 成本 | ~¥0.0005/条 |
| 延迟 | 1-3 秒 |

## 二、语音回复（说）

### 方案：edge-tts（Microsoft Edge TTS）

已安装 `edge-tts` v7.2.7。免费，Azure 级音质。

```powershell
# 清除代理（edge-tts 不支持 HTTPS 代理）
$env:HTTPS_PROXY = ""; $env:HTTP_PROXY = ""; $env:ALL_PROXY = ""

# 生成语音
edge-tts --voice zh-CN-YunxiNeural --text "要说的内容" --write-media "<输出路径>.mp3"
```

### 推荐音色

| Voice ID | 性别 | 风格 | 推荐场景 |
|----------|------|------|---------|
| `zh-CN-YunxiNeural` | 男 | 阳光 | **默认推荐** |
| `zh-CN-XiaoxiaoNeural` | 女 | 温暖 | 女声推荐 |
| `zh-CN-YunjianNeural` | 男 | 激情 | 汇报场景 |
| `zh-CN-YunyangNeural` | 男 | 专业 | 正式场景 |

### 发送语音

生成 MP3 后通过 `MEDIA:<文件路径>` 发送。

## 三、注意事项

- edge-tts 需要清除代理环境变量才能正常工作
- AIAE 网关的 Seed TTS 当前不可用（speaker 资源不匹配）
- 音频文件在 `D:\code\openclaw-home\media\inbound\` 目录
