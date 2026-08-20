---
description: Print the project's north star, milestone and overdue decision reviews
allowed-tools: Bash(node:*)
---

!`node "${CLAUDE_PLUGIN_ROOT}/scripts/build.mjs" --status`

Relay the block above as-is, with one change: render the `DASHBOARD:` line as a
markdown link - `[.compass/index.html](file:///...)` - so it is clickable in the
terminal.

Add nothing else unless something is due for review, then one line on what to do
about it.
