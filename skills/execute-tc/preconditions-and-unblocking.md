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
- **The state must be reachable in the product.** Before forcing a precondition through the API or the database, check
  that a user can reach it in the app (some settings lock after first setup; some transitions are never offered). If not,
  the case tests an impossible state: record it as **not reachable**, with the screen text or guard as evidence, and send
  the case back to the suite as a deferred clause. Change nothing.
  **Why:** a case needed a setting changed after setup. The setup page said the value "cannot be edited later" and
  refused the change; forcing it through the API would have tested a state no user can create.

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
- **Temporary configuration for setup** (an approval chain, a workflow step, a feature switch): write the rollback note
  first, then change → create the records → restore in one script (restore in a `finally` block), and read the setting
  back. Prefer settings the app freezes onto the record at creation (a chain copied onto each request), so the shared
  setting is changed for minutes, not for the whole run.
- **Use the product's own assignment path for roles and access.** Assign roles through the service that issues the
  user's permissions (the one the admin screen uses), then sign in again and confirm the user reaches the page before
  judging any permission result.
  **Why:** a role assigned through a lower-level identity call left the user with no module access; every page showed
  Access Denied and the first results had to be discarded.
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

## 5. Account states that affect sign-in and access

- **Sign in first, then change the account's state.** Actions on a test account (termination, deactivation, suspension,
  role removal) can revoke its app access or its session. When a case needs a signed-in user in such a state, have the
  person sign in, then apply the state change, and run the step without restarting the app.
- **When a sign-in fails, check the account before blaming the case.** Look up the user in the identity or user service
  (does the record exist, which modules and roles does it carry). An environment reset can leave an employee without an
  account, which looks like an access rule. If the account is broken, switch to another account that meets the case
  and record the switch.
- **An undo may not restore everything.** After cancelling a state change (cancel a termination, restore a role), check
  the account is back as it was (active, eligible, roles) and fix what the undo missed.

## 6. Data that belongs to someone else

- **Never touch data reserved for another cycle or tester** unless the user explicitly permits it, and then only with a
  written undo plan that is run afterwards.
- **When a precondition needs an action only another team can perform:** first check whether Claude can do it itself from
  data, with a backup. If not, give the user one ready-to-send message per target — what to change, on which record, and
  why — in the language and voice the user asks for.
