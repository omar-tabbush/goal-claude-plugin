#!/usr/bin/env node
// Self-check: node scripts/test.mjs   (no framework, no deps)
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const here = dirname(fileURLToPath(import.meta.url));
const proj = mkdtempSync(join(tmpdir(), 'compass-test-'));
mkdirSync(join(proj, '.compass', 'decisions'), { recursive: true });
mkdirSync(join(proj, '.compass', 'modules'), { recursive: true });

writeFileSync(join(proj, '.compass', 'goal.json'), JSON.stringify({
  north_star: 'Ship it', milestone: 'v1', progress: 40, next_steps: ['a', 'b'], updated: '2026-08-20'
}));
writeFileSync(join(proj, '.compass', 'decisions', '0001-use-sqlite.md'), `---
id: 0001
title: Use SQLite
date: 2026-08-01
status: accepted
module: storage
tags: [db, local]
provenance: human
review_date: 2020-01-01
links: []
---
## Context
Single box.

## Decision
SQLite.

## Alternatives rejected
- Postgres - ops cost.
`);
writeFileSync(join(proj, '.compass', 'modules', 'storage.md'), `---
module: storage
title: Storage
---
Data lives here.
`);

const node = process.execPath;
const build = join(here, 'build.mjs');
execFileSync(node, [build, proj], { encoding: 'utf8' });

const dataSrc = readFileSync(join(proj, '.compass', 'data.js'), 'utf8');
const window = {};
new Function('window', dataSrc)(window);
const D = window.COMPASS;

assert.equal(D.goal.north_star, 'Ship it');
assert.equal(D.decisions.length, 1);
const d = D.decisions[0];
assert.equal(d.id, '0001');
assert.equal(d.title, 'Use SQLite');
assert.deepEqual(d.tags, ['db', 'local']);
assert.equal(d.sections.length, 3, 'three ## sections');
assert.equal(d.sections[1].heading, 'Decision');
assert.match(d.search, /postgres/);
assert.equal(D.modules[0].name, 'storage');
assert.ok(existsSync(join(proj, '.compass', 'index.html')), 'index.html copied');

const status = execFileSync(node, [build, proj, '--status'], { encoding: 'utf8' });
// the slash command passes only the flag and relies on cwd - regression: --status was read as the dir
const statusCwd = execFileSync(node, [build, '--status'], { cwd: proj, encoding: 'utf8' });
assert.match(statusCwd, /NORTH STAR: Ship it/, 'flag-only run resolves the project from cwd');
assert.match(status, /NORTH STAR: Ship it/);
assert.match(status, /REVIEW DUE:\s*\n\s*- #0001/, 'overdue review surfaces');

// hook: silent where no .compass/, blocks once where there is
const stop = join(here, '..', 'hooks', 'stop.mjs');
const sid = 'test-' + process.pid;  // unique per run: markers live in tmpdir and outlive the process
const run = (payload) => execFileSync(node, [stop], { input: JSON.stringify(payload), encoding: 'utf8' });
assert.equal(run({ cwd: tmpdir(), session_id: sid + 'a' }).trim(), '', 'no .compass -> silent');
const first = JSON.parse(run({ cwd: proj, session_id: sid + 'b' }));
assert.equal(first.decision, 'block');
assert.match(first.reason, /SYNC\.md/);
assert.equal(run({ cwd: proj, session_id: sid + 'b' }).trim(), '', 'same session -> blocks only once');
assert.equal(run({ cwd: proj, session_id: sid + 'c', stop_hook_active: true }).trim(), '', 'stop_hook_active -> silent');

console.log('ok - ' + proj);
