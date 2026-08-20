#!/usr/bin/env node
// Sandbox. No install, no real project touched.
//   node scripts/demo.mjs           seed examples/demo (if empty), build, open dashboard
//   node scripts/demo.mjs --reset   throw the sandbox away and re-seed
//   node scripts/demo.mjs --build   rebuild only (after you edit the markdown)
//   node scripts/demo.mjs --status  what /compass:status prints
//   node scripts/demo.mjs --hook    what the Stop hook returns, for a real and a bare dir
import { mkdirSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const proj = join(root, 'examples', 'demo');
const c = join(proj, '.compass');
const node = process.execPath;
const flag = f => process.argv.includes(f);

const day = off => new Date(Date.now() + off * 864e5).toISOString().slice(0, 10);

const GOAL = {
  north_star: 'One dashboard that answers "why is it like this?" without asking anyone.',
  milestone: 'v1 - init pipeline + auto-sync',
  progress: 65,
  next_steps: [
    'Run init against a real repo and count how much of the vault survives the import',
    'Watch one week of Stop-hook syncs - if it records noise, tighten the six-month filter',
    'Decide whether /compass:decide is needed or auto-sync is enough'
  ],
  updated: day(-2)
};

const dec = (id, title, o) => [`${id}-${o.slug}.md`, `---
id: ${id}
title: ${title}
date: ${o.date}
status: ${o.status}
module: ${o.module}
tags: [${(o.tags || []).join(', ')}]
provenance: ${o.provenance}
review_date: ${o.review || ''}
superseded_by: ${o.superseded_by || ''}
links: [${(o.links || []).join(', ')}]
---
${o.body.trim()}
`];

const DECISIONS = [
  dec('0001', 'Plain files in the repo are the source of truth', {
    slug: 'files-are-truth', date: day(-40), status: 'accepted', module: 'data-layer',
    tags: ['storage', 'git'], provenance: 'human', links: ['docs/SCHEMA.md'],
    body: `## Context
The records have to survive the tool. They also have to be readable by a model at
session start, reviewable in a diff, and editable without launching anything.

## Decision
Markdown + frontmatter under \`.compass/\`, committed with the code. The dashboard
is a generated view and can be deleted at any time without losing anything.

## Alternatives rejected
- SQLite - binary, unreviewable in a PR, needs a driver.
- A hosted service - the records outlive any subscription, and an offline repo
  should still explain itself.
- Keeping it in the Obsidian vault only - fine for a human, invisible to a session
  opened in the repo.

## Consequences
Parsing cost on every build. Frontmatter stays flat forever - the parser is 30
lines and nested YAML will be silently dropped.`
  }),
  dec('0002', 'The dashboard reads data.js, never fetch()', {
    slug: 'data-js-not-fetch', date: day(-38), status: 'accepted', module: 'dashboard',
    tags: ['html', 'file-protocol'], provenance: 'human',
    body: `## Context
The page has to open by double-clicking it. Over \`file://\`, \`fetch('./data.json')\`
is blocked by CORS in every browser.

## Decision
The build writes \`window.COMPASS = {...}\` into \`.compass/data.js\`, loaded by a plain
\`<script src>\`. \`index.html\` is copied once and never regenerated.

## Alternatives rejected
- Inline the JSON into the HTML - every sync rewrites the whole page, so the diff
  is useless for review.
- Require \`npx serve\` - infrastructure for a page that shows twenty records.

## Consequences
\`data.js\` is a build artifact but is committed anyway, so a fresh clone opens.
Anyone hand-editing \`data.js\` loses it on the next build.`
  }),
  dec('0003', 'Stop hook blocks once per session instead of spawning a headless run', {
    slug: 'stop-hook-blocks-once', date: day(-30), status: 'accepted', module: 'capture',
    tags: ['hooks', 'cost'], provenance: 'human', links: ['hooks/stop.mjs'],
    body: `## Context
Capture has to be automatic, and it has to happen while the reasoning is still in
context. A hook is a shell command and cannot reason on its own.

## Decision
The Stop hook returns \`decision: "block"\` once per session with a pointer to
\`docs/SYNC.md\`. The same session writes the records, with full context, at no extra
process cost. A marker file in the temp dir plus \`stop_hook_active\` prevents loops.

## Alternatives rejected
- \`claude -p\` subprocess on SessionEnd - pays for a second model run that can only
  read the transcript, not the live reasoning.
- Model-discipline only (SessionStart instructions) - best-effort, and the sessions
  that most need a record are the long ones where it gets forgotten.

## Consequences
Every session in an opted-in project ends with one extra short turn. If that ever
grates, the fix is a stricter filter in SYNC.md, not a quieter hook.`
  }),
  dec('0004', 'Compass stays silent in folders with no .compass/', {
    slug: 'silent-until-opt-in', date: day(-30), status: 'accepted', module: 'capture',
    tags: ['ux'], provenance: 'mcq-answer',
    body: `## Context
The plugin is installed once, globally, and most folders opened in a day are
scratch dirs, other people's repos, or one-off client work.

## Decision
The hook exits 0 immediately when \`.compass/\` is absent. Projects opt in exactly
once, by running \`/compass:init\`.

## Alternatives rejected
- Ask once per unknown folder - a prompt in every throwaway dir, and the answer has
  to be remembered somewhere outside the project.
- Auto-init any git repo - creates \`.compass/\` in repos that are not ours.

## Consequences
A project you forgot to init records nothing, silently. That is the accepted trade.`
  }),
  dec('0005', 'Inferred records land as proposed, never accepted', {
    slug: 'inferred-is-proposed', date: day(-22), status: 'accepted', module: 'capture',
    tags: ['provenance', 'trust'], provenance: 'human',
    body: `## Context
Stage 2 of init reads dependencies, structure and commit messages. That yields
plausible decisions, and plausible is exactly the failure mode - a confident record
of a reason nobody ever had is worse than no record.

## Decision
Anything mined from code is written with \`status: proposed\` and
\`provenance: inferred-from-code\`. Only a human answer promotes it to \`accepted\`.

## Alternatives rejected
- Write them as accepted and let the user delete the wrong ones - nobody audits a
  list of forty records, so the wrong ones become history.
- Do not mine at all - loses the cheapest source of coverage on day one.

## Consequences
A fresh init looks half-finished on purpose. The provenance filter on the dashboard
exists mainly to work through that backlog.`
  }),
  dec('0006', 'Deliberate shortcuts carry a review_date', {
    slug: 'shortcuts-expire', date: day(-120), status: 'accepted', module: 'data-layer',
    tags: ['debt'], provenance: 'human', review: day(-3),
    body: `## Context
"Temporary" is how permanent architecture gets built. A shortcut with a known
ceiling should resurface on its own instead of waiting to be rediscovered.

## Decision
Any record for an accepted shortcut sets \`review_date\`. Once that date passes, the
record is pushed to the top of the dashboard and into \`/compass:status\`.

## Alternatives rejected
- A TODO in the code - invisible six months later, and carries no rationale.
- A calendar reminder - detached from the record it is about.

## Consequences
This record is itself overdue, which is the point - the alert strip above is real,
not a mock.`
  }),
  dec('0007', 'Sessions record nothing by default', {
    slug: 'six-month-filter', date: day(-14), status: 'accepted', module: 'capture',
    tags: ['noise', 'filter'], provenance: 'ai-suggested',
    body: `## Context
A ledger that records every session becomes a log, and a log is not read. The tool
dies the moment it feels like a chore.

## Decision
Record only what someone would ask "why did we do this?" about in six months.
Zero records for a session is the normal, correct outcome.

## Alternatives rejected
- One summary per session - recreates the daily-note pattern that already exists in
  the vault, and buries the load-bearing choices.
- A record per commit - activity, not intent.

## Consequences
Some real decisions are missed. Accepted: a small trustworthy ledger beats a large
one nobody reads.`
  }),
  dec('0008', 'Bundle a Node CLI for init and sync', {
    slug: 'node-cli', date: day(-45), status: 'superseded', module: 'capture',
    tags: ['tooling'], provenance: 'human', superseded_by: '0009',
    body: `## Context
Early assumption that commands should be real code for determinism and tests.

## Decision
Ship \`compass init|sync|status\` as an installable Node package; the plugin only
shells out to it.

## Alternatives rejected
- Prose-only commands - looked untestable at the time.

## Consequences
Superseded once it was clear that the parts worth automating were mechanical and
tiny, and everything else needed the model anyway.`
  }),
  dec('0009', 'Only the mechanical half is code', {
    slug: 'prose-plus-build-script', date: day(-44), status: 'accepted', module: 'capture',
    tags: ['tooling'], provenance: 'human', links: ['0008'],
    body: `## Context
Supersedes 0008. Splitting the work showed a clean line: judgment (what counts as a
decision, gap-filling questions, reading a codebase) versus mechanics (parse
frontmatter, write data.js).

## Decision
Judgment lives in command markdown the model reads. Mechanics live in one
dependency-free \`build.mjs\`. Nothing to install, nothing to version separately.

## Alternatives rejected
- Full CLI (see 0008) - most of it would have been a wrapper around prose.
- No script at all, model writes data.js - hand-patching a JSON array is fragile and
  costs tokens on every sync.

## Consequences
The record format is now load-bearing for a 30-line parser. If frontmatter ever
needs nesting, the parser gets replaced before the format changes.`
  }),
  dec('0010', 'Serve the dashboard from a local MCP server', {
    slug: 'mcp-server', date: day(-5), status: 'proposed', module: 'dashboard',
    tags: ['v2', 'mcp'], provenance: 'inferred-from-code',
    body: `## Context
Inferred from the roadmap notes, not yet decided. A live server would give a real
URL, cross-project view, and tools any Claude surface could call.

## Decision
Proposed only. Not built.

## Alternatives rejected
- Nothing evaluated yet.

## Consequences
Left as \`proposed\` deliberately, as an example of what init leaves behind for you
to confirm or drop.`
  })
];

const MODULES = [
  ['data-layer.md', `---
module: data-layer
title: Data layer
source: imported from vault/modules/data-layer.md
---
Everything under \`.compass/\`: the goal file, decision records, module docs, and the
generated \`data.js\`.

## Hard constraints
- Frontmatter stays flat. The parser will not read nested YAML.
- Append-only. A reversed decision gets a new record; the old one is marked
  \`superseded\`, never rewritten.
- \`data.js\` is generated. Hand edits are lost on the next build.

## Open questions
- Should \`links\` become structured (type + target) instead of free strings?
`],
  ['capture.md', `---
module: capture
title: Capture
source:
---
How a decision gets from a session into a file: the Stop hook, \`docs/SYNC.md\`, and
the init pipeline.

## Hard constraints
- Silent in folders without \`.compass/\`.
- At most one block per session.
- Never invent a rationale. No evidence, no record.

## Open questions
- Is \`/compass:decide\` needed, or does end-of-session capture cover it?
`],
  ['dashboard.md', `---
module: dashboard
title: Dashboard
source:
---
The static page: goal header, overdue-review strip, decisions table with search,
filters, sort and pagination, and module docs.

## Hard constraints
- No build step, no dependencies, no network. It must open over \`file://\`.
- \`index.html\` is copied once per project. The build never overwrites it, so local
  tweaks survive.

## Open questions
- Cross-project index page - one screen for every project's goal and overdue reviews.
`]
];

function seed() {
  mkdirSync(join(c, 'decisions'), { recursive: true });
  mkdirSync(join(c, 'modules'), { recursive: true });
  writeFileSync(join(c, 'goal.json'), JSON.stringify(GOAL, null, 2) + '\n');
  for (const [name, body] of DECISIONS) writeFileSync(join(c, 'decisions', name), body);
  for (const [name, body] of MODULES) writeFileSync(join(c, 'modules', name), body);
  console.log(`seeded ${DECISIONS.length} decisions, ${MODULES.length} modules`);
}

function open(f) {
  const [cmd, args] = process.platform === 'win32' ? ['cmd', ['/c', 'start', '', f]]
    : process.platform === 'darwin' ? ['open', [f]] : ['xdg-open', [f]];
  try { execFileSync(cmd, args, { stdio: 'ignore' }); } catch { console.log('open it yourself: ' + f); }
}

if (flag('--hook')) {
  const stop = join(root, 'hooks', 'stop.mjs');
  const run = p => execFileSync(node, [stop], { input: JSON.stringify(p), encoding: 'utf8' }).trim() || '(silent)';
  const sid = 'demo-' + process.pid;
  console.log('bare dir      ->', run({ cwd: tmpdir(), session_id: sid }));
  console.log('demo project  ->', run({ cwd: proj, session_id: sid }));
  console.log('same session  ->', run({ cwd: proj, session_id: sid }));
  console.log('nested stop   ->', run({ cwd: proj, session_id: sid + 'b', stop_hook_active: true }));
  process.exit(0);
}

if (flag('--reset')) { rmSync(c, { recursive: true, force: true }); seed(); }
else if (!existsSync(c)) seed();

if (flag('--status')) {
  console.log(execFileSync(node, [join(here, 'build.mjs'), proj, '--status'], { encoding: 'utf8' }));
  process.exit(0);
}

console.log(execFileSync(node, [join(here, 'build.mjs'), proj], { encoding: 'utf8' }).trim());
if (!flag('--build')) open(join(c, 'index.html'));
console.log('edit:  examples/demo/.compass/decisions/*.md   then: node scripts/demo.mjs --build');
