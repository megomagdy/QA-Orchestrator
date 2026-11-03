# Deviations, Candidates and Bugs

A deviation is first a **candidate**. Only the user turns a candidate into a bug.

## 1. Where the expectation comes from

The expected result comes from the documents and the rulings of the role that owns each decision (SKILL.md §0.2). Code is
used only to explain a deviation or to list what a rule must cover — never as the verdict.

## 2. Checks before showing a candidate

| Check | If the answer is no |
|---|---|
| Is it user-visible — a screen, report, export, or an API response a client renders? | not a candidate; at most an observation |
| Is it new compared with the pre-release build? | "not raised — pre-existing" |
| Was it reached through the real navigation path? | reproduce it through that path first |
| Does it still reproduce on the current build? Re-check after any deploy that landed mid-cycle. | move it to the "removed, with reason" table |
| If it was seen only with scripted input (script-set values, programmatic clicks), does it reproduce with real typing and clicking, or when the person does it? | not a candidate yet |

**Why:** scripted input skips the events a real user triggers, so it can produce states no user can reach.

## 3. The candidate brief

State these up front, then the steps and evidence:

1. The document clause that sets the expectation, or **"spec-silent"**.
2. Whether a design frame exists for that state.
3. Whether the API responds differently between the variants compared.
4. The exact on-screen text the candidate refers to, quoted.

## 4. Rulings and candidate states

The user rules on each candidate. Record the state with its date:

| State | Meaning |
|---|---|
| **Confirmed** | a bug; goes to the bug queue |
| **Dropped** | not a bug, with the ruling quoted |
| **Parked** | "not yet"; revisit only when the user asks |

A later run never raises a dropped or parked item again as new.

## 5. Confirmed bugs

Each confirmed bug gets:
- a structured entry: steps, expected, actual, evidence, affected cases;
- data staged so the user can reproduce and record it;
- one entry in the project's bug queue, in the location and one-line format the project files define.

No root cause and no fix suggestion. The batch bug-filing skill, if available, files the queue later, after the user's yes
and a duplicate check (SKILL.md §0.1).

## 6. Before handover

1. Re-verify every bug and every candidate live, through the UI.
2. Move anything that no longer reproduces to a **"removed, with reason"** table.
3. Check **by script** that every Fail and Blocked case, and every parked or dropped candidate with its ruling, appears in
   the defect index (the list of bugs and candidates kept with the results). Fix any gap before handing over.
