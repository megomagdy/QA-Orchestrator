# Token-Efficient Test Case Execution with Claude Code & Codex

Oct 10, 2026 · Mohamed Magdy

## Final strategy — who does what

Claude Code and Codex each build their own Playwright specs from the same QMetry cases, in separate folders, and each runs its own suite; a script compares the two runs, so you review only the cases where they disagree. The agents do every cheap step themselves; you keep only the four steps that need a human: login, exporting the cases, confirming bugs, and triggering /report-bugs. The plan starts after test case writing: its input is your finished test case Excel in the QMetry template.

**Two modes, chosen per project. Single-agent mode is the default**: only claude/ or only codex/ exists and Step 5b is skipped. Dual mode (both agents run, comparison on) pays for the most expensive step, Step 4, twice, so use it as a pilot on one module or for P1 cases only, note the cost and the extra bugs it caught, and keep it only where that is worth it. Wherever this doc says Claude Code for a shared step (scripts, review page, bug logging, results, upload), read it as the lead agent: the one you are using, or Claude Code in dual mode. Bug verification never waits for the second agent or the comparison: the review page is built from whichever agent results exist, and shows the second agent's result when it arrives.

| # | What | Who | Tokens | How often |
| --- | --- | --- | --- | --- |
| 1 | Project + both agent folders, configs, rules files (Steps 1–2) | Claude Code | Low | Once per project |
| 2 | Connect Playwright MCP (Step 3) | Each agent runs its own command; you restart the session | Low | Once |
| 3 | Save login to auth.json | You (log in by hand) | None | When session expires |
| 4 | Export / save the QMetry-template Excel | You | None | Per feature |
| 5 | Convert Excel to case files (Step 4a) | Claude Code runs the script | Very low | Per feature |
| 6 | Write specs (Steps 4b–4c) | The agent in its folder (dual mode: both, independently) | High (paid twice in dual mode) | Once per feature + changed cases |
| 7 | Run suite + failure summary (Step 5) | Each agent in its own folder | Low | Every run |
| 8 | Compare the two runs (Step 5b, dual mode only) | Claude Code runs the compare script | Low | Every run |
| 9 | Triage failures, fix own scripts (Step 6b) | Each agent, its own failures only | Low, per failure | Runs with failures |
| 10 | Verify candidate bugs in bug-review.html (full details + evidence) | You | None | Runs with failures |
| 11 | Log bugs per the bug-report skill (Step 6c) | Claude Code, once for both agents | Low | After you confirm |
| 12 | File bugs to Jira / Azure DevOps | You run /report-bugs (script files them) | Low | After step 11 |
| 13 | Results Excel + QMetry upload (Steps 6a, 6d) | Claude Code runs the scripts | Very low | Every run (upload: Jira projects) |
| 14 | Manual cases: functional / visual (Step 7) | Claude Code / you | Medium / none | Manual cases only |
| 15 | Cross-validate the cases before Step 4 (Step 3b) | Lead agent, cross-validate skill | Medium | Once per feature |
| 16 | Sync lessons to the global QA folder | Lead agent, sync-global skill | Low | End of each feature |

Dual mode doubles only row 6. As a rough guide, at 10–20k tokens per case that is about 1–2M tokens per agent per 100 cases, once per feature; each later run costs each agent a few thousand tokens plus its triage. Note the usage each tool reports at the end of a feature to compare cost as well as results.

**Fixed cost per session: the instruction files.** Every new session, and every `/clear`, reloads them before any work starts. Claude Code reads every CLAUDE.md from its folder up to the drive root; a full playbook CLAUDE.md is about 100–120 KB (25–30k tokens), and D:\Idaratech\CLAUDE.md adds about 39 KB. So:

- Put qa-run **outside** any folder that has a large CLAUDE.md, for example `D:\QA-Runs\<feature>\qa-run`, never inside `D:\Idaratech\<feature>\`.
- Keep qa-run's own CLAUDE.md lean: the run rules plus the Lessons Learned Log only (Step 2). The full playbook stays in the feature folder where the cases were written; test design rules are not needed to execute.
- Check it once: `/context` in Claude Code shows how many tokens the memory files take.

## Step 1 — One-time project setup (Claude Code; login by you)

Create a project folder outside any folder with a large CLAUDE.md (for example under `D:\QA-Runs\<feature>\`; see "Fixed cost per session" above) and install Playwright, the Excel library and dotenv. Requires Node.js 18+ and Python 3 (this machine has Python 3.12, openpyxl and Pillow). Commands are bash: on Windows run them in Git Bash, or let Claude Code run them.

```bash
mkdir qa-run && cd qa-run
npm init -y
npm i -D @playwright/test dotenv @playwright/mcp@0.0.83
npx playwright install chromium
pip install openpyxl pillow
mkdir -p claude/tests codex/tests scripts support auth testcases results "Manual Execution"
```

To use the Google Chrome already installed instead of a downloaded Chromium, add `channel: 'chrome'` to the project in playwright.config.ts and `--browser=chrome` to the MCP args, and replace `npx playwright install chromium` with `npx playwright install ffmpeg`: video recording needs Playwright's ffmpeg, which otherwise comes with Chromium.

Reference implementation of every script in this plan, already working on a real project: `D:\Takeoff\B2B Markups\qa-run` (scripts/, support/, access.json). Copy those files into a new qa-run instead of asking an agent to write them again.

Folder layout the agents will rely on:

```text
qa-run/
  testcases/<feature>_qmetry.xlsx  # QMetry-template Excel, never edited
  testcases/cases.json             # generated (Step 4a), read by scripts
  testcases/cases/<module>.md      # generated, compact, read by agents
  scripts/                         # shared helper scripts (Steps 3c–6): save-login.js, check-access.js, failures.js ...
  support/access.ts                # useRole / openAs helpers for the specs (Step 3c)
  support/keep-evidence.ts         # globalTeardown: keeps failure evidence across runs (Step 5)
  access.json                      # every portal + role the cases need, and its login file (Step 3c)
  results/comparison.md            # Claude vs Codex (Step 5b)
  results/access-status.json       # written by check-access.js, read by support/access.ts
  Manual Execution/                # Bug Summaries.txt + Epic N/Bug M.png (bug-report skill)
  QA_RUN_RULES.md                  # master run rules (Step 2)
  CLAUDE.md                        # lean: run rules + Lessons Learned Log (Step 2); Claude Code reads it from claude/
  AGENTS.md                        # only if qa-run is a git repo: one-line stub (Step 2)
  qa-rules-condensed.md            # read by your skills from the project root (only when a skill needs it)
  auth.json                        # saved login of the default role, all portals (git-ignored)
  auth/<portal>-<role>.json        # one saved login per extra role (git-ignored)
  .env                             # portal URLs, test-account credentials, QMetry API key (git-ignored)
  claude/                          # Claude Code works only here
    playwright.config.ts  tests/  results/ (artifacts/ emptied each run, evidence/ kept)  manual_cases.json
  codex/                           # Codex works only here
    AGENTS.md  playwright.config.ts  tests/  results/  manual_cases.json
```

Export the feature's test cases from QMetry to Excel and save the file unedited in `testcases/`. A QMetry export has one row per step: case fields (key, summary, precondition, priority) on the case's first row, step rows (step summary, test data, expected result) below it. The converter in Step 4a handles that layout; results never go into this file.

Create `.env`:

```bash
BASE_URL=https://your-staging-url
```

Create `claude/playwright.config.ts` and an identical `codex/playwright.config.ts`. Agents always run Playwright from inside their own folder, so every path below is relative to it. The `use` block produces UI evidence on every failure and keeps nothing for passing tests; the `dot` reporter keeps console output tiny so a run costs the agent almost nothing to read.

```ts
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

export default defineConfig({
  testDir: './tests',
  retries: 1,                       // a pass on retry = flaky, not a bug
  workers: 2,
  reporter: [
    ['dot'],                        // minimal console output
    ['html', { outputFolder: 'results/html', open: 'never' }],
    ['json', { outputFile: 'results/results.json' }],
    ['junit', { outputFile: 'results/junit.xml' }],  // for the QMetry import
  ],
  outputDir: 'results/artifacts',
  globalTeardown: '../support/keep-evidence.ts', // copies failure evidence to results/evidence (kept across runs)
  use: {
    baseURL: process.env.BASE_URL,
    storageState: '../auth.json',
    screenshot: 'only-on-failure',  // UI evidence: final screen at failure
    video: 'retain-on-failure',     // UI evidence: the whole flow
    trace: 'retain-on-failure',     // DOM, network, console per step
    actionTimeout: 10_000,
  },
  // 1920x1080: dialogs show more of their content, so failure screenshots rarely cut off messages
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } } }],
});
```

Run the two suites one after the other, not at the same time, when tests change shared settings or data on the same environment; otherwise one agent's run can break the other's and show up as a false disagreement.

Every test runs in a fresh browser context, so there is no stale cache between cases; no manual hard reload is needed.

Save the login once with `scripts/save-login.js` (reference implementation). It opens the portal in a plain Chrome window, you log in by hand and press Enter in the terminal, and it merges that portal's session into the file. Do not use `npx playwright codegen --save-storage` for this: its recorder toolbar can capture the clicks, so you cannot type in the fields.

```bash
node scripts/save-login.js BASE_URL                                # main portal + default role -> auth.json
node scripts/save-login.js B2B_URL                                 # another portal, same file (different origin)
node scripts/save-login.js BASE_URL auth/admin-manager.json        # another role on the same portal -> its own file
```

Roles and portals are set up in "Step 3c — Access & roles" below; re-run the command, or let check-access.js log in by itself, whenever a session expires.

Add a `.gitignore`:

```text
node_modules/
results/
claude/results/
codex/results/
auth*.json
auth/
.env
```

## Step 2 — Shared rules file (Claude Code creates it from this doc)

Put the standing rules in one file so every prompt stays short. Save this as `QA_RUN_RULES.md` in the project root:

```markdown
# QA Run Rules (read before any task)

## Scope
1. Work only inside your own agent folder (claude/ or codex/). Read shared inputs only from
   ../testcases, ../scripts, ../support, ../access.json, ../auth*.json, ../auth/ and ../.env.
   Never read or copy the other agent's folder.
2. Write to shared folders (../testcases, ../scripts, ../results, ../Manual Execution) only when a prompt says so.

## Logins and roles
1. ../access.json lists every portal + role and its saved login file (the default role, used when a test
   does not call useRole, is ../auth.json). Before writing or running specs:
   node ../scripts/check-access.js   (refreshes what it can, prints what is missing; no tokens)
2. In specs: import { useRole, openAs } from '../../support/access';
   useRole('<id>') inside a test.describe tagged @role-<id>; openAs(browser, '<id>') for a second role
   in the same test. Open each portal by its absolute URL from ../.env. Never hard-code a login file path.
3. A missing login never stops the work: useRole / openAs skip the test as "Blocked: needs login ...".
   List the blocked keys in your reply. Never type, read or print passwords or tokens.
4. With the MCP, switch role with browser_set_storage_state, filename = ../ + the role's file.
5. A case check-access lists as UNMAPPED: ask the user for its role; until then Manual "unknown access".

## Token rules
1. Never open, view or describe screenshots, videos or traces. Reference file paths only.
2. Never read results/results.json, results/run.log or the HTML report. Read results/failures.md only.
3. Never read the .xlsx. Read only your module's case file: ../testcases/cases/<module>.md
4. Browser access only through the MCP server named "playwright". Never Claude in Chrome, the Codex
   Browser / Chrome plugin, computer use or screen control.
   Locate elements with browser_find; when a snapshot is unavoidable, limit it with depth or save it with
   filename and search the file. Never take a full snapshot just to look around. No screenshots.
   (The "playwright-test" server, used by the playwright-test-* agents, has no browser_find; do not use it here.)
5. Routine run, always exactly (skips tests that create data the app cannot delete):
   npx playwright test --grep-invert @creates-data > results/run.log 2>&1; node ../scripts/failures.js
   Full run, only when the prompt says "full run" (new build): the same command without --grep-invert @creates-data.
   Tag every test that creates data the app cannot delete (tiers, rules, history rows) with @creates-data.
   Verify a single fix with: npx playwright test <spec file> -g "<key>" --reporter=line
6. Write each spec file in one edit. Do not explain code in chat. End every task with a summary of 10 lines or fewer.

## Quality rules
1. One QMetry case = one test titled "<QMetry key> | <Summary>", tagged @ui or @api and @p1/@p2/@p3.
2. Each QMetry step = one test.step('<Step Summary>') so the report shows the exact failing step.
3. Each Expected Result = explicit expect() assertions. No test without assertions.
4. Locators: getByRole > getByLabel > getByPlaceholder > getByTestId > getByText. CSS/XPath only with a comment saying why.
5. No waitForTimeout. Use web-first assertions (toBeVisible, toHaveText, toHaveURL).
6. Never weaken, remove or loosen an assertion to make a test pass. Behaviour that differs from the Expected Result is a bug, not a script fix.
7. Test data unique per run: your agent prefix (CC- for Claude Code, CX- for Codex) + a timestamp. Delete records the test created when the app allows it.
8. A case that cannot be automated reliably (visual layout, document content judgement, email/SMS, captcha) goes in manual_cases.json in your folder with the reason. Never skip silently.
9. API cases use the request fixture. On every call write the request and the response to files under
   testInfo.outputPath() and attach them with testInfo.attach(name, { path }), so they are kept as evidence.
   The bearer token comes from the role's saved login file; never print or log it.
10. Downloads: page.waitForEvent('download'), saveAs results/downloads/<KEY>-<file name>, then assert on the
    file content in the test. Judging how a file looks in Excel or a PDF viewer is Manual.
11. Before asserting on a message (validation, error, toast) or any element inside a scrollable container
    (dialog body, drawer, table), scroll it into view first (await locator.scrollIntoViewIfNeeded()), so the
    failure screenshot shows it. For dialogs, also attach a screenshot of the dialog when an assertion fails.

## Failure classification
Actual Bug | Locator Broken | Timing Issue | Test Data Issue | Script Assertion Error | Test Logic Error | Environment Issue | Flaky (passed on retry)
Blocked (a skipped test whose reason starts with "Blocked:") is not a failure: it is never triaged or logged as a bug.
Only Locator Broken, Timing Issue, Test Data Issue and Script Assertion Error may be fixed in the script.
Script Assertion Error: the app matches the case's Expected Result, but the expect() line does not express it
correctly (typo, whitespace or letter-case formatting, wrong regex, text read from the wrong element). Fix it so the
assertion checks the Expected Result exactly as written - never so it matches what the app shows when that differs
from the Expected Result (that is an Actual Bug). List every such fix with the expect() line before and after. An Environment Issue is never a bug. A Test Logic Error (the case's expected result is wrong) is not a bug
and not a script fix: report it to the user to correct the QMetry case.

## Skills and shared files
- Project root for skills = the qa-run folder (..); qa-rules-condensed.md lives there.
- Triage with the bug-hunter method, inline, no sub-agent (Claude Code: /bug-hunter; Codex: the
  instructions in ~/.codex/agents/bug-hunter.toml). It is an agent in the global QA folder, not a skill.
- Use checkpoint / session-resume only to continue interrupted work (label = your agent name), not between modules.
- When the user corrects you or a lesson is learned, append a dated line to the Lessons Learned Log (11.3) in ../CLAUDE.md.

## Global QA Folder
D:\QA-Global-Portable

## Bug reporting (bug-report skill)
Bugs are logged only in Step 6c, by the lead agent, after the user confirms them:
- One line per bug in "../Manual Execution/Bug Summaries.txt" under the right Epic section:
  "Bug <next number>: [Action] [Component] - [Symptom]" (+ " (back end)" for back-end bugs).
  Numbering is sequential per section; never reuse a number marked [REPORTED: ...].
- Evidence: "../Manual Execution/Epic <n>/Bug <m>.png" and "Bug <m> (2).webm"
  (flat in Manual Execution/ for single-section projects).
- One bug per root cause; list every affected QMetry key. API bugs include the full request and response.
- Full report per bug: "../Manual Execution/Bug Details/Epic <n> - Bug <m>.md" (the name must not start
  with "Bug", so /report-bugs does not attach it as evidence).
```

Where the rules live:

- **Root CLAUDE.md (lean):** QA_RUN_RULES.md plus an empty "## 11.3 Lessons Learned Log" section. Do not put the full /init-project playbook here: it would be reloaded every session and after every /clear. The two things the skills need from this file are here: sync-global reads the "Global QA Folder" section and section 11.3, and /learn appends to 11.3. Claude Code started in claude/ reads the root CLAUDE.md, so claude/ needs no copy.
- **codex/AGENTS.md:** a copy of QA_RUN_RULES.md. Tested with Codex 0.162: when Codex starts in codex/ it reads only codex/AGENTS.md if qa-run is not a git repo. If qa-run is a git repo, Codex reads from the repo root down and, when the root has no AGENTS.md, loads the root CLAUDE.md as well; the one-line root AGENTS.md stub prevents that.
- **qa-rules-condensed.md:** copy the feature folder's file into the qa-run root (it holds that project's learnings; skills read it from the project root, never link it).

```bash
cp QA_RUN_RULES.md CLAUDE.md
printf '\n## 11.3 Lessons Learned Log\n\n| Date | Lesson | Where applied |\n| --- | --- | --- |\n' >> CLAUDE.md
cp QA_RUN_RULES.md codex/AGENTS.md
# only if qa-run is a git repo:
echo "# qa-run: Codex rules are in codex/AGENTS.md" > AGENTS.md
```

Edit only QA_RUN_RULES.md, then redo the first and third command; never overwrite CLAUDE.md once section 11.3 has entries (paste the changed rules section by hand instead). The "Read QA_RUN_RULES.md first" line in the prompts can be dropped. To confirm what Codex loads, run `codex debug prompt-input` from codex/ and search the output for your rules.

**Skills and agents in Codex (already done on this machine).** `D:\QA-Codex-Bridge\Install-QACodex.ps1` links all the global QA skills into `~/.codex/skills` (one junction per skill), converts the global agents (bug-hunter, qa-reviewer, tc-writer, ...) into Codex custom agents in `~/.codex/agents`, and adds the Claude-to-Codex translation rules to `~/.codex/AGENTS.md`. It never writes to the global QA folder. Re-run it after adding a skill or changing an agent:

```powershell
powershell -ExecutionPolicy Bypass -File "D:\QA-Codex-Bridge\Install-QACodex.ps1"
```

In the prompts below, Claude Code calls a skill as `/name` and Codex as `$name` (in Codex, `/review` is the built-in code review, not the QA skill). bug-hunter is an agent, not a skill; Prompt 6b runs its method inline.

To let Claude Code do Steps 1–2 for you, export this doc as Markdown into the folder as SETUP_GUIDE.md and send:

```text
Read SETUP_GUIDE.md, sections "Step 1" and "Step 2" only, and do them in this folder exactly as written.
Use BASE_URL=<your-url> in .env. Do not run the codegen login command; I will.
Do not change any content from the guide. Reply only with: files created, and any failed command with its error line.
```

## Step 3 — Connect the Playwright MCP (each agent runs its own; you restart the session)

The MCP is only used in Step 4 (exploring pages to write specs) and Step 7 (manual cases). These flags remove the biggest token costs: no images back to the model, no full page snapshot after every action, login loaded from file, and ready-made assertion tools.

Pin the version. The flags and tools below (browser_find, snapshot depth, --caps=testing,storage, browser_set_storage_state, --snapshot-mode) were checked in the README of `@playwright/mcp@0.0.83`; `@latest` downloads whatever is newest at every start and can change them. The Playwright bundled in your projects (1.58.2) is older and does not have browser_find, so always use this separate package for the "playwright" server.

| Flag | Effect |
| --- | --- |
| --image-responses=omit | No image is ever sent to the model |
| --snapshot-mode=none | Actions no longer return the full page snapshot; the agent asks with browser_find instead. Biggest saving in Step 4; remove it if the agent starts guessing locators |
| --isolated + --storage-state | Clean session each time, already logged in |
| --caps=testing,storage | testing: verify-element / verify-text / generate-locator tools; storage: browser_set_storage_state, to switch role while exploring (Step 3c) |
| --console-level=error | Only console errors are returned |
| --headless | No browser window (remove it if you want to watch) |

Each action also returns its Playwright code (`--codegen` defaults to typescript), which the agent reuses in the spec.

**Codex** — add to `~/.codex/config.toml`. Codex starts MCP servers in the folder it was opened in, so start Codex in qa-run/codex and the relative auth path works; on Windows, launch npx through cmd:

```toml
[mcp_servers.playwright]
command = "cmd"
args = ["/d", "/c", "npx", "-y", "@playwright/mcp@0.0.83", "--headless", "--isolated",
        "--storage-state=../auth.json", "--image-responses=omit", "--snapshot-mode=none",
        "--caps=testing,storage", "--console-level=error"]
startup_timeout_sec = 60
```

Codex ignores a project's own .codex/config.toml (tested), so this entry is global; in other projects the server is listed but unused.

**Claude Code** — it runs this inside qa-run/claude, which writes claude/.mcp.json; then restart Claude Code:

```bash
claude mcp add --scope project playwright -- npx -y @playwright/mcp@0.0.83 --headless --isolated --storage-state=../auth.json --image-responses=omit --snapshot-mode=none --caps=testing,storage --console-level=error
```

Check it: start `claude` in the folder and type `/mcp`; playwright should show as connected. In Codex, send `List the tools of the MCP server named playwright, names only.` Both lists must include browser_find; the tool names in the prompts below must match them.

For Codex, Playwright also ships a CLI + skills package ([microsoft/playwright-cli](https://github.com/microsoft/playwright-cli)) that its README describes as more token-efficient than the MCP for coding agents; worth trying once the MCP flow is working. Source for flags: [Playwright MCP README](https://github.com/mcp/microsoft/playwright-mcp).

## Step 3b — Cross-validate the test cases (lead agent, once per feature, medium tokens)

Catch contradictions, duplicates and coverage gaps in the Excel before any script is written; a wrong case found here costs one edit, found after Step 4 it costs a script in each agent plus a false failure. Only the lead agent runs it, even in dual mode.

```text
Use the cross-validate skill (Claude Code: /cross-validate, Codex: $cross-validate) on
testcases/<feature>_qmetry.xlsx, with these sources if they exist: <PRD / QC decisions / design files>.
Run the document checks only: contradictions, duplicates, coverage gaps, spec-silent gaps,
missing boundary and authorization cases.
Skip the live-DOM part (dom-auditor / test-planner agents): Step 4b explores the screens anyway.
Write the report to results/cross-validate.md. Reply with the verdict and the counts only.
```

Fix the Excel until the verdict is CLEAN or you accept what remains, re-run Prompt 4a's script, then start Step 4. Skipping the live-DOM part is what keeps this step at medium cost; the skill would otherwise start extra browser agents.

## Step 3c — Access & roles (once per project, before Step 4; no tokens)

Goal: know every login the cases need before any agent starts, so no run stops halfway for a portal or role you did not prepare. Reference implementation: `D:\Takeoff\B2B Markups\qa-run` (access.json, scripts/check-access.js, scripts/save-login.js, support/access.ts).

1. **Each case says what it needs.** The write-tests / tc-writer skills put one line first in every precondition:
   `Access: <portal> as <role>` (several separated by `;`, or `Access: none`). For older cases without that line, `access.json` holds aliases: phrases such as "signed in as super admin" or "role: accountant" that identify a role in free-text preconditions.
2. **access.json** has one entry per portal + role (one account = one entry): portal and role names (must match the Access line), the .env variable of the portal URL, the saved login file, the aliases, and optionally the .env variable names of a test account's credentials. For a site whose login is a popup on the home page instead of a login page (typical B2C sites), add `"login": { "open": "Login" }` with the text of the control that opens it; the script then clicks it to log in, and treats that control still being visible as "logged out". `manual` lists case keys that are never automated, with the reason (for example a production-database check).
3. **Run the pre-flight check** after Step 4a and before every run:
   ```bash
   node scripts/check-access.js
   ```
   It works out which roles the cases need, opens each portal headless with its saved login, and prints one line per role: ready / refreshed / expired / missing, how many cases need it, and the exact command to fix it. Cases it cannot map are listed as UNMAPPED: add an alias or an Access line. It writes `results/access-status.json`.
4. **Save the missing logins** by hand (`node scripts/save-login.js <URL variable> <file>`), or let the script do it: when a role's test-account credentials are set in .env, check-access.js logs in by itself whenever the login is missing or expired. Use that only for test accounts without MFA or captcha; keep the credentials in .env only, never in prompts or chat.
5. **Roles in specs** (support/access.ts):
   - `useRole('<id>')` inside a `test.describe` tagged `@role-<id>`: every test in the block runs as that role.
   - `openAs(browser, '<id>')`: a second role in the same test (admin changes something, the agent sees it).
   - A role-matrix (RBAC) case runs the same test once per role with the expected allow / deny per role, for example from the enforcement-tc-gen matrix.
   - A missing or expired login makes the test skip as "Blocked: needs login <portal> as <role>" instead of failing: the run continues, failures.md lists blocked keys separately, and the results Excel marks them Blocked. After you save the login, re-run only those: `npx playwright test --grep @role-<id>`.
6. **While exploring with the MCP** (Step 4b), the agent switches role with `browser_set_storage_state` (needs `--caps=storage`), so one MCP server covers every role.

## Step 3d — Database, bookings and accessibility tools (once per project; decide before Step 4)

Most cases an agent leaves Manual fall into three groups. Settle them before Step 4, or the agents will (rightly) refuse:

- **Database checks.** Give the agents guarded DB access instead of marking "needs DB" Manual. Reference implementation: `scripts/db.py` + `support/db.ts`. The connection comes from the team's existing DB tool, so no credentials are copied; reads are SELECT-only; writes need an explicit flag, UPDATE must have a WHERE and its rows are backed up first to `results/db-backups/`; DELETE / DROP / ALTER / EXEC are always refused. Never point it at production.
- **Bookings and other irreversible actions.** Agents refuse them by default. Write the project's policy into the rules: for example "DEV flights are not real, booking is allowed; tag those tests @books and @creates-data". Without such a line they stay Manual.
- **Accessibility.** Install `@axe-core/playwright` so accessibility cases can run axe (WCAG 2.1 AA tags) on each screen; only screen-reader listening stays Manual.
- **Second accounts.** Cases that compare two agencies, two users or two roles need a second login: add it to access.json (Step 3c) before Step 4.

## Step 4 — Convert the Excel cases to specs (agent, token-heavy, once)

This is the only expensive step (in dual mode it runs twice: Claude Code in claude/ and Codex in codex/, same prompts, independently). Prompt 4a runs once, by Claude Code from the qa-run root. For 4b, go module by module, 10–15 cases per prompt; type `/clear` before each new module in Claude Code and start a new session in Codex. Each 4b prompt is self-contained, so no checkpoint / session-resume between modules: they only add tokens. Use them only when a module is interrupted halfway.

Models: Step 4 on the strongest setting you are willing to pay for (Claude Code: Opus; Codex: gpt-6.1-sol on high, or gpt-6-astra on high for complex modules). Steps 5–7: Claude Code on Sonnet (`/model`), Codex on gpt-6.1-sol medium. Avoid xhigh / max / ultra for these long, many-step runs.

**Prompt 4a — QMetry Excel to case files (Claude Code, qa-run root, once):**

```text
Read only the header row and first 15 rows of testcases/<feature>_qmetry.xlsx to learn its layout.
It uses the QMetry template: case fields (Key, Summary, Precondition, Priority, Labels, Components/Folder)
on the first row of each case, one row per step below it (Step Summary, Test Data, Expected Result).
Write scripts/qmetry_to_json.py, reusable for every project that uses this template (Jira or Azure DevOps):
- usage: python qmetry_to_json.py <input.xlsx> [output_dir]  (output_dir defaults to testcases/)
- find columns by header name (case-insensitive, trimmed), never by position; fail with a clear
  message listing the headers it could not find
- group step rows under their case; skip empty rows
- write <output_dir>/cases.json for the scripts:
  {key, summary, type (UI/API from Labels or Components, default UI), precondition, priority, module,
   steps: [{action, data, expected}], automation: "Auto"}
- write one compact file per module for the agent, <output_dir>/cases/<module-slug>.md:
  ## <key> | <summary> [<type>, <priority>]
  Pre: <precondition>
  1. <action> | data: <data> | expect: <expected>
- module = Components/Folder column, else the key prefix
Run it. Reply only with: total cases, total steps, count per module and type, and any rows it could not place.
```

Prompt 4a is paid once in total, not per project. Copy the finished script to your global QA folder and run it in any project that uses the template (no tokens):

```bash
python <global-qa-folder>/scripts/qmetry_to_json.py testcases/<feature>_qmetry.xlsx
```

Re-run it whenever the cases change, then Prompt 4b for the changed cases only. The per-module .md files cost the agent roughly half the tokens of the same cases in JSON, and 4b reads only one module.

**Prompt 4b — generate one module's specs (repeat per module, new session each time):**

```text
Read QA_RUN_RULES.md first.
Module: <Module name>. Cases: ../testcases/cases/<module-slug>.md (read only this file).
0. Run node ../scripts/check-access.js. For a role it reports as missing, still write its tests with
   useRole / openAs (they will show as Blocked); do not explore its screens.
1. Use the MCP server named playwright to open each screen these cases touch once, starting at
   <BASE_URL>/<path>, to learn the locators; switch role with browser_set_storage_state when a case
   needs another one. Use browser_find, not full snapshots. No screenshots.
2. Write tests/<module-slug>.spec.ts: one test per case following the quality rules,
   reusing the Playwright code the MCP returns for each action.
3. Add any case that cannot be automated reliably to manual_cases.json, with the reason.
4. Run this file once: npx playwright test tests/<module-slug>.spec.ts --reporter=line
5. Fix only Locator Broken / Timing Issue / Script Assertion Error failures, max 2 attempts per test
   (Script Assertion Error: show the expect() line before and after).
   Leave assertion failures unchanged.
6. Reply only with: cases automated, cases marked Manual (with reason), cases Blocked (role),
   tests failing on assertions (TC ID + one line each).
```

Assertion failures reported in point 7 are your first candidate bugs; they go through Step 6 like any other failure.

**Prompt 4c — coverage check (cheap, after all modules):**

```text
Read QA_RUN_RULES.md first.
Compare the keys in ../testcases/cases.json with the test titles in tests/.
Reply only with keys that are neither in a spec nor in manual_cases.json.
```

The expected result is an empty list. Any ID returned gets its own short 4b prompt.

## Step 5 — Run the suite (each agent in its folder, low tokens)

Each agent runs its own suite with one command and reads back a one-line count; failure details go to a short text file, roughly 150–300 tokens per failure instead of the full report.

Claude Code saves this once as `scripts/failures.js` (shared; it reads the `results/` folder of the agent folder it is run from):

```js
// Compact failure list for the agent: text only, evidence as paths.
const fs = require('fs');
const r = JSON.parse(fs.readFileSync('results/results.json', 'utf8'));
const strip = s => (s || '').replace(/\u001b\[[0-9;]*m/g, '');
const failedStep = steps => {
  for (const s of steps || []) if (s.error) return failedStep(s.steps) || s.title;
  return null;
};
const rows = [];
const blocked = [];
const walk = suite => {
  (suite.suites || []).forEach(walk);
  for (const spec of suite.specs || []) {
    for (const t of spec.tests) {
      if (t.status === 'skipped') {
        const notes = [...(t.annotations || []), ...t.results.flatMap(x => x.annotations || [])];
        const why = notes.find(a => (a.description || '').startsWith('Blocked:'));
        if (why) blocked.push(`- ${spec.title.split(' |')[0]}: ${why.description}`);
        continue;
      }
      if (t.status !== 'unexpected' && t.status !== 'flaky') continue;
      const fail = t.results.filter(x => x.status !== 'passed').pop();
      const err = strip(fail.error?.message).split('\n').filter(Boolean).slice(0, 4).join(' / ');
      const files = (fail.attachments || []).filter(a => a.path)
        .map(a => `${a.name}: ${a.path}`).join(' | ');
      rows.push([
        `### ${spec.title}`,
        `- result: ${t.status === 'flaky' ? 'FLAKY (passed on retry)' : 'FAILED'}`,
        `- file: ${spec.file}:${spec.line}`,
        `- failed step: ${failedStep(fail.steps) || 'n/a'}`,
        `- error: ${err}`,
        `- evidence: ${files || 'none'}`,
      ].join('\n'));
    }
  }
};
r.suites.forEach(walk);
const out = [rows.join('\n\n') || 'No failures'];
if (blocked.length) out.push(`## Blocked (missing login - not bugs)\n${blocked.join('\n')}`);
fs.writeFileSync('results/failures.md', out.join('\n\n'));
console.log(`${rows.length} failing/flaky, ${blocked.length} blocked -> results/failures.md`);
```

**Prompt 5 — run (send to each agent, in its folder, every run):**

```text
Run node ../scripts/check-access.js, then the routine run exactly as the rules say (say "full run" instead after a new build).
Reply only with the access lines that are not ready and the count line printed by failures.js.
```

Useful variants:

```bash
npx playwright test --grep @p1            # priority 1 only (smoke)
npx playwright test tests/leave.spec.ts   # one module
npx playwright test -g "TC-012"           # one case
npx playwright test --last-failed         # re-run only last run's failures
```

To look at the evidence yourself (no tokens):

```bash
npx playwright show-report results/html
npx playwright show-trace results/evidence/<test-folder>/trace.zip
```

**Evidence is kept across runs.** Playwright empties `results/artifacts` at the start of every run, including the short re-runs an agent makes to verify a fix, so a bug candidate's screenshot and video used to be gone by the time it was confirmed and logged. `support/keep-evidence.ts` (reference implementation), set as `globalTeardown` in playwright.config.ts, runs at the end of every run whatever the reporter and copies each failed attempt's folder to `results/evidence/<test-folder>/` (failure screenshot `test-failed-1.png`, `video.webm`, `trace.zip`, error context and file attachments such as API request/response). Playwright never empties that folder; a later failure of the same test replaces its folder, and a later pass leaves it alone. failures.md lists the evidence paths there.

## Step 5b — Compare Claude Code vs Codex (dual mode only, low tokens)

A script lines up both runs per QMetry key. Agreed passes are accepted; an agreed failure from two independently written scripts is a strong bug candidate; every disagreement means at least one script, or the environment, is wrong.

| Claude Code | Codex | Meaning | Next |
| --- | --- | --- | --- |
| Pass | Pass | Agreed pass | Accept |
| Fail | Fail | Same failure in two independent scripts | Strong bug candidate: 6b in both, then you confirm |
| Pass | Fail (or the reverse) | One script wrong, flaky, or a data clash | The failing agent runs 6b; still different → you open that case's evidence |
| Automated | Manual | One agent managed to automate it | Ask the other agent to retry it, or keep it Manual |
| Missing | any | Coverage gap | Prompt 4c for that agent |

**Prompt 5b-1 — compare script (Claude Code, qa-run root, once per project):**

```text
Write scripts/compare.py that reads claude/results/results.json and codex/results/results.json
(Playwright JSON reports; test titles start with the QMetry key), claude/manual_cases.json,
codex/manual_cases.json and testcases/cases.json, and writes:
- results/comparison.xlsx: one row per QMetry key with Summary, Claude status, Codex status
  (Pass | Fail | Flaky | Manual | Missing), Agree (yes/no), and each side's failed step + first error line
- results/comparison.md: counts (agreed pass, agreed fail, disagreements, manual, missing)
  and one line per disagreement
Run it. Reply with the counts only.
```

**Prompt 5b-2 — every run, after both agents finish Step 5:**

```text
Run python scripts/compare.py from the qa-run root. Reply with the content of results/comparison.md only.
```

## Step 6 — Triage failures and write results with evidence (agent, low tokens)

The agent reads only failures.md, fixes script problems, and never edits an assertion. Real bugs reach the Excel file with their UI evidence embedded, and are logged only after you confirm them.

**Prompt 6a — results writer (Claude Code, qa-run root, once per project):**

```text
Write scripts/write_results.py (openpyxl + Pillow), run from an agent folder as:
  python ../scripts/write_results.py --agent claude|codex
It creates ../results/<feature>_results_<agent>_<YYYY-MM-DD>.xlsx: a copy of ../testcases/<feature>_qmetry.xlsx
with columns Execution Status, Actual Result, Evidence, Screenshot, Video, Trace added and filled on each
case's first row. Never edit the original. Inputs (relative to the agent folder):
- results/results.json (Playwright JSON report; test titles start with the QMetry key)
- results/triage.json ({"KEY": {"class": "...", "actual": "one line"}})
- manual_cases.json and results/manual_results.json if they exist
Execution Status = Pass | Fail | Flaky | Blocked (Environment Issue, or a skipped test whose reason starts
with "Blocked:" - put that reason in Actual Result) | Manual.
Failed UI cases: embed the failure screenshot as a 300px-wide thumbnail in Evidence, and hyperlink the full
screenshot, video.webm and trace.zip in their columns, all taken from results/evidence/<test-folder>/.
Failed API cases: hyperlink the request/response files kept in results/evidence/<test-folder>/.
Test it in claude/ and reply only with the count per status. Do not open any image.
```

**Prompt 6b — triage with the bug-hunter method (each agent, in its folder, after a run with failures):**

bug-hunter is an agent, not a skill. Run its method inline, not as a sub-agent: a sub-agent re-reads everything in its own context, and in Codex the bug-hunter agent is read-only, so it could not write triage.json anyway.

```text
Triage results/failures.md with the bug-hunter method, yourself, no sub-agent
(Claude Code: the /bug-hunter skill; Codex: follow the instructions in ~/.codex/agents/bug-hunter.toml),
with the failing cases from ../testcases/cases/<module-slug>.md and the existing log ../Manual Execution/Bug Summaries.txt.
Text only: do not open screenshots, videos or traces; cite their paths as evidence.
Then:
1. Locator Broken / Timing Issue / Test Data Issue / Script Assertion Error: open only that screen with the MCP server named playwright
   (browser_find, no screenshots), fix the spec, verify with:
   npx playwright test <file> -g "<key>" --reporter=line   (max 2 attempts, then reclassify)
2. Change an assertion only for a Script Assertion Error, and show the expect() line before and after.
   Test Logic Error (the case's expected result is wrong): list it for me.
3. Write results/triage.json for every failure ({"KEY": {"class": "...", "actual": "one line"}}) and
   results/defects.md with bug-hunter's grouped defects: title, severity, affected keys, steps,
   expected vs actual, evidence paths, one-line log entry.
4. Do not write to Bug Summaries.txt. Reply with: key | class | fixed (yes/no), then the defect titles.
```

When an agent finishes 6b, it re-runs Prompt 5 in its folder and the review page is built right away; you do not wait for the other agent or the comparison. In dual mode, running 6b-2 again after the second agent finishes adds its result to each card.

**Prompt 6b-2 — bug review page (lead agent, qa-run root; script written once, then only run):**

```text
Write scripts/bug_review.py and run it. It builds results/bug-review.html from whichever agent folders
(claude/, codex/) have results/triage.json; a missing folder or a missing comparison is normal, never an error.
One card per candidate bug: every key classed Actual Bug by at least one agent, grouped by the defects in
results/defects.md when present (one card per defect, with its title and severity). Each card shows:
- key, summary, priority, and each agent's status and classification ("not run" for an absent agent)
- preconditions, test data and the QMetry steps, with the failed step highlighted
- expected result vs actual result (triage line + first error lines)
- the failure screenshot inline (embedded as a data URI), the video playable inline (relative link),
  and the trace path with the command to open it: npx playwright show-trace <path>
- console errors and failed network requests from the trace, when available
- for API cases: the attached request and response
Do not open or describe any image. Reply with the number of candidates only.
```

Open the page in your browser, check each card, and reply to Claude Code with the keys you confirm.

**Prompt 6c — log confirmed bugs (lead agent, qa-run root, bug-report skill):**

```text
Confirmed bugs: <QMetry keys>. Log them following the bug-report skill:
1. Start from bug-hunter's grouped defects in results/defects.md (same root cause = one bug). Never log an Environment Issue.
2. For each bug append "Bug <next number>: [Action] [Component] - [Symptom]" (+ " (back end)" for back-end bugs)
   to "Manual Execution/Bug Summaries.txt" under Epic section <n>; keep numbering sequential.
3. Evidence from results/evidence/<test-folder>/ of the agent that failed (claude/ first): failure screenshot -> "Manual Execution/Epic <n>/Bug <m>.png",
   video -> "Manual Execution/Epic <n>/Bug <m> (2).webm"; API bugs: request + response -> "Bug <m>.json".
4. Write the full report to "Manual Execution/Bug Details/Epic <n> - Bug <m>.md" in the bug-report structure:
   title, environment (URL, browser, role), preconditions, steps to reproduce from the QMetry case, expected,
   actual, evidence (screenshot embedded with a relative link, video and trace paths), severity S1-S4 + priority,
   affected keys, workaround, reproducibility (always if both agents and the retry failed; intermittent if flaky).
5. Run the results writer in each agent folder that has results.
Reply with bug numbers and titles only.
```

Then run `/report-bugs` in Claude Code from the qa-run root, pointing it to the matching Bug Details files for the descriptions; its script files the bugs to Jira or Azure DevOps with the evidence attached.

An agent can quick-check its fixes with the command below, but always finish with a full Prompt 5 run before Steps 5b and 6d: a partial run overwrites results.json with only the re-run tests.

```bash
npx playwright test --last-failed > results/run.log 2>&1; node ../scripts/failures.js
```

**Step 6d — push results to a QMetry test cycle (Claude Code, one command per run, Jira projects):**

QMetry for Jira imports JUnit result files through its REST API, creates or reuses a test cycle, and reuses existing test cases whose summary or key matches exactly ([QMetry docs](https://qmetrysupport.atlassian.net/wiki/spaces/QTM4JD480/pages/3617154864/Automation), [import parameters](https://www.Jenkins.io/doc/pipeline/steps/qmetry-for-jira-test-management/)). The JUnit import carries pass/fail status only, not attachments ([supported formats](https://qmetrysupport.atlassian.net/wiki/x/zIGoOw)), so the screenshots stay in the results Excel and the bug tickets. This assumes QMetry for Jira; generate an automation API key in QMetry and add QMETRY_URL and QMETRY_API_KEY to `.env`.

Prompt 6d (once per project):

```text
Read QA_RUN_RULES.md first.
Write scripts/qmetry_upload.py that:
1. copies results/junit.xml to results/junit_qmetry.xml, renaming each testcase so its name is exactly
   the QMetry Summary of its key from ../testcases/cases.json (the script runs from an agent folder);
2. uploads that file to the QMetry for Jira Import Results API using QMETRY_URL and QMETRY_API_KEY from .env,
   reusing the test cycle key passed as the first argument.
Follow the official QMetry automation API docs for the request format. Do not run the upload; I will.
```

Every run, after bugs are logged (dual mode: once comparison.md shows no open disagreements), the lead agent runs from its own folder:

```bash
python ../scripts/qmetry_upload.py <TEST-CYCLE-KEY>
```

Try the first upload on a throwaway test cycle. If QMetry creates new test cases instead of reusing yours, the names did not match exactly; fix the renaming before using a real cycle. Azure DevOps projects skip Step 6d: results stay in the results Excel and bugs go to Azure DevOps through /report-bugs.

## Step 7 — Manual and visual cases (agent + MCP, medium tokens)

Cases marked Manual split in two. Functional ones the agent runs through the MCP as text, saving evidence to disk only when a step fails; with `--image-responses=omit` the screenshot is written to file but never sent to the model. Cases that need a human eye (layout, alignment, PDF/print look) are cheapest checked by you.

**Prompt 7a — run functional Manual cases (Claude Code, in claude/):**

```text
Read QA_RUN_RULES.md first.
Execute the keys in manual_cases.json (dual mode: the keys marked Manual in ../results/comparison.md)
for module <Module name> with the MCP server named playwright (case details in ../testcases/cases/<module-slug>.md).
Skip cases whose reason is visual judgement; list them at the end for me.
- Navigate and check with browser_find and the verify tools. No screenshots while steps pass.
- On a failed step, save evidence and do not look at it:
  browser_take_screenshot  -> results/manual/<TC ID>.png (fullPage)
  browser_console_messages -> results/manual/<TC ID>-console.txt (level error)
  browser_network_requests -> results/manual/<TC ID>-network.txt
- Write results/manual_results.json: {"TC-040": {"status": "Pass|Fail", "actual": "one line", "evidence": [paths]}}.
- Then run: python ../scripts/write_results.py --agent claude
- Reply with: TC ID | status | one line, and the list of visual cases left for me.
```

**Visual cases** — check them yourself, or, if you want the agent to judge them, add a second MCP server named `playwright-visual` with the same args minus `--image-responses=omit`, and use it only for those cases. Each screenshot the model reads costs roughly 1,000–1,500 tokens, so keep this to the few cases that truly need it.

## Daily run, token-heavy steps and guardrails

**Every run after setup:**

1. Logins: the agent runs `node scripts/check-access.js` as part of Prompt 5; it refreshes logins that have test-account credentials and tells you which ones to save by hand (`node scripts/save-login.js ...`). Blocked tests do not stop the run.
2. Prompt 5 to each agent you use for this project, in its folder.
3. Dual mode only: Prompt 5b-2 to Claude Code for the counts and disagreements; it never blocks bug verification.
4. Failures: Prompt 6b, then Prompt 5, in each agent as it finishes; Prompt 6b-2, then verify the candidates in bug-review.html (you); Prompt 6c (Claude Code); run `/report-bugs` (you trigger it).
5. After bugs are logged (dual mode: and no open disagreements), the lead agent runs the results writer and, on Jira projects, the QMetry upload from its folder.
6. Cases changed: re-export the Excel (you); Claude Code re-runs `qmetry_to_json.py`; Prompt 4b for the changed cases, then 4c, in both agents.

**Watch mode (see Chrome while the agents work; costs no extra tokens, images are never sent to the model):**

| Step | Normal | Watch mode |
| --- | --- | --- |
| Exploring with the MCP (Steps 4b, 6b, 7) | `--headless` in the MCP args | Remove `--headless` from claude/.mcp.json and the Codex `[mcp_servers.playwright]` entry, then start a new session: the MCP loads only at session start |
| Running the suite (Step 5) | `npx playwright test ...` (headless, 2 workers) | Add `--headed --workers=1` to the run command in the prompt: one visible Chrome window, about twice as slow. Do not click or type in it while it runs |
| Looking at one test step by step | — | You run `npx playwright test --ui` in the agent folder (writes no result files, so it is never the official run) |
| check-access.js | headless | headless (save-login.js is always visible, because you log in in it) |

Watch-mode Prompt 5:

```text
Run node ../scripts/check-access.js, then the routine run headed so I can watch, one worker:
npx playwright test --grep-invert @creates-data --headed --workers=1 > results/run.log 2>&1; node ../scripts/failures.js
Reply only with the access lines that are not ready and the count line printed by failures.js.
```

**Codex on Windows:** its sandbox blocks launching Chrome (`browserType.launch: spawn EPERM`), so test runs and check-access.js fail inside it; the MCP is not affected (MCP servers run outside the sandbox). The first time Codex asks to run `npx playwright test` or `node ../scripts/...` outside the sandbox, approve it with the "always allow this command" option, so only those commands get that permission. Do not switch Codex to full access for this.

**End of each feature (lead agent, qa-run root):** run the sync-global skill (Claude Code: `/sync-global`, Codex: `$sync-global`). It generalizes the new entries in the Lessons Learned Log of CLAUDE.md into your global playbook template and qa-rules-condensed.md, so the next project starts with them. Also test cases flagged as Test Logic Error go back into the QMetry Excel here.

**Token-heavy steps you can choose to do yourself:**

- Prompt 4b (page exploration): the main cost. You can record a flow with `npx playwright codegen <url>` and hand the agent the recorded code instead.
- Prompt 6b with many failures: if a whole module fails (say 20+ tests), it is almost always login, environment or a renamed screen. Open one trace yourself first; one fix there saves triaging every test.
- Visual cases in Step 7: cheapest by eye.

**Quality guardrails:**

- Review the first spec of each module yourself: every Expected Result in Excel should map to an `expect()` line.
- Sanity-check one test per module: change an expected value in the spec, run it, and confirm it fails. A test that still passes is not checking anything.
- Reject any agent change to an `expect()` line in a diff unless you asked for it or it is a listed Script Assertion Error fix whose "after" line still checks the Expected Result exactly as written.
- Keep `retries: 1`: a pass on retry is reported as Flaky, not hidden as Pass or inflated into a bug.
