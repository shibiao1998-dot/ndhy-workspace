# Search Layer — Execution Flow

## Phase 1: Intent Classification

Classify intent **before** deciding search strategy. Don't ask the user which mode.

| Intent | Signal Words | Mode | Freshness | Weight Bias |
|--------|-------------|------|-----------|-------------|
| **Factual** | "什么是 X", "X 的定义", "What is X" | answer | — | authority 0.5 |
| **Status** | "X 最新进展", "X 现状", "latest X" | deep | pw/pm | freshness 0.5 |
| **Comparison** | "X vs Y", "X 和 Y 区别" | deep | py | keyword 0.4 + authority 0.4 |
| **Tutorial** | "怎么做 X", "X 教程", "how to X" | answer | py | authority 0.5 |
| **Exploratory** | "深入了解 X", "X 生态", "about X" | deep | — | authority 0.5 |
| **News** | "X 新闻", "本周 X", "X this week" | deep | pd/pw | freshness 0.6 |
| **Resource** | "X 官网", "X GitHub", "X 文档" | fast | — | keyword 0.5 |

> Detailed classification guide: `references/intent-guide.md`

**Rules**: scan signal words → pick most specific on multi-match → default `exploratory`

---

## Phase 2: Query Decomposition & Expansion

### General Rules
- **Tech synonym expansion**: k8s→Kubernetes, JS→JavaScript, Go→Golang, Postgres→PostgreSQL
- **Chinese tech queries**: also generate English variants ("Rust 异步编程" → + "Rust async programming")

### Per-Intent Expansion

| Intent | Strategy | Example |
|--------|----------|---------|
| Factual | + "definition", "explained" | "WebTransport" → "WebTransport", "WebTransport explained overview" |
| Status | + year, "latest", "update" | "Deno 进展" → "Deno 2.0 latest 2026", "Deno update release" |
| Comparison | Split into 3 sub-queries | "Bun vs Deno" → "Bun vs Deno", "Bun advantages", "Deno advantages" |
| Tutorial | + "tutorial", "guide", "step by step" | "Rust CLI" → "Rust CLI tutorial", "Rust CLI guide step by step" |
| Exploratory | Split into 2-3 angles | "RISC-V" → "RISC-V overview", "RISC-V ecosystem", "RISC-V use cases" |
| News | + "news", "announcement", date | "AI 新闻" → "AI news this week 2026", "AI announcement latest" |
| Resource | + specific resource type | "Anthropic MCP" → "Anthropic MCP official documentation" |

---

## Phase 3: Multi-Source Parallel Search

### Step 1: Brave (all modes)
```
web_search(query="Deno 2.0 latest 2026", freshness="pw")
```

### Step 2: Exa + Tavily + Grok (Deep / Answer modes)
```bash
python3 /home/node/.openclaw/workspace/skills/search-layer/scripts/search.py \
  --queries "sub-query-1" "sub-query-2" "sub-query-3" \
  --mode deep \
  --intent status \
  --freshness pw \
  --num 5
```

**Source participation matrix**:
| Mode | Exa | Tavily | Grok | Note |
|------|-----|--------|------|------|
| fast | ✅ | ❌ | fallback | Exa first; Grok if no Exa key |
| deep | ✅ | ✅ | ✅ | All three in parallel |
| answer | ❌ | ✅ | ❌ | Tavily only (with AI answer) |

**Parameters**:
| Param | Description |
|-------|-------------|
| `--queries` | Multiple sub-queries run in parallel |
| `--mode` | fast / deep / answer |
| `--intent` | Intent type, affects scoring weights |
| `--freshness` | pd(24h) / pw(week) / pm(month) / py(year) |
| `--domain-boost` | Comma-separated domains, matched results authority +0.2 |
| `--num` | Results per source per query |

### Step 3: Merge
Merge Brave + search.py results. Deduplicate by canonical URL. Tag sources.

---

## Phase 4: Result Scoring

### Formula
```
score = w_keyword × keyword_match + w_freshness × freshness_score + w_authority × authority_score
```

Weights determined by intent (see Phase 1 table).

- **keyword_match** (0-1): query term coverage in title+snippet
- **freshness_score** (0-1): based on publish date, newer = higher (no date = 0.5)
- **authority_score** (0-1): based on domain tier
  - Tier 1 (1.0): github.com, stackoverflow.com, official docs
  - Tier 2 (0.8): HN, dev.to, notable tech blogs
  - Tier 3 (0.6): Medium, 掘金, InfoQ
  - Tier 4 (0.4): other

> Full domain scoring table: `references/authority-domains.json`

### Domain Boost
```bash
search.py "query" --mode deep --intent tutorial --domain-boost dev.to,freecodecamp.org
```

---

## Phase 5: Knowledge Synthesis

| Result Count | Strategy |
|-------------|----------|
| ≤5 | List each with source tag + score |
| 5-15 | Cluster by topic + per-group summary |
| 15+ | High-level summary + Top 5 + drill-down prompt |

### Synthesis Rules
- **Answer first, then sources** (don't start with "I searched...")
- **Group by topic, not by source** (not "Brave results: ... Exa results: ...")
- **Flag conflicts**: explicitly note when sources contradict
- **Confidence expression**:
  - Multi-source consistent + fresh → direct statement
  - Single source or older → "According to [source], ..."
  - Conflict/uncertain → "Different perspectives exist: A says..., B says..."
