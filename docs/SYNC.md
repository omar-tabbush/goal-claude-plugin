# compass sync

Run at session end. Be terse - no summaries, no praise, no file dumps.

## 1. Scan this session

Look at what actually happened. Keep only load-bearing choices:

- expensive to reverse, or
- a threshold/guard with a real reason, or
- a "we don't do it this way **because**..." convention, or
- a rejected alternative ("tried X, failed because Y"), or
- a real-world constraint (provider, client, regulator, cost).

Renames, formatting, obvious fixes, routine feature work = not decisions.
Usually 0-2 records per session. Zero is the normal answer.

## 2. Write records

For each keeper, `.compass/decisions/NNNN-slug.md`, next free `NNNN`.
Schema + rules: `../docs/SCHEMA.md`. Shape: `../templates/decision.md`.

- `provenance: human` if the user chose it, `ai-suggested` if you did.
- `review_date` only for a shortcut with a known ceiling.
- Reversed an earlier decision? New record, and set the old one
  `status: superseded` + `superseded_by:` - never edit its Decision text.
- No evidence for the why? Do not invent one. Skip, or ask in one line.

New module touched with no `modules/<name>.md`? Create it from
`../templates/module.md`.

## 3. Update goal.json

Only if it moved: `milestone`, `progress`, `next_steps`, `updated` (today).
Nothing moved = leave it.

## 4. Build

```
node "<plugin root>/scripts/build.mjs"
```

Run from the project dir. Regenerates `.compass/data.js`.

## 5. Report

One line: `compass: N records, goal <changed|unchanged>` - or
`compass: nothing to record`. Then stop. Do not commit unless asked.
