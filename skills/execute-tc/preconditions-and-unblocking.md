# Preconditions and Unblocking

Anything not blocked by a named failed case must be unblocked. Every rule below assumes SKILL.md §0: approval gates,
reversible writes, and the off-limits data listed in the project files.

## 1. Meeting a precondition

- **Run the case as written.** If the available data cannot meet a precondition, run what can run and record the gap on
  the result. Never substitute a different scenario.
  **Why:** a substituted scenario produces a Pass for a case that was never tested.
- **Check data at the level the case uses** — the exact record in the exact period or state, not only its parent entity
  (e.g. "record A in period P", not "record A exists").
- **Dry-run or inspect every candidate target before choosing one.** If none qualifies, the case is Not complete, with that
  output as evidence.
- **Input files:** when a case depends on an uploaded file, inspect each candidate file before anyone uploads it — that its
  content is machine-readable, and that it does not clash with existing records (e.g. the same identity, phone number or
  email).
- **Fixture ledger:** check the record's remaining quotas, lockouts and temporary grants (SKILL.md §2) before choosing it.

## 2. Writing data to unblock a case

- **Back up and write the rollback before any write.** Capture the exact prior values; run the rollback afterwards and say
  what was left.
- **Never fabricate data the app computes; seed master data only.** Records the app derives (totals, results, generated
  documents, computed statuses) are produced through the app.
  **Why:** hand-written derived rows are internally inconsistent and hide the defects the case is meant to find.
  - *Exception — states an external system cannot produce on demand:* seeding that stored state is allowed with a backup
    and an undo. The result is labelled **"display check on a seeded state"** and never decides the verdict on the
    computation that would normally produce that state.
- **Removing rows your own run created through the app is cleanup, not fabrication.** Capture them by id, dump them
  first, and verify the counts against a before/after snapshot.
- **Prefer a fresh test record created through the app** over repairing a broken or stuck one, when the user agrees.
- **Rebuild a missing pre-release baseline from version control** (check out the earlier build or its data definitions)
  rather than guessing what it looked like.

## 3. Time, jobs and forced failures

- **Time-dependent states:** simulate them through data, through the app's own job triggers, or — with the user's
  approval — through the client clock for client-side date limits. Restore afterwards and label the method in the result.
- **Job triggers act on everything due, not only your fixture.** List what a run will touch first; abort if anything
  outside your fixtures is in that list.
- **Forced-failure preconditions:** inject the fault only on rows Claude created for it, with an undo. The outcome is a
  **candidate** (it is not reproducible from the UI alone) and is recorded with the injection steps.

## 4. Permission and role cases

- Use a dedicated least-privilege role and test user; the person signs in (SKILL.md §0.3).
- Expect a fresh sign-in after role or profile changes before judging what the user can see.
- When the UI denies access, probe the server endpoint separately, and report **"screen blocks"** and **"server enforces"**
  as two results.
  **Why:** a hidden button with an open endpoint is still a permission defect.

## 5. Data that belongs to someone else

- **Never touch data reserved for another cycle or tester** unless the user explicitly permits it, and then only with a
  written undo plan that is run afterwards.
- **When a precondition needs an action only another team can perform:** first check whether Claude can do it itself from
  data, with a backup. If not, give the user one ready-to-send message per target — what to change, on which record, and
  why — in the language and voice the user asks for.
