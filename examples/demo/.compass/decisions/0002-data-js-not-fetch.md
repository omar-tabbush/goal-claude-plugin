---
id: 0002
title: The dashboard reads data.js, never fetch()
title_ar: اللوحة تقرأ data.js ولا تستخدم fetch
date: 2026-07-13
status: accepted
module: dashboard
tags: [html, file-protocol]
provenance: human
review_date: 
superseded_by: 
links: []
---
## Context
The page has to open by double-clicking it. Over `file://`, `fetch('./data.json')`
is blocked by CORS in every browser.

## Decision
The build writes `window.COMPASS = {...}` into `.compass/data.js`, loaded by a plain
`<script src>`. `index.html` is copied once and never regenerated.

## Alternatives rejected
- Inline the JSON into the HTML - every sync rewrites the whole page, so the diff
  is useless for review.
- Require `npx serve` - infrastructure for a page that shows twenty records.

## Consequences
`data.js` is a build artifact but is committed anyway, so a fresh clone opens.
Anyone hand-editing `data.js` loses it on the next build.
