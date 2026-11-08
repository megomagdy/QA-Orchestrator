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
6. **Source of truth** — when more than one requirements document exists (PRD, engineering hand-off, impact map, decision pages), ask which one wins when they disagree, and record the answer as the first decision. Until it is answered, list it as the first CRITICAL question.
   **Why:** on one feature, a hand-off and its PRD disagreed in five places (a value of 1h vs 30 min, a scope item only one of them listed). Every one of those conflicts was settled by a single ruling ("the hand-off wins"), which had to be asked for afterwards.

**Credential handling:** prefer pointing at an already-connected session or a stored-secrets location over pasting raw secrets in chat; follow the harness safety rules (never type passwords into login fields; never place secrets in URLs). Access is read-only wherever possible.

For each source: if available & authorized → run the matching pillar in Phase 5. If unavailable or declined → skip it and RECORD the omission as a coverage limitation in the output (Phase 8). These sources are OPTIONAL — never block the review on them — but the ask (with concrete access details) is MANDATORY.

## Phase 1: Document Analysis
For each document set (PRD, Stories, design files), extract: stated behaviors, field definitions, validation rules, state transitions, permission rules, calculations. Build a mental index of WHERE each piece of information lives.

**Prototype rule:** If a prototype/design is provided, review it RENDERED — open it in a browser, screenshot each screen, and extract the actual DOM (buttons, columns, tooltips, expand/collapse state, chrome). NEVER review a prototype from stripped text or the layer tree; those hide the very details manual review catches. Read the pixels.

**Design-reader checklist (same for every reader).** Whoever reads design frames (you or several agents) applies ONE checklist, and FLAGS each mismatch in an issues table; transcribing the text into an inventory is not flagging it. The checklist always includes:
- every message and label compared word for word with the spec's message / label table;
- every value (numbers, limits, defaults, options) compared with the spec's tables;
- **fixed periods in copy**: any calendar year, month or fixed date in screen text is suspect when the period is configurable (per-user year, fiscal year, billing cycle);
- every state the spec defines for the screen, and any state the design shows that the spec does not;
- **validation map**: every validation rule the spec gives a dialog or form has its own error-state frame with the spec's message; list the rules with no frame;
- **mock-data consistency inside each frame**: the shown state must follow from the shown data (an error appears only on a value that breaks the rule), names match the page they sit on, and dates use one format.
**Why:** two readers given different briefs flag the same mistake on one screen and miss it on the next. A reader who finds one issue in a dialog tends to stop there. An "edit scheduled change" error frame showed a start-date error on a valid future date, named a different person from the page it sat on and used a second date format, while the error users will really hit (a past date) had no frame.

**Absolute-word check.** List every absolute claim in the spec ("exactly", "always", "never", "only", "every", "all", "cannot") and check each against exceptions stated elsewhere in the same spec. An absolute with an exception elsewhere and no cross-reference is a finding.
**Why:** a rule "a refund returns exactly the counted days" and an exception "nothing comes back for a closed year" were both read and the contradiction was missed.

## Phase 2: Cross-Reference
Compare every fact across all documents. For each finding, cite BOTH documents and exact sections.

## Phase 2b: Spec-Silent Sweep (BEFORE writing any question)
Comparing sources finds contradictions; it does NOT find cases nobody wrote about. Build these three inventories from the feature's entities and screens, then turn every cell that no source answers into a question (or a stated assumption for MEDIUM/LOW). Each cell is either answered (cite the source) or raised; none is left blank.

1. **Data-shape & lifecycle inventory** (per entity and per rule): the same change made twice in one period, and changed back; records in progress at release (saved drafts, pending requests, scheduled changes) and what happens to them; past rows after a later correction (are past periods frozen or recalculated in reports, history and totals?); every variant of each related entity (e.g. for a calendar: working day, day off, holiday, a day with only extra entries; for an order: draft, partly shipped, cancelled); extreme ranges (shortest, longest, 0, maximum, "no limit" types with very long ranges, and whether a maximum length exists at all).
2. **Entity × action matrix**: for every entity, every action: **view**, create, edit, delete, export, bulk, API, and actions on behalf of someone else. For each cell: who may do it, the rule, the message. Never inherit the action list from how a source phrased its question; a source that lists "create / edit / delete" has said nothing about "view". **Configuration controls count as entities too:** every switch, toggle, flow or rule editor and settings form gets its own row (who may change it, which permission covers it).
   **Why:** a review asked which permission covers creating, editing, cancelling and viewing leave, but never which one covers the employee-requests switch or the approval-flow editor; the spec named neither.
3. **Implementer pass (screen-state matrix)**: for every screen and form, its loading / calculating, empty, error, no-permission, disabled, and limit states, and for every input its bounds. Ask "what does the developer need to build this?" for each.
4. **Rule intersections**: for every record state that changes what is allowed (open vs closed / locked period, past vs future, pending vs approved, active vs scheduled), list every rule that acts on a record in that state and every surface that shows it (balance, history, totals, invoices or payroll, report). Read the rules together and write the combined outcome; two rules that each look fine alone can contradict on the same record.
5. **Domain eligibility sweep**: for every type, option or benefit gated by eligibility, ask which real-world attributes the law or domain implies (religion, nationality, gender, marital status, age, contract type) beyond the ones the spec names, and check whether the data store holds them (and how often they are empty). Raise each unnamed attribute as a question.

6. **General shape**: the spec's headline example is one instance of a rule. List every shape the rule covers (N of each related record or type, any order, chains, mixed types; e.g. several line items, approvers, periods or schedule entries) and, for each question and worked example, check whether the answer changes for the general shape. Where it does, give the general variant its own example.
   **Why:** a feature was described with its most common pair (a main record followed by an extra one), but its rule joined any chain of touching records of any type. Examples covered only the pair, so the costlier cases were missed: with two main records, one forgotten final action left the second record looking unused and penalised, and one forgotten action could count as three penalties.

7. **Migrated and carried values on screen**: for every value the release carries over, recounts or migrates, write the worked display example on every surface that shows it ("X of Y", totals, history line) using the display rule's own formula. A value outside the normal range (carried above the yearly maximum, negative, empty) gets its own example.
   **Why:** "carry the balance over as it is" was accepted; the screen it produced ("9 of 6 days left", because Y is the company value) appeared only when a test case had to state the exact text.
8. **One name, one spelling**: every term the spec defines in more than one place (a standard name, a label, its translation) is compared across all its occurrences. This check runs even when the full translation review is skipped.
   **Why:** a leave type's Arabic name differed between the definitions section and the UI-labels table, and two other labels had two spellings each; skipping the Arabic review hid all three.

**Why (4–5):** "cancelling a past booking marks its days as missed" and "a closed period's records are never updated" were both quoted in the review and never read together; an eligibility-gated type was checked for the two attributes the spec named, but nobody asked about a third the domain implies, although the user table held that field.

**Why:** on one feature, an FE reviewer's questions about a yearly period changed twice, drafts in progress at release, past report years, an extra entry on a non-working day, viewing permission and the maximum length of a request were all missed by a review that compared spec, decisions page, design, code and data.

## Phase 3: Classify Findings
For each finding, classify as: Confirmed Behavior (verified across docs), Conflict (docs contradict), Gap (missing info that blocks TCs), Ambiguity (multiple interpretations possible).

**Answered is not the same as visible.** For every calculation, ordering rule and displayed column the spec defines, write a Confirmed Behavior with a **worked example at its boundary** (a change in the middle of a period, two automatic steps on the same day, each value a column can show). These become the oracles of `/write-tests`, and they stop the same questions being asked again.
**Why:** three of a stakeholder's six questions (a column's values, the credit in a month with two policies, the credit on a change's start day) were answered in the spec, but the review never surfaced them, so they looked open.

**Worked examples state every input and label every number.** Name each setting that changes the result (thresholds, tolerances, caps, rounding, time zone, defaults), state every user action and system event including the last one, and label each figure (e.g. counted vs missing vs paid). When the code is available, run the example through the code's own formula before writing the result.
**Why:** "Extra: 1h 55m, Short" was read as 1h 55m missing (it was time counted; 5 min were missing, and the time of the final action was never stated). "10 minutes late" was wrong under the setting's 15-minute grace. A daily-total example ignored a deduction the code applies.

**Today's behaviour that affects users, money or data another system consumes is a keep-or-change question, not a silent dev note.** When the code shows what the system does today (and you have traced it end to end, Phase 4 Pass 3), and it affects what users see, what anyone is charged or paid, or data another system consumes, raise it to product as: "Today X happens — step by step: trigger → code path → data written → every downstream consumer (totals, reports, exports, invoices, payroll, integrations). Keep it, or change to …?" Never write "may" where the code gives a definite trigger. Reproduce it on the test environment when that is safe: use a test account, record the before state, give a reason that names the review, and report the side effects. Keep as developer notes only code hygiene with no behaviour to choose (a missing migration, unsorted lookups, how times must be compared).
**Why:** six verified findings (an amount counted twice, a holiday rate never applied, one input channel skipping an eligibility check) sat as developer notes that product would never see. "The other record may also hold the amount" was rejected as vague. The step-by-step chain, reproduced on the test environment (period total 3.97 → 5.93), made it a decision product can take.

## Phase 4: Self-Verification (Two-Pass)
**Pass 1 — Premise Validation:** For every question, verify the premise. Check ALL documents before claiming something is missing.
**Pass 2 — Prior-Decision Check:** Check if any existing decisions/notes already answer the question.
**Pass 3 — Current-System Pass (when code, data or the live app is available):** for every question, ask "is this about how the system works **today**?" If yes, answer it yourself and record it as a Confirmed Behavior with its source; product is asked only about new behaviour the spec leaves open. Before stating what a user can or cannot do today, trace it through **every layer**:
- the **screen** (is the button shown? is the setting exposed, or hidden / commented out?);
- the **API guard or validation** (and, from the version-control history, e.g. `git log -S`, when that guard landed);
- the **engine** that computes the result.
A rule found in one layer is not the behaviour: a list built in the backend may never be read by the app. Check the **eligibility rules between entities** too (plan, role, contract, account type, region) before offering a combination as an example. Read every sub-agent claim in the code yourself before quoting it.
**Why:** three questions (an action on a day the user was on leave, recalculating a closed period, overlapping records) were answerable from the code, and the user asked why they were asked at all. "A second start on the same record is refused" came from a backend list the app never reads (the app shows a "start again" button). "The lock can be bypassed" came from a sub-agent summary, but the bypass was demo-only. An example used a setting whose toggle is commented out in the UI. Another combined two record types that an eligibility rule forbids.

## Phase 5: Ground-Truth Cross-Validation (each pillar only if available from Phase 0)
Run only the pillars the user confirmed available. Each resolves or upgrades findings that documents alone cannot settle. See [agents.md](agents.md) for orchestration.

- **Live app + adjacent-surface sweep:** DOM-audit the real screens; then sweep every NEIGHBOR surface that reads/displays/exports the feature's core entity (e.g. dashboards, related workflows, exports, every report, adjacent modules, entity-type variants, mobile, localization) for impact. Run a **current-system delta**: for every prototype element, does it exist in the app today (new / changed / absent)?
- **Existing-code baseline cross-validation:** locate the current implementation of each touched surface; verify every "unchanged / not changing" claim against the code; trace the entity's full read→display→export path and flag single-record / status-based lookups that a new state could bypass; enumerate variant branches (entity types, engines, migrated-vs-legacy paths); capture current constants as test oracles. Stale-guard: read the branch that reflects what's DEPLOYED, not a stale local checkout; stamp findings with the commit/date.
- **Current data store (read-only):** confirm entry-condition flags → select the test scope/tenant; verify the feature entity's schema (columns, statuses, contiguity, NULL vs value); hunt edge data (multi-record periods, unusual config, entity-type variants, unconfigured prerequisites); pull baseline rows as regression oracles. Guardrails: read-only, non-production, correct scope/tenant, no cross-scope/cross-tenant access.
  - **A row is not proof that the app allows it.** Test data holds seeded rows, rows from before a guard existed, and bug leftovers. Before citing a data shape as "exists" or raising it as a question, check the code guard that would block it, compare when that guard landed (version-control history, e.g. `git log -S`) with when the row was created, and check the live app when the guard is on the screen. Label every data-derived statement with its source and whether the shape is still creatable. Use data for "what to seed" and fill rates; use code and the app for "what the system does".
  - **Compare times the way the code does.** When records store a business date plus a time (often UTC, often wrapping past midnight), compute real moments with the code's own conversion (time zone, wrap, duration) before calling two records adjacent, overlapping or ordered. Never compare clock times on the date alone.
  **Why:** two findings came from rows the app cannot create today: an overlap from a seeded test user, and a forbidden combination of record types created before the guard landed. A naive clock-time query reported "exact" back-to-back pairs that were really a day apart, and the same data held 73 overlapping pairs of old rows.

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
Self-critique: What did I review from text only that should have been rendered? Which adjacent surfaces did I not check? Which "not changing" claims did I not verify against code/data? Which displayed number did I check only for reconciliation, not for meaning? Which existing reader of the changed data is missing from the consumer sweep? Which data shape did I not look for on the environment? Which Phase 2b cell (data shape, entity × action incl. view, screen state) is neither answered nor raised? Which absolute word did I not check against exceptions? Did every design reader apply the same checklist? Which record state (closed period, past date, scheduled) did I not cross with every rule and surface that acts on it? Which eligibility-gated type did I not sweep for unnamed domain attributes? Which validation rule has no error-state frame? Which calculation has no worked example in the Confirmed Behaviors? Which question is really about today's behaviour and could have been answered from the code, data or app? Which "today" claim did I take from one layer (or from a sub-agent) without tracing the screen, the API guard and the engine? Which data shape did I cite without checking that the app can still create it? Which time comparison did not use the code's own conversion? Which worked example leaves out an input that changes its result (a threshold, cap, rounding rule, time zone or the last user action)? Which question or example covers only the headline shape and not the general one? Which verified finding about today's behaviour stayed a developer note instead of a keep-or-change question? Which configuration control (switch, editor, settings form) has no permission answer? Which migrated or carried value has no worked display example? Which term defined in two places did I not compare? List anything skipped explicitly.

## Phase 7b: Closing Answers and Spec Edits (every answer round, every spec edit after the review)
An answer or a spec edit is a new clause. Before marking a question closed or an edit "matches":
1. **Re-read every other clause on the same rule** (search the spec for the rule's nouns: the field, the date, the type) and today's code path. A closed answer that contradicts another clause is not closed; raise the conflict, or after sign-off decide it as the write-tests skill says.
2. **Verify an "as today" answer per sub-rule.** List each sub-rule it covers (each type, field, channel) and check each one in today's code. One verified sub-rule doesn't verify the rest.
3. **Read a new or edited clause against the clause it qualifies**, not only against the answer it records (an edit to the "assign" rule is read against the "hire" rule it mirrors).
**Why:** three answers closed as matching their questions contradicted other text and surfaced only during test writing: a credit timing added to one rule disagreed with the hire rule; "sick and unpaid stay as today" contradicted "sick and unpaid included" in the working-day rule; "the reason field works as today" was checked for one part (the handover email) but not per leave type, where today's form differs.

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
- Configuration controls (switches, editors, settings) are entities: each gets its permission question
- Never close an answer or accept a spec edit without the Phase 7b cross-check against related clauses and today's code, per sub-rule
- A point counts as covered only when a flagged finding raised it, never because its text appears in an inventory
- Never ask product how the system works today: answer it from code, data and the app (Phase 4 Pass 3), traced through every layer
- A data row is never proof of what the app allows; check the guard and the app first
- Today's behaviour that affects users, money or downstream data goes to product as keep-or-change, with the step-by-step code chain; developer notes are for code hygiene only
- When a finding turns out wrong, correct it everywhere it appears (review, report, companion pages) and say so in the item
