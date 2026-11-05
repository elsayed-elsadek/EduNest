#!/usr/bin/env node
/**
 * EduNest — Jira backlog sync for project EF
 * ------------------------------------------------------------------
 * Reads the two authored task files:
 *   ../jira-tasks-batch-01.md
 *   ../jira-tasks-batch-02.md
 * and creates, in order: 7 Epics -> 26 Tasks -> 5 Sub-tasks (38 issues).
 *
 * Modes
 *   node sync-jira.mjs --dry-run        Parse + print the plan. No network.
 *   node sync-jira.mjs --csv out.csv    Parse + write an importable CSV. No network.
 *   node sync-jira.mjs                  Create the issues in Jira.
 *
 * Required for creation (environment variables):
 *   JIRA_BASE_URL   e.g. https://mromarmedhat.atlassian.net
 *   JIRA_EMAIL      your Atlassian account email
 *   JIRA_API_TOKEN  from https://id.atlassian.com/manage-profile/security/api-tokens
 *
 * Optional:
 *   JIRA_PROJECT    default: EF
 *   --with-estimates  also set the original estimate (needs time tracking enabled)
 *
 * Safety: idempotent. Any issue whose summary already exists in the project is
 * skipped, so re-running after a partial failure never duplicates work.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');

const BASE = (process.env.JIRA_BASE_URL || '').replace(/\/+$/, '');
const EMAIL = process.env.JIRA_EMAIL || '';
const TOKEN = process.env.JIRA_API_TOKEN || '';
const PROJECT = process.env.JIRA_PROJECT || 'EF';

const ARGV = process.argv.slice(2);
const DRY = ARGV.includes('--dry-run');
const WITH_EST = ARGV.includes('--with-estimates');
const csvIdx = ARGV.indexOf('--csv');
const CSV_OUT = csvIdx >= 0 ? ARGV[csvIdx + 1] : null;

/* ------------------------------------------------------------------ *
 * 1. Epics (authored separately: the task files reference them by ID)  *
 * ------------------------------------------------------------------ */
const EPICS = [
  ['FE-EPIC-01', 'Frontend Code Quality & Build Reliability',
    'Make install, typecheck, lint, build and dependency checks reproducible and clean. Exit: CI green from a clean clone, zero dead modules, zero unguarded logs, dependency set justified.'],
  ['FE-EPIC-02', 'Frontend Security & Auth Integration',
    'Remove production-host hazards and harden the client security posture. Exit: no localhost or secrets in the bundle, documented session strategy, guards tested, XSS sinks closed, audit triaged.'],
  ['FE-EPIC-03', 'Testing & Quality Assurance',
    'Create a test pyramid and cover the critical journeys. Exit: unit, component and E2E suites run in CI and pass on staging.'],
  ['FE-EPIC-04', 'React Performance & Bundle',
    'Measure and control bundle, render and asset performance. Exit: budgets enforced in CI, measured improvements recorded.'],
  ['FE-EPIC-05', 'Production Configuration & Deployment',
    'Make the SPA deployable and cache-correct on a real host. Exit: staging and production configs exist; deep links, headers and HTTPS verified.'],
  ['FE-EPIC-06', 'Responsive, Accessibility & Compatibility',
    'Meet an agreed browser, device and accessibility baseline. Exit: matrix executed, axe critical = 0, keyboard flows pass.'],
  ['FE-EPIC-07', 'Error Handling, Monitoring & Release',
    'Detect, communicate and recover from failures. Exit: error boundary and tracking live, staging smoke and rollback proven, signed go/no-go.'],
];

/* ------------------------------------------------------------------ *
 * 2. Parse the authored markdown                                       *
 * ------------------------------------------------------------------ */
const HEADING = /^(#{1,2})\s+(Sub-task\s+)?(FE-\d{3}[A-Z]?)\s+[—–-]\s+(.+?)\s*$/;

function readSections(file) {
  const text = readFileSync(join(ROOT, file), 'utf8').replace(/\r\n/g, '\n');
  const lines = text.split('\n');
  const found = [];

  for (let i = 0; i < lines.length; i++) {
    const m = HEADING.exec(lines[i]);
    if (!m) continue;
    const [, hashes, sub, id, title] = m;

    let end = lines.length;
    for (let j = i + 1; j < lines.length; j++) {
      if (HEADING.test(lines[j]) || /^##\s+(Batch summary|Full backlog summary)/.test(lines[j])) {
        end = j;
        break;
      }
    }
    let body = lines.slice(i + 1, end).join('\n');
    body = body.replace(/\n---\s*$/g, '').replace(/\n{3,}/g, '\n\n').trim();
    found.push({ id, title: title.trim(), isSub: Boolean(sub) || hashes === '##', body });
    i = end - 1;
  }
  return found;
}

const PRIORITY = /\*\*Priority\*\*\s*\|?\s*(Highest|High|Medium|Low)/;
const EPIC = /\*\*Epic\*\*\s*\|?\s*(FE-EPIC-\d{2})/;
const ESTIMATE = /\*\*Estimate\*\*\s*\|?\s*([0-9]+(?:\.[0-9]+)?(?:\s*[–-]\s*[0-9]+(?:\.[0-9]+)?)?)/;
const LABELS = /\*\*Labels\*\*\s*\|?\s*(.+)/;

function estimateDays(body) {
  const m = ESTIMATE.exec(body);
  if (!m) return null;
  const nums = m[1].split(/[–-]/).map(s => parseFloat(s.trim())).filter(n => !Number.isNaN(n));
  return nums.length ? Math.max(...nums) : null;
}

function labelsFor(body, priority) {
  const out = new Set(['frontend', 'production-readiness']);
  const m = LABELS.exec(body);
  if (m) {
    for (const hit of m[1].matchAll(/`([^`]+)`/g)) {
      const v = hit[1].trim().toLowerCase();
      if (v && v.length <= 50 && !/[\s,]/.test(v)) out.add(v);
    }
  }
  if (priority) out.add(priority.toLowerCase());
  return [...out];
}

function cleanBody(body) {
  const lines = body.split('\n');
  const out = [];
  let i = 0;

  while (i < lines.length) {
    if (!/^\s*\|/.test(lines[i])) { out.push(lines[i]); i++; continue; }

    const block = [];
    while (i < lines.length && /^\s*\|/.test(lines[i])) { block.push(lines[i]); i++; }

    const isSeparator = l => /^\|[\s:|-]+\|$/.test(l.trim());
    const header = block[0];
    const sep = block[1] && isSeparator(block[1]) ? block[1] : null;
    const dataStart = sep ? 2 : 1;
    const data = block.slice(dataStart).filter(l => !/^\|\s*\*\*(Type|Priority|Estimate|Epic)\*\*\s*\|/i.test(l));

    if (!data.length) continue;              // whole table was redundant metadata
    out.push(header);
    if (sep) out.push(sep);
    out.push(...data);
  }

  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

const issues = [
  ...readSections('jira-tasks-batch-01.md'),
  ...readSections('jira-tasks-batch-02.md'),
].map(sec => {
  const declared = (PRIORITY.exec(sec.body) || [])[1] || null;
  const epic = (EPIC.exec(sec.body) || [])[1] || null;
  const isSub = sec.isSub;
  const parent = isSub ? sec.id.replace(/[A-Z]$/, '') : null;
  return {
    id: sec.id,
    title: sec.title,
    summary: `[${sec.id}] ${sec.title}`,
    type: isSub ? 'Sub-task' : 'Task',
    priority: declared,
    epic,
    parent,
    estimate: estimateDays(sec.body),
    labels: labelsFor(sec.body, declared),
    body: cleanBody(sec.body),
  };
});

// Sub-tasks inherit priority (and epic) from their parent when not declared.
for (const it of issues) {
  if (it.type !== 'Sub-task') continue;
  const parent = issues.find(x => x.id === it.parent);
  if (!it.priority) it.priority = parent?.priority || 'Medium';
  if (!it.epic) it.epic = parent?.epic || null;
  if (!it.labels.length) it.labels = parent?.labels || [];
}

if (issues.length !== 31) {
  console.error(`Parsed ${issues.length} issues, expected 31. Aborting — the markdown shape changed.`);
  process.exit(1);
}

/* ------------------------------------------------------------------ *
 * 3. Markdown -> Atlassian Document Format                             *
 * ------------------------------------------------------------------ */
const txt = (text, marks) => {
  const node = { type: 'text', text };
  if (marks && marks.length) node.marks = marks;
  return node;
};

function inline(text) {
  const nodes = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(txt(text.slice(last, m.index)));
    const tok = m[0];
    if (tok.startsWith('**')) nodes.push(txt(tok.slice(2, -2), [{ type: 'strong' }]));
    else nodes.push(txt(tok.slice(1, -1), [{ type: 'code' }]));
    last = m.index + tok.length;
  }
  if (last < text.length) nodes.push(txt(text.slice(last)));
  return nodes.filter(n => n.text !== '');
}

function mdToAdf(md) {
  const lines = md.split('\n');
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) { i++; continue; }

    if (/^\s*---+\s*$/.test(line)) { blocks.push({ type: 'rule' }); i++; continue; }

    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      blocks.push({
        type: 'heading',
        attrs: { level: Math.min(6, Math.max(1, h[1].length)) },
        content: inline(h[2].trim()),
      });
      i++;
      continue;
    }

    if (/^\s*\|/.test(line)) {
      const rows = [];
      while (i < lines.length && /^\s*\|/.test(lines[i])) { rows.push(lines[i].trim()); i++; }
      blocks.push({
        type: 'codeBlock',
        attrs: { language: 'text' },
        content: [txt(rows.join('\n'))],
      });
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        let item = lines[i].replace(/^\s*[-*]\s+/, '');
        const box = /^\[( |x|X)\]\s*/.exec(item);
        if (box) item = (box[1].toLowerCase() === 'x' ? 'DONE  ' : 'TODO  ') + item.slice(box[0].length);
        items.push({
          type: 'listItem',
          content: [{ type: 'paragraph', content: inline(item) }],
        });
        i++;
      }
      blocks.push({ type: 'bulletList', content: items });
      continue;
    }

    const para = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^\s*\|/.test(lines[i]) &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^(#{1,6})\s+/.test(lines[i]) &&
      !/^\s*---+\s*$/.test(lines[i])
    ) {
      para.push(lines[i].trim());
      i++;
    }
    if (!para.length) { i++; continue; }

    const content = [];
    para.forEach((p, idx) => {
      if (idx) content.push({ type: 'hardBreak' });
      content.push(...inline(p));
    });
    if (content.length) blocks.push({ type: 'paragraph', content });
  }

  return { type: 'doc', version: 1, content: blocks.length ? blocks : [{ type: 'paragraph', content: [txt(' ')] }] };
}

/* ------------------------------------------------------------------ *
 * 4. CSV mode                                                          *
 * ------------------------------------------------------------------ */
function csvCell(v) {
  const s = v === null || v === undefined ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function writeCsv(path) {
  const rows = [[
    'Issue Type', 'Summary', 'Description', 'Priority', 'Labels',
    'Epic Link', 'Parent', 'Original Estimate', 'Temporary ID',
  ]];

  for (const e of EPICS) {
    rows.push([
      'Epic',
      e[1],
      `${e[2]}\n\nEpic ID: ${e[0]}`,
      e[0] === 'FE-EPIC-06' || e[0] === 'FE-EPIC-04' ? 'High' : 'Highest',
      'frontend,production-readiness',
      '', '', '', e[0],
    ]);
  }

  for (const it of issues) {
    const epicTitle = (EPICS.find(e => e[0] === it.epic) || [])[1] || '';
    const parentSummary = it.parent
      ? (issues.find(x => x.id === it.parent) || {}).summary || it.parent
      : '';
    rows.push([
      it.type,
      it.summary,
      it.body,
      it.priority,
      it.labels.join(','),
      epicTitle,
      parentSummary,
      it.estimate ? `${it.estimate}d` : '',
      it.id,
    ]);
  }

  writeFileSync(path, '\uFEFF' + rows.map(r => r.map(csvCell).join(',')).join('\r\n') + '\r\n', 'utf8');
  console.log(`CSV written: ${path}  (${rows.length - 1} rows)`);
}

/* ------------------------------------------------------------------ *
 * 5. Jira REST client                                                  *
 * ------------------------------------------------------------------ */
class ApiError extends Error {
  constructor(status, payload) {
    super(`HTTP ${status}: ${JSON.stringify(payload).slice(0, 900)}`);
    this.status = status;
    this.payload = payload;
  }
}

const authHeader = () =>
  'Basic ' + Buffer.from(`${EMAIL}:${TOKEN}`).toString('base64');

async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${BASE}/rest/api/3${path}`, {
    method,
    headers: {
      Authorization: authHeader(),
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const raw = await res.text();
  let data = null;
  try { data = raw ? JSON.parse(raw) : null; } catch { data = raw; }
  if (!res.ok) throw new ApiError(res.status, data);
  return data;
}

async function loadContext() {
  const project = await api(`/project/${PROJECT}`);
  const types = project.issueTypes.map(t => t.name);

  const pick = (...candidates) => candidates.find(c => types.includes(c));

  const epicType = pick('Epic');
  const taskType = pick('Task', 'Story', 'Improvement');
  const subType = pick('Sub-task', 'Subtask');

  if (!epicType) throw new Error(`No Epic issue type in ${PROJECT}. Types: ${types.join(', ')}`);
  if (!taskType) throw new Error(`No Task/Story issue type in ${PROJECT}. Types: ${types.join(', ')}`);

  let epicNameField = null;
  try {
    const fields = await api('/field');
    const f = fields.find(x => x.name === 'Epic Name');
    if (f) epicNameField = f.id;
  } catch { /* not fatal */ }

  const priorities = new Set();
  try {
    for (const p of await api('/priority')) priorities.add(p.name);
  } catch { /* not fatal */ }

  return { epicType, taskType, subType, epicNameField, priorities };
}

async function searchJql(jql, fields, maxResults = '100', nextPageToken = null) {
  const qs = new URLSearchParams({ jql, maxResults, fields });
  if (nextPageToken) qs.set('nextPageToken', nextPageToken);
  try {
    return await api(`/search/jql?${qs}`);
  } catch (err) {
    // Older sites only expose the legacy /search endpoint.
    if (err instanceof ApiError && (err.status === 404 || err.status === 410)) {
      const legacy = new URLSearchParams({ jql, maxResults, fields });
      if (nextPageToken) legacy.set('startAt', nextPageToken);
      return await api(`/search?${legacy}`);
    }
    throw err;
  }
}

async function existingSummaries() {
  const seen = new Set();
  let token = null;
  for (let page = 0; page < 40; page++) {
    const data = await searchJql(`project = ${PROJECT} ORDER BY created ASC`, 'summary', '100', token);
    for (const it of data.issues || []) seen.add(normalize(it.fields.summary));
    if (!data.nextPageToken) break;
    token = data.nextPageToken;
  }
  return seen;
}

const normalize = s => String(s || '').replace(/\s+/g, ' ').trim().toLowerCase();

async function create(fields, retryWithout = []) {
  const payload = { fields };
  try {
    return await api('/issue', { method: 'POST', body: payload });
  } catch (err) {
    if (!(err instanceof ApiError) || err.status !== 400) throw err;

    const msg = JSON.stringify(err.payload || '').toLowerCase();
    const clone = { ...fields };

    // Epic Name required on some company-managed projects
    if (msg.includes('epic name') && !clone.customfield_10011) {
      const nameField = globalThis.__epicNameField;
      if (nameField) {
        clone[nameField] = fields.summary;
        return create(clone, retryWithout);
      }
    }
    // Priority may be restricted
    if (msg.includes('priority') && clone.priority) {
      delete clone.priority;
      return create(clone, retryWithout);
    }
    // Time tracking may be disabled
    if ((msg.includes('timetracking') || msg.includes('originalestimate')) && clone.timetracking) {
      delete clone.timetracking;
      return create(clone, retryWithout);
    }
    // Labels may be restricted
    if (msg.includes('labels') && clone.labels) {
      delete clone.labels;
      return create(clone, retryWithout);
    }
    throw err;
  }
}

/* ------------------------------------------------------------------ *
 * 6. Main                                                              *
 * ------------------------------------------------------------------ */
async function main() {
  if (CSV_OUT) { writeCsv(resolve(CSV_OUT)); return; }

  if (ARGV.includes('--selftest')) {
    let nodes = 0;
    const problems = [];
    const walk = (n, path) => {
      nodes++;
      if (n.type === 'text' && (!n.text || !n.text.length)) problems.push(`${path}: empty text node`);
      if (Array.isArray(n.content)) {
        if (!n.content.length) problems.push(`${path}: empty content array on ${n.type}`);
        n.content.forEach((c, i) => walk(c, `${path}/${n.type}[${i}]`));
      }
    };
    for (const it of issues) {
      const adf = mdToAdf(it.body);
      const before = problems.length;
      walk(adf, it.id);
      if (problems.length > before) console.log(`${it.id}: ${problems.length - before} problem(s)`);
    }
    console.log(`ADF self-test: ${issues.length} docs, ${nodes} nodes, ${problems.length} problems`);
    for (const p of problems.slice(0, 20)) console.log('  ' + p);
    if (problems.length) process.exitCode = 1;
    return;
  }

  if (DRY) {
    console.log(`Project: ${PROJECT || '(unset)'}\n`);
    console.log('EPICS');
    for (const e of EPICS) console.log(`  ${e[0].padEnd(12)} ${e[1]}`);
    console.log('\nISSUES');
    for (const it of issues) {
      console.log(
        `  ${it.id.padEnd(8)} ${it.type.padEnd(9)} ${it.priority.padEnd(8)} ` +
        `${(it.estimate ? it.estimate + 'd' : '-').padEnd(5)} ` +
        `${(it.epic || '').padEnd(12)} ${it.summary}`
      );
    }
    console.log(`\nTotal: ${EPICS.length} epics + ${issues.length} issues = ${EPICS.length + issues.length}`);
    return;
  }

  if (!BASE || !EMAIL || !TOKEN) {
    console.error('Missing JIRA_BASE_URL / JIRA_EMAIL / JIRA_API_TOKEN.\n' +
      'Use --dry-run or --csv to work offline.');
    process.exit(2);
  }

  console.log(`Target: ${BASE} · project ${PROJECT}\n`);
  const ctx = await loadContext();
  globalThis.__epicNameField = ctx.epicNameField;
  console.log(`Issue types: epic=${ctx.epicType} task=${ctx.taskType} sub=${ctx.subType || 'n/a'}`);
  console.log(`Priorities available: ${[...ctx.priorities].join(', ') || 'unknown'}\n`);

  const seen = await existingSummaries();
  const created = [];
  const skipped = [];
  const failed = [];

  const epicKeys = new Map();

  for (const [id, title, goal] of EPICS) {
    const summary = `[${id}] ${title}`;
    if (seen.has(normalize(summary))) { skipped.push(summary); continue; }
    try {
      const res = await create({
        project: { key: PROJECT },
        issuetype: { name: ctx.epicType },
        summary,
        description: mdToAdf(goal),
        labels: ['frontend', 'production-readiness'],
      });
      epicKeys.set(id, res.key);
      created.push([id, res.key, summary]);
      console.log(`  + ${res.key.padEnd(10)} epic    ${summary}`);
    } catch (e) {
      failed.push([id, summary, e.message]);
      console.error(`  ! ${id} epic failed: ${e.message}`);
    }
  }

  // Resolve existing epics we skipped, so tasks can still attach
  if (skipped.length) {
    const all = await searchJql(
      `project = ${PROJECT} AND issuetype = Epic ORDER BY created ASC`,
      'summary'
    );
    for (const it of all.issues || []) {
      for (const [id, title] of EPICS) {
        if (normalize(it.fields.summary) === normalize(`[${id}] ${title}`)) epicKeys.set(id, it.key);
      }
    }
  }

  const taskKeys = new Map();

  for (const it of issues.filter(x => x.type === 'Task')) {
    if (seen.has(normalize(it.summary))) { skipped.push(it.summary); continue; }
    const fields = {
      project: { key: PROJECT },
      issuetype: { name: ctx.taskType },
      summary: it.summary,
      description: mdToAdf(it.body),
      labels: it.labels,
    };
    if (it.priority && (!ctx.priorities.size || ctx.priorities.has(it.priority))) {
      fields.priority = { name: it.priority };
    }
    const parentKey = epicKeys.get(it.epic);
    if (parentKey) fields.parent = { key: parentKey };
    if (WITH_EST && it.estimate) fields.timetracking = { originalEstimate: `${it.estimate}d` };

    try {
      const res = await create(fields);
      taskKeys.set(it.id, res.key);
      created.push([it.id, res.key, it.summary]);
      console.log(`  + ${res.key.padEnd(10)} task    ${it.summary}`);
    } catch (e) {
      failed.push([it.id, it.summary, e.message]);
      console.error(`  ! ${it.id} failed: ${e.message}`);
    }
  }

  for (const it of issues.filter(x => x.type === 'Sub-task')) {
    if (seen.has(normalize(it.summary))) { skipped.push(it.summary); continue; }
    const parentKey = taskKeys.get(it.parent);
    if (!parentKey) {
      failed.push([it.id, it.summary, `parent ${it.parent} was not created; sub-task skipped`]);
      console.error(`  ! ${it.id} skipped: parent ${it.parent} missing`);
      continue;
    }
    if (!ctx.subType) {
      failed.push([it.id, it.summary, 'project has no Sub-task issue type']);
      console.error(`  ! ${it.id} skipped: no Sub-task type`);
      continue;
    }
    const fields = {
      project: { key: PROJECT },
      issuetype: { name: ctx.subType },
      parent: { key: parentKey },
      summary: it.summary,
      description: mdToAdf(it.body),
    };
    if (it.priority && (!ctx.priorities.size || ctx.priorities.has(it.priority))) {
      fields.priority = { name: it.priority };
    }
    if (WITH_EST && it.estimate) fields.timetracking = { originalEstimate: `${it.estimate}d` };

    try {
      const res = await create(fields);
      created.push([it.id, res.key, it.summary]);
      console.log(`  + ${res.key.padEnd(10)} subtask ${it.summary}`);
    } catch (e) {
      failed.push([it.id, it.summary, e.message]);
      console.error(`  ! ${it.id} failed: ${e.message}`);
    }
  }

  const report = ['Temporary ID,Jira Key,Summary']
    .concat(created.map(([id, key, s]) => [id, key, `"${s.replace(/"/g, '""')}"`].join(',')))
    .join('\r\n');
  writeFileSync(join(HERE, 'jira-created-keys.csv'), report, 'utf8');

  console.log(`\nCreated ${created.length} · skipped ${skipped.length} · failed ${failed.length}`);
  console.log(`Key map: ${join(HERE, 'jira-created-keys.csv')}`);
  if (failed.length) {
    console.log('\nFailures:');
    for (const [id, s, m] of failed) console.log(`  ${id}: ${m}`);
    process.exitCode = 1;
  }
}

main().catch(e => {
  console.error('\nFATAL:', e?.message || e);
  process.exit(1);
});
