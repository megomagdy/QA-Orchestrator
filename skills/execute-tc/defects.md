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

## 3a. Where candidates are written

Every candidate goes into the **candidates index** and the **reproduction guide** at once, in the structure and step style
of [candidates-guide.md](candidates-guide.md): self-contained sections, one action per step, literal data inline, the
default account unless the candidate needs another role.

## 4. Rulings and candidate states

The user rules on each candidate. Record the state with who ruled, the date and the reason in their words, in both files
([candidates-guide.md](candidates-guide.md) §3):

| State | Meaning |
|---|---|
| **Confirmed** | a bug; goes to the bug queue |
| **Dropped** | not a bug — or very minor, or expected existing behaviour — with the ruling quoted |
| **Parked** | "not yet"; revisit only when the user asks |

A later run never raises a dropped or parked item again as new.

### 4.1 After every ruling

1. **Re-derive each affected case** from the candidates still standing on it:
   - every candidate on it dropped and every step ran → **Pass**;
   - every candidate dropped but a step never ran → **Not complete**, with what that step needs and from whom;
   - some candidates left → **Fail → <the remaining ids>**.
   A step the user decides to skip is recorded in the evidence as "skipped by the user's decision on <date>" and no longer
   holds the case at Not complete.
2. **A general ruling** (one that states a rule, not just a verdict) is also written to the project's decisions log, and
   the open question it answers is marked answered. **Why:** a rule given only in chat is lost by the next cycle, and the
   same deviation gets raised again.
3. **Recount by script** from the results file and update the handoff's counts and Fail table in the same pass.
4. Make bulk state edits safely ([candidates-guide.md](candidates-guide.md) §6): anchor on the candidate id, assert one
   match, print all states after.

### 4.2 An issue the user finds while reviewing

Reproduce it live, capture the request and response, and locate the cause. A different defect or fix becomes a **new
candidate** cross-referenced from the one being reviewed; text in the existing candidate that the finding contradicts is
corrected. The case it belongs to records both ids.

## 5. Confirmed bugs

Each confirmed bug gets:
- its reproduction-guide section (steps, expected, actual, affected cases), which is the source for the bug report;
- data staged so the user can reproduce and record it;
- an evidence file per candidate id in the project's evidence folder, checked 1:1 against the confirmed set and linked from
  both candidate files ([candidates-guide.md](candidates-guide.md) §4);
- a **Layer** tag — Frontend, Backend or both, "(likely)" when inferred — from the page compared with the API
  ([candidates-guide.md](candidates-guide.md) §5), so the bug can be routed;
- one entry in the project's bug queue, in the location and one-line format the project files define.

No root cause and no fix suggestion. The batch bug-filing skill, if available, files the queue later, after the user's yes
and a duplicate check (SKILL.md §0.1).

## 6. Before handover

1. Re-verify every bug and every candidate live, through the UI.
2. Move anything that no longer reproduces to a **"removed, with reason"** table.
3. Check **by script** that every Fail and Blocked case, and every parked or dropped candidate with its ruling, appears in
   the defect index (the list of bugs and candidates kept with the results). Fix any gap before handing over.
4. Check **by script** that the index and the reproduction guide agree: the same ids, the same state per id, a ruling line
   under every dropped or confirmed guide heading, and an evidence link and Layer on every confirmed one.
