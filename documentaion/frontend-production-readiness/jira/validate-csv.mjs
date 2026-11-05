import { readFileSync } from 'node:fs';

const p = process.argv[2];
const t = readFileSync(p, 'utf8').replace(/^\uFEFF/, '');
const rows = [];
let cur = '';
let q = false;
for (let i = 0; i < t.length; i++) {
  const c = t[i];
  if (c === '"') {
    if (q && t[i + 1] === '"') { cur += '"'; i++; } else q = !q;
  } else if (c === ',' && !q) { rows.push(cur); cur = ''; }
  else if (c === '\n' && !q) { rows.push(cur); cur = ''; }
  else if (c !== '\r') cur += c;
}
rows.push(cur);

const COLS = 9;
const recs = [];
for (let i = 0; i < rows.length; i += COLS) {
  if (rows[i] !== '' || i === 0) recs.push(rows.slice(i, i + COLS));
}
const head = recs.shift();
const bad = [];
const byType = {};

for (const r of recs) {
  const [type, sum, desc, pri, lab, epic, parent, est, id] = r;
  byType[type] = (byType[type] || 0) + 1;
  if (!sum || !desc) bad.push(`${id}: missing summary or description`);
  if (type !== 'Epic' && (!desc.includes('Acceptance Criteria') || !desc.includes('Test Scenarios'))) {
    bad.push(`${id}: missing Acceptance Criteria or Test Scenarios`);
  }
  if (type === 'Sub-task' && !parent) bad.push(`${id}: sub-task without parent`);
  if (type === 'Task' && !epic) bad.push(`${id}: task without epic link`);
  if (!pri) bad.push(`${id}: missing priority`);
}

console.log('columns :', head.join(' | '));
console.log('records :', recs.length);
console.log('by type :', JSON.stringify(byType));
console.log('problems:', bad.length);
bad.slice(0, 15).forEach(b => console.log('   - ' + b));
console.log('em dash preserved:', recs.filter(r => r[2].includes('\u2014')).length);
console.log('longest desc (chars):', Math.max(...recs.map(r => r[2].length)));
console.log('total desc chars   :', recs.reduce((a, r) => a + r[2].length, 0));
