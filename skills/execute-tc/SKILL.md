---
name: execute-tc
description: Execute written test cases against a live test environment, one test cycle at a time, in either of two modes — Claude runs the cases through the session's UI-automation tool, or Claude prepares and verifies each case so a person can run it. Keeps a working list and a results file with evidence, turns deviations into candidates for the user to rule on, queues confirmed bugs for later filing, and keeps a handoff current. Use when the user asks to execute or run test cases, run a test cycle, "run everything you can", retest a cycle, or prepare cases for someone to execute by hand.
argument-hint: "case id(s), a test cycle, or all"
---

# Execute Test Cases — $ARGUMENTS

Run written test cases against the live test environment and record a verdict with evidence for every case in the cycle,
or prepare each case so a person can run it without guessing. Any product, any kind of UI (web, mobile, desktop), any
test-management tool, issue tracker and UI-automation tool.

**Read first — they are binding:** workspace instructions, project instructions, the project's QA rules file if present
(e.g. a condensed rules file), and memory. Project rulings (QC decisions, "not a bug" rulings, who decides what) override
anything generic here.

Supporting files: [ui-mechanics.md](ui-mechanics.md) (recovery and UI-automation mechanics) ·
[preconditions-and-unblocking.md](preconditions-and-unblocking.md) · [defects.md](defects.md) ·
[handover.md](handover.md) (preparing cases for a person, command blocks, the handoff file, the closing report).

## Values this skill takes from the project files

Every value below is **as defined in the project files**. If the project defines none, use the default, or ask the user once
and write the answer into the project files so the next session does not ask again.

| Value | Default when the project defines none |
|---|---|
| Test-management tool and its execution statuses (the mapping in §3) | ask once |
| Working list and results file: location and format | one working-list file and one results file per cycle, in the project folder |
| Bug queue: location and one-line format | the file the batch bug-filing skill (if available) is configured to read; otherwise ask once |
| Evidence folder and file naming | an evidence folder per cycle, files named after the case or bug id |
| Handoff file | one handoff file per cycle, in the project folder |
| Safe option values for screens that can commit a business action (§0.4) | ask once, before the first such screen |
| Off-limits accounts, records and data reserved for another cycle or tester | treat every record this run did not create as read-only |
| Whether the app's support "log in as" feature may be used (§0.3) | not allowed |
| Who owns which decision (product, design, development) | ask once |

## 0. Ground rules — these change behaviour

1. **Approval gates.** Nothing is written to the test-management tool or the issue tracker without the user's yes. When
   the user asks to report bugs: run a duplicate check first, and don't re-run cases unless asked.
2. **Rulings count only from the role that owns them.** A developer's comment on a ticket is information, not a product
   decision: say so, and point to the open question it touches.
   **Why:** acting on an unowned answer makes the suite test a decision nobody with authority made.
3. **Division of work.** Claude does every non-sensitive step itself. The person does only steps that need a password, a
   bank, identity or other personal value, or their own login; Claude drives to that exact field and stops there.
   - *Exception:* where the project files explicitly allow it, Claude may use the app's own support "log in as" feature on a
     test environment. The generated value goes straight from its element into the login field; it never appears in chat
     or in tool output.
   - Server or command-line steps the person must run are written as numbered blocks (format in [handover.md](handover.md)).
4. **A step's side effects matter, not just the control pressed.** Before any step on a screen that can commit a business
   action (e.g. a payment, a submission, a request), set every option on that screen to the safe value the project files
   designate. If an unintended business record is created anyway: stop, tell the user, and undo it only with their
   approval. Never fill payment, bank or card fields.
   **Why:** a successful earlier action can trigger an automatic submit, so the control you press is not the only thing that runs.
5. **"No side effect" needs data evidence.** An expectation such as "no call is made", "no counter changes" or "no row is
   written" is proven by a before/after reading from the data store or log (the id range or the counter), never by the
   screen alone.
6. **Confirm the build before judging a fix.** When a fix is said to be deployed, check it is live first: e.g. the client
   build's timestamp or version against the merge time, or a behaviour the fix changes. If the build predates the fix,
   wait and re-check; don't record a Fail.
7. **A deviation is a candidate, not a bug.** The expected result comes from the documents and the rulings. Code may
   explain a deviation or list what a rule must cover; it never decides the verdict. The user rules on every candidate
   ([defects.md](defects.md)).
8. **Run each case as written.** Never substitute a different scenario for a precondition the data cannot meet: run what
   can run and record the gap ([preconditions-and-unblocking.md](preconditions-and-unblocking.md)).
9. **Every write is reversible.** Back up and write the rollback before any write; never fabricate data the app computes.
10. **Report coverage as "N of M ran"**, never as a suite pass. A reduced-scale run records its own N of M inside the case
    result.
11. **Know which account is signed in** before acting (the browser or device may be shared), and say at the end which
    account it is left signed in as.
12. **Tool hygiene.** Never pass free text (evidence, steps, quotes) through shell command strings; write it with
    file-edit tools. If one tool returns identical results for different targets (e.g. databases, tenants, accounts),
    suspect the tool before reporting.
    **Why:** shells rewrite quotes, escapes and newlines, so the stored evidence silently differs from what was seen.

## 1. Choose the mode

- **(a) Claude executes.** Claude drives the UI-automation tool through each case, stopping only at the steps §0.3 gives to
  the person.
- **(b) Claude prepares, a person executes.** Every case handed over is verified ready in the live environment and written
  so it can be run without guessing — checklist in [handover.md](handover.md). Cases are grouped by shared setup;
  excluded cases are listed with a one-line reason.

A cycle can mix both: Claude runs what it can and prepares the rest.

## 2. Set up the cycle

The **test cycle in the test-management tool is the unit of work.**

1. **Working list** — one row per case: the tool's identifiers for the case and for its execution in this cycle, a gate
   flag, and the tester's current status.
2. **Results file** — per case: status, concrete evidence (values seen, record keys, response codes, file names of the
   captured evidence) and, on a re-run, the previous status.
3. **Fixture ledger** — per test record, its limited budgets: quotas left, lockouts until a given time, temporary grants
   kept on purpose. Check it before choosing a target. Run negative cases that trigger a lockout or burn a quota **last**
   on a record, or on a dedicated record.
4. **Order:** gate cases first, then the planned order. Stop and tell the user on a failure that makes the rest
   meaningless (the app is down, the session expired, the environment is wrong).
5. **Stale cases found mid-run:** fix the case at its source, push it to the tool (after the user's yes, §0.1), refresh
   the copies not yet run, and tell the user which already-run copies need a manual step sync.

## 3. Run each case and record a status

Run the steps with literal values. Capture evidence on every failure and on every check that a screen alone cannot prove
(§0.5). For dialogs, overlays and other UI-automation traps, use [ui-mechanics.md](ui-mechanics.md).

| Status | Use when |
|---|---|
| **Pass** | every expected result was observed |
| **Fail** | an expected result was not observed — and the Fail maps to one of: a confirmed bug, a known bug, a candidate, or "not raised — pre-existing" |
| **Blocked** | only by a **named** failed case that this case depends on |
| **Not complete** | could not finish for any other reason; say exactly what it needs and from whom |
| **Not applicable** | the case does not apply to this build or environment, with the reason |

Map these to the test-management tool's own statuses as listed in the project files; a tool may lack some of them, so
record the skill status in the results file as well.

## 4. Unblock everything not blocked by a failed case

Anything not blocked by a failed case must be unblocked. The rules — backups, seeding limits, cleanup of your own rows,
time-dependent states, job triggers, forced failures, permission cases, missing baselines, reserved data, fresh records,
actions only another team can perform — are in [preconditions-and-unblocking.md](preconditions-and-unblocking.md).

## 5. Deviations, candidates and bugs

A deviation becomes a candidate, the user rules on it, and only a confirmed bug reaches the bug queue — checks, the
candidate brief, the bug entry and the pre-handover re-verification are in [defects.md](defects.md). No root cause and no
fix suggestion on a bug. The batch bug-filing skill, if available, files the queue later.

## 6. Upload and import files

When a case needs a file to upload or import: generate it, validate it against the app's own preview or validation step,
and hand it over to be used as-is. No hand edits.
**Why:** a hand-edited file is no longer the file that was validated.

## 7. Session hygiene

- Keep status replies short.
- Keep the **handoff file** current: what ran, the counts, environment changes and their rollbacks, open questions. At
  about 90% context, write the handoff plus a start prompt for the next session ([handover.md](handover.md)).
- **"Run everything you can"** is a continuous mode: work through the whole runnable list without per-case check-ins and
  collect the questions for the end.
- **Never sit idle.** When waiting (a sign-in, a deploy, a timer, another team), say exactly what you are waiting for and
  from whom.
- End with the **closing report** ([handover.md](handover.md)): what was added (bugs, candidates), every Blocked case with
  its blocking failure, and every Not complete case with exactly what it needs and from whom.

## 8. Optional helpers

Each is used only if available, and only when useful; none runs automatically and none is required.
- A failure-triage agent (e.g. bug-hunter, if available) to classify failures: real bug, broken locator, timing,
  environment, test logic, flaky.
- A UI-audit agent (e.g. dom-auditor, if available) to confirm that the elements a failing step uses exist.
- The batch bug-filing skill, if available, to file the bug queue after the user's yes.
- The fix-verification skill (e.g. verify-fix, if available), when the run is a retest of fixed bugs.
