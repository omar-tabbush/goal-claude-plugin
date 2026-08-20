---
id: 0009
title: Only the mechanical half is code
date: 2026-07-07
status: accepted
module: capture
tags: [tooling]
provenance: human
review_date: 
superseded_by: 
links: [0008]
---
## Context
Supersedes 0008. Splitting the work showed a clean line: judgment (what counts as a
decision, gap-filling questions, reading a codebase) versus mechanics (parse
frontmatter, write data.js).

## Decision
Judgment lives in command markdown the model reads. Mechanics live in one
dependency-free `build.mjs`. Nothing to install, nothing to version separately.

## Alternatives rejected
- Full CLI (see 0008) - most of it would have been a wrapper around prose.
- No script at all, model writes data.js - hand-patching a JSON array is fragile and
  costs tokens on every sync.

## Consequences
The record format is now load-bearing for a 30-line parser. If frontmatter ever
needs nesting, the parser gets replaced before the format changes.
