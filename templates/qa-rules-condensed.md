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
- NEVER write TCs from a story title alone. Read PRD, design files, API spec, QC decisions first.
- Use SFDP decomposition: States, Fields, Data interactions, Permission gates.
- Every question must pass premise validation against Foundational Rules Registry.
- Screen types determine test patterns: List, Form, Wizard, Inline CRUD, Settings, Dashboard.
- Only apply patterns for features CONFIRMED in design docs.
- QC decisions override PRD, design files, and assumptions.
- Budget ≥ 30% for negative/boundary/edge cases.
- Every AC → minimum 3 TCs (happy + 2 negative/boundary/edge).

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

## 7. API Testing Rules (from: api-testing-rest, playwright-api-testing, postman-api-testing)
- Test all CRUD operations per resource.
- Validate status codes: 200/201/204 success, 400/401/403/404/409/422 errors.
- JSON schema validation for every response.
- Test pagination, filtering, sorting parameters.
- Validate response headers (Content-Type, security headers).
- Chain requests via variables (create → get → update → delete).
- Data-driven testing with CSV/JSON data files.
- Clean up test data (DELETE what you POSTed).

## 8. Bug Report Rules (from: bug-report-writing)
- Title formula: [Action] [Component] - [Symptom].
- Severity: Critical (crash/data loss) > High (core broken) > Major (impaired, workaround) > Minor (cosmetic).
- Priority (separate): P0=immediate, P1=this sprint, P2=before release, P3=backlog.
- One bug per ticket. Group related failures to same root cause.
- Steps must be exact: URL, click target, input value, button name.
- Always include: environment, evidence (screenshot/HAR/console), reproducibility, workaround.
- For API bugs: full request + response + server logs.
- For mobile bugs: device model, OS version, network condition.

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
- 10.35: If your design tool exposes an MCP/API (design-tool example: Figma MCP `get_metadata`/`get_screenshot`), use it to resolve low-res PNG misreads — always verify questionable UI claims via the design tool's structured data before writing TCs, rather than trusting a low-res export.
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
- 10.54: (Tool-specific example: Qmetry) XLSX template — sheet name `TestCases`; Summary uses `[Type-Tag]` prefix (Happy/Edge/Negative/Integration/Idempotent/Localization/Regression); Status column empty; Version string `1.0`; TestCase Type `Manual`. Multi-row pattern: 1 metadata-bearing first row + N step-only rows (no separator). The transferable rule for ANY test tool: always inspect a real production template's row 2 before generating; keep internal TC IDs in a spare column (the tool assigns its own keys on import).
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
- 10.68: Panoramic/multi-screen design exports blow past the readable-image limit — crop into per-frame segments then resize each. Slice the wide image into N vertical segments (small overlap) and resize each to ~760px width into a `resized/` subfolder; read segments individually. Whole-image downscaling makes every device screen unreadable. (Section 2)
- 10.69: Before pushing open questions, cross-check each against your OWN Confirmed Behaviors list and the design files already reviewed — drop any question already answered there. Raising a gap whose answer you captured erodes trust and wastes product time. (Section 7)
- 10.70: (Tool-specific example: Notion) Notion MCP has NO hard page-delete — `in_trash` on update-page is silently ignored (only updates properties). To remove a DB row, `move-pages` it to the workspace (detaches from the data source); permanent delete needs the Notion UI. The transferable rule: after any delete/remove via a platform MCP, re-query to confirm the row is actually gone. (Section 11)
- 10.71: Open-question tracker titles must be full self-contained questions (end in "?"), not terse labels — stakeholders scan titles in the table view. Keep the short ID (Q1, Q2…) in a separate property. (Section 8)
- 10.72: Team-chat MCP integrations (e.g. Slack) may have NO delete or edit-message tool — only send/draft/schedule/react/read. Treat posts as irreversible via API; retract via a follow-up message or manual UI delete. Draft tools are the "offline" path (save without sending) but often allow only ONE attached draft per channel. (Section 11)
- 10.73: The bug-report ingestion script (report-bugs.js) parses bugs ONLY under a section header (`Epic N:`) with a `(back end)/(BE)/(FE)` label suffix — inline `- back end - <dev>` does NOT parse (line skipped without header; label defaults to FE and the dev name pollutes the summary without the suffix). Reformat to `Bug N: <text> (back end)` first; map the dev via the config FE/BE assignee map, not inline. (Section 8)
- 10.74: Never auto-send outbound team communications (Slack/chat posts) — require explicit per-message user confirmation: draft, show the exact text, wait for go-ahead. A prior turn's approval is NOT blanket permission. (Section 11)
