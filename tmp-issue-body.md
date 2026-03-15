## Problem

With the orchestrator pattern (main -> PM -> workers), the PM (depth-1) manages multi-phase projects autonomously. However, the PM cannot send intermediate progress updates to the main agent - it can only announce when fully completed.

This means the main agent (and the human) have no way to receive real-time phase-completion updates from the PM. The only workaround is polling a shared file, which is fragile and requires the main agent to be triggered by an external event to check.

## Current behavior

- Depth-1 orchestrator agents get: sessions_spawn, subagents, sessions_list, sessions_history
- sessions_send is NOT available to depth-1 agents
- Only the final announce (on task completion) reaches the parent
- No way for depth-1 to push intermediate messages to depth-0

## Desired behavior

Allow depth-1 (and optionally depth-2+) agents to use sessions_send to message their parent session:

```json
// From depth-1 PM agent:
sessions_send({
  "sessionKey": "parent",
  "message": "Phase 3 complete. Starting Phase 4."
})
```

This would enable:
1. PM reporting phase completion to Leader in real-time
2. Leader proactively relaying progress to the human
3. Any orchestrator-level agent sending status updates without waiting for full task completion

## Use case

We run a 28-expert AI organization:
- Leader (depth-0) spawns PM (depth-1)
- PM spawns domain experts (depth-2) for each project phase
- PM completes phases sequentially (product definition -> design -> architecture -> development -> testing -> deployment)
- Human wants real-time progress updates after each phase, not just a final summary

Currently the only option is file-based polling, which is unreliable and adds unnecessary complexity.

## Suggested implementation

- Add sessions_send to the depth-1 tool policy (alongside existing sessions_spawn, subagents, etc.)
- Scope it to only allow messaging the parent session (not arbitrary sessions)
- Or introduce a dedicated `announce_progress` tool that sends a non-final update to the parent

## Environment

- OpenClaw on Windows 10
- maxSpawnDepth: 5, maxChildrenPerAgent: 10, maxConcurrent: 8
