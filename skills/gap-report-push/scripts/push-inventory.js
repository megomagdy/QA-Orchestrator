#!/usr/bin/env node
// Push-inventory gate for /gap-report-push. No dependencies (Node 18+).
//
//   node push-inventory.js plan   <review-findings.md> [--decisions push-decisions.json] [--out push-plan.json]
//   node push-inventory.js verify <push-plan.json> <tracker-ids.json|.txt>
//
// plan   — lists every OPEN item of the report (questions, conflicts, findings, design divergences), gives each a
//          treatment (entry / mapped to another item / excluded / combined design entry) and exits 2 while any
//          item is still UNDECIDED. Decisions come from the report itself (a conflict mentioned by an open question
//          is mapped to it; a finding whose "Raised as" names an open item is mapped to it) and from an optional
//          decisions file that overrides them:
//            { "entry": ["CF-20"], "map": {"CF-05": "Q-06"}, "exclude": {"NF-07": "QA-internal data caveat"},
//              "design": "combined" | "separate" | "skip", "designId": "DESIGN" }
// verify — compares the plan's expected entry IDs with the IDs read back from the tracker; exits 1 on any
//          missing or unexpected entry.
//
// Tables are recognised by their header row, following the /review output format:
//   questions  — header has "Priority" and a "Q-ID"/"Question" column; closed when Priority contains CLOSED
//   conflicts  — header has "Conflict";  closed when the conflict cell contains "[Resolved"
//   findings   — header has "Finding";   closed when the finding cell starts with "**Resolved"
//   design     — header has "Divergence"; closed when the divergence cell says "No longer a divergence"
// Other tables (status per question, reconciliation, inputs…) are ignored.

const fs = require('fs');

const [cmd, ...rest] = process.argv.slice(2);
const flag = name => { const i = rest.indexOf(name); return i >= 0 ? rest[i + 1] : null; };

function tables(md) {
  const out = []; let cur = null; let heading = '';
  for (const raw of md.split(/\r?\n/)) {
    const line = raw.trim();
    if (/^#{1,6} /.test(line)) heading = line.replace(/^#+ /, '');
    if (/^\|/.test(line)) {
      const cells = line.replace(/^\||\|$/g, '').split('|').map(c => c.trim());
      if (cells.every(c => /^:?-{3,}:?$/.test(c))) continue;
      if (!cur) { cur = { heading, head: cells, rows: [] }; out.push(cur); } else cur.rows.push(cells);
    } else cur = null;
  }
  return out;
}
const plain = s => (s || '').replace(/\*\*/g, '').replace(/`/g, '').trim();
const idOf = cell => (plain(cell).match(/^(Q-\d+|CF-\d+|NF-\d+)\b/) || [])[1];
const idsIn = text => [...new Set((text.match(/\b(?:Q|CF|NF)-\d+\b/g) || []))];

// Every table row of the report keyed by its first-cell ID (canonical tables AND status / decision tables),
// so a conflict can be linked to the question that resolves it wherever the report records the link.
function allRowsById(md) {
  const byId = new Map();
  for (const t of tables(md)) for (const r of t.rows) {
    const id = idOf(r[0]); if (!id) continue;
    (byId.get(id) || byId.set(id, []).get(id)).push(r.join(' | '));
  }
  return byId;
}
// "Q-08 … the no-joining-date part became CF-20" points AWAY from the question: not a resolving link.
const pointsAway = (text, id) => new RegExp(`(became|moved to|split into|now|see also)\\s+\\**${id}\\b`, 'i').test(text);

function collect(md) {
  const items = new Map();
  let designNo = 0;
  for (const t of tables(md)) {
    const head = t.head.map(h => plain(h).toLowerCase());
    const kind = head.some(h => h.includes('priority')) && head.some(h => h === 'q-id' || h === 'question') ? 'question'
      : head.some(h => h === 'conflict') ? 'conflict'
      : head.some(h => h === 'finding') ? 'finding'
      : head.some(h => h === 'divergence') ? 'design'
      : null;
    if (!kind) continue;
    for (const r of t.rows) {
      const text = r.join(' | ');
      if (kind === 'design') {
        const id = `D-${String(++designNo).padStart(2, '0')}`;
        const closed = /no longer a divergence/i.test(r[1] || '');
        items.set(id, { id, kind, title: plain(r[0]), closed, text });
        continue;
      }
      const id = idOf(r[0]);
      if (!id || items.has(id)) continue; // first canonical table wins
      const pri = kind === 'question' ? plain(r[head.indexOf('priority')]) : '';
      const closed = kind === 'question' ? /CLOSED/i.test(pri)
        : kind === 'conflict' ? /\[Resolved/i.test(r[1] || '')
        : /^\*\*Resolved/i.test((r[1] || '').trim());
      const title = plain(r[1]).replace(/^\[[^\]]+\]\s*/, '').slice(0, 90);
      const raisedAs = kind === 'finding' ? r[head.indexOf('raised as')] || '' : '';
      items.set(id, { id, kind, title, closed, priority: pri, text, raisedAs });
    }
  }
  return items;
}

function plan(reportPath) {
  const md = fs.readFileSync(reportPath, 'utf8');
  const decisions = flag('--decisions') ? JSON.parse(fs.readFileSync(flag('--decisions'), 'utf8')) : {};
  const items = collect(md);
  const rowsById = allRowsById(md);
  const open = [...items.values()].filter(i => !i.closed);
  const openQ = open.filter(i => i.kind === 'question');
  const designMode = decisions.design || 'combined';
  const designId = decisions.designId || 'DESIGN';
  const result = [];

  for (const it of open) {
    let treatment, target = null, reason = '';
    if (decisions.exclude && decisions.exclude[it.id]) { treatment = 'excluded'; reason = decisions.exclude[it.id]; }
    else if (decisions.map && decisions.map[it.id]) { treatment = 'mapped'; target = decisions.map[it.id]; reason = 'decisions file'; }
    else if ((decisions.entry || []).includes(it.id)) { treatment = 'entry'; reason = 'decisions file'; }
    else if (it.kind === 'question') { treatment = 'entry'; }
    else if (it.kind === 'design') {
      treatment = designMode === 'separate' ? 'entry' : designMode === 'skip' ? 'excluded' : 'combined';
      target = designMode === 'combined' ? designId : null;
      reason = designMode === 'skip' ? 'design mode skip' : '';
    } else if (it.kind === 'conflict') {
      // a link recorded anywhere: an open question's rows naming the conflict, or the conflict's rows naming the question
      const linked = openQ.find(q => (rowsById.get(q.id) || []).some(t => idsIn(t).includes(it.id) && !pointsAway(t, it.id)))
        || openQ.find(q => (rowsById.get(it.id) || []).some(t => idsIn(t).includes(q.id) && !pointsAway(t, q.id)));
      if (linked) { treatment = 'mapped'; target = linked.id; reason = `report links ${it.id} and ${linked.id} (check it really resolves it)`; }
      else { treatment = 'entry'; reason = 'no open question resolves it'; }
    } else if (it.kind === 'finding') {
      const targets = idsIn(it.raisedAs).filter(x => items.has(x) && !items.get(x).closed);
      const toClosed = idsIn(it.raisedAs).filter(x => items.has(x) && items.get(x).closed);
      if (targets.length) { treatment = 'mapped'; target = targets.join(', '); reason = 'from "Raised as"'; }
      else if (toClosed.length) { treatment = 'excluded'; reason = `raised as ${toClosed.join(', ')}, now closed`; }
      else { treatment = 'UNDECIDED'; reason = 'needs a decision: entry, map or exclude'; }
    }
    result.push({ id: it.id, kind: it.kind, priority: it.priority || '', title: it.title, treatment, target, reason });
  }

  const entries = result.filter(r => r.treatment === 'entry').map(r => r.id);
  if (result.some(r => r.treatment === 'combined')) entries.push(designId);
  const undecided = result.filter(r => r.treatment === 'UNDECIDED');
  const byKind = k => ({ total: [...items.values()].filter(i => i.kind === k).length, open: open.filter(i => i.kind === k).length });

  console.log('Push inventory —', reportPath);
  console.log('Category      total  open');
  for (const k of ['question', 'conflict', 'finding', 'design']) { const c = byKind(k); console.log(`${k.padEnd(12)} ${String(c.total).padStart(6)} ${String(c.open).padStart(5)}`); }
  console.log('');
  for (const t of ['entry', 'mapped', 'combined', 'excluded', 'UNDECIDED']) {
    const rows = result.filter(r => r.treatment === t);
    if (!rows.length) continue;
    console.log(`${t.toUpperCase()} (${rows.length})`);
    for (const r of rows) console.log(`  ${r.id.padEnd(6)} ${r.kind.padEnd(9)} ${(r.priority || '').padEnd(10)} ${r.target ? '→ ' + r.target + '  ' : ''}${r.reason ? '[' + r.reason + '] ' : ''}${r.title}`);
    console.log('');
  }
  console.log(`Tracker entries expected: ${entries.length}`);
  const out = flag('--out');
  if (out) fs.writeFileSync(out, JSON.stringify({ report: reportPath, createdAt: new Date().toISOString(), expectedEntries: entries, items: result }, null, 2));
  if (undecided.length) { console.error(`\nGATE: ${undecided.length} open item(s) have no treatment. Add them to the decisions file (entry / map / exclude).`); process.exit(2); }
}

function verify(planPath, idsPath) {
  const p = JSON.parse(fs.readFileSync(planPath, 'utf8'));
  const raw = fs.readFileSync(idsPath, 'utf8').trim();
  const ids = raw.startsWith('[') ? JSON.parse(raw) : raw.split(/[\r\n,]+/).map(s => s.trim()).filter(Boolean);
  const want = new Set(p.expectedEntries), got = new Set(ids);
  const missing = [...want].filter(x => !got.has(x));
  const extra = [...got].filter(x => !want.has(x));
  const dupes = ids.filter((x, i) => ids.indexOf(x) !== i);
  console.log(`Expected ${want.size} · in tracker ${ids.length} (${got.size} distinct)`);
  if (missing.length) console.log('MISSING from tracker:', missing.join(', '));
  if (extra.length) console.log('NOT in the plan:', extra.join(', '));
  if (dupes.length) console.log('DUPLICATE in tracker:', [...new Set(dupes)].join(', '));
  if (missing.length || extra.length || dupes.length) process.exit(1);
  console.log('OK: the tracker matches the push plan.');
}

if (cmd === 'plan' && rest[0]) plan(rest[0]);
else if (cmd === 'verify' && rest[0] && rest[1]) verify(rest[0], rest[1]);
else { console.error('usage: push-inventory.js plan <report.md> [--decisions file] [--out plan.json] | verify <plan.json> <ids.json|txt>'); process.exit(64); }
