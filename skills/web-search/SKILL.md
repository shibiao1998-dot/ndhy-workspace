---
name: web-search
description: >-
  Free web search using DuckDuckGo (no API key needed). Use when: (1) user asks to search the web,
  (2) need current/recent information, (3) research a topic, (4) fact-check claims,
  (5) find documentation or references. NOT for: internal file search or when offline results are sufficient.
metadata:
  openclaw:
    emoji: "🔍"
---

# Web Search (DuckDuckGo)

Free web search via DuckDuckGo. No API key required.

## Setup

Requires `ddgs` Python package:

```bash
pip install ddgs
```

## Usage

### Quick search (default 5 results)

```bash
python -c "
from ddgs import DDGS
results = DDGS(proxy=None).text('YOUR_QUERY', max_results=5)
for i, r in enumerate(results, 1):
    print(f'{i}. [{r[\"title\"]}]({r[\"href\"]})')
    print(f'   {r[\"body\"][:200]}')
    print()
"
```

### News search

```bash
python -c "
from ddgs import DDGS
results = DDGS(proxy=None).news('YOUR_QUERY', max_results=5)
for i, r in enumerate(results, 1):
    print(f'{i}. [{r[\"title\"]}]({r.get(\"url\",\"\")})')
    print(f'   {r.get(\"source\",\"\")} - {r.get(\"date\",\"\")}')
    print(f'   {r[\"body\"][:200]}')
    print()
"
```

### PowerShell (Windows)

```powershell
python -c "from ddgs import DDGS; [print(f'{i+1}. {r[\"title\"]}\n   {r[\"href\"]}\n   {r[\"body\"][:150]}\n') for i,r in enumerate(DDGS(proxy=None).text('YOUR_QUERY', max_results=5))]"
```

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `query` | string | required | Search query |
| `max_results` | int | 5 | Number of results (1-20) |
| `region` | string | `"wt-wt"` | Region filter (`cn-zh`, `us-en`, `wt-wt` for worldwide) |

## Tips

- Replace `YOUR_QUERY` with the actual search term
- Use `.news()` instead of `.text()` for recent news
- Add `region='cn-zh'` for China-specific results
- Results include `title`, `href` (URL), and `body` (snippet)
