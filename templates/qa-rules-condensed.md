---
name: qa-rules-condensed
description: Condensed rules from all 16 QA skills. Load THIS instead of individual skill files to save tokens. Contains only the rules, no examples or code.
---

# QA Rules — Condensed Reference
> Source: 16 QA skills compressed into essential rules only.
> Use this file instead of loading individual skills to save context tokens.
> Only load a full SKILL.md when you need specific code patterns or detailed examples.

---

## 1. Investigation Rules (from: unified-qa, test-plan-generation)
- Ask for ground-truth sources BEFORE reviewing: prior manual notes, live app, existing code, current data — collect concrete ACCESS DETAILS, not a yes/no. They are optional; the ask is not.
- A document-only review is blind to prototype UI detail, adjacent-feature gaps, and implementation truth. Record every ground-truth source you could NOT consult as a coverage limitation.
- Never review a prototype from stripped text or a layer tree — render it, screenshot it, read the DOM.
- Verify every "unchanged / not changing" claim against code or data before accepting it.
- Trace the feature entity's full read → display → export chain; flag single-record and status-based lookups a new state could bypass.
- Enumerate entity-type / engine / migrated-vs-legacy branches before scoping — a feature specced for the default path may not apply to them.
- Sweep ADJACENT surfaces that read, display, or export the feature entity (dashboards, exports, every report, related workflows, localization).
- Check displayed numbers for MEANING, not only reconciliation — a correct sum can still misrepresent what it covers.
- Reading the other party's notes before a "fresh" review makes overlap a measure of priming, not discovery — never report it as a score.
- Use the data store to select test data (real edge rows, unusual config, entity-type variants) instead of inventing preconditions.
- NEVER write TCs from a story title alone. Read PRD, design files, API spec, QC decisions first.
- Use SFDP decomposition: States, Fields, Data interactions, Permission gates.
- Every question must pass premise validation against Foundational Rules Registry.
- Screen types determine test patterns: List, Form, Wizard, Inline CRUD, Settings, Dashboard.
- Only apply patterns for features CONFIRMED in design docs.
- QC decisions override PRD, design files, and assumptions.
- Budget ≥ 30% for negative/boundary/edge cases — the THREE COMBINED, not Negative alone (Negative typically lands near 20% and reads as a false failure).
- Every AC → minimum 3 TCs (happy + 2 negative/boundary/edge).
- **Ask product who is eligible for the feature BEFORE writing TCs** — which tenants/companies/plans can actually use it. Eligibility is the entry condition of every TC; PRDs routinely document the gate they own and omit platform-level gates they take for granted.
- Design-tool layer names are NOT the rendered text — never quote UI labels from a layer tree (see 10.35).
- "X appears nowhere" claims require reading 100% of frames/screens, never a sample (see 10.75).
- A clickable prototype can be knowingly stale — establish which artefact is source of truth before writing TCs, and state it on the implementation ticket.
- Diff artefact versions between deliveries; never re-read the whole file. Regressions hide in the changed hunks.
- Re-check "resolved" review items after every build — reversed decisions get reintroduced.
- Screen recordings are first-class DOM evidence when the app is unreachable: metadata, then an overview frame grid, then frames at the interesting timestamps.
- Reproduce bug steps from the recording frames, not the reporter's one-liner — recordings carry detail summaries omit.
- Report execution as "N of M ran", never as a suite pass. State the denominator and mark untested cases explicitly.

## 2. Test Case Design Rules (from: unified-qa, test-plan-generation)
- TC ID: E{epic#}-{type}-{seq}. Types: P=Positive, N=Negative, E=Edge, S=Security, L=Localization.
- Priority: P0=smoke, P1=core, P2=extended, P3=edge.
- Every TC links to ≥ 1 issue tracker story. No orphaned TCs.
- Expected results MUST match QC decisions exactly.
- Validation timing: WHERE does validation fire? (form save? binding? assignment?)
- Linked-state blocking is absolute: ALL modifications blocked (edit, rename, delete).
- Test techniques: Equivalence Partitioning, Boundary Value Analysis, Decision Tables, State Transition.
- Steps must reference actual UI elements (DO: "Click 'Save' button" / DON'T: "Click submit").
- Preconditions must be specific and reproducible.
- Boundary and Edge share the `E` ID letter — the true category lives in the `[Category]` Summary prefix. Filter/report on the prefix, never the ID letter.
- Generate the readable (.md) and importable (.xlsx) outputs from ONE data file; apply suite-wide preconditions inside the generator, never by hand (see 10.77).
- Tag assumption-based TCs in Labels + a `REVISIT:` marker in Description so one filter returns every TC needing revision when answers land (see 10.78).
- Splitting a suite into subsets: define the subset once in the data file and assert the partition (subset + rest === total, no overlap) or fail the build.
- Every TC step opens from a named module; identify a transient record by state, never by name.
- Never bake instance data (record names, person names) into navigation steps — it breaks the suite on every other tenant.
- When one navigation error is reported, audit ALL cases — a single symptom commonly hides several more classes.
- Use the test-tool Description column for AC traceability, not a restatement of the Summary.
- Duplicate = same expected result OR verifies the same thing. State/screen/endpoint/persona variants are steps in ONE case. Build a behaviour inventory before writing; the generator fails on duplicates.
- Give TC writers requirements, not areas: traceability matrix (clause → behaviour → case) BEFORE writing; agents return a "not covered" list; a coverage gate fails on unmapped clauses, dangling IDs and orphan cases.
- Spec-silent behaviour still gets a case, on a stated reasonable assumption (tag + REVISIT). "Not covered" is never a valid status.
- Compute boundary fixtures from the system's actual formula, not the spec default — configurable bases override documented ones.

## 3. Form Validation Rules (from: form-validation-breaker)
- Client-side validation is convenience, not defense. Always test server-side.
- Boundary values: min, min-1, min+1, max, max-1, max+1, zero, empty, null.
- Whitespace-only, tab-only, newline-only on required fields → must reject.
- Encoding attacks: same char as UTF-8, URL-encoded, HTML entities, Unicode escapes.
- Multi-step forms: test step order manipulation, replay, incomplete flows.
- Error messages must not leak implementation details.

## 4. Security Rules (from: owasp-security-testing, auth-bypass-tester)
- OWASP Top 10: Broken Access Control (#1), Cryptographic Failures, Injection, Insecure Design, Security Misconfiguration.
- RBAC: test every endpoint with authorized role, unauthorized role, unauthenticated, cross-tenant.
- IDOR: verify authorization for every resource accessed by user-supplied ID.
- JWT: test tampered tokens, expired tokens, algorithm downgrade (none/HS256).
- Session: test logout invalidation, session fixation, concurrent sessions.
- Injection payloads: SQL (' OR '1'='1), XSS (<script>), NoSQL ({$gt:''}), Command (; ls).
- Security headers: CSP, X-Content-Type-Options, X-Frame-Options, HSTS, Referrer-Policy.
- Rate limiting on login and sensitive endpoints.
- Passwords never in URLs or API responses.

## 5. Accessibility Rules (from: axe-core-accessibility)
- WCAG 2.1 AA baseline for all pages.
- axe-core tags: wcag2a, wcag2aa, wcag21a, wcag21aa.
- Every input must have an associated label (not just placeholder).
- Focus must be trapped in modals, returned to trigger on close.
- Focus indicators must be visible on all interactive elements.
- Color contrast: 4.5:1 normal text, 3:1 large text, 3:1 UI components.
- All functionality keyboard-accessible. No tabindex > 0.
- Form errors announced via aria-live or role="alert".
- Scan AFTER dynamic content loads (modals, dropdowns, AJAX).

## 6. Playwright Automation Rules (from: playwright-e2e, playwright-enhanced)
- Page Object Model: BasePage (abstract) → concrete pages. Locators in constructor.
- Selector priority: getByRole > getByLabel > getByPlaceholder > getByText > getByTestId > CSS.
- NEVER use page.waitForTimeout(). Use auto-waiting or explicit event waits.
- Auth state reuse via storageState (login once, reuse across tests).
- Config: retries 2 on CI / 0 local, trace on-first-retry, screenshot only-on-failure.
- Multi-environment via TEST_ENV variable (local/staging/production).
- Tag tests: @smoke, @regression, @security, @a11y.
- Each test must be independent. No shared mutable state.
- Wrap API seed calls in retry helper (3 retries, 2s delay) to handle staging DNS hiccups.
- Mid-run auth refresh: detect login redirect in POM navigation, re-authenticate, retry.
- Hide floating chat widgets via `page.addStyleTag()` — they intercept clicks near bottom-right.
- Use `scrollIntoViewIfNeeded()` + `force: true` for buttons obscured by sticky footers/widgets.
- For component library forms: use `fill()` + dispatchEvent instead of Tab key (avoids corrupting adjacent fields).
- Backend APIs may reject empty arrays in required collection fields — always verify with test API call first.
- Automation catches ~40% of manual bugs (functional only). Visual/design compliance needs screenshot comparison tools.
- Analyze failures iteratively at 5-failure checkpoints per epic — don't wait for full suite completion.
- Scaffolding for an unbuilt feature: wire, map to TC IDs and typecheck, then test.fixme() with a reason. A guessed-selector green is worse than an honest skip.

## 7. API Testing Rules (from: api-testing-rest, playwright-api-testing, postman-api-testing)
- Test all CRUD operations per resource.
- Validate status codes: 200/201/204 success, 400/401/403/404/409/422 errors.
- JSON schema validation for every response.
- Test pagination, filtering, sorting parameters.
- Validate response headers (Content-Type, security headers).
- Chain requests via variables (create → get → update → delete).
- Data-driven testing with CSV/JSON data files.
- Clean up test data (DELETE what you POSTed).
- Seed master data only (entities, rates, assignments). Never fabricate derived records — computed rows are internally inconsistent and mask the defects under test.
- Seed scripts need idempotence, a state guard that aborts if the assumed state has moved, and a generated rollback capturing exact prior values. Tag seeded rows so they are findable.
- Deliberately plant the precondition that triggers an otherwise-untested path, then assert every consequence of the rule in one run.
- Check the API payload before reporting a missing flag from the DB schema — the real flag is often exposed only in the resource.
- Invariants enforced only in application code need API-level negative tests; inspect the actual indexes rather than assuming.
- A stored column and the API value can differ — trace which one the UI reads before asserting staleness.
- Static code review can predict per-case pass/fail when execution is blocked — label it a prediction, never a result. Developer comments often reveal spec-vs-implementation conflicts.

## 8. Bug Report Rules (from: bug-report-writing)
- Exports and reports may read the raw entity row rather than the calculated result items — verify the source of every reported figure.
- Entry points can be asymmetric: an action present on a legacy surface may be absent on the migrated/v2 surface the eligible audience actually sees.
- Title formula: [Action] [Component] - [Symptom].
- Severity: Critical (crash/data loss) > High (core broken) > Major (impaired, workaround) > Minor (cosmetic).
- Priority (separate): P0=immediate, P1=this sprint, P2=before release, P3=backlog.
- One bug per ticket. Group related failures to same root cause.
- Steps must be exact: URL, click target, input value, button name.
- Always include: environment, evidence (screenshot/HAR/console), reproducibility, workaround.
- For API bugs: full request + response + server logs.
- For mobile bugs: device model, OS version, network condition.
- Tracker "Bug" may be a SUBTASK type — parent bugs to a Story (hierarchy-0 issue), not to dev-task subtasks; a standalone "Defect" type may exist at story level.
- Attach evidence via the tracker REST `POST /issue/{key}/attachments` (node FormData + `X-Atlassian-Token: no-check` + Basic auth) — the issue-tracker MCP has no file-upload tool; keep creds in `Manual Execution/.env`.
- Bug tickets state the problem only — no root-cause section, no code-level diagnosis, no suggested fix. Keep Workaround: it is user guidance, not a fix instruction.
- Verification against source still happens; it just stays in the working notes, not on the ticket.
- Issue-tracker markdown fields need Markdown headings, not wiki markup — wiki syntax renders as literal text.
- Some create APIs HTML-escape quotes in the summary field; set the title in the follow-up edit call or avoid quotes.
- Confirm assignee identity before filing — directories return many near-matches and display names differ from how people are written in notes.

## 9. CI/CD Rules (from: ci-cd-pipeline-config)
- Run tests on every PR.
- Fail build on critical accessibility violations.
- Upload test reports and artifacts.
- Use Newman for API test execution in CI.
- Separate smoke (fast, every PR) from full regression (nightly/release).

## 10. Mobile Testing Rules (from: appium-mobile-testing)
- iOS: touch vs click semantics, keyboard overlay scroll, momentum scrolling, safe area.
- WebKit dropdown issues: tap → wait 500ms → tap again → try keyboard.
- Test on real device viewport sizes (iPhone 14 Pro Max for iOS QA).

## 11. Lessons Learned — Hard Rules (from: unified-qa)
- 10.80: Feature eligibility may exist ONLY in a meeting recording, in no written doc. Ask, confirm, and get it written down — it is the precondition of every TC and dictates the test environment/account.
- 10.81: A migrated/versioned tenant may render a DIFFERENT surface than the docs describe. Confirm which screen the eligible audience sees before writing UI TCs.
- 10.82: A single-record, status-blind lookup keyed on a boundary date silently drops a record effective mid-range — the write path can be correct while the read path is the entire bug.
- 10.83: A per-unit calculation mode (units × rate) can override an aggregate total, so an aggregate-splitting feature may not apply to those entities at all.
- 10.84: A spec can name a touch point that does not exist in code. Locate the real generator before scoping it.
- 10.85: Shared skills/agents copied into projects silently drift — LINK them to the shared source. Copies ran a months-old command while the shared folder was current, with no error.
- 10.86: Link what you CONSUME, copy what you AUTHOR. A file the project writes to must stay a copy or the learn step bypasses the sync review gate.
- 10.87: Before replacing a directory with a link, diff it and promote local-only content into the shared folder first — never clobber.
- 10.88: Preserving an item is not promoting it. Duplicates with near-identical descriptions compete for the same triggers; evaluate, then retire them with a note on what supersedes them.
- 10.89: Windows Compress-Archive writes backslash zip entry paths that consumers reject as invalid; build archives with node + jszip using forward slashes.
- 10.90: Virtualized transcript/list panels expose their full buffered range in the accessibility tree — read the panel node instead of scrolling or copy-pasting.
- 10.91: A browser debugger/extension conflict blocks clicks, screenshots and JS while page reads keep working. Plan around it; ask the user to close DevTools / disable other automation extensions.
- 10.92: Headless Chrome renders HTML→PNG with no package dependencies — keep documentation diagrams regenerable from source rather than as stale binaries.
- 10.93: SPA deep links must be read from route definitions, not guessed — a wrong path can silently redirect and look like a permissions problem.
- 10.1: Validation timing — if deferred, current stage must expect SUCCESS.
- 10.2: Linked-state blocking — if hard-blocked, ALL modifications blocked.
- 10.3: Delta files — headers must match main file exactly.
- 10.4: Don't assume UI features — confirm in design files/PRD/DOM first.
- 10.5: Snapshot vs live-fetch — know which for every entity relationship.
- 10.6: Cross-validation is not optional — ~4% of TCs contain contradictions.
- 10.7: Ghost UI elements — run DOM audit before finalizing UI-dependent TCs.
- 10.8: Holistic cross-epic investigation — never review one epic in isolation; read ALL epics/stories together first.
- 10.9: Three-gate quality filter for open questions: blocks TC writing, misleads expected results, or genuine gap.
- 10.10: Verify product answers address the specific question asked, not a related topic.
- 10.11: Extract QC decisions as numbered entries (QC-NNN) from product answers — actionable + auditable.
- 10.12: Verify import format against a real production template, not documentation — docs drift from reality.
- 10.13: Agent subprocesses may not write files — orchestrator must capture and persist results.
- 10.14: TC type tags (13 approved) + ordering (Happy/Positive first, Edge/Corner last) enable execution prioritization.
- 10.15: Cache files eliminate 60-70% token usage on repeated analysis — build after each major phase.
- 10.16: Issue tracker API cannot convert subtask↔standalone type — create new issue of target type and copy fields.
- 10.17: Issue tracker sprint custom field requires plain numeric ID, not an object — API rejects non-numeric values.
- 10.16: Issue tracker create-API may double-escape newlines — always follow create with edit to fix formatting.
- 10.17: Mid-flow cross-tab entity edits bypass server-side validation — test stale-data scenarios.
- 10.18: Automation catches ~40% of manual bugs — pair with visual regression for full coverage.
- 10.19: Backend APIs may reject empty arrays in required collection fields — verify payloads before building seed helpers.
- 10.20: Custom UI components render items as `button` elements — check accessibility snapshot before writing selectors.
- 10.21: Form fields with pre-populated defaults make "empty field" validation untestable — mark as `test.fixme()`.
- 10.22: Ask, Don't Guess — when a command says "ask the user", stop and ask. Never infer paths or values.
- 10.23: Analyze Playwright failures at 5-failure checkpoints per epic — don't wait for full suite completion.
- 10.24: Always verify QC decision sources in ALL project files (appendices, cache, shared-chat) before claiming hallucination.
- 10.25: Design files may show out-of-scope features — always cross-check against PRD "Out of Scope" table. PRD authority > design presence.
- 10.26: Handover docs must explain screen flows (what the user does, what happens, what to watch for), not just list UI elements — design details woven into narrative, not inventoried as bullet lists.
- 10.27: Backend must re-validate entity status at submission time — multi-tab stale-state race conditions allow duplicate operations on already-transitioned entities (e.g., paying an already-paid invoice).
- 10.28: Bug reporting: split intelligence (Claude writes descriptions/overrides) from execution (script calls API) — saves ~90% tokens vs MCP tools.
- 10.29: Issue tracker createIssue must explicitly set labels field — summary prefix alone doesn't create labels. Include sprint field if applicable.
- 10.30: Bridge files decouple Claude intelligence from script execution — Claude writes JSON (descriptions, overrides), script reads and executes API calls.
- 10.31: Issue tracker search API may have per-request result limits (e.g., 100) — always verify totalCount vs returned count and fetch remaining separately.
- 10.32: Bug-to-TC traceability reports must include TC summaries, not just IDs — IDs may differ between internal drafts and test management tools.
- 10.28: Mutually exclusive UI states must use exclusive rendering logic — independent condition checks cause conflicting banners/notifications to display simultaneously.
- 10.29: When story updates add new TCs, always re-run the FULL test-import generator (not just the delta) to keep the main import file current. Generate BOTH: main file (full suite) + delta file (incremental import).
- 10.33: PRD worked examples with exact amounts are P0 acceptance fixtures — convert each into a TC with exact figures as expected results.
- 10.34: Use FR/PRD references as placeholder TC linkage when no issue tracker stories exist. Bulk re-link when stories are created.
- 10.35: (REVISED) If your design tool exposes an MCP/API (design-tool example: Figma MCP `get_metadata`/`get_screenshot`), use its structured data for STRUCTURE only — node IDs, geometry, hierarchy, frame inventory. **Layer names are NOT the rendered text and must never be quoted as UI labels**: they persist from earlier design iterations, so a menu whose layers are named "Loan"/"More" can render "General"/"Letter". Extracting labels from a layer tree produces confidently wrong test steps. The correct fix for an unreadable export is a higher-resolution per-frame crop (10.68), NOT falling back to layer names.
- 10.36: PRD field validation tables (Required/Disabled/Auto-calc per field per type) generate form TCs for ALL types even when the design files show only one variant.
- 10.37: QC decisions can replace PRD data models, not just clarify ambiguity — update ALL dependent TCs when QC introduces a new model.
- 10.38: Before rating any open question HIGH/CRITICAL, verify the feature is NOT in PRD "Out of Scope" — aggressive scope validation eliminates false-priority questions.
- 10.39: Test management tool Story Linkages column supports compound values — on bulk rewrite, split on comma, map each key independently, rejoin. Treating the cell as a single atomic key corrupts multi-story linkages.
- 10.40: Issue tracker epic children may include mixed types (Bug + Story) and duplicate story labels — when bulk-mapping placeholders, filter by `issuetype = Story`, extract the ordinal token from each summary, pick canonical key (lowest issue key) on duplicates. Never use blind ordinal mapping.
- 10.41: Per-component design audit, not per-screen — enumerate every interactive affordance (sortable columns, hover states, action menus) and every page-level state variant (locked/approved/empty/error). Classify each design element: PRD-supported / PRD-silent (open question) / PRD-out-of-scope / decorative. Silence in the QC log is a gap, not an answer.
- 10.42: Modal-scope decisions are not page-scope decisions. When QC documents a state inside a modal, walk every render surface (page banners, lists, KPI cards, side panels) and ask "what does this state look like here?" Closed-cycle / locked-record / deferred-feature global states must be audited at every render surface independently.
- 10.43: Cross-epic seams need a verb × state matrix. When two epics share a data dependency (one mutates, the other reads), enumerate every upstream verb × every downstream state. Each cell is documented OR an open question — there is no implicit cell. Empty cells = automatic open questions.
- 10.44: Nightly recompute jobs (e.g., timesheet/payroll/balance derivers) overwrite direct DB seed edits — pause the cron during fixture setup, OR seed the upstream tables and let the job derive, OR replicate the job's logic exactly in the seed script. Verify by re-running validation after the job's next scheduled execution.
- 10.45: API status enums may silently filter unknown values — verify every status used in fixtures is rendered by the UI; unrenderable values cause empty cells, not errors. When an enum value documented in DB is missing from API output, assume it's deprecated and use the closest accepted value.
- 10.46: `new Date(mysql_datestring).toISOString()` corrupts timestamps when the MySQL connection uses `dateStrings:true` — JS `Date` parses the string as local time, then `.toISOString()` outputs UTC. Round-tripping shifts data by the timezone offset. Use string manipulation or `Date.UTC()` for time arithmetic in seed scripts.
- 10.47: Per-row JS DB loops are 50-100× slower than set-based SQL UPDATE on remote databases — express derived columns as joinable subqueries inside one UPDATE per column. Reserve JS loops for genuinely procedural logic that can't be expressed in SQL CASE.
- 10.48: When seeding new parent rows that drive UI forms, always insert dependent linkage rows (e.g., policy/break/join tables) — UI fetch queries often INNER JOIN on these and silently fail to populate Name/Start/End fields when the linkage is missing. Every "form fields empty after seeding" bug traces to a missing FK row in a dependent table.
- 10.49: When a database column appears unused by the UI (e.g., a `*_ar` localization column), verify by direct UI inspection — write to the column and confirm it surfaces. Don't assume schema columns are wired up; legacy columns frequently exist as future-i18n placeholders that aren't actually consumed.
- 10.50: Migration `predict()` rules must be ordered by priority — terminated/skipped users first, then exclusive types (specific nationality+employment+shift_type combinations), then "no-data" unmapped catalog, then classification overrides, then employment_type-driven branches. Document every product Q-clarification as a numbered rule and apply in this exact priority order.
- 10.51: UI may read from a join table (e.g., `*_packages`) rather than the aggregate column on the parent (e.g., `parent.total`) — when seed scripts populate the parent's totals correctly but the UI shows zeros, look for a per-component join table that the UI prefers. Audit: every active parent row should have ≥1 row in the join table and the parent's aggregate column should match `SUM(join_table.amount)`.
- 10.52: Aggregate columns must be set explicitly — populating the per-component fields alone may not auto-trigger the sum. INSERT must include both the components AND the explicit aggregate column. Date columns should never be left as `'0000-00-00'` (UI may interpret as a far-future placeholder).
- 10.53: Status enum partitions matter — rows with `status='pending'` (or other non-canonical statuses) are invisible to migration / aggregation logic that filters `WHERE status='active'`. Don't insert parallel "active" rows alongside existing pending rows; promote the pending row to active via UPDATE (preserving original component values).
- 10.54: (Tool-specific example: Qmetry) XLSX template — sheet name `TestCases`; Summary uses `[Type-Tag]` prefix (Happy/Edge/Negative/Integration/Idempotent/Localization/Regression); Status column empty; Version string `1.0`; TestCase Type `Manual`. Multi-row pattern: 1 metadata-bearing first row + N step-only rows (no separator). The transferable rule for ANY test tool: always inspect a real production template's row 2 before generating; keep internal TC IDs in a spare column (the tool assigns its own keys on import). **Verified divergences from skill documentation** (re-confirmed against a real template): `Is Shareable Step` is `0`, not `FALSE`; and `Assignee`/`Reporter`/`Created By`/`Created On`/`Updated By`/`Updated On` ARE populated with an account ID and `DD/Mon/YYYY HH:MM` timestamps — docs claiming "EMPTY always" for those are wrong. Always trust the file over the doc.
- 10.55: Cross-story rendering matrix (within the same epic) — when story A produces data and story B displays it, build an explicit matrix BEFORE writing TCs. Rows = visible attributes (status chips, indicators, columns); Columns = each rendering surface; Cells = TC IDs asserting consistency. Empty cells = required TCs (or explicit "out of scope" justification). Same silence-mapping pattern as cross-epic seams (10.43), but at the within-epic story level. Asserting a behavior in one story and assuming peer stories inherit it is a methodology failure.
- 10.56: Screenshot test for view/list/container stories — sketch a typical row and enumerate every visible element BEFORE writing TCs. Map each element to "asserted by TC X" or "open question." Empty mappings = automatic TC backlog. Plus: run a category-bias smell check on the TC mix — if >90% of TCs target frame/range/filter/picker behavior, the row content is likely under-tested. The PRD's defining sentence often biases attention toward the FRAME instead of the CONTENT.
- 10.57: Late-hours rule — within grace → late=0; past grace → late = FULL delay from shift_start (NOT delay − grace). Within-grace pre-time is "free" (not late, not short). Always derive from raw punches + schedule, never `delay − grace`.
- 10.58: Short-hours rule — sum of mid-day gaps + early-clock-out time, computed across ALL punches per day. Active window extends past shift_end by `late_clock_out_minutes` tolerance (typically 120 min); working past shift_end within tolerance cancels early-out short. Single-punch analysis misses split-shifts and inflates short totals.
- 10.59: `timesheet.shortage_hours` may store COMBINED late + pure-short. For business formulas treating late and short as separate buckets (`+ late + shortage + ...`), using raw DB.shortage_hours produces double-counting. Use `pure_short = DB.shortage_hours − DB.late_hours` OR derive from raw punches.
- 10.60: Migration eligibility for "active employees only" rules = `users.status='active'` (current status). NOT presence in historical off-board / termination tables — a user can have a historical off-board row and a current status='active' (re-hired). Filter `WHERE u.status='active' AND u.deleted_at IS NULL`; ignore off-board tables.
- 10.61: Matrix-driven classification source = LATEST contract by `start_at DESC`, regardless of contract status (active/pending/completed). UI may render contracts as "Active" by date range, not by DB status. Filtering `status='active'` only misses pending contracts whose `contract_type` was correctly assigned. SQL: `WHERE id = (SELECT id FROM user_contracts WHERE user_id=u.id AND deleted_at IS NULL ORDER BY start_at DESC, id DESC LIMIT 1)`.
- 10.62: Migration test-data realism = backup-ONCE → delete-after-cutoff (per cycle) → test → restore. Delete transactional rows dated after the cutoff (punches, breaks cascade, computed daily summaries, future payroll-amount rows); KEEP forward-looking scheduling rows (scheduled shifts, assignments, approved leave). Future schedule = logical; future actual (punch/computed result) = not. Back up only touched tables once; restore between cycles.
- 10.63: Daily-job derived rows are per scheduled unit, not per day. A start-of-day job creates one derived row (status=absent) per scheduled shift until the employee acts; off-days produce NO row; 2 shifts/day = 2 rows. Backfill keyed on the schedule row id, assigned-measure = scheduled duration, actuals = 0, only up to today/cutoff.
- 10.64: A revamped module often writes to a PARALLEL new table set while the legacy table still exists, and the new UI reads the NEW tables. By-entity cleanup/seeding/verification that queries only legacy tables leaves orphan rows that still render in the UI. Enumerate ALL new-system tables (parent + FK children + sibling feature tables) and verify against the actual UI surface.
- 10.65: Migration eligibility bug class — non-active users (off-boarded/terminated) with mapping-eligible inputs still get a LIVE migrated row instead of being skipped/soft-deleted. When verifying an "active-only" migration, also assert every NON-active user has NO live migrated row; treat a live row on a non-active user as the same bug class as "unmapped row not soft-deleted."
- 10.66: A shared prerequisite (cut-off/cycle config) should gate ONLY dependent flows, not the whole module — focused "set up X" empty-state CTA (shortcut to that one config step, not the full wizard); independent flows keep working with graceful fallback. Build an explicit BLOCKED-vs-NOT-BLOCKED surface list, write TCs for both, watch cross-platform inconsistency (web blocks vs mobile allows) and coverage gaps when the gating spec postdates the TC suite.
- 10.67: DB-scripting quirks for fixture/migration work — (1) reserved-word columns (`from`/`to`/`group`/`order`): backticks get eaten by the shell in inline `node -e`; write the query to a `.js` file. (2) Restoring legacy NULLs into now-NOT-NULL columns fails strict mode → `SET SESSION sql_mode=''` first. (3) Convert local cutoff to UTC before comparing DB timestamps (account for DST; summer UTC+3 → local-noon = 09:00 UTC).
- 10.68: (REVISED — coordinate-driven method preferred) Panoramic/multi-screen design exports blow past the readable-image limit; whole-image downscaling makes every device screen unreadable. **Preferred: crop by the design tool's own frame coordinates.** Exports map onto the design canvas at a fixed scale + uniform padding — derive it, verify it per board (`section_w × scale + 2×pad == export_w`), then crop each frame exactly and resize only if it still exceeds the limit. A Figma export commonly maps at 2× scale + 80px padding (`px = coord × 2 + 80`). This yields one readable image per screen with no guesswork. **Fallback** when coordinates are unavailable: slice into N vertical segments with a small overlap and resize each into a `resized/` subfolder. (Section 2)
- 10.69: Before pushing open questions, cross-check each against your OWN Confirmed Behaviors list and the design files already reviewed — drop any question already answered there. Raising a gap whose answer you captured erodes trust and wastes product time. (Section 7)
- 10.70: (Tool-specific example: Notion) Notion MCP has NO hard page-delete — `in_trash` on update-page is silently ignored (only updates properties). To remove a DB row, `move-pages` it to the workspace (detaches from the data source); permanent delete needs the Notion UI. The transferable rule: after any delete/remove via a platform MCP, re-query to confirm the row is actually gone. (Section 11)
- 10.71: Open-question tracker titles must be full self-contained questions (end in "?"), not terse labels — stakeholders scan titles in the table view. Keep the short ID (Q1, Q2…) in a separate property. (Section 8)
- 10.72: Team-chat MCP integrations (e.g. Slack) may have NO delete or edit-message tool — only send/draft/schedule/react/read. Treat posts as irreversible via API; retract via a follow-up message or manual UI delete. Draft tools are the "offline" path (save without sending) but often allow only ONE attached draft per channel. (Section 11)
- 10.73: The bug-report ingestion script (report-bugs.js) parses bugs ONLY under a section header (`Epic N:`) with a `(back end)/(BE)/(FE)` label suffix — inline `- back end - <dev>` does NOT parse (line skipped without header; label defaults to FE and the dev name pollutes the summary without the suffix). Reformat to `Bug N: <text> (back end)` first; map the dev via the config FE/BE assignee map, not inline. (Section 8)
- 10.74: Never auto-send outbound team communications (Slack/chat posts) — require explicit per-message user confirmation: draft, show the exact text, wait for go-ahead. A prior turn's approval is NOT blanket permission. (Section 11)
- 10.75: Absence findings require 100% coverage of the artefact set. Any claim of the form "X does not appear anywhere" is only valid once EVERY frame/screen/page has been read visually — a sample plus an absence claim reads as verified fact but is a guess. Reading 18 of 24 design frames while asserting "all findings verified against rendered pixels" hid a HIGH finding (a status screen omitting the reason text shown on every other surface) and left an already-answerable question open. State your actual coverage ratio when making an absence claim. (Section 1)
- 10.76: Feature eligibility is the entry condition of EVERY test case — ask product "which tenants/companies/plans can actually use this?" before writing. Documents describe the availability control the author owns (e.g. a per-company toggle) and silently omit platform-level gates treated as background (e.g. "only companies migrated to the new module"). Discovering a second gate late invalidates the precondition of the entire suite, exposes an ineligible path with zero coverage, and — worst — makes every test fail at step 1 on the wrong tenant, which looks like a broken feature rather than a wrong environment. Confirm the eligible tenant type during investigation AND confirm the staging tenant matches before execution. (Section 1)
- 10.77: Generate the readable and importable outputs from a SINGLE data file — never hand-maintain both. Keep TCs in one data module and emit .md + .xlsx from one script; apply suite-wide preconditions inside the generator. When a late eligibility decision added a precondition to an existing 130-TC suite, the generator applied it in one line with zero risk of a missed case; hand-editing two files guarantees drift. Corollary: mark the exception cases with a flag the generator reads, so "which TCs deliberately skip this precondition" is data, not memory. (Section 2)
- 10.78: When product hasn't answered but authorises proceeding, write the TC on a STATED assumption and tag it — an `assumption-{id}` / `pending-{ref}` label plus a `REVISIT:` marker in the description. One filter then returns every TC needing revision when the answer arrives, instead of re-reading the suite. Record the inverse too ("if the answer is X, invert this assertion") so the revision is mechanical. (Section 2)
- 10.79: When Python/openpyxl is unavailable, read and write .xlsx with `node` + `jszip` (xlsx is a zip of XML). Write cells as `t="inlineStr"` to avoid maintaining a sharedStrings table, XML-escape values EXACTLY once (check for `&amp;quot;` double-escaping in the output), and round-trip the generated file to verify headers, the multi-row pattern, and that no field landed on the wrong row before shipping it. (Section 11)
- 10.94: Prototype authority must be established before TC writing — a clickable prototype can be knowingly stale, and product may rule the written spec wins.
- 10.95: Diff artefact versions rather than re-reading; regressions live in the changed hunks.
- 10.96: Seed master data only — fabricated derived records are internally inconsistent and hide the defects under test.
- 10.97: Boundary fixtures must be computed from the tenant/account configuration, not the spec appendix.
- 10.98: Trace which consumer reads a value before asserting staleness — a stored column can be bypassed by a live-derived API field.
- 10.99: Never report a defect from DB schema alone — check the API payload first.
- 10.100: Bug tickets state the problem only — no root cause, no suggested fix; verification stays in the working notes.
- 10.101: Report execution as "N of M ran" — a pass summary over partial coverage reads as a green light.
- 10.102: Screen recordings are first-class DOM evidence; read the frames rather than the reporter's summary.
- 10.103: When a doc edit claims to "address" a finding, re-read the finding's SUBJECT, not its keywords, before scoring it closed. A rewrite removed a similarly-named set of fields belonging to a DIFFERENT variant, and the finding was wrongly marked resolved — the keyword matched, the subject did not. A false "closed" silently deletes a real question from the list and the reviewer, not the author, has to catch it. (Section 1)
- 10.104: Prove "derived vs stored" ARITHMETICALLY before asserting either. A stored per-hour rate matched neither `total ÷ {divisor}` nor `component ÷ {divisor}` — two divisions proved the values were free-typed and independently stored, turning a suspected display nicety into a confirmed data-completeness gap. "It's probably computed" is the assumption that makes a missing input field look harmless. (Section 1)
- 10.105: ONE exhaustive sweep per stakeholder round — never drip-feed follow-ups. Sweep every source to exhaustion (spec body, appendix, design file, the existing suite, the surfaces the feature touches), send one complete list, and afterwards raise only genuinely NEW information: a document was edited, or a build defect appeared. Something findable in the previous pass is not new. A trickle makes the QA lead look unprepared to a team that has already answered "everything" twice; if you later find something you missed, fix the test cases quietly and hold it unless it changes an answer already given. (Section 1)
- 10.106: Derived data may be a COMPUTATION CHAIN, not a table: raw events → engine → derived row, driven by ORM model events. A direct SQL insert fires no event, so a hand-written derived row is fabricated and a hand-written raw event produces nothing at all. Trace the chain — and find the recompute command's scope — before promising to seed it. (Section 11)
- 10.107: Check which table the app actually READS. A legacy table sat at 0 rows with nothing reading it; seeding it would have been invisible, and the flag that appeared to reference it was backed by the newer table instead. (Section 11)
- 10.108: A per-row SNAPSHOT column (a period/cycle row carrying its own copy of a global setting) means a settings change affects only rows created afterwards. Check the history for how the app bridged a previous change — it may use a one-off transition row rather than rewriting existing ones, and copying that precedent keeps seeded data app-consistent. (Section 11)
- 10.109: The UI itself may REFUSE what the data plan assumes — e.g. past-dated scheduling blocked by the date picker, or period selectors offering only closed periods. Some fixtures can only ACCRUE, never be seeded. Establish these limits by driving the real UI before committing to a data-prep plan. (Section 11)
- 10.110: An asymmetric guard is where the bug lives. One handler checked the date before recomputing; its sibling did not — so editing a future-dated record computed it as though the day had happened, writing a penalty for a day nobody could have worked. When you find a guard, check EVERY sibling path for the same one. (Section 1)
- 10.111: Do NOT create filler data to tick a seeding box. A run was abandoned once the fixtures turned out to be excluded from it — a batch of unrelated records on an already-closed period would serve no case and add noise to a shared environment. Say what could not be created, why, and when it becomes possible. (Section 2)
- 10.112: A fixture must be reproducible by the app AS IT STANDS TODAY. Seeded records sat on a date the live app cannot produce, so the fixture contradicted itself. A state the app cannot reach is a precondition no tester can rebuild — and it quietly tests the wrong thing. (Section 2)
- 10.113: Design-tool metadata for a whole board can overflow the token limit — grep the saved result for frame ids, then screenshot each frame individually. Ids come from metadata; labels come ONLY from rendered pixels. (Section 11)
- 10.114: Browser `find` guesses wrong on icon-only controls — it identified a Duplicate icon as "assign" and opened the wrong editor. Confirm with a screenshot before clicking, and back out without saving if it was wrong. Likewise, re-screenshot after any success banner: it shifts the layout and stale coordinates land on the wrong row. (Section 11)
- 10.115: Pre-release code is NOT a prediction of the new build. Where an AC conflicts with the current implementation, the implementation changes — that is what building the feature means. Current code is legitimate evidence for exactly two things: (a) testing an explicit "unchanged / not changing" claim the document makes, and (b) ENUMERATING BRANCHES — every behaviour keyed on the thing being replaced — so each can be checked for a stated decision. Anything else is speculation wearing a file path, and flagging current behaviour as a future defect burns credibility and buries the real gaps. (Section 1)
- 10.116: Sweep the EXISTING surfaces, not just the new documents against each other. Cross-referencing new docs finds doc-vs-doc conflicts and nothing else. Before reporting, list the surfaces the feature REPLACES and inspect each as it stands today — a "new" tab may be an existing tab renamed, and a "no columns change" claim is meaningless until you have looked at the columns. Five of six manual findings were missed this way despite full code and DB access. (Section 1)
