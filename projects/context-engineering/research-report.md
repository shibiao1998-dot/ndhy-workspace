# 本地向量知识库 + 上下文工程深度调研报告

> 调研时间：2026-03-16 | 调研人：🔬 技术调研专家 | 版本：v1.0

---

## 1. 执行摘要

**核心发现**：OpenClaw 已内置一套成熟的向量记忆搜索系统（memory-core 插件 + 内置 SQLite 向量索引），支持混合搜索（BM25 + 向量）、时间衰减、MMR 去重、多提供商嵌入、会话索引等高级特性。**我们不需要从零构建向量知识库——只需启用和配置现有能力。**

OpenClaw 的 memory-core 插件（当前已加载）提供 `memory_search` 和 `memory_get` 工具，底层使用 SQLite + sqlite-vec 做向量检索，支持混合 BM25+向量搜索。memory-lancedb 插件（当前 disabled）是一个独立的 LanceDB 向量存储方案，适用于需要独立长期记忆的场景。此外，OpenClaw 还集成了 QMD（实验性），这是一个本地 BM25+向量+重排序的搜索侧车，可将索引范围扩展到 workspace 之外的任意 Markdown 目录。

**推荐方案**：分三步走——① 立即启用 memory-core 的 memorySearch 配置（快速见效）；② 扩展索引范围覆盖专家设定和技能文件（extraPaths）；③ 评估 QMD 后端替代方案以获得更强的检索能力。不需要引入外部向量数据库。

---

## 2. OpenClaw 内置能力分析

### 2.1 memory-core 插件（当前状态：loaded）

memory-core 是 OpenClaw 默认的记忆插件，提供两个 Agent 工具：

| 工具 | 功能 | 实现方式 |
|------|------|----------|
| `memory_search` | 语义搜索记忆片段 | SQLite 向量索引 + BM25 全文搜索混合 |
| `memory_get` | 按路径读取特定记忆文件 | 直接文件读取，支持行范围 |

**底层架构**：
- **索引存储**：per-agent SQLite 数据库（`~/.openclaw/memory/<agentId>.sqlite`）
- **分块策略**：~400 token 目标，80 token 重叠，保持语义连贯
- **索引范围**：默认索引 `MEMORY.md` + `memory/**/*.md`
- **文件监听**：自动监听文件变化，1.5 秒去抖后触发重新索引
- **重新索引触发**：嵌入 provider/model/endpoint 指纹或分块参数变化时自动全量重建

**高级特性**（需配置启用）：

| 特性 | 说明 | 默认状态 |
|------|------|----------|
| **混合搜索** | BM25 关键词 + 向量语义融合 | 可用（需 FTS5） |
| **MMR 重排序** | 最大边际相关性，去除重复结果 | 关闭（需配置） |
| **时间衰减** | 新记忆得分更高，旧记忆逐渐衰减 | 关闭（需配置） |
| **嵌入缓存** | SQLite 缓存已计算的嵌入，避免重复计算 | 可配置 |
| **会话索引** | 索引历史会话记录 | 实验性，需 opt-in |
| **额外路径** | 索引 workspace 外部的 Markdown 文件 | 需配置 extraPaths |
| **多模态** | Gemini Embedding 2 支持图片/音频索引 | 实验性 |

**嵌入模型支持**（已验证可用）：

| 提供商 | 模型 | 维度 | 本地/远程 | Windows 兼容 |
|--------|------|------|-----------|-------------|
| OpenAI | text-embedding-3-small | 1536 | 远程 | ✅ |
| OpenAI | text-embedding-3-large | 3072 | 远程 | ✅ |
| Gemini | gemini-embedding-001 | 768 | 远程 | ✅ |
| Gemini | gemini-embedding-2-preview | 768/1536/3072 | 远程 | ✅ |
| Voyage | voyage embeddings | 可配 | 远程 | ✅ |
| Mistral | mistral embeddings | 可配 | 远程 | ✅ |
| Ollama | nomic-embed-text 等 | 768 | 本地 | ✅（需安装 Ollama） |
| Local | GGUF via node-llama-cpp | 可配 | 本地 | ⚠️ 需编译，Windows 支持有限 |

### 2.2 memory-lancedb 插件（当前状态：disabled）

独立的 LanceDB 向量存储插件，设计用于**对话级长期记忆**：

| 能力 | 说明 |
|------|------|
| **存储** | LanceDB 本地文件数据库（Lance 列式格式） |
| **工具** | memory_recall（检索）、memory_store（存储）、memory_forget（删除） |
| **自动捕获** | 监听用户消息中的偏好/决策/实体/事实，自动存入 |
| **自动回忆** | 每次 Agent 启动时自动检索相关记忆注入上下文 |
| **去重** | 存储前检查 0.95 相似度阈值，避免重复 |
| **安全** | 检测提示注入攻击，GDPR 合规删除 |
| **嵌入** | OpenAI API（或兼容 API，如 Ollama） |

**与 memory-core 的关键区别**：
- memory-core 索引的是**磁盘上的 Markdown 文件**（文件是 source of truth）
- memory-lancedb 维护的是**独立的向量数据库**（数据库是 source of truth）
- 两者定位不同：memory-core 是文件搜索工具，memory-lancedb 是对话记忆存储

**Windows 兼容性**：LanceDB 提供 `@lancedb/vectordb-win32-x64-msvc` 预编译包，但历史上有 Windows 11 兼容问题（GitHub Issue #939）。Node.js 新版 SDK `@lancedb/lancedb`（v0.26.2）兼容性已改善。

### 2.3 QMD 后端（实验性）

QMD（Query Markdown）是 OpenClaw 支持的实验性搜索后端，替代内置 SQLite 索引器：

| 特性 | 说明 |
|------|------|
| **架构** | 独立 CLI 侧车进程 |
| **搜索** | BM25 + 向量 + LLM 重排序三级混合 |
| **运行方式** | Bun + node-llama-cpp，全本地 |
| **索引范围** | 可配置任意目录/文件（不限于 memory 目录） |
| **更新策略** | 定时刷新（默认 5 分钟） + 启动时同步 |
| **集成方式** | 配置 `memory.backend = "qmd"` 即可替代内置搜索 |
| **Windows** | ⚠️ 官方建议通过 WSL2 使用，原生 Windows 支持有限 |

### 2.4 当前环境状态

查看了 `openclaw.json` 配置：
- **memory-core**：已加载（默认 loaded），但 `memorySearch` **未配置嵌入提供商**
- **memory-lancedb**：未启用
- **QMD**：未配置
- **嵌入 API**：未配置任何嵌入 API key

**结论**：当前 `memory_search` 工具虽然注册了，但因为缺少嵌入提供商配置，向量搜索功能实际上**不可用**。这是最大的低垂果实——只需添加几行配置即可激活。

---

## 3. 本地向量数据库对比矩阵

虽然推荐直接使用 OpenClaw 内置能力，但以下对比矩阵供参考（评估是否有必要引入外部方案）：

| 维度 | LanceDB | ChromaDB | Qdrant | Milvus Lite | FAISS | Weaviate |
|------|---------|----------|--------|-------------|-------|----------|
| **实现语言** | Rust | Rust (2025重写) | Rust | Go/C++ | C++/Python | Go |
| **架构** | 嵌入式（进程内） | 嵌入式/CS | CS（Docker） | 嵌入式/CS | 库（进程内） | CS（Docker） |
| **Windows 兼容** | ✅ 预编译包 | ✅ pip install | ⚠️ 需 Docker | ⚠️ pip, 有限支持 | ⚠️ 需编译 | ⚠️ 需 Docker |
| **安装复杂度** | 低（npm/pip） | 低（pip） | 中（Docker） | 中（pip） | 高（编译） | 高（Docker+资源） |
| **Node.js SDK** | ✅ 原生 | ❌ 仅 Python/JS-HTTP | ✅ REST | ✅ REST | ❌ 仅 Python | ✅ REST |
| **OpenClaw 集成** | ✅ 已有插件 | ❌ 需自建 | ❌ 需自建 | ❌ 需自建 | ❌ 需自建 | ❌ 需自建 |
| **嵌入模型** | 需外部提供 | 可内置 | 需外部提供 | 需外部提供 | 需外部提供 | 内置模块 |
| **混合搜索** | ✅ FTS+向量 | ❌ | ✅ 载荷过滤 | ✅ | ❌ 纯向量 | ✅ BM25+向量 |
| **内存占用** | 低（列式+零拷贝） | 中 | 高（需服务进程） | 高 | 低（内存映射） | 高 |
| **适用规模** | <100 万向量 | <10 万向量 | <1 亿向量 | 10 亿+ | 1 亿+ | <1 亿 |
| **我们的规模** | ✅ 足够 | ✅ 足够 | 过度设计 | 过度设计 | 过度设计 | 过度设计 |

**关键判断**：我们的数据规模（几百个 Markdown 文件，总计几万个分块）远未达到需要专用向量数据库的阈值。OpenClaw 内置的 SQLite+sqlite-vec 方案完全胜任。引入外部数据库是**过度工程化**。

---

## 4. 上下文工程最佳实践

### 4.1 Context Engineering 五质量标准

基于 arXiv:2603.09619（Vishnyakova, 2026 年 3 月）提出的框架：

| 标准 | 定义 | 我们当前的状况 |
|------|------|----------------|
| **Relevance（相关性）** | 上下文中的每个 token 都应服务于当前任务 | 🟡 手动组装指令包，依赖 Leader 判断 |
| **Sufficiency（充分性）** | 上下文包含完成任务所需的一切信息 | 🟡 容易遗漏关键文件 |
| **Isolation（隔离性）** | 不同任务/Agent 的上下文互不干扰 | ✅ subagent 机制天然隔离 |
| **Economy（经济性）** | 在满足前两条的前提下最小化 token 使用 | 🔴 当前经常给多上下文 |
| **Provenance（溯源性）** | 所有注入的信息可追溯到可信来源 | ✅ 文件路径明确 |

### 4.2 四大上下文工程策略（LangChain 框架）

基于 LangChain 2025 年 10 月的分析，当前主流 Agent 系统使用四大策略：

**① Write（写入外部存储）**
- **Scratchpad**：Agent 将工作笔记写到文件/状态中，避免丢失
- **Memory**：跨会话的长期记忆（偏好、决策、事实）
- *我们的实现*：MEMORY.md + memory/*.md + PROJECT.md → ✅ 已有

**② Select（选择注入上下文）**
- **向量检索**：基于语义相似度选择相关片段
- **规则注入**：固定文件始终加载（如 CLAUDE.md、.cursorrules）
- *我们的实现*：固定 bootstrap 文件 + 手动指令包 → 🟡 缺少向量检索

**③ Compress（压缩上下文）**
- **摘要**：用 LLM 对旧对话生成摘要
- **裁剪**：基于规则删除旧消息/工具输出
- **选择性保留**：只保留高信号部分
- *我们的实现*：auto-compaction + memory flush → ✅ 已有

**④ Isolate（隔离上下文）**
- **多 Agent**：每个 Agent 只看到自己需要的上下文
- **子任务拆分**：大任务拆成小任务，每个小任务独立上下文
- *我们的实现*：subagent + 指令包机制 → ✅ 已有，但缺少自动化

### 4.3 Agentic RAG：Agent 主动检索

从 2025 年开始，RAG 范式从"被动注入"进化为"Agent 主动检索"：

**传统 RAG**：用户提问 → 系统检索 → 注入上下文 → LLM 回答
**Agentic RAG**：Agent 在执行过程中**自主决定**何时检索、检索什么、如何使用

OpenClaw 的 `memory_search` 工具本质上就是 Agentic RAG 的实现——Agent 可以在任务执行过程中主动调用 `memory_search` 检索相关记忆。关键是要让这个工具**真正可用且高质量**。

### 4.4 分层上下文管理

业界最佳实践与我们已有架构的对应关系：

| 层级 | 业界模式 | 我们的实现 | 状态 |
|------|----------|-----------|------|
| **HOT（热层）** | 始终在上下文中 | Bootstrap 文件（SOUL.md / AGENTS.md / USER.md） | ✅ |
| **WARM（温层）** | 按需检索注入 | memory_search → 今日/昨日日志 | 🟡 需启用向量搜索 |
| **COLD（冷层）** | 深度检索才触达 | 历史 memory/*.md / 项目归档 | 🟡 需扩展索引范围 |

### 4.5 多 Agent 上下文共享策略

针对我们 28 Agent 的场景，关键策略：

1. **共享知识库**：所有 Agent 通过同一个向量索引检索组织知识
2. **角色隔离**：每个 Agent 只看到与其角色相关的文件（通过指令包控制）
3. **PROJECT.md 作为共享状态**：项目级上下文通过 PROJECT.md 在 Agent 间传递
4. **记忆层级分离**：MEMORY.md（全局 HOT）→ memory/*.md（每日 WARM）→ 项目文件（项目级 COLD）

---

## 5. 推荐方案 + 实施路径

### 5.1 推荐方案：增量激活 OpenClaw 内置向量搜索

**不引入任何外部向量数据库**。直接配置和激活 OpenClaw 已有的 memory-core 向量搜索能力。

理由：
- 数据规模不需要专用向量数据库（几百文件，几万分块）
- OpenClaw 内置方案已覆盖混合搜索、时间衰减、MMR 等高级特性
- 零额外运维成本，与现有架构完全兼容
- 文件仍然是 source of truth，不引入数据同步问题

### 5.2 三步实施路径

#### Phase 1：激活向量搜索（1 天）

**目标**：让 `memory_search` 工具真正可用

**操作**：在 `openclaw.json` 中添加 `memorySearch` 配置：

```jsonc
{
  "agents": {
    "defaults": {
      "memorySearch": {
        // 方案 A：使用 Ollama 本地嵌入（推荐，零 API 成本）
        "provider": "ollama",
        "model": "nomic-embed-text",
        // 方案 B：使用现有 gateway 作为 OpenAI 兼容端点（如果支持）
        // "provider": "openai",
        // "model": "text-embedding-3-small",
        // "remote": {
        //   "baseUrl": "http://127.0.0.1:18795/v1",
        //   "apiKey": "sk-nd-..."
        // },
        "query": {
          "hybrid": {
            "enabled": true,
            "vectorWeight": 0.7,
            "textWeight": 0.3,
            "mmr": { "enabled": true, "lambda": 0.7 },
            "temporalDecay": { "enabled": true, "halfLifeDays": 30 }
          }
        },
        "cache": { "enabled": true, "maxEntries": 50000 },
        "sync": { "watch": true }
      }
    }
  }
}
```

**前置条件**：
- 如果选方案 A，需先安装 Ollama（`winget install Ollama.Ollama`），然后 `ollama pull nomic-embed-text`
- 如果选方案 B，需确认 NDHY Gateway 支持 embedding API

**预期效果**：
- `memory_search` 可对 `MEMORY.md` + `memory/*.md` 进行语义搜索
- Agent 开工前可自动检索相关记忆
- 混合搜索（关键词+语义）提升检索精度

#### Phase 2：扩展索引范围（1 天）

**目标**：将专家设定、技能描述、项目文件纳入搜索范围

**操作**：添加 `extraPaths` 配置：

```jsonc
{
  "agents": {
    "defaults": {
      "memorySearch": {
        "extraPaths": [
          "roles",           // 27 位专家的 SOUL.md + STANDARDS.md
          "skills",          // 技能 SKILL.md 文件
          "projects"         // 项目文档
        ]
      }
    }
  }
}
```

**预期效果**：
- Leader 组装指令包时，可通过 `memory_search` 检索"这个任务需要哪个专家"
- Agent 可检索其他专家的能力描述，辅助协作
- 项目文档（PRD、设计文档等）可被语义检索

#### Phase 3：优化检索质量 + 评估 QMD（1-2 周）

**目标**：根据实际使用反馈优化检索效果

**具体工作**：
1. **调参**：根据实际检索质量调整 vectorWeight/textWeight、MMR lambda、衰减半衰期
2. **评估 QMD**：如果 memory-core 内置搜索质量不够好，评估 QMD 后端
   - QMD 的 LLM 重排序可能显著提升检索精度
   - 但需要 WSL2（Windows 原生支持有限）
3. **构建检索质量评估集**：收集典型查询 + 期望结果，量化衡量改进
4. **探索 Leader 自动化**：让 Leader 在 spawn 子 Agent 时自动调用 `memory_search` 生成精准指令包

### 5.3 预期收益

| 收益 | 说明 | 影响 |
|------|------|------|
| **指令包组装自动化** | Leader 可通过语义检索自动找到任务相关文件 | 减少遗漏 + 降低 Leader 认知负担 |
| **上下文经济性** | 只注入相关片段，不加载整个文件 | 节省 30-60% 上下文 token |
| **跨专家知识发现** | Agent 可检索到其他专家的能力和历史决策 | 提升协作效率 |
| **历史经验复用** | 通过 memory_search 检索历史项目经验 | 避免重复犯错 |
| **新专家快速上手** | 新 spawn 的专家可自动获取相关上下文 | 减少"冷启动"问题 |

---

## 6. 风险与限制

### 6.1 技术风险

| 风险 | 概率 | 影响 | 缓解方案 |
|------|------|------|----------|
| **嵌入 API 成本** | 中 | 低 | 使用 Ollama 本地嵌入（零成本） |
| **Ollama Windows 稳定性** | 低 | 中 | Ollama 对 Windows 支持已成熟；备选用远程 API |
| **索引延迟** | 低 | 低 | 文件监听 + 1.5s 去抖已足够 |
| **检索质量不够好** | 中 | 中 | Phase 3 调参 + 评估 QMD 后端 |
| **SQLite 并发限制** | 低 | 低 | 单 Agent 场景不存在并发问题 |

### 6.2 架构限制

1. **memory-core 只索引 Markdown**：代码文件（.ts/.py 等）不会被索引。如需代码语义搜索，需额外方案（如 Continue IDE 的 LanceDB 索引）。
2. **memory_search 只在有嵌入配置时可用**：未配置时工具注册了但功能为空。
3. **extraPaths 目录递归扫描**：大量文件会增加索引时间（但我们的规模不是问题）。
4. **QMD 的 Windows 限制**：QMD 官方推荐 macOS/Linux，Windows 需通过 WSL2。如果需要 QMD 的 LLM 重排序能力，需评估 WSL2 方案。

### 6.3 不推荐做的事

1. **不要引入 ChromaDB/Qdrant/Milvus 等外部数据库**——规模不需要，增加运维负担，且与 OpenClaw 集成需要自建插件。
2. **不要启用 memory-lancedb 替代 memory-core**——两者定位不同，memory-core 的文件索引更适合我们的场景（文件是 source of truth）。
3. **不要一步到位做全量上下文自动化**——先激活基础能力，观察效果，再逐步优化。

---

## 7. 参考来源

### 一手源码（已阅读验证）
- OpenClaw memory-core 插件源码：`extensions/memory-core/index.ts`
- OpenClaw memory-lancedb 插件源码：`extensions/memory-lancedb/index.ts` + `config.ts`
- OpenClaw 官方文档：`docs/concepts/memory.md`、`docs/concepts/context.md`、`docs/concepts/compaction.md`
- OpenClaw 配置文件：`openclaw.json`（当前环境实际配置）

### 论文与框架
- Vishnyakova (2026). *Context Engineering: From Prompts to Corporate Multi-Agent Architecture*. arXiv:2603.09619. — 提出 5 质量标准（relevance/sufficiency/isolation/economy/provenance）
- Singh et al. (2025). *Agentic Retrieval-Augmented Generation: A Survey on Agentic RAG*. arXiv:2501.09136.
- LangChain Blog (2025-10). *Context Engineering for Agents*. — Write/Select/Compress/Isolate 四策略框架
- RAGFlow Blog (2025-12). *From RAG to Context: A 2025 Year-End Review*. — RAG → Context Engine 演进趋势

### 向量数据库评测
- Encore.dev (2026-03). *Best Vector Databases in 2026: Complete Comparison Guide*. — 七大向量数据库对比
- Second Talent (2026-01). *Top 10 Vector Databases for LLM Applications in 2026*. — ChromaDB 2025 Rust 重写，4x 性能提升
- LanceDB 官方：`@lancedb/lancedb` npm v0.26.2，提供 `win32-x64-msvc` 预编译包

### 嵌入模型
- Nomic AI: `nomic-embed-text` — 超越 OpenAI text-embedding-ada-002，支持长上下文（8192 token）
- Nomic AI: `nomic-embed-text-v2-moe` (GGUF) — MoE 架构，多语言支持改善
- ggml-org: `embeddinggemma-300m-qat-Q8_0.gguf` — OpenClaw 默认本地嵌入模型（~0.6 GB）

### 工具
- QMD (tobi/qmd): BM25 + 向量 + LLM 重排序，全本地运行

---

*报告终。如需更深入某一方向的调研（如 QMD Windows 适配、Ollama 嵌入性能基准测试、代码语义搜索方案），请另行安排。*
