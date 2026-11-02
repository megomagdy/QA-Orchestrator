---
name: review
description: Cross-review PRD, User Stories, and design files to identify genuine gaps, conflicts, and ambiguities. Uses two-pass self-verification to eliminate false gaps. When available and authorized, cross-validates against the rendered prototype, the live app + adjacent surfaces, the existing codebase, and the current data store (read-only). Use when investigating a new feature or epic before writing test cases.
---

# QA Investigation Review — $ARGUMENTS

Cross-review all provided documents to find REAL gaps, conflicts, and ambiguities — NOT to generate questions already answered in the docs.

A document-only review reliably catches doc-vs-doc conflicts but is BLIND to: prototype UI detail (tooltips, expand-state, columns, chrome), gaps that require knowing the current live system and its adjacent features, and implementation truth. Those gaps are recovered only by consulting ground-truth sources (Phase 0 + Phase 5). Never present a document-only pass as complete — state what was NOT consulted.

This skill is tool- and company-agnostic. Do NOT assume any specific vendor, stack, hosting, DB engine, VCS host, or tenancy model. Ask what the team uses; adapt to it. Project-specific facts (URLs, tenants, repo paths, connection details) come from the user or from project memory — never hard-code them here.

## Prerequisites

**Design exports:** If any design-tool export (Figma, Sketch, Adobe XD, Zeplin, screenshots, ...) exceeds ~1800px in any dimension, resize it to ≤1800px FIRST before reading. Claude cannot reliably read exports larger than 1800px — text becomes unreadable and element details are lost. Save resized versions in a `design/resized` subfolder.

Read any project QA-rules file (e.g. `qa-rules-condensed.md`) from the project root if one exists.

## Phase 0: Inputs & Ground-Truth Intake (ALWAYS ask first)

Before analysis, confirm the document set (PRD/BRD, User Stories, design/prototype, API specs, prior decisions) AND explicitly ASK the user which ground-truth sources are available — and collect the CONCRETE access details for each, not just a yes/no. Do not assume, do not silently skip:

1. **Existing manual QA notes / prior decisions** — file path or link. Fold them in and reconcile against them (Phase 6). Never run the review without first asking whether these exist.
2. **Live app** — the **environment URL** (staging/test/preview) AND **how to authenticate**: an already-connected/logged-in browser (simplest), a stored-credentials/secrets location the team uses, or a test account they choose to provide. Also which **account/role/tenant/context** to use.
3. **Existing codebase** — a **local path** OR a **remote repo** (any VCS/host) to fetch, AND the **branch that reflects what's deployed** (ask which; local clones may be stale — offer to fetch the current branch first).
4. **Current data store (read-only)** — whatever read-only access method the team already uses (a database MCP/connector, a CLI client, a connection string/secrets file, or an admin console/read API). AND the correct **scope/tenant/context** if the system is multi-tenant.
5. **Eligibility / entry conditions & test environment** — which users/roles/accounts/tenants/plans/flags can actually use this feature, and which environment+account to test on. It is the precondition for every test case; confirm it before anything.

**Credential handling:** prefer pointing at an already-connected session or a stored-secrets location over pasting raw secrets in chat; follow the harness safety rules (never type passwords into login fields; never place secrets in URLs). Access is read-only wherever possible.

For each source: if available & authorized → run the matching pillar in Phase 5. If unavailable or declined → skip it and RECORD the omission as a coverage limitation in the output (Phase 8). These sources are OPTIONAL — never block the review on them — but the ask (with concrete access details) is MANDATORY.

## Phase 1: Document Analysis
For each document set (PRD, Stories, design files), extract: stated behaviors, field definitions, validation rules, state transitions, permission rules, calculations. Build a mental index of WHERE each piece of information lives.

**Prototype rule:** If a prototype/design is provided, review it RENDERED — open it in a browser, screenshot each screen, and extract the actual DOM (buttons, columns, tooltips, expand/collapse state, chrome). NEVER review a prototype from stripped text or the layer tree; those hide the very details manual review catches. Read the pixels.

**Design-reader checklist (same for every reader).** Whoever reads design frames (you or several agents) applies ONE checklist, and FLAGS each mismatch in an issues table; transcribing the text into an inventory is not flagging it. The checklist always includes:
- every message and label compared word for word with the spec's message / label table;
- every value (numbers, limits, defaults, options) compared with the spec's tables;
- **fixed periods in copy**: any calendar year, month or fixed date in screen text is suspect when the period is configurable (per-employee year, fiscal year, billing cycle);
- every state the spec defines for the screen, and any state the design shows that the spec does not;
- **validation map**: every validation rule the spec gives a dialog or form has its own error-state frame with the spec's message; list the rules with no frame;
- **mock-data consistency inside each frame**: the shown state must follow from the shown data (an error appears only on a value that breaks the rule), names match the page they sit on, and dates use one format.
**Why:** two readers given different briefs flag the same mistake on one screen and miss it on the next. A reader who finds one issue in a dialog tends to stop there. An "edit scheduled change" error frame showed a joining-date error on a valid future date, named another employee and used a second date format, while the error HR will really hit (a past date) had no frame.

**Absolute-word check.** List every absolute claim in the spec ("exactly", "always", "never", "only", "every", "all", "cannot") and check each against exceptions stated elsewhere in the same spec. An absolute with an exception elsewhere and no cross-reference is a finding.
**Why:** a rule "a refund returns exactly the counted days" and an exception "nothing comes back for a closed year" were both read and the contradiction was missed.

## Phase 2: Cross-Reference
Compare every fact across all documents. For each finding, cite BOTH documents and exact sections.

## Phase 2b: Spec-Silent Sweep (BEFORE writing any question)
Comparing sources finds contradictions; it does NOT find cases nobody wrote about. Build these three inventories from the feature's entities and screens, then turn every cell that no source answers into a question (or a stated assumption for MEDIUM/LOW). Each cell is either answered (cite the source) or raised; none is left blank.

1. **Data-shape & lifecycle inventory** (per entity and per rule): the same change made twice in one period, and changed back; records in progress at release (saved drafts, pending requests, scheduled changes) and what happens to them; past rows after a later correction (are past periods frozen or recalculated in reports, history and totals?); every variant of each related entity (e.g. for a calendar: working day, day off, holiday, a day with only overtime or extra hours); extreme ranges (shortest, longest, 0, maximum, "no limit" types with very long ranges, and whether a maximum length exists at all).
2. **Entity × action matrix**: for every entity, every action: **view**, create, edit, delete, export, bulk, API, and actions on behalf of someone else. For each cell: who may do it, the rule, the message. Never inherit the action list from how a source phrased its question; a source that lists "create / edit / delete" has said nothing about "view".
3. **Implementer pass (screen-state matrix)**: for every screen and form, its loading / calculating, empty, error, no-permission, disabled, and limit states, and for every input its bounds. Ask "what does the developer need to build this?" for each.
4. **Rule intersections**: for every record state that changes what is allowed (open vs closed / locked period, past vs future, pending vs approved, active vs scheduled), list every rule that acts on a record in that state and every surface that shows it (balance, history, timesheet, payroll, report). Read the rules together and write the combined outcome; two rules that each look fine alone can contradict on the same record.
5. **Domain eligibility sweep**: for every type, option or benefit gated by eligibility, ask which real-world attributes the law or domain implies (religion, nationality, gender, marital status, age, contract type) beyond the ones the spec names, and check whether the data store holds them (and how often they are empty). Raise each unnamed attribute as a question.

**Why (4–5):** "cancel a past leave → its days show as absent" and "a closed cycle's attendance is never updated" were both quoted in the review and never read together; a religious-pilgrimage leave was checked for gender and service but nobody asked about religion, although the employee table has a religion field.

**Why:** on one feature, an FE reviewer's questions about a leave year changed twice, hiring drafts at release, past report years, overtime on a day off, viewing permission and maximum leave length were all missed by a review that compared spec, decisions page, design, code and data.

## Phase 3: Classify Findings
For each finding, classify as: Confirmed Behavior (verified across docs), Conflict (docs contradict), Gap (missing info that blocks TCs), Ambiguity (multiple interpretations possible).

**Answered is not the same as visible.** For every calculation, ordering rule and displayed column the spec defines, write a Confirmed Behavior with a **worked example at its boundary** (a change in the middle of a period, two automatic steps on the same day, each value a column can show). These become the oracles of `/write-tests`, and they stop the same questions being asked again.
**Why:** three of a stakeholder's six questions (a column's values, the credit in a month with two policies, the credit on a change's start day) were answered in the spec, but the review never surfaced them, so they looked open.

## Phase 4: Self-Verification (Two-Pass)
**Pass 1 — Premise Validation:** For every question, verify the premise. Check ALL documents before claiming something is missing.
**Pass 2 — Prior-Decision Check:** Check if any existing decisions/notes already answer the question.

## Phase 5: Ground-Truth Cross-Validation (each pillar only if available from Phase 0)
Run only the pillars the user confirmed available. Each resolves or upgrades findings that documents alone cannot settle. See [agents.md](agents.md) for orchestration.

- **Live app + adjacent-surface sweep:** DOM-audit the real screens; then sweep every NEIGHBOR surface that reads/displays/exports the feature's core entity (e.g. dashboards, related workflows, exports, every report, adjacent modules, entity-type variants, mobile, localization) for impact. Run a **current-system delta**: for every prototype element, does it exist in the app today (new / changed / absent)?
- **Existing-code baseline cross-validation:** locate the current implementation of each touched surface; verify every "unchanged / not changing" claim against the code; trace the entity's full read→display→export path and flag single-record / status-based lookups that a new state could bypass; enumerate variant branches (entity types, engines, migrated-vs-legacy paths); capture current constants as test oracles. Stale-guard: read the branch that reflects what's DEPLOYED, not a stale local checkout; stamp findings with the commit/date.
- **Current data store (read-only):** confirm entry-condition flags → select the test scope/tenant; verify the feature entity's schema (columns, statuses, contiguity, NULL vs value); hunt edge data (multi-record periods, unusual config, entity-type variants, unconfigured prerequisites); pull baseline rows as regression oracles. Guardrails: read-only, non-production, correct scope/tenant, no cross-scope/cross-tenant access.

## Phase 5b: Defect-Prevention Inputs (every feature)
Produce two lists that `/write-tests` turns into cases (see `skills/write-tests/defect-prevention.md`):
- **Consumer sweep (P8):** every data item, field, status and endpoint the feature changes, and every EXISTING reader of each — reports, exports, dashboards, limit / validation checks, summaries, notifications, other modules, mobile, integrations. Search the code when available; otherwise walk the app. A reader no document mentions is still listed.
- **Data shapes (P1):** start from the Phase 2b data-shape & lifecycle inventory, then add the shapes of data the feature's rules read (period lengths and boundaries, lifecycle positions, duplicates of "unique" values, empty optional fields, pre-release data, every entry point, brand-new account / tenant). Note which shapes exist on the test environment today and which must be seeded. Also ask product which environment can give a brand-new account.

## Phase 6: Manual-Notes Reconciliation (if the user has notes)
If the user provided (or has) a manual review — their own or a teammate's — map every one of their notes against your findings: Covered (both) / Yours-only (they caught, you missed) / Mine-only / Resolved. Nothing from their notes is dropped.
- **"Covered" needs evidence:** cite the flagged finding (conflict, question or issue-table row ID) that already raised the same point. Text that only appears in a transcription or inventory is NOT covered; never decide coverage by keyword search.
- **Verify their design quotes against the pixels** before counting a miss: notes taken from a design tool's text layers can quote labels that don't render.
- **For every "theirs only" item, name why it was missed** (which inventory or checklist lacked it) and add that gap to Phase 2b next time.
- Answers written into their notes (by product, design, dev) are decisions: quote them with the author's role and date, and check them against the spec — two answers can contradict each other.

## Phase 7: Completeness Gate (before output)
Self-critique: What did I review from text only that should have been rendered? Which adjacent surfaces did I not check? Which "not changing" claims did I not verify against code/data? Which displayed number did I check only for reconciliation, not for meaning? Which existing reader of the changed data is missing from the consumer sweep? Which data shape did I not look for on the environment? Which Phase 2b cell (data shape, entity × action incl. view, screen state) is neither answered nor raised? Which absolute word did I not check against exceptions? Did every design reader apply the same checklist? Which record state (closed period, past date, scheduled) did I not cross with every rule and surface that acts on it? Which eligibility-gated type did I not sweep for unnamed domain attributes? Which validation rule has no error-state frame? Which calculation has no worked example in the Confirmed Behaviors? List anything skipped explicitly.

## Phase 8: Output
See [output-format.md](output-format.md). Lead with an "Inputs consulted" header stating which ground-truth sources were used vs unavailable/declined, so reduced confidence is explicit.

## Rules
- NEVER generate questions about things already answered in the documents
- ALWAYS cite exact document and section for every finding
- ALWAYS ask which ground-truth sources (live app / code / data / manual notes) are available AND collect concrete access details before reviewing; use those that are, record those that aren't. They are optional; the ask is not.
- Stay tool- and company-agnostic — ask what the team uses; never assume a vendor, stack, DB engine, VCS host, or tenancy model.
- NEVER review a prototype from stripped text — render it.
- For every "not changing" claim, verify against code/data if available before accepting it.
- Priority: CRITICAL (blocks all TCs) > HIGH (blocks key TCs) > MEDIUM (affects edge cases) > LOW (nice to clarify)
- If you're unsure whether something is a gap, check ALL documents before reporting it
- ALWAYS run the Phase 2b spec-silent sweep before writing questions; a review that only compares sources is incomplete
- Ask every action for every entity, VIEW included; never take the action list from a source's own question
- A point counts as covered only when a flagged finding raised it, never because its text appears in an inventory
