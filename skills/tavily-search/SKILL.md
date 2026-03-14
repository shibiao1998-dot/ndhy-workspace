---
name: tavily-search
description: >-
  Web search using Tavily's AI-optimized search API. Use when: (1) user asks to search the web,
  (2) need current/recent information, (3) research a topic, (4) fact-check claims,
  (5) find documentation or references. NOT for: historical weather data, internal file search,
  or when offline results are sufficient.
metadata:
  openclaw:
    emoji: "🔍"
    requires:
      env: ["TAVILY_API_KEY"]
---

# Tavily Search

AI-optimized web search via the [Tavily API](https://tavily.com).

## Setup

Set the `TAVILY_API_KEY` environment variable. The key should start with `tvly-`.

## Usage

Use `curl` to call the Tavily Search API directly:

```bash
curl -s -X POST "https://api.tavily.com/search" \
  -H "Content-Type: application/json" \
  -d "{\"api_key\": \"$TAVILY_API_KEY\", \"query\": \"YOUR_QUERY\", \"search_depth\": \"basic\", \"max_results\": 5}"
```

### PowerShell (Windows)

```powershell
$body = @{
    api_key      = $env:TAVILY_API_KEY
    query        = "YOUR_QUERY"
    search_depth = "basic"
    max_results  = 5
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://api.tavily.com/search" -Method POST -ContentType "application/json" -Body $body
```

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `query` | string | required | Search query |
| `search_depth` | string | `"basic"` | `"basic"` (fast) or `"advanced"` (thorough) |
| `max_results` | int | 5 | Number of results (1-20) |
| `include_answer` | bool | false | Include AI-generated answer summary |
| `include_raw_content` | bool | false | Include full page content |
| `include_domains` | array | [] | Only search these domains |
| `exclude_domains` | array | [] | Exclude these domains |
| `topic` | string | `"general"` | `"general"` or `"news"` |
| `days` | int | 3 | For news topic, how many days back |

## Response Format

The API returns JSON with:
- `results[]` — array of search results, each with `title`, `url`, `content` (snippet), `score`
- `answer` — AI summary (if `include_answer: true`)

## Tips

- Use `search_depth: "advanced"` for complex research questions
- Use `include_answer: true` when user wants a quick summary
- Use `topic: "news"` + `days` for recent news
- Use `include_domains` / `exclude_domains` to filter sources
