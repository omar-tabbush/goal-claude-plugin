---
module: capture
title: Capture
source:
---
How a decision gets from a session into a file: the Stop hook, `docs/SYNC.md`, and
the init pipeline.

## Hard constraints
- Silent in folders without `.compass/`.
- At most one block per session.
- Never invent a rationale. No evidence, no record.

## Open questions
- Is `/compass:decide` needed, or does end-of-session capture cover it?
