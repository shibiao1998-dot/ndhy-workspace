---
name: search-layer
description: >
  DEFAULT search tool for ALL search/lookup needs. Multi-source search and deduplication
  layer with intent-aware scoring. Integrates Brave Search (web_search), Exa, Tavily,
  and Grok to provide high-coverage, high-quality results. Automatically classifies
  query intent and adjusts search strategy, scoring weights, and result synthesis.
  Use for ANY query that requires web search — factual lookups, research, news,
  comparisons, resource finding, "what is X", status checks, etc. Do NOT use raw
  web_search directly; always route through this skill.
---

# Search Layer v2.2 — 意图感知多源检索协议

> 四源同级：Brave (`web_search`) + Exa + Tavily + Grok。按意图自动选策略、调权重、做合成。

## 模块速查

| 场景 | 加载 | 路径 |
|------|------|------|
| 完整执行流程（Phase 1-5） | 📖 | [references/execution-flow.md](references/execution-flow.md) |
| 意图分类详细指南 | 📖 | [references/intent-guide.md](references/intent-guide.md) |
| Exa/Grok 源详细说明 | 📖 | [references/source-details.md](references/source-details.md) |
| 引用追踪（Thread Pulling） | 📖 | [references/thread-pulling.md](references/thread-pulling.md) |
| 域名权威评分表 | 📖 | [references/authority-domains.json](references/authority-domains.json) |
| Research light 回归样本 | 📖 | [references/research-light-regression-samples.md](references/research-light-regression-samples.md) |

## 执行流程概览

```
用户查询 → [1]意图分类 → [2]查询分解扩展 → [3]多源并行检索
  → [3.5]引用追踪(可选) → [4]结果排序 → [5]知识合成
```

## 快速参考

| 场景 | 命令 |
|------|------|
| 快速事实 | `web_search` + `search.py --mode answer --intent factual` |
| 深度调研 | `web_search` + `search.py --mode deep --intent exploratory` |
| 最新动态 | `web_search(freshness="pw")` + `search.py --mode deep --intent status --freshness pw` |
| 对比分析 | `web_search` ×3 queries + `search.py --queries "A vs B" "A pros" "B pros" --intent comparison` |
| 找资源 | `web_search` + `search.py --mode fast --intent resource` |

## 铁律

1. **永远不要因为某个源失败而阻塞主流程** — 降级继续
2. **先给答案，再列来源** — 不要先说"我搜了什么"
3. **按主题聚合，不按来源聚合** — 不要"Brave结果:… Exa结果:…"
4. **冲突信息显性标注** — 不同源矛盾时明确指出
5. **不带 --intent 时行为与 v1 完全一致** — 向后兼容
