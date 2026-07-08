# {PROJECT_NAME} — QA & Test Design Playbook

> **Single Source of Truth** for testing standards, investigation methodology, and quality assurance across {PROJECT_DESCRIPTION}.
> Authored by: {QA_LEAD_NAME}, {QA_LEAD_TITLE} · Maintained by: Claude AI Assistant

---

## Table of Contents

1. [Testing Philosophy & Principles](#1-testing-philosophy--principles)
2. [Investigation Process (MANDATORY BEFORE TEST WRITING)](#2-investigation-process-mandatory-before-test-writing)
3. [User Story Analysis Framework](#3-user-story-analysis-framework)
4. [Test Case Design Standards](#4-test-case-design-standards)
5. [Mandatory Test Coverage Matrix](#5-mandatory-test-coverage-matrix)
6. [Advanced Testing Heuristics](#6-advanced-testing-heuristics)
7. [Quality Gates Before Test Sign-off](#7-quality-gates-before-test-sign-off)
8. [Output Format Requirements](#8-output-format-requirements)
9. [Project Reference Data](#9-project-reference-data)
10. [Dashboard Auto-Refresh Rule](#10-dashboard-auto-refresh-rule)
11. [Continuous Learning & Documentation Rule](#11-continuous-learning--documentation-rule)

---

## 1. Testing Philosophy & Principles

### 1.1 Core Mindset

This project operates under a **Shift-Left, Risk-Based** testing philosophy. Every test case must justify its existence by mapping to a real user workflow, a confirmed business rule, or a known defect pattern. We do not write tests for the sake of coverage numbers — we write tests that catch defects that matter.

### 1.2 Guiding Principles

| # | Principle | What It Means in Practice |
|---|-----------|---------------------------|
| 1 | **Investigate before you write** | Never generate test cases from a story title alone. Read the PRD, study the design files, examine the API contract, and review QC decisions before writing a single test. |
| 2 | **Verify against live DOM** | UI-referencing test cases must be validated against the live application. Ghost elements (buttons, menus, icons that don't actually exist) produce test cases that always fail and erode trust in the suite. Use the `qa-dom-audit` methodology before finalizing any UI-dependent test. |
| 3 | **Every test needs a traceable "why"** | Each test case links to at least one issue tracker story. If you cannot identify which story a test validates, the test is either misplaced or unnecessary. |
| 4 | **QC decisions are law** | When a QC (Quality Clarification) decision has been confirmed, it overrides assumptions, PRD ambiguity, and even design files. Test cases must align with QC decisions exactly. |
| 5 | **Negative paths reveal more than happy paths** | Budget at least 30% of test cases for negative, boundary, and edge scenarios. Real defects hide in what happens when users do the unexpected. |
| 6 | **{ARCHITECTURE_PRINCIPLE}** | {ARCHITECTURE_PRINCIPLE_DESCRIPTION} |
| 7 | **{QUALITY_PRINCIPLE}** | {QUALITY_PRINCIPLE_DESCRIPTION} |
| 8 | **Incremental delivery, atomic imports** | Test cases are delivered in importable batches. Never re-import the entire suite when adding new cases — generate delta files for incremental import. |

> **Customization Note — Principles 6 & 7:**
> - **Principle 6** — Choose the most critical architectural concern for your project:
>   - Multi-tenant? → "Multi-tenancy is non-negotiable" — Every data-touching test must consider tenant isolation
>   - Role-based access? → "Data isolation by role is non-negotiable" — Every query must respect RBAC boundaries
>   - API-first? → "API contract integrity is non-negotiable" — Every endpoint must match its documented schema
> - **Principle 7** — Choose the most critical quality concern for your project:
>   - Localized UI? → "Localization is a first-class concern" — All supported languages, layout directions, and localized validations are mandatory coverage
>   - Accessibility? → "Accessibility is a first-class concern" — WCAG 2.1 AA compliance, screen reader testing, and keyboard navigation are mandatory
>   - Responsive design? → "Responsive design is a first-class concern" — All breakpoints, orientations, and device classes are mandatory coverage
>   - Offline mode? → "Offline resilience is a first-class concern" — Sync, conflict resolution, and degraded-mode behaviors are mandatory coverage

### 1.3 Test Pyramid Allocation

| Layer | Target % | What We Test |
|-------|----------|--------------|
| Unit / API contract | 70% | Field validations, business logic, calculation rules, API request/response schemas |
| Integration / E2E flows | 20% | Multi-step workflows (Create → Edit → Link → Block Delete), cross-module interactions |
| Exploratory / UI | 10% | Visual regressions, layout correctness, edge-case interactions, usability |

### 1.4 Regulatory / Compliance Awareness

<!--
  INSTRUCTIONS: Replace the content below with your project's compliance concerns.
  If your project has no regulatory requirements, replace this section with:
  "This project has no direct regulatory compliance requirements. Standard quality practices apply."
-->

{COMPLIANCE_DESCRIPTION}. When designing tests for these areas:

- Understand the underlying regulation before writing
- Flag any ambiguity for explicit QC confirmation
- Increase boundary value testing density
- Document the compliance rule each test validates

---

## 2. Investigation Process (MANDATORY BEFORE TEST WRITING)

> **RULE: No test case may be written until all investigation steps below are completed. Skipping investigation produces shallow, duplicate, or incorrect tests.**

### 2.1 Investigation Checklist

Use this checklist for every epic/story before writing test cases:

```
┌─────────────────────────────────────────────────────────────┐
│              PRE-TEST INVESTIGATION CHECKLIST                │
├─────────────────────────────────────────────────────────────┤
│ □ 1. Read the epic and ALL child stories                    │
│ □ 2. Read the PRD (if available)                            │
│ □ 3. Study design files for all screens in scope            │
│ □ 4. Identify the screen type (list, form, wizard, modal)   │
│ □ 5. Map field-to-field dependencies and derived values      │
│ □ 6. List all toggles and their sub-field behaviors          │
│ □ 7. Identify all search-enabled screens                    │
│ □ 8. Identify all expandable/collapsible rows               │
│ □ 9. Check for QC decisions that apply to this epic          │
│ □ 10. Review existing test cases to avoid duplication        │
│ □ 11. Validate premises against foundational rules           │
│      (cross-reference constraints from other epics)         │
│ □ 12. Verify UI elements via live DOM audit (if available)   │
│ □ 13. Document open questions before proceeding              │
│ □ 14. Cross-reference PRD against stories and design files   │
│      (three-way comparison for conflicts and gaps)           │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Investigation Workflow (Decision Tree)

```
START: New epic/story assigned for QA review
  │
  ├─→ Step 1: Fetch story details from issue tracker
  │     └─→ Read summary, description, acceptance criteria, attachments
  │
  ├─→ Step 2: Identify linked artifacts
  │     ├─→ PRD available? → Read it
  │     ├─→ Design files? → Study all screens and states
  │     └─→ API specs? → Review request/response contracts
  │
  ├─→ Step 3: Classify the scope
  │     ├─→ List/Tab screen? → Apply search + expandable + pagination patterns
  │     ├─→ Create/Edit form? → Apply field dependency + partial entry + validation patterns
  │     ├─→ Multi-step wizard? → Map step transitions and back-navigation behavior
  │     └─→ Inline editing? → Apply concurrent edit + save/cancel patterns
  │
  ├─→ Step 4: Check QC Decisions Log
  │     └─→ Filter QC decisions by epic/module → Apply confirmed behaviors to test design
  │
  ├─→ Step 5: Cross-reference with live DOM (when accessible)
  │     └─→ Run qa-dom-audit → Flag ghost elements → Adjust test spec
  │
  └─→ Step 6: Document findings
        ├─→ Confirmed behaviors → Feed into test cases
        ├─→ Open questions → Escalate for QC decision before writing tests
        └─→ Gaps/ambiguities → Log in QA Review Report
```

### 2.3 Premise Validation Rule (MANDATORY)

> **RULE: Every open question or test case premise MUST be validated against foundational system rules established in other epics/stories before it is accepted.**

When investigating a later epic, do NOT treat it in isolation. Cross-reference every assumption against constraints already confirmed in earlier epics. A question whose premise violates a confirmed system rule is invalid and wastes the product team's time.

**Foundational Rules Registry (update as rules are confirmed):**

| Rule ID | Rule | Source | Impact |
|---------|------|--------|--------|
| FR-001 | {RULE_DESCRIPTION} | {STORY_KEY} ({CONTEXT}) | {IMPACT_DESCRIPTION} |
| FR-002 | | | |
| FR-003 | | | |

<!-- Add foundational rules as they are discovered during investigation. These are system-wide constraints
     that affect multiple epics — e.g., "only one active X per user", "data is frozen at submission time",
     "approval is sequential not parallel". -->

**Validation Process:**
1. Before finalizing any question or test case, state its underlying premise explicitly
2. Check the premise against every entry in the Foundational Rules Registry
3. If the premise contradicts a foundational rule, the question/TC is **invalid** — discard it
4. If the premise depends on a rule that is ambiguous or unconfirmed, escalate as an open question about the **rule itself**, not the downstream scenario

### 2.4 Investigation Output Template

Every investigation must produce a structured output before test writing begins:

```markdown
## QA Investigation Report — [Epic Name]

### Scope
- Stories in scope: [list issue keys]
- Screens: [list screen names and types]
- Design files: [links]
- PRD: [links]

### Confirmed Behaviors
| # | Behavior | Source | QC Ref |
|---|----------|--------|--------|
| 1 | [confirmed behavior description] | [PRD / Design / QC Decision Log] | [QC #N] |

### Field Dependencies
| Source Field(s) | Dependent Field | Relationship | Auto-Recalculate? |
|-----------------|-----------------|-------------|-------------------|
| [source field(s)] | [dependent field] | [relationship type] | [Yes/No] |

### Toggles & Sub-Fields
| Toggle | Sub-Fields When ON | Required? |
|--------|-------------------|-----------|
| [toggle name] | [sub-fields list] | [requirement details] |

### Open Questions (Block Test Writing Until Resolved)
| # | Question | Status | Resolved As |
|---|----------|--------|-------------|
| 1 | [question] | OPEN / RESOLVED | [answer if resolved] |

### DOM Audit Results (If Applicable)
| Screen | Expected Elements | Actual Elements | Discrepancies |
|--------|------------------|-----------------|---------------|
| [screen] | [from spec] | [from audit] | [differences] |
```

---

## 3. User Story Analysis Framework

### 3.1 Story Decomposition Method

Every user story must be decomposed into testable atoms using the **SFDP Framework**:

| Letter | Dimension | Question to Ask |
|--------|-----------|-----------------|
| **S** | State transitions | What states can this entity be in? What triggers transitions? |
| **F** | Field behaviors | What validations apply? What are the boundaries? What are the dependencies? |
| **D** | Data interactions | What happens on Create, Read, Update, Delete? What's the list behavior? |
| **P** | Permission gates | Who can perform this action? What happens when unauthorized? |

### 3.2 Story Classification Matrix

| Story Type | Primary Test Patterns | Coverage Focus |
|------------|----------------------|----------------|
| **List/Tab screen** | Search, pagination, expandable rows, empty state, sorting, filtering | Data display accuracy, search completeness |
| **Create form** | Field validation, dependency logic, toggle sub-fields, submit/cancel | Input validation, error messages, saved data accuracy |
| **Edit form** | Pre-population, dirty-state detection, linked-state blocking | Data integrity, concurrency, edit restrictions |
| **Delete action** | Confirmation dialog, linked-state blocking, cascade behavior | Referential integrity, error messages |
| **Wizard/Stepper** | Step navigation, back-button preservation, conditional steps | State persistence across steps, validation per step |
| **Inline CRUD** | Inline create within parent form, real-time validation, summary display | Embedded CRUD within parent context |
| **Dashboard/Report** | Data aggregation accuracy, filter combinations, export functionality | Calculation correctness, filter logic |
| **Settings/Config** | Toggle behaviors, dependency chains, default values, reset functionality | Configuration persistence, cascading effects |

### 3.3 Acceptance Criteria → Test Case Mapping

For each acceptance criterion in a story:

```
AC: "User can create a new {ENTITY} with a unique name"
  │
  ├─→ Happy path: Create with valid unique name → success
  ├─→ Negative: Create with duplicate name → error message
  ├─→ Negative: Create with empty name → validation error
  ├─→ Boundary: Create with max-length name → accepted
  ├─→ Boundary: Create with max-length + 1 → rejected
  ├─→ Edge: Create with special characters in name → [verify behavior]
  ├─→ Edge: Create with whitespace-only name → validation error
  └─→ Localization: Create with localized name → accepted, displayed correctly
```

**Rule**: Every acceptance criterion must produce a minimum of 3 test cases (happy path + at least 2 negative/boundary/edge).

---

## 4. Test Case Design Standards

### 4.1 Test Case ID Convention

```
Format: E{epic#}-{type}-{sequence}

Types:
  P  = Positive / Happy Path
  N  = Negative / Error Path
  E  = Edge Case / Boundary
  S  = Security / Permission
  L  = Localization / Layout

Examples:
  E1-P-001  → Epic 1, first positive test case
  E2-N-005  → Epic 2, fifth negative test case
  E1-E-003  → Epic 1, third edge case
```

### 4.2 Test Case Template

Every test case must include these fields:

| Field | Required | Description |
|-------|----------|-------------|
| TC ID | Yes | Unique identifier following the convention above |
| Summary | Yes | One-line description (what is being tested) |
| Precondition | Yes | Required state before test execution |
| Priority | Yes | P0 (critical), P1 (high), P2 (medium), P3 (low) |
| Story Linkage | Yes | Comma-separated issue tracker keys |
| Folder | Yes | Organizational path in test management tool |
| Steps | Yes | Numbered, specific actions (reference actual UI elements) |
| Test Data | Conditional | Required on the first step row if test-specific data is needed |
| Expected Result | Yes | Observable outcome on the last step row |

### 4.3 Writing Effective Test Steps

**DO:**
```
✓ "Navigate to {MODULE} > {SCREEN} tab"
✓ "Click the '{ACTION_BUTTON}' button"
✓ "Enter '{SAMPLE_VALUE}' in the {FIELD_NAME} field"
✓ "Verify the error message reads '{EXPECTED_ERROR_MESSAGE}'"
✓ "Verify the row expands to show {EXPECTED_EXPANDED_FIELDS}"
```

**DO NOT:**
```
✗ "Go to the page"          → Which page?
✗ "Click Add"               → Which Add button?
✗ "Verify it works"         → What does "works" mean?
✗ "Check the error"         → What error? What message?
✗ "Fill in the form"        → Which fields? What values?
```

### 4.4 Priority Assignment Rules

| Priority | When to Assign | Examples |
|----------|---------------|----------|
| **P0** | Core business flow, regulatory compliance, data integrity | CRUD happy paths, calculation accuracy, data isolation |
| **P1** | Important validations, common user errors | Required field validation, duplicate detection, linked-state blocking |
| **P2** | Edge cases, boundary values, uncommon paths | Special characters in fields, max-length boundaries, concurrent edit |
| **P3** | Cosmetic, UX polish, rare scenarios | Layout alignment precision, tooltip text, animation smoothness |

### 4.5 Precondition Writing Standards

Preconditions must be specific and reproducible:

```
✓ "At least one {ENTITY} of type '{TYPE}' exists in the system and is NOT linked to any {RELATED_ENTITY}"
✓ "User is logged in as {ROLE} with full {MODULE} access"
✓ "The {ENTITY} '{NAME}' exists and is linked to {RELATED_ENTITY} '{RELATED_NAME}'"

✗ "{ENTITY} exists"          → What type? Linked or unlinked?
✗ "User is logged in"        → Which role? Which permissions?
✗ "Data exists"              → What data specifically?
```

---

## 5. Mandatory Test Coverage Matrix

> **RULE: Every epic MUST have test cases covering ALL applicable categories below. Missing coverage is a sign-off blocker.**

### 5.1 Category Checklist (Apply to Every Epic)

| # | Category | Mandatory? | Notes |
|---|----------|------------|-------|
| 1 | CRUD Happy Paths | Yes | Create, Read/View, Update/Edit, Delete — all with valid data |
| 2 | Field Validation (Negative) | Yes | Empty, whitespace, special characters, max-length, duplicate, negative numbers, type mismatches |
| 3 | Search Behavior | If screen has search | Full match, partial match, no match, localized search, case-insensitive, clear search |
| 4 | Expandable/Collapsible Rows | If list has expandable rows | Expand, collapse, multi-expand, type-specific fields, refresh after edit |
| 5 | Field Dependency & Interaction | If fields are logically related | Derived value accuracy, edit source after setting dependent, zero-out source fields |
| 6 | Toggle & Partial Field Entry | If toggles enable sub-fields | Toggle ON with all empty, only first filled, only second filled, toggle OFF clears values |
| 7 | Linked/In-Use State Blocking | If entities can be linked | Edit blocked, delete blocked, correct error message, unlink then retry |
| 8 | Pagination & Empty State | If screen has a list | Page 1 content, navigate pages, empty state message when no data |
| 9 | Concurrency | Always | Two users editing same entity simultaneously — define expected behavior (last-write-wins, optimistic locking, etc.) |
| 10 | Data Isolation | If applicable | Data scoped correctly by tenant / role / org unit — no leakage via UI or API |
| 11 | Localization / Accessibility | If applicable | Localized UI labels, layout correctness, localized validation messages, localized search — OR — WCAG compliance, keyboard nav, screen readers |
| 12 | Inline CRUD (if applicable) | If forms contain embedded entity creation | Inline create, inline edit, inline delete within parent form context |

### 5.2 Detailed Coverage Patterns

#### 5.2.1 Search Behavior

**Applies to:** Every screen/list that has a search field.

| TC Pattern | Description | Priority |
|------------|-------------|----------|
| Full-name exact search | Search by full entity name → only that entity appears | P1 |
| Partial-name substring search | Search by partial name → all matching entities appear | P1 |
| No-match search | Search with non-existent term → empty state / "No results" message | P1 |
| Localized full search | Search by full name in secondary language → matching entity appears | P1 |
| Localized partial search | Search by partial localized name → all matching entities appear | P2 |
| Case-insensitive verification | Search with different casing → still matches | P2 |
| Clear search restores full list | Clear the search field → complete unfiltered list returns | P1 |

#### 5.2.2 Expandable / Collapsible Row Data

**Applies to:** Every list with expandable rows.

| TC Pattern | Description | Priority |
|------------|-------------|----------|
| Expand single row | Click expand → shows detailed fields for that entity | P0 |
| Type-specific expansion | Different entity types show different expanded fields | P1 |
| Collapse row | Click collapse → expanded content hides | P1 |
| Multiple rows expanded | Expand multiple rows → verify behavior (all stay open or accordion) | P2 |
| Data refresh after edit | Edit entity → return to list → expand row → shows updated values | P1 |

#### 5.2.3 Field Dependency & Interaction

**Applies to:** When fields have logical relationships (calculated values, conditional validation, derived defaults).

| TC Pattern | Description | Priority |
|------------|-------------|----------|
| Edit source after setting dependent | Change a source field value → dependent field reacts correctly (recalculates, re-validates, or blocks) | P0 |
| Zero-out source fields | Set source fields to 0 or empty → dependent field handles gracefully | P0 |
| Conditional validation at different stages | If validation rules differ by context (form save vs. entity binding vs. API call), test each stage separately | P0 |

#### 5.2.4 Toggle & Partial Field Entry

**Applies to:** When a toggle enables multiple sub-fields.

| TC Pattern | Description | Priority |
|------------|-------------|----------|
| Toggle ON, all sub-fields empty | Enable toggle → leave all sub-fields empty → Save → validation error | P1 |
| Toggle ON, partial entry | Enable toggle → fill only some sub-fields → Save → validation error for missing fields | P1 |
| Toggle OFF clears values | Fill sub-fields → toggle OFF → toggle ON → fields should be cleared/reset | P2 |

#### 5.2.5 Linked/In-Use State Blocking

**Applies to:** Entities that can be referenced by other entities.

| TC Pattern | Description | Priority |
|------------|-------------|----------|
| Edit blocked when linked | Entity is linked to another entity → Edit is disabled or returns error | P0 |
| Delete blocked when linked | Entity is linked → Delete returns "Cannot delete: entity is in use" | P0 |
| Unlink then retry | Remove the link → Edit/Delete now available | P1 |

#### 5.2.6 Concurrency

| TC Pattern | Description | Priority |
|------------|-------------|----------|
| Simultaneous edit | Two users edit the same entity → define expected outcome (last-write-wins, conflict error, merge) | P1 |
| Edit while another deletes | User A edits, User B deletes → User A attempts save → appropriate error | P2 |

#### 5.2.7 Data Isolation

<!--
  INSTRUCTIONS: Customize for your architecture:
  - Multi-tenant → Test tenant-to-tenant isolation
  - Role-based → Test role-to-role data boundaries
  - Org-unit scoped → Test org-unit isolation
  Remove this section if your project has no data isolation requirements.
-->

| TC Pattern | Description | Priority |
|------------|-------------|----------|
| Data invisible across boundaries | Scope A creates data → Scope B cannot see it | P0 |
| API-level isolation | Direct API call with wrong context token → cannot access other scope's data | P0 |

---

## 6. Advanced Testing Heuristics

### 6.1 Systematic Test Design Techniques

Apply these techniques in order of priority:

| Technique | When to Apply | How |
|-----------|---------------|-----|
| **Equivalence Partitioning (EP)** | Any input field | Divide inputs into valid/invalid classes, test one value from each class |
| **Boundary Value Analysis (BVA)** | Numeric fields, length limits | Test at min, min+1, max-1, max, max+1 |
| **Decision Table** | Multiple conditions with combined outcomes | Map all condition combinations to expected results |
| **State Transition** | Entities with lifecycle states | Map all states + transitions + invalid transitions |
| **Pairwise / Combinatorial** | Forms with many independent fields | Use pairwise combinations instead of exhaustive testing |

### 6.2 Heuristic Cheat Sheet (SFDPRC)

Use this mnemonic when reviewing test coverage completeness:

| Letter | Heuristic | Questions to Ask |
|--------|-----------|-----------------|
| **S** | Search | Does this screen have search? Did I test all search patterns? |
| **F** | Fields | Did I test every field's validations? Dependencies? Toggles? |
| **D** | Data Display | Did I test expandable rows? Pagination? Empty state? Sorting? |
| **P** | Permissions | Can all authorized roles perform this action? Are unauthorized roles blocked? |
| **R** | Regression | Could this change break existing functionality? What linked entities are affected? |
| **C** | Compliance | Does this touch regulated calculations? Is it compliance-safe? |

### 6.3 Common Defect Patterns (Learn from History)

These defect patterns are commonly observed in web applications. Actively test for them:

| # | Defect Pattern | Where to Look | Test Strategy |
|---|---------------|---------------|---------------|
| 1 | Ghost UI elements in spec | Buttons/menus documented but not implemented | Live DOM audit before writing test cases |
| 2 | Inconsistent type-specific behavior | Fields that should differ by entity type but share logic | Test all types explicitly, compare side-by-side |
| 3 | Validation fires at wrong time | Field validates on blur instead of save, or vice versa | Test validation timing: on input, on blur, on save |
| 4 | Localized text breaks functionality | Feature works in primary language but fails in secondary | Test full and partial search in all supported languages |
| 5 | Expand/detail view shows stale data | Editing an entity doesn't update the expanded/detail view | Edit → return to list → expand → verify updated values |
| 6 | Toggle sub-fields persist after OFF | Toggling a feature OFF doesn't clear its sub-field values | Toggle ON → fill → Toggle OFF → Toggle ON → verify cleared |
| 7 | Linked-state check missing | Edit/Delete succeeds on an entity that is actively linked | Link entity → attempt edit/delete → verify block behavior |
| 8 | Cross-scope data leak | API returns data from other tenants/roles/org-units | Switch scope context → verify complete data isolation |
| 9 | Pagination resets on action | Performing an action on page 3 returns user to page 1 | Navigate to page N → perform action → verify page preserved |
| 10 | Empty state not handled | List shows broken layout instead of friendly empty state | Delete all data → verify empty state message and layout |
| 11 | Cross-epic premise violation | Question/TC assumes a scenario that a foundational rule in another epic prevents | Before accepting any question or TC, validate its premise against the Foundational Rules Registry in Section 2.3. Investigate later epics with full awareness of constraints from earlier epics. |
| 12 | Design-Story text mismatch | Design labels, headings, or button text differ from story AC text | Compare every visible text element in design files against the corresponding story AC or localization table. Flag mismatches as open questions — do not assume either source is correct. |
| 13 | Intra-story AC contradiction | Two acceptance criteria within the SAME story directly contradict each other. More impactful than cross-story contradictions because the developer cannot implement both. | Read all ACs holistically within each story, checking for logical consistency. Flag contradictions as CRITICAL priority since they block both development and testing. |
| 14 | PRD-Story business rule conflict | PRD defines one validation rule while the story defines a different rule. These conflicts are invisible when only comparing stories vs design — the PRD must be cross-referenced independently. | Perform three-way cross-reference: PRD functional requirements vs story ACs vs design files. When the PRD and story disagree on a business rule, raise as "PRD vs Story Conflict" category at CRITICAL priority. |

| 15 | Automation covers ~40% of manual bugs | Functional automation misses visual/design compliance, RTL layout, icon sizing, column alignment | Pair functional automation with visual regression tools (Percy/Applitools). Automation alone is insufficient for UI polish. (Added: 2026-03-28) |
| 16 | Backend API rejects empty arrays in required collection fields | API seeding with empty arrays (e.g., `items: []`) returns 422 even when the field is semantically optional | Always verify API payloads with a test call before building seed helpers. Never assume empty arrays are accepted. (Added: 2026-03-28) |
| 17 | Custom component items rendered as `button` elements, not standard list/option roles | Drawer/panel list items may be full-width buttons with composite accessible names instead of `mat-list-item`, `role=option`, or `role=radio` | Always check accessibility snapshot for actual element roles before writing selectors. Use `getByRole('button').filter({ hasText: /distinguishing-text/ })`. (Added: 2026-03-28) |
| 18 | Form fields with pre-populated defaults make "empty field" validation untestable | Time pickers, duration fields, and dropdowns load with defaults — clearing them via UI is impossible | Mark "empty field" validation tests as `test.fixme()`. These are not bugs — the app prevents the empty state by design. (Added: 2026-03-28) |
| 19 | Design files may include out-of-scope features not caught by story review | Design exports may show screens or wizards for features the PRD explicitly defers or postpones | **Always cross-check design screens against the PRD "Out of Scope" table before writing TCs.** PRD authority > design file presence. Do NOT write TCs for features visible in designs but listed as out-of-scope. (Added: 2026-03-30) |
| 20 | Backend accepts operations on already-transitioned entities (stale-state race condition) | Multi-tab scenarios where user completes an action in Tab 1, then attempts the same action in Tab 2 on the now-stale entity | Backend must re-validate entity status at submission time, not just at page load. Test: complete action in Tab 1 → attempt same action in Tab 2 → verify rejection. (Added: 2026-04-05 | Source: project experience) |
| 21 | Mutually exclusive UI states displayed simultaneously | Status banners, notification bars, or state indicators that should be exclusive (success vs error) | Banner/notification components must use exclusive state logic — clear previous state before rendering new one. Test: trigger conflicting states rapidly → verify only one banner visible at a time. (Added: 2026-04-05 | Source: project experience) |
| 22 | Per-screen design audit misses interactive affordances and per-state variants | Sortable columns, hover states, action menus, and page-level state modes (locked/approved/empty/error) are skipped when SFDP stops at the screen level | **Audit designs per-component AND per-state, not per-screen.** For every table: enumerate sortable columns. For every page: enumerate explicit state modes. Classify each design element as PRD-supported / PRD-silent (open question) / PRD-out-of-scope / decorative. Silence is a gap, not an answer. (Added: 2026-04-27) |
| 23 | Modal-scope decisions extrapolated as page-scope decisions | QC documents a behavior inside a modal (e.g., "closed cycle banner + Apply hidden inside Correction modal") and reviewer assumes that's the complete state surface | **Modal-scope ≠ page-scope.** When QC defines a state at the modal level, walk every other render surface (page banners, lists, KPI cards, side panels) and ask "what does this state look like here?" Closed-cycle / locked-record / deferred-feature global states must be audited at every render surface independently. (Added: 2026-04-27) |
| 24 | Cross-epic seam blind spot — verb × state matrix never built | Two epics share a data dependency (one mutates entities the other reads); each epic's review covers only its own side, leaving the contract between them silent | **Build a verb × state matrix as a deliverable.** Rows = upstream verbs (create / edit / delete / re-stamp). Columns = downstream record states (Present / Late / Stale / Critical / etc.). Every cell is documented OR an open question — there is no implicit cell. Empty cells = automatic open questions. (Added: 2026-04-27) |
| 25 | Nightly recompute job overwrites direct DB seed edits | Apps with derived tables (timesheet, payroll summaries, leave balances) often have a cron that rebuilds rows from upstream sources. Direct seed-script patches to those derived tables get silently rewritten on next run. | **Three options:** (a) pause the cron during fixture setup, (b) seed only upstream tables and let the job derive, (c) replicate the job's logic exactly in the seed script. Always re-run validation after the job's next scheduled execution to confirm steady-state. (Added: 2026-05-04) |
| 26 | API silently filters status values not in its render enum | DB column accepts values that the API drops without error (empty cell or row). Documented enum in DB ≠ what the renderer accepts. | **Verify every fixture status value renders in the UI.** When a value is dropped, switch to the closest accepted value and represent the original semantic via numeric columns (e.g., use `status='late'` for both late-clock-in AND short-clock-out, differentiate via `late_hours` vs `shortage_hours`). (Added: 2026-05-04) |
| 27 | `new Date(mysql_datestring).toISOString()` corrupts timestamps when MySQL connection uses `dateStrings:true` | JS `Date` parses the local-time string as if it were local, then `.toISOString()` outputs UTC. Round-tripping shifts the value by the timezone offset (e.g., +3h Saudi causes clock_in/clock_out to land on the wrong calendar day, sometimes producing impossible states like clock_out before clock_in). | **In seed scripts, use string manipulation or `Date.UTC()` for time arithmetic on MySQL strings.** Never rely on the implicit `new Date(string)` round-trip. Validate after seeding: reject any row where DATE(clock_in) ≠ entity.date or clock_out < clock_in. (Added: 2026-05-04) |
| 28 | Per-row JS DB loops 50-100× slower than set-based SQL UPDATE on remote databases | Each round-trip costs 50-100ms; 1800 rows × 3 queries = 5+ minutes (often hits connection drop mid-run). | **Express derived columns as joinable subqueries inside one UPDATE per column.** Reserve JS loops for genuinely procedural logic that can't be expressed in SQL CASE. Pattern: 7 set-based UPDATEs replace 1800-row JS loop, runtime drops from 5min to 5sec. (Added: 2026-05-04) |
| 29 | Migration `predict()` rule priority bugs surface as wrong type assignments | Predictor logic written before product Q-clarifications produces wrong types when rules are: applied in wrong order, or use the wrong discriminator (e.g., monthly-package columns for hourly-rate decisions), or missing the "skip" path for terminated users | **Document every product Q-clarification as a numbered rule and apply in priority order:** terminated/skipped first, then exclusive types (specific nationality+employment+shift_type), then "no-data" unmapped catalog, then classification overrides, then employment_type-driven branches. Validate with spot-checks on edge users that would be affected by each Q-rule. (Added: 2026-05-04) |
| 30 | UI form fields appear empty after seeding because dependent linkage row is missing | Seeding a new parent row (shift, schedule, policy) with direct columns and child collections populated, but the UI form still renders empty Name/Start/End. Root cause: UI fetch query INNER JOINs on a separate linkage table that has no row for the new parent. | **When seeding parent rows that drive UI forms, always insert dependent linkage rows.** Check the form's network response in DevTools to identify joined tables. Default linkage to a known-existing dependent (e.g., the first break_policy) when the seed doesn't have a meaningful one. Every "form fields empty after seeding" bug traces to a missing FK row in a dependent table. (Added: 2026-05-04) |
| 31 | Schema column appears unused — UI reads a different column for the same semantic | Localization columns (e.g., `name_ar`, `description_localized`) exist in the DB but the form/list UI reads only the primary column. Seeded fixtures populate the unused column expecting locale-switching to surface it; nothing happens. | **Verify column usage by direct UI inspection.** Don't assume schema columns are wired up; legacy columns often exist as future-i18n placeholders. To display localized values, write to the column the UI actually reads (commonly the primary `name`). (Added: 2026-05-04) |
| 32 | Cross-story rendering blind spot — peer stories within same epic share data, but consistency across surfaces is never asserted | Story A produces data X (e.g., computed status, attention indicators, columns); peer stories B / C / D within the same epic each render X on their own surfaces. The "obvious" assumption is "X is tested in A; B / C / D inherit it." TC suites then test the FRAME of B/C/D (range pickers, filters, scroll) but NEVER assert X renders correctly inside. | **Build a cross-story rendering matrix as a deliverable BEFORE writing TCs.** Rows = visible attributes; Columns = each story / surface that renders them; Cells = TC IDs asserting consistency. Empty cells = required TCs (or explicit "out of scope" justification). Make this a hard Quality Gate — no sign-off until every cell has a TC ID or deferral. Same silence-mapping pattern as #24 (cross-epic seams), but at the within-epic story level. (Added: 2026-04-30) |
| 33 | View / list / container TC suites biased toward FRAME behavior, missing ROW content | When a story is a "view," PRD descriptions emphasize range pickers, filters, cycle handling, etc. TC writers follow the PRD's emphasis without asking what each row actually displays. Net result: 90%+ of TCs target the frame, 0% assert the row content (status chips, indicators, columns) renders correctly. | **Run the screenshot test before TC writing.** For every view/list/container story: sketch a typical row, enumerate every visible element, map each to "asserted by TC X" or "open question." Empty mappings = automatic TC backlog. Plus run a category-bias smell check: if >90% of TCs target frame/range/filter/picker behavior, the row content is likely under-tested — trigger a "what's missing" pass. (Added: 2026-04-30) |

<!-- Add project-specific defect patterns as they are discovered during testing -->

> **Methodology root cause for #22, #23, #24, #32, #33:** Reading what is documented and stopping. The QC log records *resolved* questions, not all questions. Tracking only the resolved set creates the illusion of completeness. Always enumerate what is **silent** and ask whether the silence is a gap or a deliberate choice.

### 6.4 Risk-Based Test Prioritization

When time-constrained, use this risk matrix to decide which tests to run first:

| Risk Level | Criteria | Action |
|------------|----------|--------|
| **Critical** | Regulatory compliance, data corruption, security breach, data isolation leak | Always test — never skip |
| **High** | Core CRUD workflows, main business rules, QC-confirmed behaviors | Test in every cycle |
| **Medium** | Boundary values, uncommon paths, concurrent editing | Test in full regression |
| **Low** | Cosmetic issues, tooltip text, animation smoothness | Test when time permits |

---

## 7. Quality Gates Before Test Sign-off

### 7.1 Gate Checklist

No test suite may be considered "complete" until all gates pass:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    QUALITY GATE CHECKLIST                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  GATE 1: Investigation Completeness                                │
│  □ All stories in scope have been read                             │
│  □ PRD and design files have been reviewed                         │
│  □ QC decisions have been applied                                  │
│  □ Open questions have been resolved (or explicitly deferred)      │
│                                                                     │
│  GATE 2: Coverage Completeness                                     │
│  □ All applicable categories from Section 5.1 have been addressed  │
│  □ Every acceptance criterion has ≥ 3 test cases                   │
│  □ Negative test cases are ≥ 30% of total suite                    │
│  □ Localization/accessibility tests included (if applicable)       │
│                                                                     │
│  GATE 3: Test Case Quality                                         │
│  □ Every TC has a unique ID following the naming convention        │
│  □ Every TC has a valid story linkage                              │
│  □ Steps are specific and reference actual UI elements             │
│  □ Expected results are observable and measurable                  │
│  □ Preconditions are specific and reproducible                     │
│                                                                     │
│  GATE 4: Traceability                                              │
│  □ Story linkage distribution is logical (no orphaned TCs)         │
│  □ Coverage matrix shows no gaps per story                         │
│  □ QC decisions are traceable in test expected results             │
│                                                                     │
│  GATE 5: DOM Verification (when applicable)                        │
│  □ UI-referencing test cases verified against live DOM             │
│  □ Ghost elements flagged and removed                              │
│  □ Discrepancies documented in QA Review Report                    │
│                                                                     │
│  GATE 6: Import Readiness                                          │
│  □ Test management tool import file follows required format        │
│  □ Multi-row pattern is correct (header + step rows)               │
│  □ Delta file generated for incremental import                     │
│  □ Test import in staging environment succeeds                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 7.2 Story Linkage Validation Rules

| Rule | Check | Failure Action |
|------|-------|----------------|
| Every TC links to ≥ 1 story | Scan linkage column for blanks | Assign correct story or remove TC |
| List/Tab TCs → List story | TCs about search, expand, pagination link to the list story | Re-map to correct story |
| Form/Create TCs → Form story | TCs about field validation, save, dependencies link to the form story | Re-map to correct story |
| Cross-cutting TCs → Multiple stories | TCs about editing then viewing updated data link to both stories | Add both story keys |
| No story has zero TCs | Count TCs per story, flag stories with 0 | Investigate — either missing tests or story is out of scope |

### 7.3 Coverage Distribution Health Check

A healthy test suite for a typical CRUD epic should approximate:

| Test Type | Target % | Red Flag If Below |
|-----------|----------|-------------------|
| Positive (happy path) | 35–45% | < 25% |
| Negative (validation, error) | 30–40% | < 20% |
| Edge / Boundary | 15–25% | < 10% |
| Security / Permission | 5–10% | 0% |
| Localization / Accessibility | 5–10% | 0% |

---

## 8. Output Format Requirements

### 8.1 Test Management Tool Import File (Primary Deliverable)

<!--
  INSTRUCTIONS: Customize the column mapping below to match YOUR test management tool's import format.
  The example below uses a 14-column format. Adjust column letters, headers,
  and the multi-row pattern to match your tool (Qmetry, TestRail, Zephyr, Xray, Azure Test Plans, etc.).
-->

**Format:** {COLUMN_COUNT}-column Excel (.xlsx) with multi-row pattern.

**Column Mapping:**

| Col | Header | Content |
|-----|--------|---------|
| A | testcase_summary | TC summary text (header row only) |
| B | testcase_precondition | Precondition text (header row only) |
| C | testcase_priority | P0/P1/P2/P3 (header row only) |
| D | testcase_folder | Folder path (header row only) |
| E | story_linkages | Comma-separated issue keys (header row only) |
| F | testcase_status | "Draft" (header row only) |
| G | testcase_component | Component name (header row only) |
| H | testcase_labels | Labels (header row only) |
| I | testcase_owner | Owner name (header row only) |
| J | testcase_estimated_time | Estimated time (header row only) |
| K | testcase_description | Description (header row only) |
| L | step_summary | Step text (step rows only) |
| M | step_expectedResult | Expected result (last step row only) |
| N | step_testData | Test data (first step row only) |

<!-- Adjust column mapping to match your test management tool's import format -->

**Multi-Row Pattern:**

```
Row 1: [TC Summary] [Precondition] [P1] [Folder] [{STORY_KEY}] [Draft] ... (header)
Row 2: [Step 1 text] [] [Test data on first step]                            (step)
Row 3: [Step 2 text] [] []                                                    (step)
Row 4: [Step 3 text] [Expected result on last step] []                        (step)
Row 5: (blank separator row)
Row 6: [Next TC Summary] [Precondition] [P0] ...                              (header)
...
```

**Critical Rules:**
- Test Data goes on the FIRST step row only
- Expected Result goes on the LAST step row only
- Header rows contain metadata; step rows contain only step details
- A blank row separates each test case
- Always generate delta files for incremental import (never re-import existing cases)

### 8.2 QA Review Report (Markdown)

Generated during the investigation phase, this report captures findings and open questions:

```markdown
# QA Review Report — [Epic Name]
**Date:** [date]
**Reviewer:** {QA_LEAD_NAME}
**Stories:** [comma-separated keys]

## Findings Summary
| # | Finding | Severity | Status |
|---|---------|----------|--------|
| 1 | [finding] | High/Med/Low | Open/Resolved |

## Open Questions
| # | Question | Raised To | Answer |
|---|----------|-----------|--------|
| 1 | [question] | [person/team] | [answer or PENDING] |

## QC Decisions Applied
| QC # | Decision | Impact on Test Cases |
|------|----------|---------------------|
| QC #1 | [decision description] | [how it affects test design] |

## Test Coverage Summary
| Story | TC Count | Positive | Negative | Edge |
|-------|----------|----------|----------|------|
| {STORY_KEY} | 15 | 6 | 5 | 4 |
```

### 8.3 File Naming Convention

| File Type | Naming Pattern | Example |
|-----------|---------------|---------|
| Full import file | `{TOOL} Import - {PROJECT} Epics {n} & {n}.xlsx` | `Qmetry Import - CRM Epics 1 & 2.xlsx` |
| Delta import file | `{TOOL} Import - NEW Epic {n} Cases Only.xlsx` | `Qmetry Import - NEW Epic 1 Cases Only.xlsx` |
| QA Review Report | `QA Review - Epic {n} - {name}.md` | `QA Review - Epic 1 - User Management.md` |
| Open Questions | `Open Questions - Epic {n}.md` | `Open Questions - Epic 1.md` |

---

## 9. Project Reference Data

<!--
  INSTRUCTIONS: This entire section is project-specific. Fill in YOUR project's data.
  The structure below provides the template — replace all placeholder content.
-->

### 9.1 Epic-Story Mapping

| Epic | Story Key | Story Name | Screen Type | Status |
|------|-----------|------------|-------------|--------|
| Epic 1 — {EPIC_NAME} ({EPIC_KEY}) | {STORY_KEY} | {STORY_NAME} | {SCREEN_TYPE} | {STATUS} |

<!-- Add all epics and their child stories here. Keep this table updated as new stories are created. -->

### 9.2 Key QC Decisions Reference

| QC # | Decision | Impact on Testing |
|------|----------|-------------------|
| (None yet) | Project is in setup phase | QC decisions will be logged as they arise during investigation |

<!-- Add all QC decisions as they are confirmed throughout the project -->

### 9.3 Integration Info

- **Project Management Tool:** {TOOL_NAME} (e.g., Jira, Azure DevOps, Linear)
- **Cloud ID / Workspace:** `{CLOUD_ID}`
- **User Account ID:** `{ACCOUNT_ID}`
- **Test Management Tool:** {TEST_TOOL} (e.g., Qmetry, TestRail, Zephyr, Xray)
- **Open Questions Database:** {TOOL} ({CONNECTION_DETAILS})
- **Design Source:** {DESIGN_TOOL_AND_LOCATION} (e.g., Figma file link, local PNG exports)
- **PRD Location:** {PRD_LINK_OR_PATH}
- **Open Questions Category Options:** Design-Story Discrepancy, Missing AC / Gap, Ambiguous Behavior, Cross-Epic Conflict, PRD vs Story Conflict

<!-- Add additional integration details as tools are connected -->

### 9.4 Test Suite Statistics (Current — Verified {DATE})

| Metric | Value |
|--------|-------|
| Total test cases | 0 (investigation phase) |
| Open questions | 0 |
| Questions answered | 0 |
| Questions pending | 0 |
| PRD cross-reference status | NOT STARTED |
| Premise audit status | NOT STARTED |

**Open Questions by Epic:**

| Epic | Question Count | Priority Breakdown |
|------|---------------|-------------------|
| {EPIC_NAME} | 0 | — |

<!-- Update this table as questions are identified and resolved -->

**Story Linkage:**

| Story Linkage | TC Count |
|---------------|----------|
| (No test cases written yet) | 0 |

<!-- Update this table as test cases are written -->

---

## 10. Dashboard Auto-Refresh Rule

<!--
  INSTRUCTIONS: Remove this section if you are NOT using a Claude-powered dashboard.
  If you are, customize the source files and tab names below.
-->

> **MANDATORY: Every Claude session (Cowork or Code) that modifies ANY project file MUST regenerate the Project Dashboard before ending its work.**

### 10.1 What Triggers a Dashboard Refresh

The dashboard (`Project Dashboard.html`) must be regenerated whenever ANY of the following changes occur:

| Change Type | Examples | Affected Dashboard Tabs |
|-------------|----------|------------------------|
| **New/modified test cases** | TCs added to import file, TC counts changed | Overview, TC Metrics, Coverage |
| **New epic or story** | New epic section added, new story mapped | Overview, Lifecycle, Metrics, Coverage |
| **QC decision added/changed** | New QC entry in Section 9.2 | Coverage, Gaps |
| **Shared chat update** | New thread in shared chat log, status changed | Shared Chat tab |
| **Automation progress** | Selectors resolved, API endpoints discovered | Automation Status tab |
| **Gap resolved or new gap found** | Coverage gap filled with new TCs | Gaps & Actions tab |
| **Phase milestone reached** | DOM audit complete, automation started | Lifecycle tab |
| **Section 9.4 updated** | TC counts or story linkage numbers changed | All metric tabs |

### 10.2 How to Refresh

Use the **`refresh-qa-dashboard`** scheduled task if available. This task:

1. Reads all source files: this playbook, automation handoff docs, shared chat logs, QA revisit reports, and the import Excel
2. Extracts current data from each file
3. Rebuilds `Project Dashboard.html` with all tabs
4. Saves the updated file to the workspace folder

Alternatively, manually regenerate the dashboard by reading all source files and rebuilding the HTML.

### 10.3 Dashboard Source Files

| File | What It Feeds |
|------|--------------|
| This playbook (CLAUDE.md) | Section 9.1 → epic/story mapping; Section 9.2 → QC decisions; Section 9.4 → TC counts |
| Automation handoff document | Handoff section completion, blocker list, seeding status |
| Shared chat log | Full conversation threads between sessions |
| QA Revisit Report | Coverage matrices, label distribution, gap analysis |
| Test import Excel file | TC count verification, folder paths |

### 10.4 Rules for Automation Sessions

When an automation session makes changes (e.g., fills in API endpoints, resolves selectors, adds DOM mismatch notes):
- Read the current `Project Dashboard.html`
- Update ONLY the affected tabs/sections
- Preserve all other data intact
- Update the "Last refreshed" timestamp in the header

---

## 11. Continuous Learning & Documentation Rule

> **MANDATORY: Any modification, new rule, insight, or pattern learned during collaboration MUST be documented in this file (`CLAUDE.md`) before the session ends.**

### 11.1 What Must Be Documented

Every meaningful learning from our collaboration should be captured. This includes but is not limited to:

| Category | Examples | Where to Add |
|----------|----------|-------------|
| **New rules or constraints** | "Always ask clarifying questions before starting a task", "Never import full suite — use delta files" | Relevant existing section, or new subsection |
| **QC decisions** | Confirmed behaviors from QC reviews, clarifications on ambiguous requirements | Section 9.2 (QC Decisions Reference) |
| **Defect patterns discovered** | New recurring bug types found during testing | Section 6.3 (Common Defect Patterns) |
| **Process improvements** | Better investigation steps, improved checklist items, workflow optimizations | Relevant section (Investigation, Quality Gates, etc.) |
| **Project-specific insights** | Business rule clarifications, field behavior discoveries, API contract details | Section 9 (Project Reference Data) or new subsection |
| **Tool/integration learnings** | Import tool quirks, issue tracker query patterns, design file interpretation rules | Section 9.3 or new subsection |
| **Testing heuristics** | New test design patterns, coverage strategies, risk assessment refinements | Section 6 (Advanced Testing Heuristics) |

### 11.2 Documentation Standards

When adding new content to this file:

1. **Write generically and reusably** — Frame learnings as guidelines applicable to future tasks, not one-off notes. Avoid referencing specific conversation timestamps or session IDs.
2. **Place content in the right section** — Don't dump everything into one section. Each learning belongs in the section it naturally extends.
3. **Use consistent formatting** — Follow the existing table, list, and heading conventions already established in this file.
4. **Include rationale** — Explain *why* the rule exists, not just *what* it says. Future sessions benefit from understanding the reasoning.
5. **Date-stamp significant additions** — For major new rules or QC decisions, include the date they were established (e.g., `Added: YYYY-MM-DD`).

### 11.3 Lessons Learned Log

> This log tracks significant learnings added to the playbook over time. Each entry references the section where the full detail was added.

| # | Date | Learning | Section Updated |
|---|------|----------|----------------|
| 1 | {DATE} | {LEARNING_DESCRIPTION} | {SECTION_REFERENCE} |
| 2 | 2026-03-28 | **Holistic cross-epic investigation is mandatory.** Never investigate one epic in isolation. Read ALL epics/stories and ALL design files together before identifying questions. Isolated review produces too many minor/invalid/duplicate questions. Added: 2026-03-28 | Source: project experience | Section 2.1 |
| 3 | 2026-03-28 | **Three-gate quality filter for open questions.** A question only qualifies if it: (a) blocks TC writing, (b) would mislead expected results, or (c) represents a genuine gap with no info in any artifact. Minor, already-answered, or no-impact questions must be excluded. Added: 2026-03-28 | Source: project experience | Section 2 |
| 4 | 2026-03-28 | **Business rules in reference docs must be verified against all artifacts.** Treat reference file rules as claims that need verification, not ground truth. When a conflict is discovered, annotate the rule with the conflict reference rather than picking a side. Added: 2026-03-28 | Source: project experience | Section 9 |
| 5 | 2026-03-28 | **Validate product answers against design files.** After receiving answers to open questions, systematically compare every answer against the relevant design file. Catches discrepancies between what the product team says and what the designer implemented. Track as "follow-up items" (FU-N) — these don't block TC writing. Added: 2026-03-28 | Source: project experience | Section 2, 6.3 |
| 6 | 2026-03-28 | **Extract QC decisions as numbered structured entries (QC-NNN).** When the product team answers questions, convert each answer into a numbered QC decision with source traceability and testing impact. Makes answers directly actionable for TC design and creates an audit trail. Added: 2026-03-28 | Source: project experience | Section 9.2 |
| 7 | 2026-03-28 | **Follow-up items are distinct from open questions.** When design cross-reference reveals a discrepancy but the product answer is clear enough to write TCs, track as a follow-up item, not a new question. Follow-ups indicate design may need updating but don't block TC writing. Added: 2026-03-28 | Source: project experience | Section 9.2 |
| 8 | 2026-03-28 | **Verify answers actually address the specific question asked.** Product team answers may describe a different aspect of the same feature without answering the specific question. Always compare the answer against the specific options/scenarios presented in the question. Added: 2026-03-28 | Source: project experience | Section 2 |
| 9 | 2026-03-28 | **"Partially Answered" status requires structured follow-up notes.** When reclassifying an answer, add: (a) what WAS answered, (b) what was NOT answered, (c) specific follow-up question. This ensures the product team knows exactly what additional info is needed. Added: 2026-03-28 | Source: project experience | Section 2 |
| 10 | 2026-03-28 | **Check page content body for inline answers, not just property fields.** Stakeholders may write answers inside page content (below separators or in follow-up sections) rather than in designated property fields. Inline answers can correct or reverse original answers. Added: 2026-03-28 | Source: project experience | Section 2 |
| 11 | 2026-03-28 | **Parallel agent orchestration for large-scale TC generation.** When generating 300+ TCs, spawn parallel tc-writer agents grouped by epic affinity. Each agent receives: relevant QC decisions embedded directly, foundational rules, TC format spec. Prepare Excel infrastructure in parallel. Added: 2026-03-28 | Source: project experience | Section 8, 11 |
| 12 | 2026-03-28 | **TC parser: compare header count vs output count.** When parsing TC markdown into import format, always compare grep header count vs parser output count and investigate discrepancies > 2%. TCs with unparseable step tables are silently dropped. Added: 2026-03-28 | Source: project experience | Section 8 |
| 13 | 2026-03-28 | **Verify import format against a real production template, not documentation.** Read an existing successful import file (headers, data rows, styling, cell values) to determine the correct format. Documentation — even this playbook — can drift from reality. Added: 2026-03-28 | Source: project experience | Section 8 |
| 14 | 2026-03-28 | **Agent-spawned subprocesses may not write files.** Agents may have Write/Bash tools denied in their sandbox. The orchestrator (main context) MUST capture agent return messages and write output files itself. Never rely on agents to persist their own results. Added: 2026-03-28 | Source: project experience | Section 11 |
| 15 | 2026-03-28 | **Test management tool Summary field should not duplicate the TC ID.** If a Work Key column already contains the TC ID, the Summary column should contain only descriptive text — not a repeated ID prefix. Added: 2026-03-28 | Source: project experience | Section 8 |
| 16 | 2026-03-28 | **Cache files eliminate 60-70% token usage on repeated analysis.** Build structured cache files after completing investigation and TC generation phases. Subsequent commands read compact cached data instead of re-reading full playbook, PRD, stories, and design files. Added: 2026-03-28 | Source: project experience | Caching Rules |
| 17 | 2026-03-28 | **13 TC type tags + execution ordering.** All TCs must be prefixed with one of 13 approved type tags: [Happy], [Positive], [Negative], [Data Validation], [Boundary], [Edge], [Corner], [Permission], [Integration], [State Transition], [Error Handling], [Localization], [Regression]. Sort within epic: Happy/Positive first, Edge/Corner last. Added: 2026-03-28 | Source: project experience | Section 4.1.1, 4.1.2 |
| 18 | 2026-03-28 | **Test management tool linkage is internal — deleting folders doesn't auto-unlink TCs.** When deleting a folder in the test management tool, TCs may remain linked to stories. Manual unlinking from each story is required. Always verify linkage state after folder operations. Added: 2026-03-28 | Source: project experience | Section 9.3 |
| 19 | 2026-03-28 | **Cross-validation discovers questions invisible during initial investigation.** ~4% of questions only surface during TC-to-TC comparison — not during story analysis, design review, or PRD cross-reference. Gaps arise from implicit assumptions, threshold behaviors, and unspecified field constraints. Cross-validation is mandatory, not optional. Added: 2026-03-28 | Source: project experience | Section 6 |
| 20 | 2026-03-28 | **Issue tracker create-API may double-escape newlines in markdown.** Always follow issue creation with an edit call using `contentFormat: "markdown"` to fix description formatting. The edit endpoint handles newlines correctly. Added: 2026-03-28 | Source: project experience | Section 6.3 |
| 21 | 2026-03-28 | **Mid-flow entity edits bypass server-side validation.** When a user starts a multi-step flow and edits a referenced entity in another tab, the backend may validate against stale data. Test cross-tab edit scenarios. Added: 2026-03-28 | Source: project experience | Section 6.3 |
| 22 | 2026-04-05 | **Issue tracker API cannot convert subtask↔standalone type.** Changing issue type across hierarchy levels (e.g., Bug subtask → Defect standalone) fails via API. Must create a new issue of the target type and copy fields, then close the original. Added: 2026-04-05 | Source: project experience | Section 6.3 |
| 23 | 2026-04-05 | **Issue tracker sprint field requires plain numeric ID.** When setting sprint via custom field, pass a raw integer (e.g., `1688`), not an object like `{"id": 1688}`. The API rejects non-numeric values. Added: 2026-04-05 | Source: project experience | Section 6.3 |
| 22 | 2026-03-28 | **Automation catches ~40% of manual bugs — functional only.** Visual/design compliance, RTL layout, icon sizing, and column alignment require screenshot comparison tools. Added: 2026-03-28 | Source: project experience | Section 6.3 |
| 23 | 2026-03-28 | **Backend APIs may reject empty arrays in required collection fields.** Seeding with `items: []` returns 422 even when semantically optional. Verify with test API call before building seed helpers. Added: 2026-03-28 | Source: project experience | Section 6.3 |
| 24 | 2026-03-28 | **Custom UI components may render items as `button` elements, not list/option roles.** Always check accessibility snapshot for actual element roles before writing selectors. Added: 2026-03-28 | Source: project experience | Section 6.3 |
| 25 | 2026-03-28 | **Form fields with pre-populated defaults make "empty field" validation untestable.** Mark as `test.fixme()` — the app prevents the empty state by design. Added: 2026-03-28 | Source: project experience | Section 6.3 |
| 26 | 2026-03-28 | **Ask, Don't Guess: when a command says "ask the user", STOP and ask.** Don't search filesystem or infer paths from directory structure. A wrong assumption wastes more time than a 5-second question. Added: 2026-03-28 | Source: project experience | Caching Rules |
| 27 | 2026-03-28 | **Analyze Playwright failures iteratively at 5-failure checkpoints per epic.** Don't wait for full suite completion. Fix in batches for faster convergence. Added: 2026-03-28 | Source: project experience | Section 6 |
| 28 | 2026-03-29 | **Always verify QC decision sources in ALL project files before claiming hallucination.** QC decisions may exist in appendix files, cache files, or shared-chat logs — not just the main CLAUDE.md. Search all project artifacts before concluding a decision was fabricated. Added: 2026-03-29 | Source: project experience | Section 2.2 |
| 29 | 2026-03-30 | **Handover documents must explain screen flows, not list UI elements.** Describing "columns: A, B, C" and "chips: X, Y" produces a UI audit, not a handover. Instead, narrate what the user does, what happens next, what business rules apply, and what to watch for — with design details woven into the narrative naturally. A teammate should understand the feature's behavior, not just its visual inventory. Added: 2026-03-30 | Source: project experience | Section 8, 11 |
| 30 | 2026-04-05 | **Backend must re-validate entity status at submission time (stale-state race condition).** Multi-tab scenarios expose bugs where Tab 2 operates on an already-transitioned entity (e.g., completing an action on an entity already processed in Tab 1). Backend accepts because it validated at page load, not at submit time. Always test multi-tab completion-then-retry scenarios. Added: 2026-04-05 | Source: project experience | Section 6.3 |
| 31 | 2026-04-05 | **When story updates add new TCs, regenerate BOTH the full import file AND the delta file.** The full test management import file must always contain the complete TC suite. Run the main generator after appending new TCs to drafts — it reads all draft files and produces the comprehensive import. The delta file is for incremental import only. Users expect the main file to be current at all times. Added: 2026-04-05 | Source: project experience | Section 8 |
| 31 | 2026-04-05 | **Mutually exclusive UI states must use exclusive rendering logic.** Banner/notification components showing conflicting states simultaneously (e.g., success + error banners) indicate independent condition checks instead of exclusive state machine. Test rapid state transitions and redirect callbacks for banner conflicts. Added: 2026-04-05 | Source: project experience | Section 6.3 |
| 32 | 2026-04-15 | **Bug reporting: split intelligence (Claude) from execution (script).** Claude writes bridge files (descriptions, overrides) with polished summaries and auto-detected parents, then a Node.js script handles all issue tracker API calls. Reduces token cost from ~35-55K per bug (via MCP tools) to ~3-5K total per batch. NEVER use issue tracker MCP tools when a reporting script is available. Added: 2026-04-15 | Source: project experience | Section 11 |
| 33 | 2026-04-15 | **Issue tracker createIssue must explicitly set labels field.** The labels field must be included in the API request body — a prefix in the summary (e.g., `[BE]`) does NOT auto-create a label on the issue. Also include sprint custom field if applicable. Added: 2026-04-15 | Source: project experience | Section 6.3 |
| 34 | 2026-04-15 | **Bridge files decouple Claude intelligence from script execution.** Architecture: Claude writes JSON files (descriptions, overrides, config) → Script reads JSON and executes API calls. If bridge file doesn't exist, script falls back to raw input. This pattern applies to any task where Claude adds intelligence but execution is token-expensive via MCP tools. Added: 2026-04-15 | Source: project experience | Section 11 |
| 35 | 2026-04-15 | **Issue tracker search API may have per-request result limits.** When a filter returns >100 issues, the API may silently return only 100. Always verify `totalCount` against returned count and fetch remaining with a targeted query (e.g., filter by priority or date range). Added: 2026-04-15 | Source: project experience | Section 6.3 |
| 36 | 2026-04-15 | **Bug-to-TC traceability reports must include TC summaries, not just IDs.** Internal TC IDs may differ from IDs in the test management tool after import. Adding the TC summary text makes bugs identifiable regardless of which ID system is used. Always extract TC summaries from source draft files when generating traceability reports. Added: 2026-04-15 | Source: project experience | Section 8 |
| 37 | 2026-04-16 | **PRD worked examples with exact amounts serve as TC acceptance fixtures.** When a PRD provides worked calculation examples with exact values (e.g., payroll §9 "system output must match these examples exactly"), convert each example into a P0 TC with the exact figures as expected results. These are the highest-confidence TCs because both dev and QA share the same fixture data. Added: 2026-04-16 | Section 4, 6 |
| 38 | 2026-04-16 | **Use FR references as placeholder TC linkage when no issue tracker stories exist.** When the tracker has zero stories for a feature (common during early revamp phases), use PRD functional requirement IDs (e.g., FR1, §7.1) as TC story linkage placeholders. Document a bulk re-link task for when stories are created. Avoids blocking TC writing on story creation. Added: 2026-04-16 | Section 4.2, 7.2 |
| 39 | 2026-04-16 | **Use your design tool's MCP/API to resolve low-res export misreads** (design-tool example: Figma MCP `get_metadata`/`get_screenshot`). When local design PNG exports are too low-res to read (causing false element claims), pull structured metadata via the design tool's MCP/API with specific node/layer IDs instead of trusting the image. Always verify questionable UI claims this way before writing TCs. Added: 2026-04-16 | Section 2, 6.3 |
| 40 | 2026-04-16 | **PRD field validation tables drive per-type form TCs without full design coverage.** A single PRD table mapping fields × entity types to Required/Disabled/Auto-calc states generates form TCs for ALL types, even when the design files only show one variant. Don't block TC writing waiting for per-type designs if the PRD validation table is comprehensive. Added: 2026-04-16 | Section 2, 3 |
| 41 | 2026-04-16 | **QC decisions can fundamentally replace PRD data models, not just clarify ambiguity.** A QC answer may introduce an entirely new data model (e.g., replacing stored status with date-derived computation). This changes the entire test strategy. When a QC answer introduces a new model, update ALL dependent TCs, not just the directly asked question. Added: 2026-04-16 | Section 9.2 |
| 42 | 2026-04-16 | **Aggressive MVP scope validation eliminates false-priority questions.** Before rating any open question as HIGH or CRITICAL, verify the feature it asks about is NOT in the PRD "Out of Scope" section. Initial reviews may produce 4+ CRITICAL questions that drop to 0 after scope validation — most "missing" features are intentionally deferred. Check scope BEFORE assigning severity. Added: 2026-04-16 | Section 2 |
| 43 | 2026-04-23 | **Test management tool Story Linkages column supports compound (comma-separated) values.** When bulk-rewriting placeholder linkages to real keys, always split on comma, map each key independently, then rejoin. Treating the cell as a single atomic key corrupts multi-story linkages (e.g., `{PLACEHOLDER_A},{PLACEHOLDER_B},{PLACEHOLDER_C}`). Applies to any bulk xlsx rewrite. Added: 2026-04-23 | Source: project experience | Section 8 |
| 44 | 2026-04-23 | **Issue tracker epic children may include mixed types (Bug + Story) and duplicate ordinal labels.** JQL `parent = {EPIC_KEY}` may return Bugs alongside Stories and two issues sharing the same story-number label (e.g., both keys labeled US-14). Before mapping placeholders to real keys, filter by `issuetype = Story`, extract the ordinal token from each summary, and pick the canonical key (lowest issue key) on duplicates. Never rely on blind ordinal mapping (US-N → Nth child). Added: 2026-04-23 | Source: project experience | Section 6.3 |
| 45 | 2026-05-07 | **Late-hours rule when computing attendance penalties — within grace → late=0; past grace → late=FULL delay from shift_start (NOT delay − grace).** Within-grace pre-shift time is "free" (not counted as late OR short). The DB typically stores late as full delay, matching this rule. Always derive from raw punches + schedule, never compute as `delay − grace`. Added: 2026-05-07 | Source: {MODULE} | Section 6 |
| 46 | 2026-05-07 | **Short-hours rule — sum of mid-day gaps + early-clock-out time, computed across ALL punches per day.** Active window extends past shift_end by `late_clock_out_minutes` tolerance (typically 120 min); working past shift_end within tolerance cancels early-out short. Single-punch analysis misses split-shift patterns and produces inflated short totals — always aggregate all attendance rows per (user, date). Added: 2026-05-07 | Source: {MODULE} | Section 6 |
| 47 | 2026-05-07 | **Combined storage convention — `timesheet.shortage_hours` may store COMBINED late + pure-short, not pure short alone.** Verify by spot-checking a day with known late: `DB.shortage_hours = DB.late_hours + pure_short`. For business formulas treating late and short as separate buckets (`+ late_hours + shortage_hours + ...`), using raw DB shortage_hours produces double-counting. Use `pure_short = DB.shortage_hours − DB.late_hours` OR derive both from raw punches. Added: 2026-05-07 | Source: {MODULE} | Section 6.3 |
| 48 | 2026-05-07 | **Migration eligibility for any "active employees only" rule = `users.status = 'active'` (current status). NOT presence in historical off-board / termination tables.** A user may have a historical off-board record but a current status='active' (e.g., re-hired). Always filter `WHERE u.status='active' AND u.deleted_at IS NULL`; ignore off-board tables. Confirmed via product clarification: false-positive exclusions came from joining on the historical off-board table. Added: 2026-05-07 | Source: project experience | Section 9 |
| 49 | 2026-05-07 | **Matrix-driven classification source = the LATEST contract by `start_at DESC`, regardless of contract status (active/pending/completed).** Filtering to `status='active'` only misses pending contracts whose post-migration `contract_type` was correctly assigned. UI may render contracts as "Active" by date range (today between start_at and end_at), not by DB status field. SQL: `WHERE id = (SELECT id FROM user_contracts uc2 WHERE uc2.user_id = u.id AND uc2.deleted_at IS NULL ORDER BY start_at DESC, id DESC LIMIT 1)`. Added: 2026-05-07 | Source: project experience | Section 9 |
| 50 | 2026-05-18 | **Migration test-data realism = backup-ONCE → delete-after-cutoff (per cycle) → test → restore.** To make seeded test data resemble a real pre-migration "live" snapshot, delete transactional rows dated after a chosen cutoff timestamp (e.g. attendance punches, break records, computed daily summaries, future payroll-amount rows). KEEP forward-looking *scheduling* rows (scheduled shifts, schedule assignments, approved leave) — scheduling a future shift/leave is logical, but a future *actual* (a punch, a computed attendance result) is not. **How to apply:** back up only the touched tables ONCE (TRUNCATE+INSERT `.sql` per table), re-run the delete per cutoff, restore from the single backup between test cycles. Added: 2026-05-18 | Source: {MODULE} | Section 11 |
| 51 | 2026-05-18 | **"Daily-job" derived rows must be simulated per scheduled unit, not per day.** Many attendance/timesheet systems run a start-of-day job that creates one derived row (status `absent`) per *scheduled shift* until the employee acts. Off-days produce NO row (no scheduled shift); a person with 2 shifts in a day gets 2 rows. **How to apply:** when backfilling derived rows, key on the schedule row's id, set the "assigned" measure = scheduled duration and all actuals = 0, and only backfill up to "today"/cutoff — future days haven't had their job run yet. Added: 2026-05-18 | Source: {MODULE} | Section 6.3 |
| 52 | 2026-05-18 | **A revamped module often writes to a PARALLEL new table set while the legacy table still exists — and the new UI reads from the NEW tables.** Cleaning/seeding/verifying by querying only the legacy tables leaves orphan rows in the new tables that still render in the UI (real miss: shifts kept appearing after "cleanup" because a separate new schedule table + its FK-child + its overtime table were untouched). **How to apply:** before any by-entity cleanup or data-state assertion on a revamped module, enumerate ALL new-system tables (parent + FK children + sibling feature tables) and verify against the actual UI surface, not just the legacy tables. Added: 2026-05-18 | Source: {MODULE} | Section 6.3 |
| 53 | 2026-05-18 | **Migration eligibility bug class — non-active users with matrix-eligible inputs still get a LIVE migrated row instead of being skipped/soft-deleted.** Reproduced across multiple tenants: users whose current status is off-boarded (but whose attributes satisfy a mapping rule) received a live classification row. **How to apply:** when verifying any "active-only" migration, don't just confirm active users are correct — also assert every NON-active user has NO live migrated row (it should be absent or soft-deleted). Treat a live row on a non-active user as the same bug class as "unmapped row not soft-deleted." Added: 2026-05-18 | Source: project experience | Section 9 |
| 54 | 2026-05-18 | **A shared prerequisite (e.g. a payroll cut-off / cycle config) should gate ONLY the dependent flows, not the whole module.** When most customers don't use the prerequisite feature, blocking the entire module is unacceptable — the agreed pattern blocks only cycle-dependent flows with a focused "set up X" empty-state CTA (a shortcut to just that one config step, NOT the full wizard) and leaves independent flows working with graceful fallback. **How to apply:** for any feature gated by a shared prerequisite, build an explicit BLOCKED-vs-NOT-BLOCKED surface list and write TCs for both sides. Watch for cross-platform inconsistency (web blocks vs mobile silently allows) and for a coverage gap when the gating spec postdates the existing TC suite. Added: 2026-05-18 | Source: project experience | Section 6.3 |
| 55 | 2026-05-18 | **Three recurring DB-scripting quirks for fixture/migration work: (1) reserved-word columns (`from`/`to`/`group`/`order`) get their backticks eaten by the shell in inline `node -e` scripts → write the query to a `.js` file and run the file. (2) Restoring legacy rows that hold NULLs in now-NOT-NULL columns fails under strict mode → `SET SESSION sql_mode=''` before the restore. (3) Always convert a local cutoff time to UTC before comparing against DB timestamps (account for DST; e.g. summer UTC+3 means local-noon = 09:00 UTC).** Added: 2026-05-18 | Source: {MODULE} | Section 11 |
| 56 | 2026-06-03 | **Panoramic / multi-screen design exports blow past the readable-image limit — crop into per-frame segments, then resize each.** A single mobile-flow export can be many thousands of px wide containing 5–6 device frames; downscaling the whole image to the ≤1800px limit makes every screen unreadable. **How to apply:** slice the wide image into N vertical segments (with small overlap) and resize each to ~760px width into a `resized/` subfolder, then read segments individually. The flat "resize to ≤1800px" rule only works for single-screen exports. Added: 2026-06-03 | Source: {MODULE} | Section 2 |
| 57 | 2026-06-03 | **Before pushing/finalizing open questions, cross-check each against your OWN "Confirmed Behaviors" list and the design files already reviewed — drop any question already answered there.** A picker-population question was raised as an open gap even though the dialog answering it was in the design file already reviewed and was even listed under Confirmed Behaviors. **Why:** a question whose answer you already captured erodes stakeholder trust and wastes product's time. **How to apply:** add a quality-gate step — every candidate question must fail the test "is this already answered by a confirmed behavior or a screen I've read?" before it enters the gap report / tracker. Added: 2026-06-03 | Source: {MODULE} | Section 7 |
| 58 | 2026-06-03 | **Notion MCP has no hard page-delete — the `in_trash` flag on update-page is silently ignored (it only updates properties).** To remove a database row, use `move-pages` to detach it to the workspace (it leaves the data source); a true permanent delete requires the Notion UI. **Why:** believing `in_trash:true` worked leaves the row still in the DB. **How to apply:** after any "delete," re-query the data source to confirm the row count dropped; warn the user that detached pages still exist as orphan private pages. Added: 2026-06-03 | Source: {MODULE} | Section 11 |
| 59 | 2026-06-03 | **Open-question tracker titles must be full, self-contained questions (ending in "?"), not terse labels.** A title like "X definition — option-A vs option-B" is unreadable as a question; stakeholders must open the page to learn the ask. **Why:** people scan titles in the table/list view. **How to apply:** put the complete question in the title field; keep the short ID (Q1, Q2…) in a separate property. Added: 2026-06-03 | Source: {MODULE} | Section 8 |
| 60 | 2026-06-15 | **Team-chat MCP integrations (e.g. Slack) may have NO delete or edit-message tool — only send/draft/schedule/react/read.** To retract a posted message, post a follow-up or delete it manually in the chat UI. Draft tools (e.g. send-draft) are the "offline" path (save to Drafts without sending) but often allow only ONE attached draft per channel. **Why:** a sign-off message was posted live and could not be programmatically removed. **How to apply:** treat chat posts as irreversible via API — never rely on deleting/editing them afterward (parallels the Notion no-hard-delete quirk). Added: 2026-06-15 | Source: {MODULE} | Section 11 |
| 61 | 2026-06-15 | **The bug-report ingestion script (report-bugs.js) parses bugs ONLY under a section header (`Epic N:`) with a `(back end)/(BE)/(FE)` label suffix — inline `- back end - <dev>` does NOT parse.** Without the header the line is skipped entirely; without the parenthetical suffix the label defaults to FE and the dev name pollutes the summary. **Why:** bug lines authored in the inline format had to be reformatted before the script picked them up. **How to apply:** reformat each bug to `Bug N: <text> (back end)` under an `Epic N:` section before running; capture the dev via the config FE/BE assignee map, not inline. Added: 2026-06-15 | Source: {MODULE} | Section 8 |
| 62 | 2026-06-15 | **Never auto-send outbound team communications (chat/Slack posts) — require explicit per-message user confirmation.** **Why:** a QA owner set this as a hard standing rule after a sign-off was posted live; outbound messages reaching a team channel must stay under the user's control. **How to apply:** draft the message, present the exact text, wait for an explicit go-ahead; do not treat a prior turn's approval as blanket permission for later messages. Added: 2026-06-15 | Source: {MODULE} | Section 11 |
<!-- Append new learnings here as they arise -->

---

## Appendix A: Placeholder Reference

> **How to use this template:** Search for `{PLACEHOLDER_NAME}` patterns and replace them with your project-specific values.

| Placeholder | Description | Example Value |
|-------------|-------------|---------------|
| `{PROJECT_NAME}` | Your project name | "Loans", "Shifts Management", "CRM Portal", "Inventory System" |
| `{PROJECT_DESCRIPTION}` | One-line project description | "the Loans module in an HR/ERP platform", "the Shift Management system revamp" |
| `{QA_LEAD_NAME}` | QA lead full name | "Jane Smith", "Alex Chen" |
| `{QA_LEAD_TITLE}` | QA lead job title | "Senior QA Engineer", "QA Lead" |
| `{ARCHITECTURE_PRINCIPLE}` | Principle 6 title | "Multi-tenancy is non-negotiable", "Data isolation by role is non-negotiable" |
| `{ARCHITECTURE_PRINCIPLE_DESCRIPTION}` | Principle 6 description | "Every data-touching test must consider tenant isolation. A test that passes but leaks data across tenants is worse than a test that fails." |
| `{QUALITY_PRINCIPLE}` | Principle 7 title | "Localization is a first-class concern", "Accessibility is a first-class concern" |
| `{QUALITY_PRINCIPLE_DESCRIPTION}` | Principle 7 description | "Arabic + English UI, RTL layout, and localized validation messages are mandatory coverage areas for every screen." |
| `{COMPLIANCE_DESCRIPTION}` | Regulated areas description | "Modules touching payroll integration (WPS), salary deductions, and labor law compliance carry regulatory risk" |
| `{MODULE}` | Application module path | "HR > Loans", "Shifts", "CRM > Deals" |
| `{ENTITY}` | Primary business entity | "Loan Request", "Adherence Policy", "Customer", "Product" |
| `{RELATED_ENTITY}` | Entity linked to the primary | "Loan Type", "Shift Preset", "Deal", "Warehouse" |
| `{STORY_KEY}` | Issue tracker story key | "IS-5074", "CRM-1234", "INV-100" |
| `{EPIC_KEY}` | Issue tracker epic key | "IS-5310", "CRM-1000", "INV-050" |
| `{TOOL_NAME}` | Project management tool | "Jira", "Azure DevOps", "Linear", "GitHub Issues" |
| `{CLOUD_ID}` | Tool workspace/cloud ID (from your tracker) | "00000000-0000-0000-0000-000000000000" (example UUID) |
| `{ACCOUNT_ID}` | Your user account ID (from your tracker) | "example-account-id" |
| `{TEST_TOOL}` | Test case management tool | "Qmetry", "TestRail", "Zephyr", "Xray", "Azure Test Plans" |
| `{COLUMN_COUNT}` | Number of columns in import | "14", "25", "15" |
| `{DESIGN_TOOL_AND_LOCATION}` | Design file source | "Figma file at figma.com/file/abc123", "Local PNG exports in Design/ folder" |
| `{PRD_LINK_OR_PATH}` | PRD document location | "https://notion.so/...", "Confluence page at ..." |
| `{DATE}` | Date of action/verification | "2026-03-09" |

---

## Appendix B: Sections to Remove If Not Applicable

| Section / Subsection | Remove If... |
|---------------------|-------------|
| Section 1.4 (Regulatory Compliance) | Your project has no regulatory requirements |
| Section 5.1 Row 10 (Data Isolation) | Your project has no data isolation requirements |
| Section 5.1 Row 11 (Localization / Accessibility) | Your project supports only one language AND has no accessibility requirements |
| Section 5.2.7 (Data Isolation) | Your project has no data isolation requirements |
| Section 10 (Dashboard Auto-Refresh) | You are not using the Claude-powered dashboard |

---

## Appendix C: Quick-Start Setup Guide

Follow these steps to set up this playbook for a new project:

1. **Copy this file** as `CLAUDE.md` into your project's root folder
2. **Replace all `{PLACEHOLDER}` values** — use Appendix A as a reference
3. **Choose Principles 6 & 7** — pick the architecture and quality concerns most relevant to your project
4. **Fill in Section 1.4** — or replace with "no regulatory requirements" if not applicable
5. **Remove inapplicable sections** — use Appendix B as a guide
6. **Fill in Section 9.1** — map your epics and stories
7. **Fill in Section 9.3** — add your tool integration details
8. **Customize Section 8.1** — adjust the column mapping to match your test management tool's import format
9. **Start investigating** — follow Section 2.1 checklist for your first epic
10. **Document as you go** — use Section 11 to capture every learning

---

*Template version: 2.0 · Portable, tool-agnostic edition · Designed for reuse across any CRUD/SaaS/enterprise web application project.*
