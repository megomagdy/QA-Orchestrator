/**
 * Regenerates the 5 documentation PNGs from HTML sources.
 *
 *   node build-diagrams.js
 *
 * Requires only a local Chrome/Edge install (no npm dependencies).
 * Edit the SPECS below, re-run, and the PNGs are rebuilt.
 */

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const OUT = __dirname;

const CHROME_CANDIDATES = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
];

const CSS = `
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0b2036; --card:#0f1a30; --card2:#102844; --border:#1d3557;
  --cyan:#38bdf8; --teal:#5eead4; --txt:#dbe6f3; --muted:#8ea6c2; --dim:#6b83a3;
  --amber:#fbbf24; --rose:#fb7185;
}
body{background:var(--bg);color:var(--txt);
  font-family:"Segoe UI",system-ui,-apple-system,sans-serif;
  padding:34px 40px;-webkit-font-smoothing:antialiased}
h1{font-size:31px;font-weight:700;letter-spacing:-.4px}
h1 .accent{color:var(--cyan)}
.sub{color:var(--muted);font-size:15px;margin-top:7px;line-height:1.5}
.rule{height:2px;background:linear-gradient(90deg,var(--cyan),transparent);margin:20px 0 26px;border-radius:2px}
.band{background:var(--card);border:1px solid var(--border);border-left:4px solid var(--cyan);
  border-radius:11px;padding:16px 20px;margin-bottom:11px}
.band .bt{font-size:17px;font-weight:700;color:var(--cyan);margin-bottom:4px}
.band .bd{color:var(--muted);font-size:13.5px;line-height:1.55}
.chips{display:flex;flex-wrap:wrap;gap:7px;margin-top:10px}
.chip{background:var(--card2);border:1px solid var(--border);border-radius:7px;
  padding:5px 11px;font-size:12.5px;color:var(--txt);font-family:Consolas,monospace}
.chip.a{border-color:var(--teal);color:var(--teal)}
.arrow{text-align:center;color:var(--cyan);font-size:19px;margin:1px 0 5px;opacity:.75}
.foot{margin-top:22px;color:var(--dim);font-size:12.5px;border-top:1px solid var(--border);padding-top:13px;line-height:1.6}
.tag{display:inline-block;background:rgba(56,189,248,.13);border:1px solid var(--cyan);
  color:var(--cyan);border-radius:20px;padding:3px 13px;font-size:12px;font-weight:600}
.tag.copy{background:rgba(142,166,194,.1);border-color:var(--dim);color:var(--muted)}
`;

function page(title, w, body, extra = "") {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
<style>${CSS}
body{width:${w}px}
${extra}</style></head><body>${body}</body></html>`;
}

/* ─────────── 1. JOURNEY ─────────── */
const journey = () => {
  const phases = [
    ["🏁 SETUP — once per machine, once per project", "Skills and agents are LINKED to the global folder, never copied — so every project runs the same, current version.", ["/init-workspace", "/init-project"]],
    ["🔍 INVESTIGATE", "Register sources, then cross-review docs against ground truth: rendered prototype, live app, existing code, current data. Raise only real gaps.", ["/save-url", "/review", "/cache-build", "/gap-report-doc", "/gap-report-push"]],
    ["✍️ DESIGN TESTS", "SFDP decomposition + coverage matrix (negative/boundary/edge ≥ 30% combined). Outputs Markdown plus an import file matching your test tool.", ["/write-tests", "/cross-validate"]],
    ["🤖 AUTOMATE", "Page-Object framework, auth-state reuse, multi-env config, CI wiring — then run, triage, and heal.", ["/scaffold-automation", "/run-automation"]],
    ["🖱️ EXECUTE MANUALLY", "Drive the real browser, capture evidence, log confirmed bugs as one-liners per epic.", ["/execute-tc"]],
    ["🐞 REPORT", "Batch-create tracker issues through a pluggable adapter and auto-attach the evidence.", ["/report-bugs", "/bug-report"]],
    ["🧠 LEARN & SYNC", "Document what the session taught, then promote the generalizable parts back to the global folder for the next project.", ["/learn", "/sync-global"]],
  ];
  const body = `
  <h1>The QA <span class="accent">Journey</span> — blank machine to tested feature</h1>
  <div class="sub">Seven phases. Each one leaves the next with less to re-derive — and the last one feeds the global folder,
  so the following project starts smarter than this one did.</div>
  <div class="rule"></div>
  ${phases.map(([t, d, c], i) => `
    <div class="band"><div class="bt">${t}</div><div class="bd">${d}</div>
      <div class="chips">${c.map(x => `<span class="chip">${x}</span>`).join("")}</div></div>
    ${i < phases.length - 1 ? '<div class="arrow">▼</div>' : ""}`).join("")}
  <div class="arrow" style="font-size:15px;opacity:.6">↺ &nbsp;learnings return to SETUP — the next project inherits them</div>
  <div class="foot"><b>Anytime:</b> <code>/checkpoint</code> saves session context before you step away; <code>/session-resume</code> restores it.
  <code>/learn</code> also fires on its own when a correction or new pattern appears mid-session.</div>`;
  return page("Journey", 1600, body);
};

/* ─────────── 2. FILE FLOW (the updated one) ─────────── */
const fileFlow = () => {
  const rows = [
    ["skills/", ".claude/skills/", "LINK", "37 skills — one copy on disk, shared by every project"],
    ["agents/", ".claude/agents/", "LINK", "10 subagents — same instance everywhere"],
    ["scripts/ + adapters/", "$QA_GLOBAL_HOME", "LINK", "invoked in place; never duplicated"],
    ["templates/playbook", "CLAUDE.md", "COPY", "project fills placeholders and writes its own lessons log"],
    ["templates/qa-rules", "qa-rules-condensed.md", "COPY", "/learn writes here; /sync-global promotes reviewed rules back"],
    ["registered test template", "&lt;tool&gt;-template.xlsx", "COPY", "starting point for the project's own test cases"],
    ["—", "Manual Execution/ · .env", "COPY", "the project's own bug log, evidence, and credentials"],
  ];
  const extra = `
  table{width:100%;border-collapse:separate;border-spacing:0 8px}
  th{text-align:left;font-size:12px;letter-spacing:.9px;text-transform:uppercase;color:var(--dim);padding:0 14px 4px}
  td{background:var(--card);border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:13px 14px;font-size:14px;vertical-align:middle}
  td:first-child{border-left:1px solid var(--border);border-radius:9px 0 0 9px;font-family:Consolas,monospace;color:var(--teal)}
  td:last-child{border-right:1px solid var(--border);border-radius:0 9px 9px 0;color:var(--muted);font-size:13px}
  td.dest{font-family:Consolas,monospace;color:var(--txt)}
  tr.link td{border-color:#1e4b6b;background:#0e2438}
  .why{display:flex;gap:14px;margin-top:8px}
  .why div{flex:1;background:var(--card);border:1px solid var(--border);border-radius:10px;padding:15px 17px;font-size:13.5px;color:var(--muted);line-height:1.6}
  .why b{color:var(--txt)}`;
  const body = `
  <h1>Global folder <span class="accent">↔</span> project folder</h1>
  <div class="sub"><b>The rule:</b> <span class="tag">LINK</span> what a project only <b>consumes</b> &nbsp;·&nbsp;
  <span class="tag copy">COPY</span> what a project <b>authors</b>. &nbsp;See <code>LINK-VS-COPY.md</code>.</div>
  <div class="rule"></div>
  <table>
    <tr><th>Global folder — single source of truth</th><th>How</th><th>Project folder</th><th>Why</th></tr>
    ${rows.map(([g, p, how, why]) => `
      <tr class="${how === "LINK" ? "link" : ""}">
        <td>${g}</td>
        <td style="text-align:center;width:132px">${how === "LINK"
          ? '<span class="tag">═══▶ LINK</span>'
          : '<span class="tag copy">- - -▶ COPY</span>'}</td>
        <td class="dest">${p}</td><td>${why}</td></tr>`).join("")}
    <tr><td style="color:var(--amber)">templates/</td>
        <td style="text-align:center"><span class="tag copy" style="border-color:var(--amber);color:var(--amber)">◀── /sync-global</span></td>
        <td class="dest">CLAUDE.md lessons log</td>
        <td>reviewed learnings are promoted <b>back</b> into the global templates</td></tr>
  </table>
  <div class="why">
    <div><b>Why link the shared files?</b> A copy is a snapshot that silently runs an old version.
    Project folders once held April copies while the global folder had August versions — an improved
    <code>/review</code> never ran, with no error and no warning. A link cannot drift.</div>
    <div><b>Why copy the authored files?</b> Each project writes to them. If <code>qa-rules-condensed.md</code>
    were linked, <code>/learn</code> would write straight into the shared file, skipping the
    <code>/sync-global</code> review gate and leaking unvalidated project rules into every other project.</div>
  </div>
  <div class="foot"><b>Migrating an existing folder to a link:</b> diff it first, promote anything local-only
  <i>into</i> the global folder, keep the newer side, back the directory up — then link. Never clobber.</div>`;
  return page("File flow", 1600, body, extra);
};

/* ─────────── 3. AGENT ORCHESTRATION ─────────── */
const agents = () => {
  const phases = [
    ["🔍 Investigate", "/review", [["qa-reviewer", "one per document set — deep-reads PRD, stories, designs in parallel"], ["dom-auditor", "audits the rendered prototype and live screens for elements that do not exist"], ["playwright-test-planner", "explores the running app and maps flows the docs never mention"], ["security-scanner", "reads specs for access-control and injection gaps"], ["a11y-auditor", "checks specs against WCAG 2.1 AA"]]],
    ["✍️ Design tests", "/write-tests · /cross-validate", [["tc-writer", "one per epic, in parallel, for 5+ stories"], ["security-scanner", "security-specific cases"], ["a11y-auditor", "accessibility cases"], ["dom-auditor", "confirms every referenced element exists before the suite is finalized"]]],
    ["🤖 Automate", "/scaffold-automation · /run-automation", [["playwright-test-planner", "designs scenarios against the real app"], ["playwright-test-generator", "writes specs, verifying every selector in the live DOM"], ["playwright-test-healer", "repairs broken tests — never the application"], ["bug-hunter", "classifies failures: real bug vs locator drift vs timing vs environment"]]],
    ["🖱️ Execute · 🐞 Report", "/execute-tc · /report-bugs", [["api-tester", "verifies contracts, status codes, and error shapes"], ["bug-hunter", "groups related failures to a single root cause"]]],
  ];
  const extra = `
  .ph{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:18px 20px;margin-bottom:14px}
  .ph .h{display:flex;align-items:baseline;gap:13px;margin-bottom:13px}
  .ph .h b{font-size:19px;color:var(--cyan)}
  .ph .h span{font-family:Consolas,monospace;font-size:12.5px;color:var(--dim)}
  .ag{display:flex;gap:13px;padding:10px 0;border-top:1px dashed var(--border)}
  .ag .n{min-width:238px;font-family:Consolas,monospace;font-size:13.5px;color:var(--teal)}
  .ag .d{color:var(--muted);font-size:13.5px;line-height:1.5}`;
  const body = `
  <h1>Agent <span class="accent">orchestration</span> — who gets spawned, and when</h1>
  <div class="sub">Ten subagents. The orchestrator decides which to spawn from the scope and from which
  ground-truth sources you authorised — then merges and verifies what they return. Agents surface
  <i>candidates</i>; the main context decides what is real.</div>
  <div class="rule"></div>
  ${phases.map(([t, cmd, list]) => `
    <div class="ph"><div class="h"><b>${t}</b><span>${cmd}</span></div>
    ${list.map(([n, d]) => `<div class="ag"><div class="n">${n}</div><div class="d">${d}</div></div>`).join("")}
    </div>`).join("")}
  <div class="foot"><b>Scope rules.</b> 1–2 stories: no agents, work in the main context. 3–5: reviewers only.
  A full epic: fan out, then merge. <b>Whenever a prototype or a live app is available it is audited rendered</b> —
  never from stripped text, because tooltips, expand state, columns and chrome are invisible there.</div>`;
  return page("Agent orchestration", 1600, body, extra);
};

/* ─────────── 4. BUG WORKFLOW (short strip) ─────────── */
const bugFlow = () => {
  const steps = [
    ["Bug Summaries.txt", "one-liners per epic + evidence files", "var(--txt)"],
    ["/report-bugs", "polishes wording, auto-detects parent stories", "var(--cyan)"],
    ["adapters/&lt;tracker&gt;.js", "the only tracker-aware code", "var(--teal)"],
    ["your tracker", "issues created + evidence attached", "var(--amber)"],
  ];
  const extra = `
  body{padding:26px 34px}
  .flow{display:flex;align-items:stretch;gap:0}
  .st{flex:1;background:var(--card);border:1px solid var(--border);border-radius:11px;padding:14px 17px}
  .st .t{font-family:Consolas,monospace;font-size:15px;font-weight:700}
  .st .d{color:var(--muted);font-size:12.5px;margin-top:5px;line-height:1.45}
  .ar{display:flex;align-items:center;color:var(--cyan);font-size:23px;padding:0 13px;opacity:.8}`;
  const body = `
  <h1 style="font-size:23px;margin-bottom:4px">The <span class="accent">bug workflow</span> — type one line, get a filed issue</h1>
  <div class="sub" style="margin-bottom:15px;font-size:13.5px">Claude writes the report; a dependency-free script makes the API calls, so batch reporting costs almost no tokens.</div>
  <div class="flow">
    ${steps.map(([t, d, c], i) => `
      <div class="st"><div class="t" style="color:${c}">${t}</div><div class="d">${d}</div></div>
      ${i < steps.length - 1 ? '<div class="ar">▶</div>' : ""}`).join("")}
  </div>`;
  return page("Bug workflow", 1600, body, extra);
};

/* ─────────── 5. INFOGRAPHIC (rendered at 2x) ─────────── */
const info = () => {
  const pillars = [
    ["🔗", "One source of truth", "Skills and agents live once, in the global folder. Every project links to them, so nothing can silently run a stale version."],
    ["🧭", "Ground-truth review", "Documents alone hide prototype detail, adjacent features and implementation truth. The review asks what it may consult — live app, code, data — and records what it could not."],
    ["🧪", "Coverage by construction", "SFDP decomposition, an explicit coverage matrix, and a floor for negative, boundary and edge cases combined."],
    ["🔌", "Any stack, any vendor", "Tracker, test tool, docs platform and design tool are configured once per user. Nothing here is tied to a company or product."],
    ["🤖", "Agents where they pay", "Ten subagents fan out for breadth, then the main context verifies. Findings are candidates until confirmed."],
    ["♻️", "Learnings compound", "Every session can promote what it learned back to the global folder, so the next project starts ahead."],
  ];
  const extra = `
  body{width:1600px;height:1040px;padding:44px 50px;display:flex;flex-direction:column}
  h1{font-size:45px}
  .count{margin-top:16px;font-family:Consolas,monospace;font-size:17px;color:var(--cyan);
    border:1px solid var(--border);background:var(--card);border-radius:9px;padding:11px 18px;display:inline-block}
  .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:17px;margin-top:26px;align-content:start}
  .p{background:var(--card);border:1px solid var(--border);border-radius:13px;padding:20px 22px}
  .p .i{font-size:27px}
  .p .t{font-size:19px;font-weight:700;color:var(--cyan);margin:9px 0 8px}
  .p .d{color:var(--muted);font-size:14px;line-height:1.62}
  .strip{margin-top:auto;padding-top:22px;display:flex;gap:11px;flex-wrap:wrap}
  .strip span{background:var(--card2);border:1px solid var(--border);border-radius:8px;
    padding:8px 14px;font-size:13px;font-family:Consolas,monospace;color:var(--txt)}`;
  const body = `
  <div>
    <h1>QA-Orchestrator — <span class="accent">portable QA infrastructure</span> for Claude Code</h1>
    <div class="sub" style="font-size:17px">A shareable global folder that gives an agent a complete QA methodology:
    investigation, gap analysis, test design, automation, execution, bug reporting — and a memory that compounds.</div>
    <div class="count">37 SKILLS &nbsp;•&nbsp; 10 AI AGENTS &nbsp;•&nbsp; ANY TRACKER · ANY TEST TOOL · ANY STACK</div>
  </div>
  <div class="grid">
    ${pillars.map(([i, t, d]) => `<div class="p"><div class="i">${i}</div><div class="t">${t}</div><div class="d">${d}</div></div>`).join("")}
  </div>
  <div class="strip">
    <span>/init-workspace</span><span>/init-project</span><span>/save-url</span><span>/review</span>
    <span>/write-tests</span><span>/cross-validate</span><span>/scaffold-automation</span><span>/run-automation</span>
    <span>/execute-tc</span><span>/report-bugs</span><span>/learn</span><span>/sync-global</span>
  </div>`;
  return page("QA-Orchestrator", 1600, body, extra);
};

const SPECS = [
  { name: "diagram-1-journey", html: journey(), w: 1600, h: 1350, scale: 1 },
  { name: "diagram-2-file-flow", html: fileFlow(), w: 1600, h: 890, scale: 1 },
  { name: "diagram-3-agent-orchestration", html: agents(), w: 1600, h: 1265, scale: 1 },
  { name: "diagram-4-bug-workflow", html: bugFlow(), w: 1600, h: 230, scale: 1 },
  { name: "qa-orchestrator-infographic", html: info(), w: 1600, h: 860, scale: 2 },
];

const chrome = CHROME_CANDIDATES.find((p) => fs.existsSync(p));
if (!chrome) {
  console.error("No Chrome/Edge found. Add its path to CHROME_CANDIDATES.");
  process.exit(1);
}

for (const s of SPECS) {
  const htmlPath = path.join(OUT, `_src-${s.name}.html`);
  fs.writeFileSync(htmlPath, s.html);
  const png = path.join(OUT, `${s.name}.png`);
  execFileSync(chrome, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-sandbox",
    `--force-device-scale-factor=${s.scale}`,
    `--window-size=${s.w},${s.h}`,
    `--screenshot=${png}`,
    "file:///" + htmlPath.replace(/\\/g, "/"),
  ], { stdio: "pipe", timeout: 90000 });
  const b = fs.readFileSync(png);
  console.log(`  ${s.name}.png -> ${b.readUInt32BE(16)}x${b.readUInt32BE(20)} (${Math.round(b.length / 1024)} KB)`);
}
console.log("done — HTML sources kept as _src-*.html for future edits");
