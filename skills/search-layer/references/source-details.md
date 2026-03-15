# Search Layer — Exa Source Details

## Exa 源说明（两层角色）

### Retrieval lane（默认主路径）
- 默认仍走 `/search`，但不再固定死 `type=auto`
- 当前最小映射：
  - `resource` → `instant`
  - `status` / `news` → `fast`
  - `exploratory` + `mode=deep` → `deep`
  - 其他 → `auto`
- 默认附带 `contents.highlights.maxCharacters=1200`，提升 snippet 质量，避免 Exa 结果因空摘要在本地 ranking 中被低估
- `freshness` 会映射为 Exa `startPublishedDate`，让 status/news 查询和 Tavily/Grok 时间窗口更一致
- 结果 metadata 中保留 `meta.exaType`，便于观测实际 resolved type

### Research lane（选择性升级）
- 仅当 query 命中复杂 `comparison / exploratory / status / news` 场景时，在标准候选召回之后追加一段 Exa `type=deep` 研究块，并以 `research` 字段附加到输出
- `research` 是附加 contract，不替换 `results`，保证旧调用方仍可只读 `results`
- 当前边界：comparison 需显式对比词/判断词/3+ 子查询；exploratory 需判断/因果/对比词；status/news 需判断/因果词，不因普通多查询扩展误触发
- 暂不把 `deep-reasoning` / `outputSchema` 接进默认主路径，避免基础 search-layer 变成重型 research/synthesis 引擎

## Grok 源说明
- 通过 completions API 调用 Grok 模型（`grok-4.1-fast`），利用其实时知识返回结构化搜索结果
- 自动检测时间敏感查询并注入当前时间上下文
- 在 deep 模式下与 Exa、Tavily 并行执行
- 需要在 `~/.openclaw/credentials/search.json` 中配置 Grok 的 `apiUrl`、`apiKey`、`model`（或通过环境变量 `GROK_API_URL`、`GROK_API_KEY`、`GROK_MODEL`）
- 如果 Grok 配置缺失，自动降级为 Exa + Tavily 双源
