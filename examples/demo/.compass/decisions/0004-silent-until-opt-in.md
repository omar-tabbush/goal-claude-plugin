---
id: 0004
title: Compass stays silent in folders with no .compass/
title_ar: Compass يصمت في المجلدات بلا ‎.compass/
date: 2026-07-21
status: accepted
module: capture
tags: [ux]
provenance: mcq-answer
review_date: 
superseded_by: 
links: []
---
## Context
The plugin is installed once, globally, and most folders opened in a day are
scratch dirs, other people's repos, or one-off client work.

## Decision
The hook exits 0 immediately when `.compass/` is absent. Projects opt in exactly
once, by running `/compass:init`.

## Alternatives rejected
- Ask once per unknown folder - a prompt in every throwaway dir, and the answer has
  to be remembered somewhere outside the project.
- Auto-init any git repo - creates `.compass/` in repos that are not ours.

## Consequences
A project you forgot to init records nothing, silently. That is the accepted trade.
