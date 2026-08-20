---
module: data-layer
title_ar: طبقة البيانات
title: Data layer
source: imported from vault/modules/data-layer.md
---
Everything under `.compass/`: the goal file, decision records, module docs, and the
generated `data.js`.

## Hard constraints
- Frontmatter stays flat. The parser will not read nested YAML.
- Append-only. A reversed decision gets a new record; the old one is marked
  `superseded`, never rewritten.
- `data.js` is generated. Hand edits are lost on the next build.

## Open questions
- Should `links` become structured (type + target) instead of free strings?
