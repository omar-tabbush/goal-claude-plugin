---
id: 0005
title: Inferred records land as proposed, never accepted
date: 2026-07-29
status: accepted
module: capture
tags: [provenance, trust]
provenance: human
review_date: 
superseded_by: 
links: []
---
## Context
Stage 2 of init reads dependencies, structure and commit messages. That yields
plausible decisions, and plausible is exactly the failure mode - a confident record
of a reason nobody ever had is worse than no record.

## Decision
Anything mined from code is written with `status: proposed` and
`provenance: inferred-from-code`. Only a human answer promotes it to `accepted`.

## Alternatives rejected
- Write them as accepted and let the user delete the wrong ones - nobody audits a
  list of forty records, so the wrong ones become history.
- Do not mine at all - loses the cheapest source of coverage on day one.

## Consequences
A fresh init looks half-finished on purpose. The provenance filter on the dashboard
exists mainly to work through that backlog.
