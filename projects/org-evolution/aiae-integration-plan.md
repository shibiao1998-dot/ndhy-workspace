# AIAE 网关 OpenClaw 集成方案

> 待老板审批后执行（🔴 高风险：修改 OpenClaw Gateway 配置）

## 当前状态
- 默认 provider: `ndhy-gateway/claude-opus-4-6`
- AIAE 网关已验证连通，138 个模型可用
- API Key 已存储在 `.env`

## 集成方案

### 方案 A：添加 AIAE 为独立 provider（推荐）

在 `openclaw.json` 中添加自定义 provider：

```json5
{
  models: {
    mode: "merge",
    providers: {
      "aiae": {
        baseUrl: "https://ai-gateway.aiae.ndhy.com/v1",
        apiKey: "${AIAE_API_KEY}",
        api: "openai-completions",
        models: [
          // Tier 1 旗舰
          { id: "gpt-5.4-2026-03-05", name: "GPT-5.4" },
          // 推理
          { id: "o3-2025-04-16", name: "O3 Reasoning" },
          { id: "o4-mini-2025-04-16", name: "O4-Mini Reasoning" },
          // 中文强势
          { id: "doubao-seed-2-0-pro-260215", name: "Doubao Seed 2.0 Pro" },
          { id: "qwen3.5-plus-2026-02-15", name: "Qwen 3.5 Plus" },
          // 经济
          { id: "deepseek-v3.2-1201", name: "DeepSeek V3.2" },
          { id: "qwen3.5-flash-2026-02-23", name: "Qwen 3.5 Flash" },
          // Gemini
          { id: "gemini-3.1-pro-preview", name: "Gemini 3.1 Pro" },
        ],
      },
    },
  },
}
```

### 好处
1. **主力不变**：默认仍用 `ndhy-gateway/claude-opus-4-6`
2. **按需切换**：特定任务可用 `/model aiae/doubao-seed-2-0-pro-260215` 切换
3. **心跳可用便宜模型**：改心跳 model 为 `aiae/qwen3.5-flash-2026-02-23`，每次心跳成本降 90%+
4. **session_status model override**：可为特定 session 设置不同模型

### 方案 B：子 Agent/ACP 内通过 curl/python 调用

不改 OpenClaw 配置，在 ACP 任务中通过代码直接调用 AIAE API。

适用场景：
- 图像/视频/语音生成（OpenClaw 不原生支持这些端点）
- 特定模型的嵌入/重排序任务
- Claude Code 任务中需要调用其他模型辅助时

## 建议行动

1. **方案 A + B 并行**：添加 aiae provider 用于文本模型路由，同时在 ACP 中用代码调用多媒体模型
2. **心跳模型立即可优化**：从 claude-opus-4-6 改为 aiae/qwen3.5-flash（成本降 95%+）
3. **图像/视频能力**通过 model-router Skill 指导 ACP 任务中使用

## 环境变量配置

需在 `openclaw.json` 的 `env` 段添加：
```json5
{
  env: {
    AIAE_API_KEY: "sk-nd-xxx"
  }
}
```

---

*待老板审批*
