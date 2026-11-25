# Handover — Cases for a Person, Command Blocks, the Handoff File, the Closing Report

## 1. Preparing a case for a person to execute (mode b)

Every case handed over must pass all of these:

- [ ] **Verified ready in the live environment**, with the data checked at the level the case uses (e.g. the exact record
      in the exact period, not just the parent entity).
- [ ] **Re-checked just before handover** — a shared environment changes.
- [ ] **Every record, screen and period is named** so it can be found without guessing: the name plus a unique key
      wherever ids or names repeat.
- [ ] **Literal values** in every step (what to type, which option to pick), never "a valid value".
- [ ] **Every step is performable** on the screen as it is in that state: the control exists, not only the record.
- [ ] **Says whether it saves anything**, and how to clean up afterwards.

Group the cases by shared setup (same login, same records, same screen), so the person sets up once per group. List the
excluded cases with a one-line reason each.

## 2. Server or command-line steps the person runs

Write them as numbered blocks, in this order:

1. **Dry run** first, showing what would change.
2. **Snapshot and rollback** for each target, written before anything is changed.
3. The **real run**.
4. Explicit **"stop and send me the output"** points, where Claude takes the before/after snapshots.

## 3. The handoff file

Keep it current during the run (location as defined in the project files):

- what ran, with counts ("N of M ran", per status);
- environment changes made and their rollbacks (done / still to run);
- the fixture ledger (quotas, lockouts, temporary grants kept on purpose);
- open questions and who they are waiting on;
- the account the environment is left signed in as.

At about 90% context, finish the handoff file and add a **start prompt** for the next session: the cycle, where the files
are, what is next, and what is waiting on whom.

## 4. Waiting

When waiting (a sign-in, a deploy, a timer, another team), say exactly what you are waiting for and from whom, then keep
working on anything else that can run.

## 5. Messages to other teams

When a precondition needs another team's action (see [preconditions-and-unblocking.md](preconditions-and-unblocking.md)
§5): one ready-to-send message per target, saying what to change, on which record, and why — in the language and voice
the user asks for.

## 6. The closing report

- Coverage: "N of M ran", with the count per status.
- What was added: confirmed bugs and new candidates, each with its id in the bug queue or defect index.
- Rulings: candidates confirmed (with the Frontend / Backend / both split and evidence status), dropped (each with its
  reason) and still open. Counts are recomputed after the last ruling, by script from the results file.
- Every **Blocked** case with the failed case that blocks it.
- Every **Not complete** case with exactly what it needs and from whom.
- Environment changes still in place, and the account left signed in.
