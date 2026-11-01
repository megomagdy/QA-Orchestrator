// scripts/tc-prevention-gates.js — Defect-Prevention Gates 1–2 (skills/write-tests/defect-prevention.md).
// Project-agnostic: works on any array of cases shaped { id, labels?, steps: [{ step, expected }] }.
//
//   const { preventionGates } = require('<QA_GLOBAL_HOME>/scripts/tc-prevention-gates');
//   const problems = preventionGates(cases);            // [] when clean
//   if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
//
// Options: { allowVague: Set<caseId> } for reviewed exceptions, { vagueWords, observationPattern } to override.
// CLI: node tc-prevention-gates.js <cases.json>

const OBSERVATION = /\b(record (whether|what|how)|note (what|whether|how)|observe (whether|what)|check (if|whether))\b/i;
const VAGUE = ['correctly', 'correct', 'properly', 'as expected', 'works', 'working', 'successfully', 'is updated', 'are updated', 'displays fine', 'no issues', 'appropriate', 'appropriately'];
// A concrete outcome names a value, a quoted string, a field, a status or a count.
const CONCRETE = /(\d|["“'‘`]|\b(shows|reads|equals|is set to|stores|returns|lists|contains|is not|are not|no longer|is blocked|is refused|is disabled|is enabled|is hidden|is removed|is on|is off|status|message|toast|error|count|empty)\b)/i;

const labelsOf = c => (Array.isArray(c.labels) ? c.labels : String(c.labels || '').split(/[,\s]+/)).filter(Boolean);
const isBlocked = c => labelsOf(c).some(l => /^blocked-/i.test(l));

function preventionGates(cases, opts = {}) {
  const obs = opts.observationPattern || OBSERVATION;
  const vague = (opts.vagueWords || VAGUE).map(w => w.toLowerCase());
  const allow = opts.allowVague || new Set();
  const out = [];
  for (const c of cases) {
    (c.steps || []).forEach((s, i) => {
      const exp = String(s.expected || '').trim();
      const where = `${c.id} step ${i + 1}`;
      if (!exp) { out.push(`${where}: empty expected result`); return; }
      if (obs.test(exp) && !isBlocked(c)) out.push(`${where}: observation-only step ("${exp.slice(0, 80)}") — give a definite outcome or label the case blocked-<question id>`);
      const low = exp.toLowerCase();
      if (!allow.has(c.id) && vague.some(w => low.includes(w)) && !CONCRETE.test(exp)) {
        out.push(`${where}: vague expected result ("${exp.slice(0, 80)}") — name the value, field, message or status`);
      }
    });
  }
  return out;
}

module.exports = { preventionGates, OBSERVATION, VAGUE };

if (require.main === module) {
  const file = process.argv[2];
  if (!file) { console.error('usage: node tc-prevention-gates.js <cases.json>'); process.exit(2); }
  const problems = preventionGates(require(require('path').resolve(file)));
  console.log(problems.length ? problems.join('\n') : 'Defect-prevention gates 1-2: clean');
  process.exit(problems.length ? 1 : 0);
}
