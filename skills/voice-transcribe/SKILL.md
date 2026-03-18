---
name: voice-transcribe
description: |
  飞书语音消息自动转文字。当收到语音消息（audio/ogg 文件）时使用此技能。
  使用 AIAE 网关的 Qwen3 Omni Flash 模型进行语音识别，支持中英文，成本极低（约¥0.0005/条）。
  **触发条件**：消息包含 [Audio:] 标记或 .ogg/.opus 附件
---

# Voice Transcribe — 语音消息转文字

## 触发条件

当收到的消息包含以下任一特征时，立即执行本技能：
- `[Audio: ...]` 标记
- `.ogg` 或 `.opus` 附件
- `audio/ogg` 类型的媒体文件

## 执行流程

### Step 1：提取音频文件路径

从消息中提取音频文件的完整路径，通常在 `D:\code\openclaw-home\media\inbound\` 目录。

### Step 2：调用 Qwen3 Omni Flash 识别

使用 PowerShell 执行：

```powershell
$audioPath = "<音频文件路径>"
$audioBytes = [IO.File]::ReadAllBytes($audioPath)
$audioB64 = [Convert]::ToBase64String($audioBytes)

$body = @{
    model = "qwen3-omni-flash-2025-12-01"
    messages = @(
        @{
            role = "user"
            content = @(
                @{ type = "text"; text = "请将这段语音转录为文字。只输出转录的文字内容。" }
                @{ type = "input_audio"; input_audio = @{ data = "data:audio/ogg;base64,$audioB64"; format = "ogg" } }
            )
        }
    )
    max_tokens = 500
} | ConvertTo-Json -Depth 5

[IO.File]::WriteAllText("$env:TEMP\asr-req.json", $body)
$env:AIAE_API_KEY = "<从 .env 读取>"
$result = curl.exe -s "https://ai-gateway.aiae.ndhy.com/v1/chat/completions" `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $env:AIAE_API_KEY" `
  -d "@$env:TEMP\asr-req.json"
```

### Step 3：解析结果

从响应 JSON 中提取 `choices[0].message.content`，即为转录文字。

### Step 4：回复用户

格式：直接将转录文字作为用户的输入来理解和回复，就像用户直接打字一样。不需要特别提示"你说了XXX"，除非用户在测试语音功能。

## 技术细节

| 项目 | 值 |
|------|-----|
| 模型 | `qwen3-omni-flash-2025-12-01` |
| 端点 | `https://ai-gateway.aiae.ndhy.com/v1/chat/completions` |
| 音频格式 | OGG/Opus（飞书语音默认格式） |
| 支持语言 | 中文、英文及多语言 |
| 平均成本 | ¥0.0005/条 |
| 平均延迟 | 1-3 秒 |

## 注意事项

- API Key 从环境变量或 `.env` 文件读取，**不硬编码**
- 音频文件通常在 `D:\code\openclaw-home\media\inbound\` 目录
- 文件名格式：`<随机ID>.ogg`
- 如果识别失败，告诉用户"语音识别失败"并建议用文字
