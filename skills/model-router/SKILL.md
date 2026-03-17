---
name: model-router
description: |
  AIAE 网关多模型智能路由。根据任务类型自动选择最优 AI 模型。
  覆盖 138 个模型：文本对话、推理、图像生成、视频生成、语音、嵌入、3D。
  **使用场景**：
  (1) 需要为专家任务选择最佳模型
  (2) 需要调用非默认模型（图像/视频/语音/嵌入/推理）
  (3) 需要生成 UI 图、产品图、视频、语音
  (4) 需要成本优化或性能调优
  (5) 用户提到"用什么模型"、"换个模型"、"生成图片"、"生成视频"
---

# Model Router — AIAE 网关多模型智能路由

## 连接信息

| 项目 | 值 |
|------|-----|
| Base URL | `https://ai-gateway.aiae.ndhy.com/v1` |
| API Key | `.env` 中 `AIAE_API_KEY` |
| 协议 | OpenAI Compatible API |

## 快速决策树

```
任务进来 → 判断类型：

文本任务 ─┬─ 复杂推理/数学 → 推理模型组
          ├─ 代码生成     → 代码模型组
          ├─ 长文本处理    → 长上下文模型组
          ├─ 中文内容创作  → 中文强势模型组
          └─ 通用对话      → 通用旗舰组

生成任务 ─┬─ UI/产品图     → 图像模型组（见 references/image-models.md）
          ├─ 艺术/创意图   → 图像模型组
          ├─ 视频         → 视频模型组（见 references/video-models.md）
          ├─ 语音         → 语音模型组
          └─ 3D/数字人    → 特种模型组

工程任务 ─┬─ RAG/语义搜索  → 嵌入+重排序模型组
          └─ 图片理解      → 视觉模型组
```

## 核心路由表（文本模型）

### Tier 1：旗舰对话（最强能力，高成本）

| 模型 | 强项 | 弱项 | 推荐场景 |
|------|------|------|---------|
| `claude-opus-4-6` | 编程 #1（SWE-Bench 81.4%）、长上下文、Agentic、创意写作、安全 | 成本高 | **默认旗舰**。复杂编程、多文件工程、深度分析 |
| `gpt-5.4-2026-03-05` | 通用 #1、速度快、成本效率好、Computer Use | 复杂编程略逊 Claude | 通用任务、高吞吐管线、文档处理 |
| `doubao-seed-2-0-pro-260215` | 中文 #1（SuperCLUE 69.16 国内第一）、数学推理全球顶级（AIME25 98.3）、多模态前三 | 代码能力一般 | **中文内容创作**、数学推理、中文对话 |

### Tier 2：高性能对话（平衡性能与成本）

| 模型 | 强项 | 推荐场景 |
|------|------|---------|
| `claude-sonnet-4-6` | 长文本、速度快、性价比好 | 长文档处理、批量任务、审查 |
| `gemini-3.1-pro-preview` | 超长上下文（1M+）、多模态 | 超长文档分析 |
| `qwen3.5-plus-2026-02-15` | 速度极快（Sonnet 1/6 时间）、指令遵循强（IFBench 76.5）、中文好 | **高吞吐中文任务**、批量处理 |
| `deepseek-v3.2-1201` | 成本极低、中文好 | 大量低复杂度文本任务 |

### Tier 3：推理专精（深度思考）

| 模型 | 强项 | 推荐场景 |
|------|------|---------|
| `o3-2025-04-16` | 推理 #1（ARC-AGI 3x o1）、数学、科学 | 复杂数学证明、科学分析、架构决策 |
| `o4-mini-2025-04-16` | 推理强+成本低、编码分高 | **高性价比推理**、STEM批量任务 |
| `DeepSeek-R1-0528` | 开源推理最强（MMLU 90.8%）、显示推理过程 | 数学/逻辑推理、透明推理需求 |
| `deepseek-v3.2-1201-thinking` | DeepSeek V3+思考模式 | 需要推理过程的通用任务 |

### Tier 4：经济高效（大量简单任务）

| 模型 | 推荐场景 |
|------|---------|
| `qwen3.5-flash-2026-02-23` | 高速低成本中文任务 |
| `doubao-seed-2-0-mini-260215` | 极低成本中文对话 |
| `doubao-seed-2-0-lite-260215` | 超低成本简单任务 |
| `kimi-k2-250905` | 1T参数 MoE、前端开发好、Agent能力强 |

## 专家 × 模型匹配速查

| 专家角色 | 默认模型 | 特殊任务替换 |
|---------|---------|------------|
| 🎯 需求分析 | `claude-opus-4-6` | — |
| 📐 产品定义 | `claude-opus-4-6` | — |
| 🏛️ 技术架构 | `claude-opus-4-6` | 复杂推理: `o3` |
| 🖥️ 前端开发 | `claude-opus-4-6`（ACP） | UI 图生成: `gemini-3.1-flash-image-preview` |
| ⚙️ 后端开发 | `claude-opus-4-6`（ACP） | — |
| 🔍 代码审查 | `claude-opus-4-6` | — |
| 🎨 体验设计 | `claude-opus-4-6` | UI 图: `gemini-3.1-flash-image-preview`; 高品质图: `MidJourney` |
| 🎨 视觉设计 | `claude-opus-4-6` | 设计稿: `gemini-3-pro-image-preview`; 中文海报: `doubao-seedream-5-0-260128` |
| 🖌️ UI 设计 | `claude-opus-4-6` | UI Mockup: `gemini-3.1-flash-image-preview`; 精修: `gpt-image-1.5` |
| 📝 技术文档 | `claude-sonnet-4-6` | — |
| 🔬 技术调研 | `claude-opus-4-6` | — |
| 📊 数据分析 | `claude-opus-4-6` | 深度推理: `o3`; 批量: `qwen3.5-plus-2026-02-15` |
| 📖 叙事策略 | `claude-opus-4-6` | 中文创作: `doubao-seed-2-0-pro-260215` |
| 🎓 教育领域 | `claude-opus-4-6` | 中文教育内容: `doubao-seed-2-0-pro-260215` |
| 🧪 测试专家 | `claude-sonnet-4-6` | — |

> 📖 完整的模型能力详解见 [references/model-capabilities.md](references/model-capabilities.md)
> 📖 图像生成模型对比见 [references/image-models.md](references/image-models.md)
> 📖 视频/语音/3D 模型见 [references/media-models.md](references/media-models.md)
> 📖 API 调用示例见 [references/api-examples.md](references/api-examples.md)

## 图像生成快速指南

### 调用方式

**方式一：Chat Completions（Gemini Image 系列）**
```bash
curl $AIAE_BASE_URL/chat/completions \
  -H "Authorization: Bearer $AIAE_API_KEY" \
  -d '{"model":"gemini-3.1-flash-image-preview","messages":[{"role":"user","content":"Generate a UI mockup..."}]}'
```
响应 `choices[0].message.content` 中包含 `inline_data`（base64 图片）。

**方式二：Images 端点（GPT Image / Seedream / MidJourney）**
```bash
curl $AIAE_BASE_URL/images/generations \
  -H "Authorization: Bearer $AIAE_API_KEY" \
  -d '{"model":"gpt-image-1","prompt":"...","n":1,"size":"1024x1024"}'
```
响应 `data[0].b64_json` 或 `data[0].url`。

### 图像模型速选

| 需求 | 推荐模型 | 理由 |
|------|---------|------|
| UI Mockup / Dashboard | `gemini-3.1-flash-image-preview` | 速度快、文字渲染好、4K、SOTA |
| 高品质产品图 | `gemini-3-pro-image-preview` | 质量最高、4K |
| 精准提示词遵循 | `gpt-image-1.5` | 最强指令理解 |
| 中文海报/营销图 | `doubao-seedream-5-0-260128` | 中文文字渲染好、3K |
| 艺术风格/创意 | `MidJourney` | 美学 #1 |
| 混元风格 | `hunyuan-image-3` | 腾讯混元 |

## 视频生成快速指南

异步任务模式：提交 → 获取 task_id → 轮询结果。

| 需求 | 推荐模型 |
|------|---------|
| 电影级视频 | `sora-2`（带同步音频、最自然运镜） |
| 高性价比视频 | `doubao-seedance-1-5-pro-251215` |
| 快速迭代 | `doubao-seedance-1-0-pro-fast-251015` |
| 可灵生态 | `K2.6` / `K21-Master` |

## 工程模型

| 需求 | 模型 |
|------|------|
| 文本嵌入（RAG） | `bge-m3`（100+语言、1024维）|
| 高精度嵌入 | `text-embedding-3-large`（3072维）|
| 多模态嵌入 | `doubao-embedding-vision-251215` |
| 搜索重排序 | `bge-reranker-v2-m3` |
| 语音合成 | `seed-tts-2.0` |
| 语音识别 | `volc.seedasr.auc` |
| 3D 模型 | `hunyuan-3d-3.1` |
| 数字人 | `omnihuman-1.5` |
| 抠图 | `saliency-seg` |

## 成本优化策略

1. **分层用模型**：简单任务用 Tier 4，复杂任务才上 Tier 1
2. **中文任务优先国产**：Doubao/Qwen/DeepSeek 成本远低于 Claude/GPT
3. **批量任务用 Flash**：`qwen3.5-flash` / `doubao-seed-2-0-lite` 极低成本
4. **推理任务用 o4-mini**：比 o3 便宜得多，推理分数接近
5. **图像迭代先 Flash 后 Pro**：快速迭代用 `gemini-flash-image`，最终版用 `gemini-pro-image`

## 注意事项

- Model ID **区分大小写**，严格按本文档 ID 填写
- Gemini Image 通过 chat/completions 调用，不是 images 端点
- 视频/3D/数字人为异步任务，需轮询
- API 返回包含 `cost_details`（CNY），可追踪成本
- 遇 429 错误用指数退避重试
