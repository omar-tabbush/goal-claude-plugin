---
id: 0001
title: Plain files in the repo are the source of truth
date: 2026-07-11
status: accepted
module: data-layer
tags: [storage, git]
provenance: human
review_date: 
superseded_by: 
links: [docs/SCHEMA.md]
---
## Context
The records have to survive the tool. They also have to be readable by a model at
session start, reviewable in a diff, and editable without launching anything.

## Decision
Markdown + frontmatter under `.compass/`, committed with the code. The dashboard
is a generated view and can be deleted at any time without losing anything.

## Alternatives rejected
- SQLite - binary, unreviewable in a PR, needs a driver.
- A hosted service - the records outlive any subscription, and an offline repo
  should still explain itself.
- Keeping it in the Obsidian vault only - fine for a human, invisible to a session
  opened in the repo.

## Consequences
Parsing cost on every build. Frontmatter stays flat forever - the parser is 30
lines and nested YAML will be silently dropped.
