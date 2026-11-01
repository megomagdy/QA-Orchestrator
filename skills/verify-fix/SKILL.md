---
name: verify-fix
description: Retest every In Testing bug of a story that the user reported (other bugs only when the user names them) and, in the same pass, explore what each fix could have broken around it (exploratory regression by a senior QA engineer, not a re-run of written cases). Produces one retest record per run and prepares the Jira close / return actions. Use when the user says "check the In Testing bugs", "retest my In Testing bugs", "verify the fix and the affected area", "make sure the fix didn't break anything", or asks to check new In Testing tickets of a story.
argument-hint: "story / epic key (e.g. IS-7532), or one or more bug keys"
---

# Verify Fix — $ARGUMENTS

Retest each bug that is **In Testing and was reported by the user** (other bugs only when the user names them) and, as part of the same verification, check that its fix did not break anything
around it. One bug = one retest + one regression charter, run while the data and logins for that bug are set up. A bug is
only ready to close when **both** parts are done.

The regression part is **exploratory testing by a senior QA engineer (10+ years)**, driven by knowledge of the feature and of
the code change — not a re-run of the written test cases and not "every case with the same label". Updating the test-tool
results of the bug's *Affected Test Cases* is a separate follow-up, not this skill.

**Read first — they are binding:** the workspace `CLAUDE.md` and its `.claude/rules/`, the project `CLAUDE.md`, the project's
`qa-rules-condensed.md` if present, and the memory index. Project rulings (QC decisions, "not a bug" rulings, who decides
what) override anything generic here.

## 0. Ground rules

- **Never write to the tracker without the user's go-ahead.** Verdicts are presented first; closing, returning,
  commenting and reassigning happen only after the user answers. Follow the project's rule for *how* to close (some
  projects close with no comment, some want a retest comment — see §5).
- **Never file a new bug from the regression.** Findings are presented with ready reproduction steps; the user decides
  (bug / not a bug / file / does it block closing). Record the ruling.
- **Judge on what the user sees** — a screen, report, export, payslip or API a client renders. A DB-only difference is
  not a defect. Validation that refuses on Save is not a fail just because there was no inline message: run the save.
- **Prove, don't predict.** A result read from code is a *prediction*; label it so and say why it could not run.
- **Report coverage honestly:** "N of M checks ran", with every Not covered and its reason. Never imply full coverage.
- **Every write is reversible and logged:** back up / snapshot before, roll back after, list what was left.

## 1. Collect the inputs

1. **The bugs — only the ones the user reported.** By default, verify the story's child bugs in status In Testing whose
   **reporter is the user** (look up their account id once, e.g. `atlassianUserInfo` / `lookupJiraAccountId`).
   Being the assignee does not count: a bug someone else reported that was assigned to the user is not in scope.
   Example (Jira): `parent = <STORY> AND status = "In Testing" AND reporter = "<accountId>"`.
   **Exception:** when the user names other tickets, another reporter or another filter ("also Waleed's bugs",
   "IS-1234 and IS-1240", "all In Testing bugs of the story"), verify exactly those instead.
   Also list once, with status, the story's other open sub-tickets that the user reported, and say which were skipped and
   why (To Do / In Progress / In Review / Blocked = fix not delivered yet). In Testing bugs reported by someone else are
   mentioned in one line as "not yours — not verified", never retested silently.
   If the tracker connector is down, use the project's REST helper if it has one (e.g. `execution/tools/jira.js`).
2. **Per bug:** summary, full description (environment, steps, expected, actual, affected TCs), **all comments** (dev notes,
   earlier retest comments — a bug can come back after a failed retest; re-check the exact path you returned it for), and the
   **changelog**: who moved it to In Testing and when. That developer is the one to reassign to if it fails.
3. **The fix itself.** `git fetch`, then find the commits naming the bug in every repo
   (`git log --all --grep=<KEY>`), read the **diff** (not just the message), and list which branches contain it
   (`git branch -r --contains <sha>`). The branch decides the environment: e.g. on staging vs only on a pre-prod
   canary branch. Note the merge time.
4. **Confirm it is deployed** before testing it. Front end: the main bundle's `Last-Modified` header must be after the merge.
   Back end: confirm by behaviour (a check the fix changes), or a version endpoint if one exists. If the environment needs
   routing headers (e.g. a canary header), add them to every scripted call.
5. **Environment state.** Is anyone else using it now (a UAT, another tester)? Which records may you touch? Which tenant /
   company qualifies (feature gates, migration flags — read the app flag, not a lookalike column)? Logins available.

## 2. Per-bug flow

For every In Testing bug:

1. **Retest the bug.** Follow its steps on the current build with data that matches the preconditions.
   - Use **fresh data when the fix is on a write path** — a record written before the fix can still carry the old state
     (the fix often prevents new damage but does not repair old rows; say so if the original fixture stays broken).
   - Build a **discriminating check**: something the old build would fail and the new one passes. If your fixture would pass
     on both builds, say so and build one that cannot (see the IS-8042 example below).
   - Verdict: **Fixed / Partly fixed / Not fixed**, with evidence: API status + body, DB values before/after, screenshot.
2. **Write the charter** (§3) and run its probes in the same session.
3. **Classify** every result (§4).
4. **Record** the bug's section in the run's retest record (§6) as you go.
5. **Report to the user** (§5) and wait for the go-ahead before any tracker write.

Several bugs on the same screen: group them into one session (shared logins and data), but keep a **separate** verdict,
charter and tracker comment per bug.

## 3. Charter — what the fix could have touched

Write one row per bug **before** testing: *fix → could also affect → concrete probes*. Think like the developer who made the
change: same component, same endpoint, same state machine, same validation, same copy/translation, same permission check,
same date/time handling, the steps just before and after the fixed one. Read the diff to find what is **shared**.

| Look at | Examples |
|---|---|
| Other states / values of the same thing | Deleted fixed → check Active, Not found, Duplicate; Monthly→Hourly fixed → check Hourly→Monthly |
| The other direction / the mirror action | moved later → moved earlier; add → delete; create → edit |
| Success path next to a fixed error path, and the other error paths | after a 409 toast fix: other 4xx/422 messages, and a normal save still closes the dialog |
| Controls after the fixed moment | locked-during-loading fix → re-enabled after success and after failure; close still works with nothing changed |
| Other surfaces that use the same code | a shared form used in onboarding **and** the profile dialog; a resource used by web and mobile; list, details, dialog, history, export, PDF, payslip |
| Other roles on both sides of a permission fix | the role that must now be hidden **and** the roles that must still see it |
| Data side effects | rows the action writes (history/audit, counters, quota), recomputed values (pro-rated hours, totals), other records sharing the value |
| Variants of the flow | create / onboarding / bulk / subscription variant fixed in only one of them |
| Repeats and sequences | the fixed action twice in a row; fixed action then delete / revert |
| Language / RTL | Arabic UI copy and layout of the changed surface |

Group the charters by screen / flow into sessions. Write them into the retest record before running them.

## 4. Run and classify

**Run in the in-app browser pane** (`mcp__Claude_Browser__*`) so the user can watch — never headless scripts for UI checks.
Read-only DB queries from the shell are fine for verification. API calls can run inside the signed-in tab (`fetch` with the
page's token) so the token never leaves the browser.

- Verify every claim against the live DOM **and** the data store (stored values, history rows, call logs).
- Capture network responses for each probed action (hook XHR / fetch, or read the pane's network log) so what the UI shows
  can be compared with what the API returned.
- Free exploration is the point: when something looks off, follow it — keep notes per charter.

| Class | Meaning |
|---|---|
| **OK** | neighbour behaves correctly |
| **Finding Fn** | a defect in the area. Before calling it a regression, check whether it predates the fix: compare the code on the live / previous release branch (`git show origin/<live-branch>:<file>`, `git log -S`), or the live app. If you cannot compare, say so |
| **Observation** | spec-silent, design/UX questions, or out-of-scope issues seen in passing |
| **Not covered** | with the reason: no data in that state, needs a second account, a tenant-wide job you must not run, not reachable from the UI, fix not deployed |

Existing behaviour outside the change is **not** a regression — note it as an observation at most.

## 5. Report and tracker actions

Present per bug: verdict (with the discriminating evidence), neighbours checked, findings with ready reproduction steps,
observations, not covered. Then ask **one** question for the run, e.g. "Close IS-1 and IS-2, return IS-3?".

After the go-ahead (follow the project's own Jira rules — they win over this list):

- **Fixed, no regression** → close. Use the project's convention: either no comment, or the retest comment from
  [templates/jira-retest-comment.md](templates/jira-retest-comment.md) ("Retest on {env}, {date}: fixed." + steps + result
  + "Also checked around the fix: …"). Discover the transition id (`getTransitionsForJiraIssue`) — names differ per
  project ("Done", "Testing is Done", …).
- **Not fixed / partly fixed** → comment what still reproduces (steps, expected, actual, what passes), @mention the
  developer, reassign to the developer who moved it to In Testing, transition to the project's reopen state
  (To Do / Reopen). Ask first when the verdict is borderline (leftovers that may be accepted as minor).
- **Regression or new defect in the neighbourhood** → do not file, do not close silently. Present it and ask whether it is a
  bug, whether it blocks closing this ticket, and whether to file it. Record the ruling, e.g. "Not a bug — same behaviour on
  the live app".
- **Comments state the problem only** — no root cause, no suggested fix. Use the tracker's rich format (ADF mention for
  Jira); build long comments in a file, not inline shell strings.
- After every write, read the issue back and confirm the status / assignee changed.

## 6. Output — the retest record

One Markdown file per run, in the project: `Manual Execution/Retest <STORY> In Testing - <YYYY-MM-DD>.md`
(or the project's existing execution folder if it keeps reports there). Use
[templates/retest-record.md](templates/retest-record.md): per bug — Bug verdict / Charter / Regression probes /
Tracker action; then the run summary, findings with the user's rulings, observations, Not covered with reasons, and
**Data left** (what was created or changed, where the rollback / backup is). Save screenshots under an evidence folder
named for the bug or the run.

## 7. Access and test-data rules

- **Logins:** the user signs in; you never type passwords, never read them out of account files, never print tokens.
  If a session expired, ask the user to sign in in the pane, then continue from the page's own token.
  Tenant logins via an admin "wild-card password" (where the product has one) are single-use: generate a fresh one each login.
  Passwords set during onboarding go into the project's `test-accounts.local.md`, never into chat.
- **Shared environments:** check nobody else is mid-test (UAT, another tester) before closing cycles, running tenant-wide
  jobs or restoring backups. Use far-future dates or dedicated records to stay out of others' way.
- **Tenant-wide jobs** (activation, renewal, notification schedulers) affect everyone's pending data — run them only with a
  hold on the other records, or not at all and say so. Never run anything that e-mails real people.
- **Before writing:** snapshot the rows you will touch (or a full backup), add a state guard to seed scripts, tag what you
  create ("QA <KEY> verify"). **After:** delete or restore what you created, read back to confirm, and list what could not
  be removed (no API, locked by a closed cycle, …).
- **Never press a button that commits an irreversible business action** to "open" something (complete onboarding, pay,
  approve a payrun, send). Observe gates; do not submit them. Never fill payment / bank / IBAN fields.
- **Deleting shared records may be refused by the safety layer** — do not work around it; report what is left.
- **Pick fixtures from real data** (read-only queries), and check that each one can reach the state you need (hire dates,
  contract coverage, one-change-per-period rules, payslip locks) before writing anything.

## 8. Pane mechanics that bit us

- Dialogs re-centre when their content changes; re-read element positions (`getBoundingClientRect`) after every change
  instead of reusing coordinates. An emulated viewport shifts coordinates too — reset it, or click by element ref.
- A page can sit on "Loading…" after navigation — reload once (or navigate through the app's own links) before assuming a failure.
- `find` refs go stale after a re-render — re-query before clicking. Icon-only buttons get guessed wrong — confirm with a screenshot.
- Short-lived toasts: install a MutationObserver before the click and read what was added.
- Helpers defined in the page (`window.api = …`) are lost on every full navigation — redefine them after navigating.
- A tab may keep a hidden step's inputs in the DOM; read the active step / tab before trusting a value.

## 9. Worked examples

- **Retest + Jira, Wathq Integration (IS-7833), 1 Nov 2026** — four In Testing bugs (IS-8097, IS-8098, IS-8099, IS-8102)
  retested in the pane, commented and moved to Done. IS-8097: the company from the failed retest was onboarded before the
  fix and still showed the old state, so a fresh company was created to prove the fix.
  Record: `D:\Idaratech\Wathq Integration\Manual Execution\Retest IS-7833 In Testing - 2026-11-01.md`.
- **Regression charters, same story** (run that day as a separate pass over 18 closed bugs; in this skill it is done per bug):
  5 sessions — S1 client edit dialog (6 bugs), S2 official data card + labels (3), S3 admin details / history / list (4),
  S4 admin edit / duplicate / clear (3), S5 onboarding + subscription (2). No regression traced to a fix; two findings
  ruled not a bug by the user; Not covered: Pending/Suspended data, outage stub, a second admin session.
  Log: `D:\Idaratech\Wathq Integration\Manual Execution\Exploratory regression - closed bugs - 2026-11-01.md`
  — read it as the reference output.
- **Discriminating fixture, Mid-Period Salary Change (IS-8042), 22 Oct 2026** — the first fixture's timesheet row was dated
  before the effective date, so the old build would also have passed. Late-imported punches produced a row dated after it;
  the retest then proved the row survived, the Employee View showed the days, the settlement counted 14 h and the payslip
  paid 738.50. Record: `D:\Idaratech\Mid-Period Salary Change\execution\regression-2026-10-22b.md`.
- **Regression found the real gap, IS-8048, 22 Oct 2026** — the bug's own steps passed, but the charter's "same shared form,
  other order of actions" probe showed that choosing the Contract Type after the dates cleared the check. Returned to the
  developer with the path; fixed and closed after the next retest.
- **Fix only on a pre-prod branch, IS-8073, 27 Oct 2026** — `git branch -r --contains` showed the fix only on
  `preprod-canary`, so it was tested on pre-prod with the canary routing header; mirror direction, repeated moves, delete
  and the neighbouring IS-8063 path all probed; the "moved earlier" case was left as a labelled prediction because the
  activation job is tenant-wide. Record: `D:\Idaratech\Mid-Period Salary Change\execution\regression-2026-10-27.md`.
