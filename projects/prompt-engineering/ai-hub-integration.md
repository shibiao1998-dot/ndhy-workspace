# AI Hub 知识库接入方案

> 分析时间：2026-03-15 23:53

---

## 1. DJ会议纪要知识库

**地址**：https://ai-hub.ndhy.com/datasets/bb898ffe-3cf6-4eb7-a68d-0c049ec918c7/documents
**dataset_id**：`bb898ffe-3cf6-4eb7-a68d-0c049ec918c7`
**规模**：1729 个文档（DJ的会议纪要，每日自动上传）
**格式**：.txt 文件，父子分段模式
**最新文档**：20260314DJ心签到.txt（2026-03-15 02:00 上传）
**更新频率**：每日凌晨 02:00 自动上传

**示例文档**：
- 20260314DJ心签到.txt (334字)
- 20260313DJ心签到.txt (341字)
- 20260312Open-Q产品验收讨论.txt (17.0k字)
- 20260312DJ个人深度工作.txt (10.7k字)
- 20260312 RPG游戏体验设计工具箱讨论.txt (9.7k字)
- 20260312专家系统&AI生产线讨论.txt (8.9k字)
- 20260311DJ个人深度工作.txt (32.2k字)
- 20260309 AI表演讨论会.txt (18.1k字)
- 20260310 RPG游戏体验设计工具箱讨论.txt (21.3k字)

---

## 2. AI Hub API 文档

### 鉴权方式
- 支持 UC Mac Token / BTS 鉴权 / API-Key
- Header 必带：
  - `Authorization: BTS {BTS_TOKEN}`
  - `X-App-Id: {BOT_ID}` (非必填)
  - `Userid: {UC_USER_ID}` (非必填)
  - `sdp-app-id: b4fb92a0-af7f-49c2-b270-8f62afac1133` (默认值)

### API 域名
- 联调环境：https://ai-hub-server.beta.101.com
- 预生产环境：https://ai-hub-api-beta.aitest.ndaeweb.com
- **正式环境**：https://ai-hub-api.aiae.ndhy.com

### 可用接口

| 接口 | 方法 | 用途 |
|------|------|------|
| 通过文本创建文档 | POST | 在知识库中创建新文档 |
| 通过文件创建文档 | POST | 上传文件到知识库 |
| 创建空知识库 | POST | 创建新的知识库 |
| 知识库列表 | GET | 获取所有知识库 |
| 通过文本更新文档 | PUT | 更新已有文档内容 |
| 通过文件更新文档 | PUT | 通过文件更新文档 |
| 获取文档嵌入状态 | GET | 查询文档向量化进度 |
| 删除文档 | DELETE | 删除文档 |
| **知识库文档列表** | GET | **获取知识库中所有文档列表** |
| 新增分段 | POST | 为文档添加分段 |
| **查询文档分段** | GET | **获取文档的分段内容** |
| 删除文档分段 | DELETE | 删除分段 |
| 更新文档分段 | POST | 更新分段内容 |

### 索引方式
- `high_quality`：使用 embedding 模型构建向量数据库索引
- `economy`：使用 Keyword Table Index 倒排索引

### 文档索引模式
- `text_model`：直接 embedding
- `hierarchical_model`：parent-child 模式
- `qa_model`：Q&A 模式（为分段生成 Q&A 对）

---

## 3. 接入方案

### 需要的凭证（需向老板获取）
- BTS Token 或 API-Key
- UC User ID
- Bot ID

### 关键接口调用链路
```
1. GET /datasets/{dataset_id}/documents — 获取DJ会议纪要文档列表
2. GET /datasets/{dataset_id}/documents/{document_id}/segments — 获取具体文档的分段内容
3. 用分段内容更新维度知识库
```

### 与产品的集成
- 产品后端定时拉取最新会议纪要（每日一次）
- 解析会议内容，提取与维度相关的信息
- 自动更新对应维度的描述（DJ要求的"维度自动更新"能力）
- 预留手动触发接口（用户可以主动拉取最新数据）
