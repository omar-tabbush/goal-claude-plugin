#!/usr/bin/env node
// Stage 1 of init, for vaults that already use the standard ledger layout:
//   <vault>/<name>.md, <vault>/decisions/NNNN-*.md, <vault>/modules/<m>/<m>.md,
//   <vault>/modules/<m>/decisions/NNNN-*.md
// Mechanical, so it costs no model tokens. Anything not in this shape is Stage 1
// work for the model instead.
//
//   node import-vault.mjs <vaultRoot> [projectDir] [--dry]
//
// Never writes to the vault. Never overwrites an existing .compass/ record.
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { join, basename, relative } from 'node:path';

const [vault, projArg] = process.argv.slice(2).filter(a => !a.startsWith('--'));
const dry = process.argv.includes('--dry');
if (!vault || !existsSync(vault)) { console.error('usage: import-vault.mjs <vaultRoot> [projectDir] [--dry]'); process.exit(1); }
const proj = projArg || process.cwd();
const out = join(proj, '.compass');

const ls = p => existsSync(p) ? readdirSync(p) : [];
const mds = p => ls(p).filter(f => f.endsWith('.md')).sort();
const dirs = p => ls(p).filter(f => statSync(join(p, f)).isDirectory());

function fm(src) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(src);
  if (!m) return [{}, src];
  const o = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line);
    if (kv) o[kv[1]] = kv[2].trim();
  }
  return [o, src.slice(m[0].length)];
}

// [[path/to/note|label]] -> label, [[note]] -> note. Vault links mean nothing outside the vault.
const unwiki = s => s.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2')
                     .replace(/\[\[([^\]]+)\]\]/g, (_, p) => p.split('/').pop());

// The vault's own heading names, mapped onto the compass four.
const HEAD = [
  [/^why\b|intent/i, 'Context'],
  [/^decision/i, 'Decision'],
  [/rejected|alternativ/i, 'Alternatives rejected'],
  [/consequence|must not/i, 'Consequences']
];
const remap = h => (HEAD.find(([re]) => re.test(h)) || [, h])[1];

function convert(src, file) {
  const [f, rawBody] = fm(src);
  let body = unwiki(rawBody);
  const t = /^#\s+(.+)$/m.exec(body);
  const title = t ? t[1].trim() : basename(file, '.md').replace(/^\d+-/, '').replace(/-/g, ' ');
  body = body.replace(/^#\s+.+$/m, '').replace(/^##\s+(.+)$/gm, (_, h) => '## ' + remap(h.trim())).trim();
  return { f, title, body };
}

const records = [];
const seen = new Set();
function collect(dir, module) {
  for (const file of mds(dir)) {
    const { f, title, body } = convert(readFileSync(join(dir, file), 'utf8'), file);
    records.push({
      src: relative(vault, join(dir, file)).replace(/\\/g, '/'),
      module: f.module || module,
      status: f.status || 'accepted',
      date: f.date || '',
      tags: f.tags || '[]',
      superseded_by: f['superseded-by'] || f.superseded_by || '',
      slug: basename(file, '.md').replace(/^\d+-/, ''),
      title, body
    });
  }
}
collect(join(vault, 'decisions'), 'cross-cutting');
for (const m of dirs(join(vault, 'modules'))) collect(join(vault, 'modules', m, 'decisions'), m);

// Vault ids restart per module; compass ids are global, so renumber by date and
// keep the vault path in links so a record can always be traced home.
records.sort((a, b) => (a.date || '9999').localeCompare(b.date || '9999') || a.src.localeCompare(b.src));

const modules = [];
for (const m of dirs(join(vault, 'modules'))) {
  const map = join(vault, 'modules', m, m + '.md');
  if (!existsSync(map)) continue;
  const [, body] = fm(readFileSync(map, 'utf8'));
  modules.push({ name: m, body: unwiki(body).replace(/^#\s+.+$/m, '').trim(), src: `modules/${m}/${m}.md` });
}

if (dry) {
  console.log(`${records.length} decisions, ${modules.length} modules`);
  records.forEach((r, i) => console.log(`  ${String(i + 1).padStart(4, '0')} [${r.module}] ${r.title.slice(0, 70)}`));
  process.exit(0);
}

mkdirSync(join(out, 'decisions'), { recursive: true });
mkdirSync(join(out, 'modules'), { recursive: true });

let written = 0, skipped = 0;
records.forEach((r, i) => {
  const id = String(i + 1).padStart(4, '0');
  const name = `${id}-${r.slug}.md`;
  if (existsSync(join(out, 'decisions', name))) { skipped++; return; }
  writeFileSync(join(out, 'decisions', name), `---
id: ${id}
title: ${r.title.replace(/\n/g, ' ')}
date: ${r.date}
status: ${r.status}
module: ${r.module}
tags: ${r.tags}
provenance: human
review_date:
superseded_by: ${r.superseded_by}
links: [vault:${r.src}]
---
${r.body}
`);
  written++;
  seen.add(r.module);
});

let mw = 0;
for (const m of modules) {
  const p = join(out, 'modules', m.name + '.md');
  if (existsSync(p)) continue;
  writeFileSync(p, `---
module: ${m.name}
title: ${m.name}
source: vault:${m.src}
---
${m.body}
`);
  mw++;
}
// A module referenced by a record but with no map file still needs a stub, or the
// dashboard shows decisions under a module that does not exist.
for (const m of seen) {
  const p = join(out, 'modules', m + '.md');
  if (existsSync(p)) continue;
  writeFileSync(p, `---
module: ${m}
title: ${m}
source:
---
Imported from the vault. No module map existed - write one.
`);
  mw++;
}

console.log(`imported ${written} decisions (${skipped} already present), ${mw} module docs -> ${out}`);
