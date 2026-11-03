---
name: write-tests
description: Generate comprehensive test cases covering all categories (happy, negative, boundary, edge, security, accessibility, localization). Outputs both Markdown and a test-management-importable Excel file matching your tool's template. Use after /review is complete and all blocking questions are answered.
---

# Write Test Cases — $ARGUMENTS

Generate comprehensive test cases following SFDP framework and strict QA methodology.

Read `qa-rules-condensed.md` from the project root for condensed QA rules.

## Prerequisites (MANDATORY)
Before writing ANY test case:
1. [ ] `/review` completed for this feature?
2. [ ] ALL blocking questions answered by product?
3. [ ] Re-investigation done after answers received?
4. [ ] Foundational Rules Registry checked for cross-epic constraints?
5. [ ] Design exports resized to a readable size? (if the product has design specs and any export exceeds ~1800px)

If ANY is missing, STOP and inform the user.

**Design exports:** If your design tool's exports (Figma, Sketch, Adobe XD, Zeplin, screenshots, ...) are images too large to read reliably (e.g. >1800px in any dimension), resize them to ≤1800px FIRST before reading — oversized exports lose text and element detail. Save resized versions in a `resized/` subfolder.

**Test Tool Template:** If a test-management import template (e.g., `test-import-template.xlsx` / `.csv`, or whatever `/init-workspace` registered) exists in the project root, read it FIRST and match its exact column order, headers, and multi-row pattern.

## TC Design Process

### Step 1: Read Cache or Source Documents
Check for `cache-[feature]-investigation.md` first. If it exists, use it instead of re-reading all source documents. Only read originals for details not in cache.

### Step 2: SFDP Decomposition per Story
For each story, decompose into: **S**tates, **F**ields, **D**ata interactions, **P**ermission gates. Each dimension generates test cases.

### Step 2a: Requirement Clause Inventory — no missed cases by design (MANDATORY, before writing any case)
Missed cases happen when writers are given **areas** ("the admin panel") instead of **requirements**. Before any case is written, break every source into atomic testable clauses and write `traceability-matrix.md`:
- every PRD / story bullet, every table row (status tables, error-code tables, permission-matrix rows, "when X happens" lists), every state-matrix cell (state × screen × persona), every UI copy string;
- every design-only element seen in the rendered frames (design states, helper texts, tooltips, empty states);
- implied cross-cutting areas: permissions for every role on every new control, API-level enforcement of every write, concurrency / two tabs, session expiry, empty or missing data, long values, date / time / timezone formats, regression of existing behaviour the feature touches, downstream consumers of changed data;
- every product decision (QC-ID) and every assumption;
- **when the feature replaces or changes existing behaviour and the code is available: every branch of the current implementation** (each `if` / guard / refusal / fallback in the code being replaced). Branches no document states are still behaviour users rely on today, and each becomes a clause (covered, or explicitly superseded).

Columns: `C-ID | Clause | Source (§ / QC / design frame / code branch / implied) | B-ID(s) | Case ID(s) | Status`. Status is **covered**, **out of scope (cite the Out-of-Scope list)**, **deferred (reason)** or **superseded (by <decision>)** for a clause a later decision replaced (name the decision; the replacing decision's own clause carries the case). "Not covered" is not an allowed status. A spec-silent clause is covered on a stated reasonable assumption (tag + `REVISIT:`).

Each clause maps to a behaviour (Step 2b), and each behaviour to exactly one case. So the chain **clause → behaviour → case** is complete before writing starts, and it's what the agents receive.

### Step 2b: Behaviour Inventory — no duplicates by design (MANDATORY, before writing any case)
**Duplicate definition:** two or more cases that have the **same expected result** OR **verify the same thing** are duplicates. That includes:
- status/state variants of one rule (Pending / Suspended / Deleted blocked the same way);
- the same rule on several screens or entry points (client dialog, onboarding, admin);
- endpoint or persona variants of one rule (Change API and Clear API both 403 for a lower role);
- any case whose assertions are all contained in another case (subset).

**Build the inventory first.** Write `behaviour-inventory.md`: one row per **behaviour** (one rule or one observable outcome), with columns `B-ID | Behaviour | Variants (states / screens / inputs / personas) | Owning epic | Source (§ / QC / assumption)`. Then:
1. **One behaviour = one case.** Variants become steps (each with its own data and expected result) inside that single case, never separate cases.
2. **Each behaviour has exactly one owning epic.** Other epics reference it; they do not re-test it. Repeated setup or navigation steps are fine; repeated **assertions** are not.
3. **Keep separate** (not duplicates): UI vs API/backend enforcement of the same rule; opposite outcomes (block vs allow, locks vs doesn't lock); Verify-time vs Save-time validation; screens with genuinely different designs or outputs.
4. Every case carries its `B-ID` (e.g. in Labels) so the generator can assert uniqueness.
5. Spec-silent behaviours still get a row and a case on a stated assumption (tag + `REVISIT:`), never a silent gap.

**Agents get behaviours, not areas.** When parallelising, hand each writer an explicit list of B-IDs. Two writers never receive the same B-ID.

### Step 2c: Defect-Prevention Pass (MANDATORY, every feature, before writing any case)
Apply [defect-prevention.md](defect-prevention.md) to the inventory. It applies to every feature, not only to features that move money. Most escaped bugs sit in an area a case already covered but were missed by its **data** or its **assertion**, so this pass shapes how each case is written:
- **P1 Data shapes** — write `data-variants.md` (time, lifecycle position, cardinality incl. duplicate "unique" values, empty optional fields, every entry point incl. pre-release data, brand-new account, content, volume, co-existing states) and mark each shape relevant or N/A per rule-bearing behaviour. Relevant shapes become steps with a `data-<shape>` label.
- **P2 Assertion strength** — exact value + where it lives + every surface that shows it; effect AND stored record; the "natural wrong implementation" must fail the step; expected values come from the rule, never from current behaviour; no observation-only steps.
- **P3 Input checklist** — every new or changed field and endpoint gets the per-type list (typed dates in the locale format, picker views, 0 / max / max+1, part larger than total, file at the limit, search with an empty name part, API missing / unknown / wrong-type fields), spec or not.
- **P4 Lifecycle sequences** — a state diagram per entity with states, and sequence cases (create → edit → move → delete, edit back) that re-check what earlier steps created.
- **P5 Visual** — one design-comparison case per new screen / modal / row type, incl. colour per state and combined indicators.
- **P6 Decision sweep** — tag cases with the decision IDs they depend on; a new or changed decision updates expected results AND fixtures and re-runs passed cases.
- **P7 Asserting step + implied negative** for every clause.
- **P8 Consumer sweep** — one regression case per existing reader of the changed data (from `/review`), and one run on a brand-new account / tenant.

### Step 3: Apply Coverage Requirements
- Happy path: 15% | Positive: 10% | Negative: 20% | Boundary: 10%
- Edge: 10% | Integration: 10% | Auth: 10% | Localization: 5%
- Accessibility: 5% | Security: 5%
- **Negative paths MUST be ≥ 30% of total**

### Step 4: TC Format
TC ID: `E{epic#}-{type}-{seq}` — Types: P=Positive (incl. Happy), N=Negative, E=Edge (incl. Boundary), I=Integration, S=Security, L=Localization, A=Accessibility. Boundary and Edge share `E`, so the true category lives in a `[Category]` prefix on the Summary; count coverage on the prefix, not the letter.

**Story linkage for cross-story cases:** when a case proves clauses from more than one story (e.g. after a cross-story merge), put **every** story key in Story Linkages and add an `also-<KEY>` label for each non-primary story, so filtering by either story finds it.

**Final expected result names its own outcome.** The last expected result must state the observable outcome that distinguishes this case (what was blocked / allowed / stored / shown, with the value), not a generic ending ("the date is accepted", "it works"). Two cases with opposite outcomes must never end in the same sentence.

### Step 5: Self-Validation
See [validation-checklist.md](validation-checklist.md) for the full self-validation checklist.

## Agent Orchestration
- **Small scope (< 5 stories):** Write directly in main context, no agents.
- **Large scope (5+ stories):** Build the behaviour inventory (Step 2b) in main context FIRST, then spawn tc-writer agents with disjoint B-ID lists for parallel generation. Also spawn security-scanner and a11y-auditor for specialized TCs (skip any category the project has removed). After agents return, merge all TCs and run self-validation in main context. The duplicate gate (below) must pass before output.

## Coverage Gate (generator / final check)
Before writing the outputs, fail the build if:
- any clause in `traceability-matrix.md` has no case ID and isn't marked out of scope, deferred (with a reason) or superseded (naming the decision);
- any case ID in the matrix doesn't exist (dangling), or any case isn't referenced by at least one clause (orphan, so it has no requirement);
- any B-ID in the behaviour inventory has no case.

**Agents must return their misses explicitly.** Each writer returns, with its cases, the list of its assigned clauses or behaviours that it did NOT cover and why. That list must be empty or carry an out-of-scope or deferred reason. A writer never leaves a spec-silent behaviour out: it writes the case on a stated assumption. The orchestrator re-runs the coverage gate after merging all agents' output, because agents can't see each other's gaps.

## Duplicate Gate (generator / final check)
Before writing the outputs, fail the build if:
- two cases share a `B-ID`;
- two cases have an identical final expected result (excluding pure navigation/setup steps);
- a pair of cases has a high summary+scope similarity (e.g. token Jaccard ≥ 0.45) and is not on an explicit "kept separate, reason: …" allow-list.

**The lexical checks are a tripwire, not the review.** A **reading pass is mandatory**: group the cases by behaviour (B-ID or owning rule) and read every case in each group against the duplicate definition. On a real suite the similarity gate flagged 65 pairs while a reading pass found 210 duplicates, because duplicates reworded per state or screen rarely look alike. Passing the gate without the reading pass does not count as "no duplicates".

## Defect-Prevention Gates (generator / final check)
Fail the build on the six gates in [defect-prevention.md](defect-prevention.md#gates-add-to-the-project-generator): observation-only steps, vague expected results, uncovered relevant data shapes, entities with no sequence case, new screens with no visual case, consumers with no regression case. Gates 1–2 are implemented in `scripts/tc-prevention-gates.js` (global folder); require it from the project generator.

**Merging after the fact is the fallback, not the process:** it costs a full re-read of the suite and leaves long cases. If you must merge, do the **trims in the same pass**: when two cases overlap only partly, remove the repeated assertions from the non-owning case while you merge, not as a later step (a separate trim pass caused 88 extra edits and two more merges after the fact).

## Output — Two Files
### File 1: Markdown — Readable tables grouped by epic/story.
### File 2: Test-tool import file (spreadsheet or CSV, per your tool) — See [excel-output.md](excel-output.md) for the import format rules (worked example: a 25-column template; adapt to your tool's real template).

## Rules
- NEVER write TCs for unconfirmed UI elements (check design files/DOM first)
- EVERY expected result MUST match QC decisions
- EVERY TC links to ≥ 1 issue tracker story
- Validation timing must be correct (WHERE does validation fire?)
- The final expected result of every TC names the distinguishing outcome (Step 4)
- Every feature gets the Defect-Prevention Pass (Step 2c) — data shapes, assertion strength, input checklist, sequences, visual, decision sweep, implied negatives, consumer sweep
