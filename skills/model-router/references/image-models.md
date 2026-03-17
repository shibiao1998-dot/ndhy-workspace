# 图像生成模型详解

## 目录
- [模型对比矩阵](#模型对比矩阵)
- [各模型详解](#各模型详解)
- [场景选型指南](#场景选型指南)
- [调用方式](#调用方式)
- [Prompt 技巧](#prompt-技巧)

---

## 模型对比矩阵

| 模型 | 来源 | 最大分辨率 | 文字渲染 | 提示遵循 | 美学品质 | 速度 | 调用端点 |
|------|------|-----------|---------|---------|---------|------|---------|
| `gemini-3.1-flash-image-preview` | Google | 4K | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 快 | chat/completions |
| `gemini-3-pro-image-preview` | Google | 4K | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 中 | chat/completions |
| `gemini-2.5-flash-image` | Google | 2K | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | 快 | chat/completions |
| `gpt-image-1.5` | OpenAI | — | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 中 | images/generations |
| `gpt-image-1` | OpenAI | 1024x1024 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 中 | images/generations |
| `doubao-seedream-5-0-260128` | ByteDance | 4K | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 中 | images/generations |
| `doubao-seedream-4-5-251128` | ByteDance | 2K | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | 快 | images/generations |
| `hunyuan-image-3` | Tencent | — | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | 中 | images/generations |
| `MidJourney` | MidJourney | — | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 慢 | images/generations |

## 各模型详解

### Nano Banana 2 (`gemini-3.1-flash-image-preview`) ⭐推荐
- **别名**：Nano Banana 2
- **定位**：速度+质量平衡之王、Image Arena 全球 #1
- **核心能力**：
  - 4K 图像生成/编辑
  - 文字渲染效果极佳（UI 图、海报文字）
  - Image-Search Grounding（基于搜索的图像生成）
  - 支持 512px/1K/2K/4K 分辨率
  - 价格是 Pro 版一半
- **最佳场景**：UI Mockup、Dashboard、带文字的设计图、快速迭代

### Nano Banana Pro (`gemini-3-pro-image-preview`)
- **定位**：图像质量天花板
- **核心能力**：
  - 4K 最高质量输出
  - 最强提示词理解和遵循
  - 支持 6 张参考图输入
  - 推理能力最强（复杂场景构图）
- **最佳场景**：最终版设计稿、高品质产品图、需要参考图的场景

### GPT Image 1.5 (`gpt-image-1.5`)
- **定位**：指令遵循之王
- **核心能力**：
  - 最强 prompt 理解（复杂指令精准执行）
  - DALL-E 3 后续，文字渲染好
- **最佳场景**：精确设计需求、复杂指令图、文字渲染

### Seedream 5.0 (`doubao-seedream-5-0-260128`)
- **定位**：中文生态最佳
- **核心能力**：
  - 2K/4K 分辨率
  - 中文文字渲染好
  - 参考图处理好
  - 比 Nano Banana Pro 有竞争力
- **⚠️ 最小分辨率限制**：≥3686400 像素（约 1920x1920），用 `2048x2048` 或更大
- **成本**：¥0.22/张（2048x2048）
- **最佳场景**：中文海报、营销物料、中文产品图

### MidJourney (`MidJourney`)
- **定位**：艺术美学之王
- **核心能力**：美学品质无可匹敌、艺术风格最丰富
- **最佳场景**：品牌视觉、艺术创作、风格化设计

---

## 场景选型指南

| 场景 | 第一选择 | 备选 | 理由 |
|------|---------|------|------|
| UI/Dashboard Mockup | `gemini-3.1-flash-image-preview` | `gpt-image-1.5` | 快、文字好、4K |
| 移动端 App 界面 | `gemini-3.1-flash-image-preview` | `gpt-image-1` | 界面元素清晰 |
| 品牌 Logo/标识 | `MidJourney` | `gemini-3-pro-image-preview` | 美学最佳 |
| 产品展示图 | `gemini-3-pro-image-preview` | `doubao-seedream-5-0-260128` | 质量最高 |
| 中文营销海报 | `doubao-seedream-5-0-260128` | `gemini-3.1-flash-image-preview` | 中文渲染好 |
| 教育插图 | `gemini-3.1-flash-image-preview` | `gpt-image-1` | 清晰、可控 |
| 图标设计 | `gpt-image-1.5` | `gemini-3.1-flash-image-preview` | 精准控制 |
| 快速原型迭代 | `gemini-3.1-flash-image-preview` | — | 速度快、成本低 |

---

## 调用方式

### Gemini Image（Chat Completions 端点）

```python
import os, base64
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(
    api_key=os.getenv("AIAE_API_KEY"),
    base_url=os.getenv("AIAE_BASE_URL"),
)

response = client.chat.completions.create(
    model="gemini-3.1-flash-image-preview",
    messages=[{"role": "user", "content": "Generate a modern dark-theme dashboard UI with sidebar, charts, and data cards"}],
    max_tokens=4096,
)

# 解析响应中的 inline_data（base64 图片）
content = response.choices[0].message.content
# 如果返回 JSON 格式，解析 inline_data.data 为 base64 图片
# 保存为文件：
# with open("output.png", "wb") as f:
#     f.write(base64.b64decode(image_b64))
```

### GPT Image / Seedream / MidJourney（Images 端点）

```python
response = client.images.generate(
    model="gpt-image-1",  # 或 doubao-seedream-5-0-260128, MidJourney
    prompt="A clean modern dashboard with dark theme",
    n=1,
    size="1024x1024",
)
# response.data[0].b64_json 或 response.data[0].url
```

### curl 示例（PowerShell 友好）

将 JSON body 写入文件再调用，避免转义问题：
```powershell
# 写入请求体
'{"model":"gemini-3.1-flash-image-preview","messages":[{"role":"user","content":"Generate a UI mockup"}],"max_tokens":4096}' | Out-File -Encoding utf8 req.json

# 调用
curl.exe -s "$env:AIAE_BASE_URL/chat/completions" `
  -H "Authorization: Bearer $env:AIAE_API_KEY" `
  -H "Content-Type: application/json" `
  -d "@req.json"
```

---

## Prompt 技巧

### UI Mockup 最佳 Prompt 模板
```
Generate a [style] UI design for a [product type].
Requirements:
- Theme: [dark/light]
- Layout: [sidebar + main content / top nav + grid / ...]
- Components: [charts, data cards, tables, forms, ...]
- Color scheme: [specific colors or "modern blue"]
- Resolution: [1024x1024 / 1920x1080]
- Text: [include realistic sample data]
Style: clean, professional, modern, high-fidelity mockup
```

### 中文海报 Prompt 模板
```
设计一张[风格]海报：
- 主题：[主题文字]
- 风格：[扁平化/国潮/简约现代/...]
- 色调：[暖色/冷色/指定色]
- 包含文字：[具体文字内容]
- 尺寸：竖版/横版
```
