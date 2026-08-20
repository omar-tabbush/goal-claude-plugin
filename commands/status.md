---
description: Print the project's north star, milestone and overdue decision reviews
allowed-tools: Bash(node:*)
---

!`node "${CLAUDE_PLUGIN_ROOT}/scripts/build.mjs" --status`

Relay the block above as-is. Add nothing unless something is due for review -
then one line on what to do about it.
