---
description: Set up .compass/ for this project - import existing docs, mine the code, fill gaps by MCQ
argument-hint: "[path to existing vault/docs, optional]"
---

Init Compass for the current project. Be terse. No progress narration.

Already have `.compass/`? Say so, stop. Do not re-init.

Read `${CLAUDE_PLUGIN_ROOT}/docs/SCHEMA.md` first. Templates:
`${CLAUDE_PLUGIN_ROOT}/templates/`.

Create `.compass/{decisions,modules}/` and `.compass/goal.json` from the
template.

## Stage 1 - import what exists

Source: `$ARGUMENTS` if given, else look for an Obsidian vault for this
project, `docs/`, `README.md`, `CLAUDE.md`, planning notes.

Vault already in the standard ledger layout (`<vault>/<name>.md`,
`decisions/NNNN-*.md`, `modules/<m>/<m>.md`, `modules/<m>/decisions/`)? Do not
read it record by record - that is mechanical and expensive:

```
node "${CLAUDE_PLUGIN_ROOT}/scripts/import-vault.mjs" <vaultRoot> . --dry
node "${CLAUDE_PLUGIN_ROOT}/scripts/import-vault.mjs" <vaultRoot> .
```

It renumbers ids globally, remaps the vault headings onto the compass four,
strips wikilinks, keeps `links: [vault:<path>]`, and never writes to the vault
or overwrites an existing record. Then read only what it could not carry over:
the vault root map, for the goal and project-wide constraints.

Pull out: the goal, stated decisions, module descriptions. One record per
decision, `provenance: human`, `source:` on module docs pointing at where it
came from. Do not restate the source verbatim - distil.

Never write back to the source. Compass is independent after this.

## Stage 2 - mine the code

Cheap scan, not a full read:

- deps + config (`package.json`, lockfiles, framework config, Docker, CI)
- directory / route / namespace structure
- `DECISION`/`HACK`/`NOTE`/`FIXME` comments
- `git log --oneline -50` for big refactors

Each inferred choice -> record with `status: proposed`,
`provenance: inferred-from-code`. Proposed means unconfirmed - the user
promotes it later. Skip anything you cannot point at evidence for.

## Stage 3 - MCQ the gaps

Check coverage against: data storage, auth, API style, state management,
deployment/hosting, payments, error handling, tenancy, testing.

For real gaps and for the shakiest `proposed` records, use AskUserQuestion -
max 4 questions per round, max 2 rounds. Concrete options, no essays.
Answers -> records, `provenance: mcq-answer`, `status: accepted`; and promote
any `proposed` record the answer confirms.

Do not ask about categories the project clearly does not have.

## Finish

```
node "${CLAUDE_PLUGIN_ROOT}/scripts/build.mjs"
```

Then report: counts by provenance, and the path to `.compass/index.html`.
Tell the user the Stop hook now handles sync automatically.
