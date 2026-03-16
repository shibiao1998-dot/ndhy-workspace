# MCP Tools Test Report

**Date:** 2026-03-17 00:09 GMT+8
**Tester:** Claude Code (Opus)
**Environment:** Windows 10, Node.js v24.13.0

---

## Summary

| # | MCP Tool | Status | Notes |
|---|----------|--------|-------|
| 1 | `ddgs-search` | ✅ **PASS** | DuckDuckGo search works. Searched "Claude Code 2026" and "ndhy-workspace", returned relevant results including GitHub gists for shibiao1998-dot. |
| 2 | `fetch` | ✅ **PASS** | Successfully fetched `https://example.com`. Returned page content as markdown ("Example Domain"). |
| 3 | `chrome-devtools` | ⚠️ **CONFLICT** | Tool is registered and available, but `list_pages` returned error: *"The browser is already running for chrome-profile. Use --isolated to run multiple browser instances."* A Chrome instance is already using the profile. Fix: close existing Chrome or configure `--isolated` / different `userDataDir`. |
| 4 | `context7` | ❌ **NOT AVAILABLE** | No `mcp__context7__*` tools are registered in the current session. The MCP server is either not configured or failed to start. |
| 5 | `github` | ✅ **PASS** | Successfully searched for repo `shibiao1998-dot/ndhy-workspace`. Found it: "NDHY AI Agent Team workspace - daily backup", created 2026-03-14, default branch `master`. Full CRUD tools available (issues, PRs, files, branches, etc.). |
| 6 | `playwright` | ❌ **NOT AVAILABLE** | No `mcp__playwright__*` tools are registered. Playwright is available only via the `webapp-testing` **skill** (not a direct MCP tool). To use it, invoke `/webapp-testing` skill. |
| 7 | `sequential-thinking` | ❌ **NOT AVAILABLE** | No `mcp__sequential-thinking__*` tools are registered in the current session. The MCP server is either not configured or failed to start. |

---

## Detailed Results

### Test 1: ddgs-search ✅

- **Tool:** `mcp__ddgs-search__web_search`
- **Query:** `"ndhy-workspace"`
- **Result:** 8 results returned. Key finding: Result #6 — `shibiao1998-dot's gists · GitHub` with description "NDHYAI Team Website V3.4".
- **Also available:** `mcp__ddgs-search__web_search_news` (news search)

### Test 2: fetch ✅

- **Tool:** `mcp__fetch__fetch`
- **URL:** `https://example.com`
- **Result:** Successfully returned page content as clean markdown:
  ```
  Example Domain
  This domain is for use in documentation examples...
  ```
- **Supports:** `max_length`, `start_index`, `raw` (HTML mode) parameters

### Test 3: chrome-devtools ⚠️

- **Tool:** `mcp__chrome-devtools__*` (26+ tools registered)
- **Test:** `list_pages`
- **Error:**
  ```
  The browser is already running for C:\Users\黄世彪\.cache\chrome-devtools-mcp\chrome-profile.
  Use --isolated to run multiple browser instances.
  ```
- **Available tools include:** `navigate_page`, `take_screenshot`, `take_snapshot`, `click`, `fill`, `evaluate_script`, `lighthouse_audit`, `performance_start_trace`, etc.
- **Fix needed:** Close the existing Chrome process using that profile, OR configure the MCP server with `--isolated` flag or a different `userDataDir`.

### Test 4: context7 ❌

- **No tools registered** under `mcp__context7__` namespace.
- **Likely cause:** MCP server not configured in `.claude/` settings, or server failed to start.
- **Action:** Add context7 MCP server configuration to `settings.json`.

### Test 5: github ✅

- **Tool:** `mcp__github__search_repositories`
- **Query:** `ndhy-workspace`
- **Result:**
  ```json
  {
    "total_count": 1,
    "items": [{
      "full_name": "shibiao1998-dot/ndhy-workspace",
      "description": "NDHY AI Agent Team workspace - daily backup",
      "created_at": "2026-03-14T08:33:34Z",
      "default_branch": "master"
    }]
  }
  ```
- **Available tools (19+):** `search_repositories`, `search_code`, `search_issues`, `search_users`, `create_repository`, `create_issue`, `create_pull_request`, `get_file_contents`, `push_files`, `merge_pull_request`, `list_commits`, `list_issues`, `list_pull_requests`, `create_branch`, `fork_repository`, etc.

### Test 6: playwright ❌

- **No tools registered** under `mcp__playwright__` namespace.
- **Note:** Playwright functionality may be accessible via the `webapp-testing` skill rather than as a direct MCP tool.
- **Action:** If direct MCP access is needed, configure `@anthropic/mcp-server-playwright` or similar.

### Test 7: sequential-thinking ❌

- **No tools registered** under `mcp__sequential-thinking__` namespace.
- **Likely cause:** MCP server not configured or failed to start.
- **Action:** Add sequential-thinking MCP server configuration.

---

## Overall Assessment

| Category | Count |
|----------|-------|
| ✅ Fully Working | 3 (ddgs-search, fetch, github) |
| ⚠️ Registered but Blocked | 1 (chrome-devtools — browser conflict) |
| ❌ Not Available | 3 (context7, playwright, sequential-thinking) |

### Recommended Fixes

1. **chrome-devtools:** Close any running Chrome instances using the MCP profile, or add `--isolated` flag to the MCP server config.
2. **context7:** Add to MCP config:
   ```json
   "context7": {
     "command": "npx",
     "args": ["-y", "@context7/mcp-server"]
   }
   ```
3. **sequential-thinking:** Add to MCP config:
   ```json
   "sequential-thinking": {
     "command": "npx",
     "args": ["-y", "@anthropic/mcp-server-sequential-thinking"]
   }
   ```
4. **playwright:** Add to MCP config (if direct MCP access needed):
   ```json
   "playwright": {
     "command": "npx",
     "args": ["-y", "@anthropic/mcp-server-playwright"]
   }
   ```
