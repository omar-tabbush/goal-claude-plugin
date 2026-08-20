#!/usr/bin/env node
// Compass Stop hook. Silent unless the project opted in (.compass/ exists).
// Blocks the stop exactly once per session so the model syncs while context is fresh.
import { existsSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const ok = () => process.exit(0);

let raw = '';
for await (const c of process.stdin) raw += c;

let input = {};
try { input = JSON.parse(raw || '{}'); } catch { ok(); }

if (input.stop_hook_active) ok();

const cwd = input.cwd || process.cwd();
if (!existsSync(join(cwd, '.compass'))) ok();

const marker = join(tmpdir(), `compass-sync-${input.session_id || 'nosession'}`);
if (existsSync(marker)) ok();
try { writeFileSync(marker, cwd); } catch { ok(); }

const root = process.env.CLAUDE_PLUGIN_ROOT || join(dirname(fileURLToPath(import.meta.url)), '..');
process.stdout.write(JSON.stringify({
  decision: 'block',
  reason: `Compass sync. Read ${join(root, 'docs', 'SYNC.md')} and follow it exactly for ${cwd}. Be terse. If nothing this session was worth a record, say "compass: nothing to record" and stop.`
}));
ok();
