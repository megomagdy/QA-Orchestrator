---
name: unified-qa
description: |
  **Unified QA Engineering Skill** — Master skill for all QA activities on any web/ERP platform. Combines: test case design (test-management import format), live DOM auditing, RBAC enforcement TC generation, module-areas config management, investigation methodology, and cross-validation practices. Use this skill for ANY QA-related task: writing test cases, auditing UI, generating permission tests, investigating epics, cross-validating test suites, or producing test-management import files.
  - MANDATORY TRIGGERS: test case, QA, quality, audit, DOM, permission test, RBAC, enforcement, module areas, test management import, investigation, QC decision, cross-validation, epic, test design
---

# Unified QA Engineering Skill

> **Reusable methodology and standards** for all QA work across the platform under test.
> Project-specific data (epic mappings, QC decisions, statistics) lives in CLAUDE.md — this file covers HOW we work, not WHAT we're working on.

---

## 1. Role & Core Principles

You are an **expert Senior QA Engineer** operating under a **Shift-Left, Risk-Based** testing philosophy.

### 1.1 Guiding Principles

| # | Principle | In Practice |
|---|-----------|-------------|
| 1 | **Investigate before you write** | Never generate test cases from a story title alone. Read PRD, design files, API contracts, and QC decisions first. |
| 2 | **Verify against live DOM** | UI-referencing TCs must be validated against the live app. Ghost elements produce tests that always fail. |
| 3 | **Every test needs a traceable "why"** | Each TC links to ≥ 1 issue tracker story **and** to the requirement clause(s) it proves (traceability matrix: clause → behaviour → case). No orphaned TCs, no clause without a case. |
| 4 | **QC decisions are law** | Confirmed QC decisions override assumptions, PRD ambiguity, and even the design files. |
| 5 | **Negative paths reveal more than happy paths** | Budget ≥ 30% of TCs for negative, boundary, and edge scenarios. |
| 6 | **Data isolation is non-negotiable** (if applicable) | Multi-tenant/RBAC-scoped systems: every data-touching test must verify isolation boundaries. |
| 7 | **Localization is first-class** (if applicable) | Localized UI labels, layout direction (RTL where relevant), localized search, localized validation messages — mandatory coverage for every screen when the product supports multiple languages. |
| 8 | **Incremental delivery** | Always generate delta files for test-management import. Never re-import the entire suite. |
| 9 | **Validation timing matters** | Know WHERE validation fires: at form save, at binding, or at assignment. Getting this wrong produces contradictory expected results. |
| 10 | **Cross-validate everything** | After writing TCs, audit them against ALL references. Contradictions hide in expected results. |

### 1.2 Test Pyramid

| Layer | Target % | What We Test |
|-------|----------|--------------|
| Unit / API contract | 70% | Field validations, business logic, calculation rules, API schemas |
| Integration / E2E flows | 20% | Multi-step workflows, cross-module interactions |
| Exploratory / UI | 10% | Visual regressions, RTL layout, edge-case interactions |

### 1.3 Regulatory Compliance Awareness

Modules touching regulated calculations (e.g., payroll, social insurance contributions, working-time rules, financial reporting, health data — whatever applies in your project's jurisdiction) carry **regulatory risk**:
- Understand the underlying regulation before writing tests
- Flag ambiguity for explicit QC confirmation
- Increase boundary value testing density
- Document the compliance rule each test validates

---

## 2. Investigation Process (MANDATORY)

> **RULE: No test case may be written until investigation is completed.**

### 2.0 Ask Before You Start (MANDATORY FIRST STEP)

Before beginning ANY task — investigation, test writing, cross-validation, or audit — **ask clarifying questions first**. Never jump into work based on assumptions.

Questions to ask before investigating a new epic:
- What are the issue tracker story keys in scope?
- Is there a PRD? Design files (Figma or equivalent)? API spec?
- Are there any known QC decisions or constraints?
- What's the expected output — investigation report, test cases, or both?
- Are there cross-dependencies with other epics or modules?
- Any known areas of ambiguity or risk?

**Why this matters:** A 2-minute question prevents hours of rework. The goal is to understand the full picture before doing any work.

### 2.1 Pre-Test Investigation Checklist

```
□ 1. Read the epic and ALL child stories in the issue tracker
□ 2. Read the PRD (if available — wherever it is hosted)
□ 3. Study design files for all screens in scope
□ 4. Identify the screen type (list, form, wizard, modal, drawer)
□ 5. Map field-to-field dependencies and derived values
□ 6. List all toggles and their sub-field behaviors
□ 7. Identify all search-enabled screens
□ 8. Identify all expandable/collapsible rows (only if confirmed in design files/PRD)
□ 9. Check for QC decisions that apply to this epic
□ 10. Review existing test cases to avoid duplication — and build the behaviour
       inventory: one row per behaviour, variants listed, one owning epic.
       Duplicate = same expected result OR verifies the same thing;
       variants (state/screen/endpoint/persona) are steps in ONE case
□ 11. Verify UI elements via live DOM audit (if accessible)
□ 12. Document open questions before proceeding
```

### 2.2 Investigation Decision Tree

```
START: New epic/story assigned
  │
  ├─→ Step 1: Fetch story details from the issue tracker (summary, description, ACs, attachments)
  │
  ├─→ Step 2: Identify linked artifacts (PRD, design files, API specs)
  │
  ├─→ Step 3: Classify scope by screen type
  │     The screen type determines which test patterns apply.
  │     DO NOT assume patterns — confirm from design files/PRD.
  │
  ├─→ Step 4: Check QC Decisions Log → apply confirmed behaviors
  │
  ├─→ Step 5: Cross-reference with live DOM (qa-dom-audit) if available
  │
  └─→ Step 6: Document findings
        ├─→ Confirmed behaviors → feed into test cases
        ├─→ Open questions → escalate before writing tests
        └─→ Gaps/ambiguities → log in QA Review Report

  ─────── AFTER PRODUCT TEAM ANSWERS ───────

  └─→ Step 7: Re-Investigation Pass (MANDATORY)
        ├─→ Re-read ALL stories with product team answers applied
        ├─→ Re-check design files/PRD for consistency with answers
        ├─→ Re-examine dependencies — do answers change any relationships?
        ├─→ Verify answers don't introduce NEW gaps or contradictions
        ├─→ Update QA Investigation Report with final confirmed behaviors
        └─→ Only declare "Ready for Test Cases" when this pass is clean
```

> **RULE: Getting answers is not enough. You must re-investigate after answers to catch secondary gaps. An answer to Question A may invalidate an assumption behind Behavior B.**

### 2.3 Story Decomposition (SFDP Framework)

For every user story, decompose into testable atoms using:

| Letter | Dimension | Question |
|--------|-----------|----------|
| **S** | State transitions | What states can this entity be in? What triggers transitions? |
| **F** | Field behaviors | What validations apply? Boundaries? Dependencies? |
| **D** | Data interactions | What happens on Create, Read, Update, Delete? |
| **P** | Permission gates | Who can act? What happens when unauthorized? |

### 2.4 Screen Type → Test Pattern Mapping

Use this table to decide which test patterns apply based on what design files/PRD confirms. **Only apply a pattern if the screen actually has the feature.**

| Screen Type | Applicable Patterns (if feature exists in design) |
|-------------|---------------------------------------------------|
| **List/Tab screen** | Search, pagination, expandable rows, empty state, sorting, filtering |
| **Create form** | Field validation, dependency logic, toggle sub-fields, submit/cancel |
| **Edit form** | Pre-population, dirty-state detection, linked-state blocking |
| **Delete action** | Confirmation dialog, linked-state blocking, cascade behavior |
| **Wizard/Stepper** | Step navigation, back-button preservation, conditional steps |
| **Inline create** | Embedded CRUD within parent form, real-time validation |
| **Drawer/Modal** | Open/close behavior, data loading, inline actions |
| **Duplicate flow** | Edit-before-save, rename validation, copied data accuracy |
| **Feature flag** | UI hidden, API blocked, data preserved when disabled |

### 2.5 Acceptance Criteria → Test Case Mapping

Every acceptance criterion must produce **minimum 3 test cases**:

```
AC: "User can [perform action] with [constraint]"
  ├─→ Happy path: Valid input → success
  ├─→ Negative: Violate constraint → error message
  ├─→ Negative: Empty/missing input → validation error
  ├─→ Boundary: At limit → accepted
  ├─→ Boundary: Over limit → rejected
  ├─→ Edge: Unusual input (emoji, special chars) → verify behavior
  └─→ Localization: secondary-language input → accepted, displayed correctly (RTL if applicable)
```

---

## 3. Test Case Design Standards

### 3.0 Pre-Writing Rules (MANDATORY)

**Rule 1: Post-Gap-Closure Alignment**
Test cases are written ONLY after all gaps/questions from the investigation are resolved AND the re-investigation pass (Step 7) is clean. Test cases must reflect the final confirmed behaviors — not the original PRD assumptions that may have been corrected during QA review.

**Rule 2: Cross-Epic Consistency**
Before writing test cases for a new epic, review ALL previous epics' confirmed decisions and test cases. Decisions made in earlier epics are binding unless explicitly overridden by a new QC decision. Examples: if Epic 1 established that a time field is in minutes, every future epic uses minutes. If Epic 2 confirmed last-write-wins for concurrency, Epic 3 doesn't introduce optimistic locking without a QC decision.

**Rule 3: Executable Steps**
Every test step must be written so it can be executed in THREE ways:
1. **Manually by a human tester** — clear enough for someone unfamiliar with the system
2. **By Claude using MCP tools** — specific element names, exact values, verifiable outcomes
3. **By an automation script** — deterministic selectors, wait conditions, assertions

This means: no vague language, no assumed context, exact field names, exact values, exact expected states.

### 3.1 TC ID Convention

```
Format: E{epic#}-{type}-{sequence}

Types:
  P = Positive / Happy Path
  N = Negative / Error Path
  E = Edge Case / Boundary
  S = Security / Permission
  L = Localization / RTL
```

### 3.2 Priority Assignment

| Priority | Criteria |
|----------|----------|
| **P0** | Core business flow, regulatory compliance, data integrity, tenant isolation |
| **P1** | Important validations, common user errors, linked-state blocking |
| **P2** | Edge cases, boundary values, concurrent edit scenarios |
| **P3** | Cosmetic, UX polish, RTL alignment precision |

### 3.3 Writing Effective Test Steps

Steps must reference **actual UI elements confirmed in the design files or live DOM**. Never reference elements you haven't verified exist.

**DO:** Specific, verifiable, referencing real elements
```
✓ "Navigate to [Module] > [Tab name]"
✓ "Click the '[Exact Button Label]' button"
✓ "Enter '[value]' in the [Field Name] field"
✓ "Verify the error message reads '[exact message]'"
```

**DO NOT:** Vague, unverifiable, assuming elements
```
✗ "Go to the page"          → Which page?
✗ "Click Add"               → Which Add button? Does it exist?
✗ "Verify it works"         → What does "works" mean?
✗ "Fill in the form"        → Which fields? What values?
```

### 3.4 Precondition Writing

Preconditions must be **specific and reproducible** — anyone should be able to set up the state:

```
✓ "At least one [Entity] of type '[Type]' exists and is NOT linked to any [other entity]"
✓ "User is logged in as [Role] with [specific permissions]"
✓ "[Entity A] exists and is linked to [Entity B]"

✗ "Data exists"             → What data specifically?
✗ "User is logged in"       → Which role? Which permissions?
✗ "Entity exists"           → What type? What state? Linked or unlinked?
```

### 3.5 Test Design Techniques

Apply in order of priority:

| Technique | When to Apply |
|-----------|---------------|
| **Equivalence Partitioning** | Any input field — divide into valid/invalid classes |
| **Boundary Value Analysis** | Numeric fields, length limits — test at min, min+1, max-1, max, max+1 |
| **Decision Table** | Multiple conditions with combined outcomes |
| **State Transition** | Entities with lifecycle states — map all transitions + invalid transitions |
| **Pairwise / Combinatorial** | Forms with many independent fields — efficient coverage |

### 3.6 Coverage Distribution

A healthy test suite should approximate:

| Test Type | Target % | Red Flag If Below |
|-----------|----------|-------------------|
| Positive (happy path) | 35–45% | < 25% |
| Negative (validation) | 30–40% | < 20% |
| Edge / Boundary | 15–25% | < 10% |
| Security / Permission | 5–10% | 0% |
| Localization | 5–10% | 0% |

---

## 4. Test Management Import Format

> **Customize this section to YOUR test management tool** (Qmetry, TestRail, Zephyr, Xray, Azure Test Plans, ...). The mapping below is a worked EXAMPLE from a production Qmetry setup — replace headers/columns per your tool's import template, and always verify against a real template file (`/init-workspace` stores its location). The multi-row pattern and critical rules apply to most tools.

### 4.1 Example: 25-Column Template (Qmetry-style)

| Col | Header | Content |
|-----|--------|---------|
| 1 | Work Key | Left blank (tool auto-assigns) |
| 2 | Summary | TC summary text (header row only) |
| 3 | Description | TC description (header row only) |
| 4 | Precondition | Precondition text (header row only) |
| 5 | Status | "Draft" (header row only) |
| 6 | Priority | "High" / "Medium" / "Low" / "Critical" (header row only) |
| 7 | Assignee | User Account ID (header row only) |
| 8 | Reporter | User Account ID (header row only) |
| 9 | Estimated Time | (header row only) |
| 10 | Labels | TC label: "Happy", "Negative", "Edge", "Security", "Localization" (header row only) |
| 11 | Components | (header row only) |
| 12 | Sprint | (header row only) |
| 13 | Fix Versions | (header row only) |
| 14 | Step Summary | Step text (step rows only) |
| 15 | Test Data | Test data (FIRST step row only) |
| 16 | Expected Result | Expected result (LAST step row only) |
| 17 | Version | "1.0" (header row only) |
| 18 | Folder | Test tool folder path (header row only) |
| 19 | TestCase Type | "Manual" (header row only) |
| 20 | Created By | User Account ID (header row only) |
| 21 | Created On | (header row only) |
| 22 | Updated By | (header row only) |
| 23 | Updated On | (header row only) |
| 24 | Story Linkages | Comma-separated issue tracker keys (header row only) |
| 25 | Is Shareable Step | (header row only) |

### 4.2 Multi-Row Pattern

```
Row N:   [Header] Summary, Precondition, Priority, Folder, Labels, Story Linkages...
Row N+1: [Step 1] Col14=step text, Col15=test data (first step only)
Row N+2: [Step 2] Col14=step text
Row N+3: [Step 3] Col14=step text, Col16=expected result (last step only)
Row N+4: (blank separator row)
Row N+5: [Next TC Header] ...
```

### 4.3 Critical Rules

- **Test Data** → FIRST step row only (Col15)
- **Expected Result** → LAST step row only (Col16)
- Header rows contain ALL metadata; step rows contain ONLY step details
- A blank row separates each test case
- **Always generate delta files** for incremental import — never re-import existing cases
- Delta/correction files must **copy exact headers, styles, and column widths** from the main file — never hardcode column headers independently

### 4.4 File Naming Convention

| File Type | Pattern |
|-----------|---------|
| Full import | `[TestTool] Import - [Project] Epics {n} & {n}.xlsx` |
| Epic-specific | `[TestTool] Import - [Project] Epic {n}.xlsx` |
| Delta/correction | `[TestTool] Import - CORRECTED Epic {n} [description].xlsx` |
| QA Review | `QA Review - Epic {n} - [Name].md` or `.docx` |

---

## 5. Mandatory Coverage Categories

> Every epic MUST cover ALL applicable categories. Missing coverage is a sign-off blocker.
> **Only apply a category if the screen/feature actually exists in the design.** Do not assume features.

### 5.1 Category Checklist

| # | Category | When Required | What to Verify |
|---|----------|---------------|----------------|
| 1 | **CRUD Happy Paths** | Always | Create, Read, Update, Delete with valid data |
| 2 | **Field Validation** | Always | Empty, whitespace, emoji, max-length, duplicate, invalid types |
| 3 | **Search** | Only if search field exists in design | Full match, partial, no-match, secondary language, case-insensitive, clear |
| 4 | **Expandable Rows** | Only if expandable rows exist in design | Expand, collapse, type-specific content, data refresh after edit |
| 5 | **Field Dependencies** | Only if fields have logical relationships | Derived value accuracy, edit source after setting dependent |
| 6 | **Toggle Sub-Fields** | Only if toggles enable sub-fields | Toggle ON/empty, partial fill, toggle OFF clears values |
| 7 | **Linked-State Blocking** | Only if entities can be referenced by others | Edit/delete blocked, correct error message, unlink then retry |
| 8 | **Pagination & Empty State** | Only if screen has a paginated list | Page navigation, empty state message |
| 9 | **Concurrency** | Always for editable entities | Two users editing simultaneously |
| 10 | **Data Isolation** | If multi-tenant / scoped | Scope A data invisible to Scope B, API-level isolation |
| 11 | **Localization** | If product is multilingual | Localized labels, layout direction (RTL if applicable), localized search, localized error messages |
| 12 | **Inline CRUD** | Only if forms embed entity creation | Inline create/edit/delete within parent context |

### 5.2 Search Patterns (when search exists)

| Pattern | Priority |
|---------|----------|
| Full-name exact match | P1 |
| Partial substring match | P1 |
| No-match → empty state / "No results" | P1 |
| Secondary-language full search | P1 |
| Secondary-language partial search | P2 |
| Case-insensitive | P2 |
| Clear search → full list restored | P1 |

### 5.3 Toggle Patterns (when toggles exist)

| Pattern | Priority |
|---------|----------|
| Toggle ON, all sub-fields empty → validation error | P1 |
| Toggle ON, only first sub-field filled → error for second | P1 |
| Toggle ON, only second sub-field filled → error for first | P1 |
| Toggle OFF → ON → fields cleared/reset | P2 |

### 5.4 Linked-State Blocking Patterns (when linking exists)

| Pattern | Priority |
|---------|----------|
| Edit blocked when linked (hard-block: disabled or error) | P0 |
| Delete blocked when linked | P0 |
| Unlink → retry succeeds | P1 |
| No replacement/migration flow on delete | P1 |

---

## 6. Live DOM Audit Methodology

### 6.1 Purpose

Verify that UI elements referenced in test cases actually exist in the live application. Prevents writing tests against "ghost elements" — buttons, menus, or actions that are documented but not implemented.

### 6.2 When to Use

- Before writing any UI-dependent test case
- After a UI redesign or feature update
- When a test spec/config needs validation against live app
- When test cases reference elements you haven't personally confirmed

### 6.3 Audit Workflow

**Phase 1: Preparation**
1. Confirm a browser-automation tool (Chrome MCP, Playwright, Selenium, etc.) is connected with a valid tab/session ID
2. Identify target URL and log in with the highest-privilege role
3. List all pages to audit

**Phase 2: Page-by-Page Audit**
For each page:
1. Navigate to the page
2. Wait 2-3 seconds for SPA rendering
3. Take a screenshot for visual confirmation
4. Run JavaScript audit to extract actual elements:

```javascript
const audit = {};
audit.headings = Array.from(document.querySelectorAll('h1,h2,h3,h4'))
  .map(h => ({ tag: h.tagName, text: h.textContent.trim() }));
audit.buttons = Array.from(document.querySelectorAll('button:not([hidden])'))
  .filter(b => b.offsetParent !== null)
  .map(b => ({
    text: b.textContent.trim().substring(0, 60),
    ariaLabel: b.getAttribute('aria-label'),
    disabled: b.disabled
  }));
audit.tabs = Array.from(document.querySelectorAll('a[role="tab"], [role="tab"]'))
  .map(t => ({ text: t.textContent.trim(), active: t.classList.contains('active') || t.getAttribute('aria-selected') === 'true' }));
audit.tables = Array.from(document.querySelectorAll('table')).map(t => ({
  headers: Array.from(t.querySelectorAll('th')).map(th => th.textContent.trim()),
  rowCount: t.querySelectorAll('tbody tr').length
}));
JSON.stringify(audit, null, 2);
```

5. For pages with tabs: click each tab, wait, repeat audit
6. Record findings

**Phase 3: Cross-Reference**
Compare actual DOM against spec/test cases. Flag every element that is referenced in tests but not found in DOM.

### 6.4 Common Pitfalls

These are real patterns that produce invalid test cases:

| Pitfall | What Actually Happens |
|---------|----------------------|
| Card-based UI assumed to be a table | Module uses clickable service cards, not data tables with CRUD buttons |
| ⋮ (three-dot) menus assumed to exist | Some layouts don't have row-level action menus even if similar pages do |
| Eye icon assumed to be Edit | Eye icon means View, not Edit |
| Buttons assumed from module name | Module called "Settlements" doesn't necessarily have Add/Edit buttons |
| Tabs without `role="tab"` | Some tabs use styled `<a>` or `<button>` without ARIA roles |
| Empty-state hides buttons | Buttons may only appear when data exists |
| Actions only in detail view | Edit/Delete may only appear after clicking into a record, not on the list page |

---

## 7. RBAC Enforcement TC Generation

### 7.1 Purpose

Generate micro test cases for every role×module×action combination in the permission system.

### 7.2 Generation Logic

```
For each role:
  For each module:
    If role HAS access:
      For each area in module:
        For each action in area:
          → Generate PERMITTED test case
          → Check for overrides (may flip to DENIED)
    If role does NOT have access:
      → Generate single ACCESS DENIED test case
```

### 7.3 ID Format & Priority

- **ID:** `TC-ENF-XXXX` — zero-padded sequential across all roles
- **P0:** Standard enforcement (PERMITTED or module DENIED)
- **P1:** Override cases (action DENIED despite module access)

### 7.4 ACCESS DENIED Test Pattern

When a role cannot access a module, verify:
1. Module NOT visible in sidebar navigation
2. Direct URL navigation → redirect to home or 403
3. No data from this module accessible via API

### 7.5 Critical Rule

**Actions array must ONLY contain DOM-verified actions.** Never include speculative actions. If unsure, run DOM audit first.

---

## 8. Module Areas Config Management

### 8.1 Purpose

Manages the `module-areas` configuration file (e.g. `module-areas.ts`) — the single source of truth mapping every module to its UI areas, CRUD actions, and CSS selectors. Drives both your automated enforcement tests (Playwright, Cypress, Selenium, etc.) and TC generators.

### 8.2 Golden Rules

1. **Actions must be DOM-verified** — never add an action without live DOM confirmation
2. **Selectors must match real elements** — confirmed via screenshot or JS audit
3. **Remove selectors when removing actions** — keep arrays and selectors in sync
4. **Keep related files in sync** — config, generator scripts, and output files
5. **Comment discrepancies** — add JSDoc explaining what audit found vs what was expected

### 8.3 Update Checklist

When updating module config:
- □ Run DOM audit on affected modules first
- □ Update `actions` arrays to match verified DOM
- □ Update selectors to match actual CSS
- □ Remove selectors for removed actions
- □ Update JSDoc comment for the module
- □ Update TC generator module data
- □ Regenerate output files
- □ Verify TC count changes make sense

---

## 9. Quality Gates

### 9.1 Gate Checklist (ALL must pass before sign-off)

**GATE 1: Investigation Completeness**
- □ All issue tracker stories in scope read
- □ PRD and design files reviewed
- □ QC decisions applied
- □ Open questions resolved or deferred

**GATE 2: Coverage Completeness**
- □ All applicable categories from Section 5.1 addressed (only those confirmed in design)
- □ Every AC has ≥ 3 test cases
- □ Negative TCs ≥ 30% of suite
- □ Localization tests included (if the product is multilingual)

**GATE 3: Test Case Quality**
- □ Every TC has unique ID following convention
- □ Every TC has valid story linkage
- □ Steps reference actual, verified UI elements
- □ Expected results are observable and measurable
- □ Preconditions are specific and reproducible

**GATE 4: Traceability**
- □ Story linkage distribution is logical
- □ No story has zero TCs (unless explicitly out of scope)
- □ QC decisions traceable in expected results

**GATE 5: DOM Verification** (when live app is accessible)
- □ UI-referencing TCs verified against live DOM
- □ Ghost elements flagged and removed
- □ Discrepancies documented

**GATE 6: Import Readiness**
- □ Import file follows your test tool's template format exactly
- □ Multi-row pattern correct
- □ Delta file generated for incremental import

**GATE 7: Cross-Validation**
- □ All expected results verified against QC decisions
- □ No contradictions in expected results
- □ Validation timing correct per QC decisions
- □ Linked-state blocking consistently applied

### 9.2 Story Linkage Rules

| Rule | How to Check |
|------|-------------|
| Every TC links to ≥ 1 story | Scan linkage column for blanks |
| List/Tab TCs → List story | Search/pagination TCs map to list-view story |
| Form/Create TCs → Form story | Validation/save TCs map to form story |
| Cross-cutting TCs → Multiple stories | TCs spanning views link to all relevant stories |
| No story has zero TCs | Count TCs per story, investigate any 0s |

---

## 10. Lessons Learned & Hard-Won Rules

> These rules were discovered through actual mistakes. They are non-obvious and critical.

### 10.1 Validation Timing Contradictions

**The concept:** When a QC decision says validation happens at a **later stage** (e.g., "at binding" rather than "at creation"), the expected result at the earlier stage must say the action **succeeds**. The error only surfaces at the later stage.

**The mistake pattern:** Writing "Per QC: validation at [later stage]" and then "Action blocked" in the same expected result. If validation is deferred, the current action passes — it's not blocked here.

**The rule:** Always ask: "WHERE does this validation fire?" Then make sure the expected result matches that location, not an earlier one.

### 10.2 Linked-State Blocking Is Absolute

**The concept:** When QC confirms entities are "hard-blocked" when linked, this means ALL modifications are blocked — not just delete, but also rename, field edits, partial updates. Everything.

**The mistake pattern:** Writing a TC that expects renaming or editing a field on an entity that is linked to another entity.

**The rule:** If an entity is linked and the QC says "hard-blocked," no test case should expect any edit to succeed. Check every TC that touches a linked entity.

### 10.3 Delta Files Must Match Source Template Exactly

**The concept:** Test-management import files have a specific structure. Delta/correction files must use the identical column order, headers, and formatting.

**The mistake pattern:** Generating a delta file with programmatic column names (e.g., `testcase_summary`) instead of the actual headers from the main file (e.g., `Summary`).

**The rule:** When generating any delta or correction file, always **read the main file first** and copy its exact headers, styles, and column widths. Never hardcode column names independently.

### 10.4 Don't Assume UI Features — Confirm Them

**The concept:** Just because a pattern is common (e.g., expandable rows, search fields, three-dot menus) doesn't mean it exists on every screen. Only write tests for features confirmed in the design files, PRD, or live DOM.

**The mistake pattern:** Applying "expandable row" test patterns to a list screen where the design doesn't show expandable rows. Or assuming a search field exists because similar screens have one.

**The rule:** Before applying any coverage pattern from Section 5, confirm the feature exists in the design source. If the design files don't show it, the PRD doesn't mention it, and DOM audit doesn't find it — don't test for it.

### 10.5 Snapshot vs Live-Fetch Architecture

**The concept:** In systems where entities reference other entities, data can be stored as either a **snapshot** (frozen copy at save time) or a **live reference** (fetched fresh on display).

**Key implications for test design:**
- **Snapshot data** is independent of the source — editing or deleting the source has no effect on the snapshot until the next save
- **Live-fetched data** always reflects current state — but is safe only if the source is protected from changes (e.g., hard-blocked when linked)
- **Re-snapshot** triggers need to be understood: does it happen on every save, or only when data changes?

**The rule:** For every entity-to-entity relationship, determine: is it snapshot or live-fetch? Then design tests accordingly.

### 10.6 Cross-Validation Is Not Optional

**The concept:** After generating any batch of test cases, systematically verify every expected result against the reference materials.

**The method:**
1. Extract all expected results from the generated TCs
2. Compare each against the relevant QC decision or PRD rule
3. Flag any contradiction between the stated rule and the expected behavior
4. Verify validation timing matches QC decisions
5. Verify linked-state blocking is consistently applied

**Why this matters:** In practice, ~4% of generated test cases contained contradictions that would have been shipped without cross-validation. The errors are subtle — correct QC reference cited, but wrong conclusion drawn from it.

### 10.7 Ghost UI Elements Are Common

**The concept:** Documentation, specs, and even the design files can reference UI elements that don't exist in the actual app. Test cases written against ghost elements always fail and erode trust.

**Common ghost patterns:**
- "Add" button assumed from module name but never implemented
- "Edit/Delete" in spec but only "View" exists
- Three-dot menus assumed but not present
- Table-based spec for a card-based interface

**The rule:** Run a DOM audit (Section 6) before finalizing any UI-dependent test case. If you can't access the live app, explicitly note which elements are unverified.

---

## 11. Output Templates

### 11.1 QA Investigation Report

```markdown
## QA Investigation Report — [Epic/Feature Name]

### Scope
- Stories: [issue tracker keys]
- Screens: [names and types]
- PRD: [link]
- Design files (Figma/Sketch/XD/etc.): [link]

### Confirmed Behaviors
| # | Behavior | Source | QC Ref |
|---|----------|--------|--------|

### Field Dependencies
| Source Field(s) | Dependent Field | Relationship |
|-----------------|-----------------|-------------|

### Toggles & Sub-Fields
| Toggle | Sub-Fields When ON | Required? |
|--------|-------------------|-----------|

### Open Questions (Block Test Writing Until Resolved)
| # | Question | Status | Resolved As |
|---|----------|--------|-------------|

### DOM Audit Results (If Applicable)
| Screen | Expected Elements | Actual Elements | Discrepancies |
|--------|------------------|-----------------|---------------|
```

### 11.2 Defect Report

```markdown
## BUG-{ID}: {Title}
**Severity:** Blocker / Critical / Major / Minor
**Priority:** P0 / P1 / P2 / P3
**Environment:** {browser, OS, tenant}
**Linked TC:** {TC ID}

### Steps to Reproduce:
1. {specific step}

### Expected: {what should happen}
### Actual: {what actually happens}
### Evidence: {screenshot/console/network}
```

### 11.3 QA Review Report

```markdown
# QA Review Report — [Epic/Feature Name]
**Date:** [date]
**Reviewer:** [name]
**Stories:** [comma-separated keys]

## Findings Summary
| # | Finding | Severity | Status |
|---|---------|----------|--------|

## Open Questions
| # | Question | Raised To | Answer |
|---|----------|-----------|--------|

## QC Decisions Applied
| QC # | Decision | Impact on Test Cases |
|------|----------|---------------------|

## Test Coverage Summary
| Story | TC Count | Positive | Negative | Edge |
|-------|----------|----------|----------|------|
```
