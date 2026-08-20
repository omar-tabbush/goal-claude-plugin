# Compass

A Claude Code plugin that keeps the **why** of a project in the project.

Decisions get made faster than they get written down, and the reasoning is gone
by the time it matters. Compass keeps a small, git-versioned record of the
load-bearing choices next to the code, updates it automatically at the end of
every Claude Code session, and renders it as a dashboard that opens with a
double-click.

- **Attached to the folder, not the chat.** Any session opened in the project
  picks it up.
- **Files are the truth.** Plain markdown + one JSON file, diffable in review.
  The dashboard is a generated view.
- **Silent until you opt in.** No `.compass/` in a folder, no behaviour.
- **Zero dependencies.** Node ships the whole build; nothing to install.

## Install

```
/plugin marketplace add omar-tabbush/goal-claude-plugin
/plugin install compass@compass-marketplace
```

## Use

```
/compass:init      set up .compass/ for this project
/compass:status    north star, milestone, decisions due for review
/compass:sync      record now (the Stop hook already does this at session end)
```

`init` runs three stages: import whatever docs/vault already exist, mine the
codebase for implicit choices, then ask multiple-choice questions to fill the
gaps. Inferred records land as `proposed` until you confirm them.

After that it maintains itself. At the end of each session a `Stop` hook fires
once, Claude writes any records worth keeping while the context is still fresh,
updates the goal, and rebuilds the dashboard. Most sessions produce nothing —
that's correct. The bar is *"would someone ask why we did this in six months?"*

Open the dashboard at `.compass/index.html`.

## What lands in the repo

```
.compass/
  goal.json                 north star, milestone, progress, next steps
  decisions/0001-slug.md    one record per decision
  modules/<name>.md         per-module context
  data.js                   generated
  index.html                dashboard
```

A decision record is ADR plus the parts that actually get lost:

```markdown
---
id: 0001
title: Use SQLite
date: 2026-08-01
status: accepted          # proposed | accepted | superseded | deprecated
module: storage
tags: [db, local]
provenance: human         # human | ai-suggested | inferred-from-code | mcq-answer
review_date: 2026-11-01   # deliberate shortcut expires instead of going permanent
superseded_by:
links: []
---
## Context
## Decision
## Alternatives rejected
## Consequences
```

`provenance` tracks who decided — you, the model, or an inference from code —
so records can be trust-weighted. `review_date` surfaces on the dashboard once
it passes, which is what stops a temporary shortcut from quietly becoming the
architecture.

Full schema and the append-only rules: [`docs/SCHEMA.md`](docs/SCHEMA.md).

## Rules it follows

- Append-only. A reversed decision gets a new record and marks the old one
  `superseded` — the original reasoning is never rewritten.
- Nothing is deleted. Corrections are new records.
- It never invents a rationale. No evidence, no record.

## Development

```
node scripts/test.mjs     # self-check: build, status, hook behaviour
node scripts/build.mjs .  # rebuild .compass/data.js for a project
```

MIT.
