---
id: 0003
title: Stop hook blocks once per session instead of spawning a headless run
date: 2026-07-21
status: accepted
module: capture
tags: [hooks, cost]
provenance: human
review_date: 
superseded_by: 
links: [hooks/stop.mjs]
---
## Context
Capture has to be automatic, and it has to happen while the reasoning is still in
context. A hook is a shell command and cannot reason on its own.

## Decision
The Stop hook returns `decision: "block"` once per session with a pointer to
`docs/SYNC.md`. The same session writes the records, with full context, at no extra
process cost. A marker file in the temp dir plus `stop_hook_active` prevents loops.

## Alternatives rejected
- `claude -p` subprocess on SessionEnd - pays for a second model run that can only
  read the transcript, not the live reasoning.
- Model-discipline only (SessionStart instructions) - best-effort, and the sessions
  that most need a record are the long ones where it gets forgotten.

## Consequences
Every session in an opted-in project ends with one extra short turn. If that ever
grates, the fix is a stricter filter in SYNC.md, not a quieter hook.
