# Search Layer — Thread Pulling (Reference Tracing)

## Phase 3.5: 引用追踪（Thread Pulling）

When search results contain GitHub issue/PR links and intent is Status or Exploratory, auto-trigger reference tracing.

### Auto-trigger Conditions
- Intent is `status` or `exploratory`
- Results contain `github.com/.../issues/` or `github.com/.../pull/` URLs

### Method 1: search.py --extract-refs (batch)

Extract reference graph directly from search results:

```bash
python3 search.py "OpenClaw config validation bug" --mode deep --intent status --extract-refs
```

Output includes a `refs` field with reference lists per result URL.

Skip search and extract refs from known URLs:

```bash
python3 search.py --extract-refs-urls "https://github.com/owner/repo/issues/123" "https://github.com/owner/repo/issues/456"
```

### Method 2: fetch-thread (single URL deep fetch)

Pull full discussion thread + structured references for a single URL:

```bash
python3 fetch_thread.py "https://github.com/owner/repo/issues/123" --format json
python3 fetch_thread.py "https://github.com/owner/repo/issues/123" --format markdown
python3 fetch_thread.py "https://github.com/owner/repo/issues/123" --extract-refs-only
```

**GitHub scenarios** (issue/PR): via API pull body + all comments + timeline events (cross-references, commits), extracting:
- Issue/PR references (#123, owner/repo#123)
- Duplicate markers
- Commit references
- Related PR/issue (timeline cross-references)
- External URLs

**Generic web**: web fetch + regex extraction of reference links.

### Agent Execution Flow

```
Step 1: search-layer search → get initial results
Step 2: search.py --extract-refs or fetch-thread → extract thread graph
Step 3: Agent filters high-value threads (LLM judges which are worth pursuing)
Step 4: fetch-thread deep-fetch each high-value thread
Step 5: Repeat Step 2-4 until information closure or depth limit (recommended max_depth=3)
```

## Degradation Strategy

- Exa 429/5xx → continue with Brave + Tavily + Grok
- Tavily 429/5xx → continue with Brave + Exa + Grok
- Grok timeout/error → continue with Brave + Exa + Tavily
- search.py total failure → use Brave `web_search` only (always available)
- **Never block the main flow because one source fails**

## Backward Compatibility

When `--intent` is not passed, search.py behaves identically to v1 (no scoring, original order output).
Existing callers (e.g., github-explorer) need no changes.
