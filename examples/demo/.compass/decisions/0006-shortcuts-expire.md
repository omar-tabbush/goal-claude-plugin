---
id: 0006
title: Deliberate shortcuts carry a review_date
date: 2026-04-22
status: accepted
module: data-layer
tags: [debt]
provenance: human
review_date: 2026-08-17
superseded_by: 
links: []
---
## Context
"Temporary" is how permanent architecture gets built. A shortcut with a known
ceiling should resurface on its own instead of waiting to be rediscovered.

## Decision
Any record for an accepted shortcut sets `review_date`. Once that date passes, the
record is pushed to the top of the dashboard and into `/compass:status`.

## Alternatives rejected
- A TODO in the code - invisible six months later, and carries no rationale.
- A calendar reminder - detached from the record it is about.

## Consequences
This record is itself overdue, which is the point - the alert strip above is real,
not a mock.
