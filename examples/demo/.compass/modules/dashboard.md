---
module: dashboard
title: Dashboard
source:
---
The static page: goal header, overdue-review strip, decisions table with search,
filters, sort and pagination, and module docs.

## Hard constraints
- No build step, no dependencies, no network. It must open over `file://`.
- `index.html` is copied once per project. The build never overwrites it, so local
  tweaks survive.

## Open questions
- Cross-project index page - one screen for every project's goal and overdue reviews.
