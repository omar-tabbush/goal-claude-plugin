# Compass data layer

```
.compass/
  goal.json          north star + active milestone + next steps
  decisions/NNNN-slug.md
  modules/<name>.md
  data.js            GENERATED - never hand-edit
  index.html         dashboard, copied once, never regenerated
```

Everything under `.compass/` is committed. `data.js` is a build artifact but
commit it too - dashboard must open from a fresh clone.

## goal.json

```json
{ "north_star": "", "milestone": "", "progress": 0, "next_steps": [], "updated": "YYYY-MM-DD" }
```

`progress` 0-100. `updated` ISO date.

## decisions/NNNN-slug.md

Frontmatter (flat only - `key: value`, arrays inline `[a, b]`; no nested YAML,
no multi-line lists, the parser is 30 lines and will drop them):

| key | notes |
|---|---|
| `id` | zero-padded, matches filename prefix |
| `title` | present-tense rule |
| `date` | YYYY-MM-DD |
| `status` | proposed / accepted / superseded / deprecated |
| `module` | must match a `modules/<name>.md` |
| `tags` | `[a, b]` |
| `provenance` | human / ai-suggested / inferred-from-code / mcq-answer |
| `review_date` | YYYY-MM-DD, only for deliberate shortcuts. Surfaces on dashboard when passed |
| `superseded_by` | id of replacement |
| `links` | `[commit sha, PR url, other decision id]` |

Body = `## ` sections, rendered in order. Standard four: Context, Decision,
Alternatives rejected, Consequences. Templates in `templates/`.

## modules/<name>.md

Frontmatter `module`, `title`, `source` (where it was imported from, if any).
Body free markdown.

## Rules

- **Append-only.** Never rewrite the Decision or Why of an accepted record. It
  changed? New record + set old `status: superseded` + `superseded_by`.
- **Never delete.** Corrections are new records.
- **Never invent a why.** No evidence for a choice -> ask, or skip it.
- **Six-month filter.** Record it only if someone would ask "why did we do
  this?" in six months. Everything else is activity, not decision.
