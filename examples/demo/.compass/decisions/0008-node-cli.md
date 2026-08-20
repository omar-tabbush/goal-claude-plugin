---
id: 0008
title: Bundle a Node CLI for init and sync
date: 2026-07-06
status: superseded
module: capture
tags: [tooling]
provenance: human
review_date: 
superseded_by: 0009
links: []
---
## Context
Early assumption that commands should be real code for determinism and tests.

## Decision
Ship `compass init|sync|status` as an installable Node package; the plugin only
shells out to it.

## Alternatives rejected
- Prose-only commands - looked untestable at the time.

## Consequences
Superseded once it was clear that the parts worth automating were mechanical and
tiny, and everything else needed the model anyway.
