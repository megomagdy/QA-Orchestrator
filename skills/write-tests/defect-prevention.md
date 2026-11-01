# Defect-Prevention Pass — applies to every feature

Run this pass between the behaviour inventory (SKILL.md Step 2b) and writing the cases, and again in `/cross-validate`.
It applies to **every** feature (forms, workflows, reports, integrations, permissions, scheduling, settings, mobile), not
only to features that move money.

**Why it exists:** a post-release audit of 87 real bugs against the suite written before execution found 52% caught by
a case, 44% in an area a case covered but **missed by its data or its assertion**, and only 5% in an area no case
touched at all. Most misses came from how existing cases were written, not from missing cases. Each section below
closes one of the eight reasons found, in order of how many bugs it explained.

---

## P1 — Data shapes: run every rule on the data that breaks it (11 of 42 misses)

A case that runs a rule on "normal" data proves nothing about the data shapes that break the code. For every behaviour
that applies a **rule** (a calculation, a filter, an eligibility check, a validation, a status change, a list or
report that selects rows), list the shapes of data the rule reads, then give each relevant shape its own step.

Build `data-variants.md` once per feature from this checklist, and mark each shape **relevant** (gets a step) or
**N/A (reason)** per behaviour:

| Dimension | Shapes to consider |
|---|---|
| **Time** | period of each real length (e.g. 28 / 29 / 30 / 31 days); month end; leap year; year boundary; today vs past vs future; a date exactly on a boundary; timezone / day-change (late-night UTC vs local) |
| **Lifecycle position** | new (just created), mid-life, joining / starting inside a period, leaving / ending inside a period, already ended, deactivated / archived / deleted, reinstated |
| **Cardinality** | none, exactly one, many, the maximum; two records that share a value users think is unique (name, number, code) |
| **Completeness** | every optional field empty; a required-looking field missing in legacy data; a configuration never set |
| **Origin** | created through every entry point (UI, bulk upload, API, migration, import); created **before** the release (legacy rows, in-flight drafts) |
| **Account / environment** | a brand-new account or tenant with no history and no reference data; a long-lived one with real data; a non-eligible one (feature gated off) |
| **Content** | very long values, special characters, right-to-left / mixed-direction text, leading or trailing spaces, case differences |
| **Volume** | empty list, one page, many pages, the size limit |
| **Combination** | two states that can co-exist on one record or day (e.g. an error flag on a row that is also split; an absence and an extra block on the same day) |

**Rules**
- Every rule-bearing case's precondition names the shapes it uses, and carries a label per shape (`data-<shape>`), so
  the gate (below) can count them.
- A rule tested only on the "typical" shape is **Partial**, not covered.
- Plan the fixtures from this table **before** execution, so the seeding covers the shapes and not only the happy path.

## P2 — Assertion strength: a step must fail when the bug is there (9 of 42)

Most "covered but missed" bugs ran through a step whose expected result was too loose to fail.

- **Name the exact value and where it lives.** "Correct", "works", "updated", "shown properly" are not expected results.
  Say what value, on which field, on which screen, and in the stored record or API response when it matters.
- **Check every surface that shows the value.** If one value appears on a screen, an export, a report and an API, the
  case reads each one (or another case owns each one, named in the description).
- **Check the effect AND the record.** If an action should stop something (assignments, access, notifications),
  assert both that it stopped *and* what was stored (end date, status, flag).
- **The "natural wrong implementation" question.** For each expected result, write down the most likely wrong
  implementation (off-by-one, wrong field, stale value, wrong scope, forgot one entry point). If the step would still
  pass, strengthen it.
- **Derive the expected value from the rule, never from current behaviour.** An expected result copied from what the
  system does today can encode the defect.
- **No observation-only steps.** "Record whether…", "Note what happens", "Check if…" with no outcome cannot fail.
  If the rule is not decided, mark the case Blocked, log the open question, and replace the step with a definite
  expected result when the answer lands.

## P3 — Input checklist for every field and endpoint, spec or not (5 of 42)

Specs rarely describe input handling, yet users hit it first. Apply this list to **every new or changed input**:

| Input type | Always test |
|---|---|
| Date / time | typed by keyboard in the locale's format (day-month vs month-day ambiguity, e.g. 03/04); picker month view, year view and arrows reach the same range; first and last allowed date; a disabled date cannot be typed in |
| Number / amount | 0, negative, decimals, the maximum and maximum + 1, very large; a value inconsistent with a related field (a part larger than its total) |
| Text | empty, whitespace only, maximum length, special characters, right-to-left text |
| Selection | every option per type or role that drives it; options that should NOT appear for a given type; the same list on create and on edit |
| File | exactly the limit, just over the limit, wrong type, the file name after upload and download |
| Search / filter | partial match, a record with an empty name part, duplicates, no result |
| API request | each required field missing, an unknown field, a wrong type, the same write repeated; the response for each refusal (status code and message) |

Spec-silent input behaviour is written on a stated reasonable assumption (tag + `REVISIT:`), never skipped.

## P4 — Lifecycle sequences: chain the actions and check what the earlier ones left (4 of 42)

Each action having its own case is not enough; bugs live in the order.

- For every entity with states (draft, pending, scheduled, active, ended, cancelled…), draw its state diagram in the
  behaviour inventory.
- Write sequence cases for: **create → edit → move (date / owner / scope) → delete / cancel**, and **edit back to the
  original value**.
- After each later step, re-check everything the earlier steps **created as a side effect** (assignments,
  notifications, schedules, derived records, cached values). Leftovers are the bug.
- Include going back in a multi-step wizard after changing an earlier step, and re-reading any count or summary the
  later step shows.

## P5 — Visual comparison case per new screen (4 of 42)

Functional cases do not see layout. For every new or changed screen, modal, card or row type, write **one** design
comparison case: width and spacing against the design, alignment, colour per state (e.g. increase vs decrease,
success vs error), truncation, and **combined indicators** (two badges or icons on one element must both stay visible).
Read the rendered design, not layer names.

## P6 — When a rule changes, sweep the cases, the fixtures and the passed results (3 of 42)

- Tag every case with the decision IDs it depends on, so one filter finds them.
- When a decision lands or changes: update the expected results **and the fixtures** (a fixture built for the old rule
  may never reach the new path), and re-run cases that already passed under the old rule.
- Record the change in the decision log with the cases it touched.

## P7 — Every clause maps to an asserting step, including its implied negative (3 of 42)

- The traceability matrix maps each clause to a **step that asserts it**, not just to a case that mentions the area.
- Every "X is shown / allowed when …" clause brings its implied negative: "X is NOT shown / allowed when …" (e.g. an
  empty state must not appear when only past records exist).

## P8 — Sweep the existing consumers of what the release changes (3 of 42)

- During `/review`, list the data, fields, statuses and endpoints the feature changes; then search the code (or the
  app) for **every existing reader** of them: reports, exports, dashboards, limit checks, summaries, notifications,
  other modules, mobile, integrations.
- Each reader gets at least one regression case, even if no document mentions it.
- Run the suite once on a **brand-new account / tenant** as well as on an established one.

---

## Bug tickets raised from a failing case

- Copy the **exact state and data** of the failing step into the ticket. A ticket that generalises (or picks a
  different example state) lets a partial fix pass verification.
- "Affected TCs" names the case **and the step number that fails**, not every case in the area.

## Gates (add to the project generator)

Fail the build when:

1. **Observation-only step** — any expected result matching `record whether|note (what|whether)|check (if|whether)|observe` without a definite outcome, unless the case is labelled `blocked-<question id>`.
2. **Vague expected result** — any expected result whose only outcome words are generic (`correct(ly)?`, `properly`, `as expected`, `works`, `successfully`, `is updated`) with no value, field or message named.
3. **Data-shape coverage** — any behaviour labelled `rule` whose relevant shapes in `data-variants.md` are not all carried by at least one case label `data-<shape>` (or marked N/A with a reason).
4. **Sequence coverage** — any entity in the behaviour inventory with a state diagram and no sequence case (`seq-<entity>` label).
5. **Visual coverage** — any new screen in the inventory with no `visual-<screen>` case.
6. **Consumer coverage** — any consumer listed in the review's consumer sweep with no regression case.

A reusable implementation of gates 1–2 lives in `scripts/tc-prevention-gates.js`; gates 3–6 compare the suite with the
inventory files and are wired by each project's generator.
