#!/usr/bin/env node
// Compass build: .compass/{goal.json,decisions/*.md,modules/*.md} -> .compass/data.js
// Zero deps. Rerun after any edit. Usage: node build.mjs [projectDir]
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, copyFileSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
// flags may come before or instead of the dir, so never take argv[2] blindly
const proj = process.argv.slice(2).find(a => !a.startsWith('--')) || process.cwd();
const dir = join(proj, '.compass');
if (!existsSync(dir)) { console.error('no .compass/ in ' + proj + ' - run /compass:init'); process.exit(1); }

const readDir = (p) => existsSync(p) ? readdirSync(p).filter(f => f.endsWith('.md')).sort() : [];

function parseFm(src) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(src);
  if (!m) return [{}, src];
  const fm = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line);
    if (!kv) continue;
    let v = kv[2].trim();
    if (v.startsWith('[') && v.endsWith(']')) {
      v = v.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    } else v = v.replace(/^["']|["']$/g, '');
    fm[kv[1]] = v;
  }
  return [fm, src.slice(m[0].length)];
}

function sections(body) {
  const out = []; const re = /^##\s+(.+)$/gm;
  let m, head = null, idx = 0;
  while ((m = re.exec(body))) {
    if (head) out.push({ heading: head, body: body.slice(idx, m.index).trim() });
    head = m[1].trim(); idx = m.index + m[0].length;
  }
  if (head) out.push({ heading: head, body: body.slice(idx).trim() });
  else if (body.trim()) out.push({ heading: 'Notes', body: body.trim() });
  return out;
}

let goal = {};
const goalPath = join(dir, 'goal.json');
if (existsSync(goalPath)) {
  try { goal = JSON.parse(readFileSync(goalPath, 'utf8')); }
  catch (e) { console.error('goal.json is not valid JSON: ' + e.message); process.exit(1); }
}

const decisions = readDir(join(dir, 'decisions')).map(f => {
  const src = readFileSync(join(dir, 'decisions', f), 'utf8');
  const [fm, body] = parseFm(src);
  const secs = sections(body);
  return {
    file: f,
    id: String(fm.id || basename(f).split('-')[0]),
    title: fm.title || secs[0]?.heading || basename(f, '.md'),
    title_ar: fm.title_ar || '',
    date: fm.date || '',
    status: fm.status || 'accepted',
    module: fm.module || '',
    tags: [].concat(fm.tags || []),
    provenance: fm.provenance || 'human',
    review_date: fm.review_date || '',
    superseded_by: fm.superseded_by || '',
    links: [].concat(fm.links || []),
    sections: secs,
    search: [fm.title, ...secs.map(s => s.heading + ' ' + s.body)].join(' ').toLowerCase()
  };
});

const modules = readDir(join(dir, 'modules')).map(f => {
  const src = readFileSync(join(dir, 'modules', f), 'utf8');
  const [fm, body] = parseFm(src);
  const name = fm.module || basename(f, '.md');
  return { file: f, name, title: fm.title || name, title_ar: fm.title_ar || '', source: fm.source || '', body: body.trim() };
});

const data = { goal, decisions, modules, generated: new Date().toISOString() };
writeFileSync(join(dir, 'data.js'), 'window.COMPASS = ' + JSON.stringify(data, null, 2) + ';\n');

// index.html is copied once so local tweaks survive; --html forces the shipped template back
const html = join(dir, 'index.html');
if (!existsSync(html) || process.argv.includes('--html')) copyFileSync(join(here, '..', 'templates', 'index.html'), html);

if (!process.argv.includes('--status')) {
  console.log(`compass: ${decisions.length} decisions, ${modules.length} modules -> ${join(dir, 'data.js')}`);
  process.exit(0);
}

// --status: human summary, no model tokens spent parsing files
const today = new Date().toISOString().slice(0, 10);
const dead = d => d.status === 'superseded' || d.status === 'deprecated';
const due = decisions.filter(d => d.review_date && d.review_date <= today && !dead(d));
const out = [];
out.push('NORTH STAR: ' + (goal.north_star || '(unset)'));
if (goal.milestone) out.push(`MILESTONE: ${goal.milestone} (${Number(goal.progress) || 0}%)`);
if (goal.next_steps?.length) out.push('NEXT: ' + goal.next_steps.map(s => '\n  - ' + s).join(''));
out.push(`DECISIONS: ${decisions.length} (${decisions.filter(d => d.status === 'proposed').length} proposed)`);
out.push(due.length
  ? 'REVIEW DUE:' + due.map(d => `\n  - #${d.id} ${d.title} (${d.review_date})`).join('')
  : 'REVIEW DUE: none');
out.push('DASHBOARD: ' + html);
console.log(out.join('\n'));
