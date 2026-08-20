---
id: 0007
title: Sessions record nothing by default
title_ar: الجلسات لا تسجّل شيئاً افتراضياً
date: 2026-08-06
status: accepted
module: capture
tags: [noise, filter]
provenance: ai-suggested
review_date: 
superseded_by: 
links: []
---
## Context
A ledger that records every session becomes a log, and a log is not read. The tool
dies the moment it feels like a chore.

## Decision
Record only what someone would ask "why did we do this?" about in six months.
Zero records for a session is the normal, correct outcome.

## Alternatives rejected
- One summary per session - recreates the daily-note pattern that already exists in
  the vault, and buries the load-bearing choices.
- A record per commit - activity, not intent.

## Consequences
Some real decisions are missed. Accepted: a small trustworthy ledger beats a large
one nobody reads.
