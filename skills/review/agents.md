# Agent Orchestration for /review

This command delegates work to specialized agents when the scope is large:

1. **qa-reviewer agent** → Spawn one per document set (PRD, Stories, design files) to deep-read each in parallel. Each agent returns structured findings.
2. **security-scanner agent** → Analyze specs for OWASP security gaps (access control, injection vectors, sensitive data handling).
3. **a11y-auditor agent** → Check specs for accessibility gaps (WCAG 2.1 AA).
4. **dom-auditor agent** → Verify UI elements exist before writing UI-dependent questions.
5. **playwright-test-planner agent** → Explore the app via browser, discover all interactive elements, map user flows. Catches features in the app but missing from docs.

## Ground-Truth Pillars (run only what Phase 0 confirmed available & authorized)

These are OPTIONAL — driven by what the user said is available in Phase 0, using the concrete access details they gave. Ask; never assume a tool or stack; record what was skipped.

- **Live app available** → ALWAYS spawn **dom-auditor + playwright-test-planner**. Two jobs: (a) audit the RENDERED prototype/screens (never stripped text), and (b) the **adjacent-surface sweep** — every neighbor surface that reads/displays/exports the feature's core entity (e.g. dashboards, related workflows, exports, every report, adjacent modules, entity-type variants, mobile, localization). Include a **current-system delta** (each prototype element: exists today / new / changed / absent).
- **Existing codebase available** → **baseline cross-validation** (general-purpose or symbol-search agent, whatever code tooling the project has): current implementation of each touched surface; verify each "not changing" claim; trace the entity's read→display→export path; flag single-record / status-based lookups a new state could bypass; enumerate variant branches (entity types, engines, migrated-vs-legacy). Stale-guard: read the branch reflecting what's DEPLOYED, stamp with commit/date.
- **Current data store available** → **data & scope verification** (read-only, via whatever access method the team uses): entry-condition flags → test scope/tenant; entity schema (columns, statuses, contiguity, NULL-vs-value); edge data; baseline oracles. Guardrails: read-only, non-production, correct scope/tenant, no cross-scope/cross-tenant access.

## Scope-Based Orchestration
- **Small scope (1-2 stories):** No agents. Do everything in main context — but still run any Phase-0-available ground-truth pillar.
- **Medium scope (3-5 stories):** Spawn qa-reviewer only. Handle rest in main context.
- **Large scope (full epic / multiple epics):** Spawn all applicable agents in parallel, merge findings in main context.
- **Whenever a prototype exists:** it MUST be reviewed rendered (dom-auditor or screenshots), never as stripped text.

## Merging Agent Results
After agents return, combine all findings into one list, then run Phase 4 (Two-Pass Self-Verification), Phase 5 (ground-truth cross-validation), Phase 6 (manual-notes reconciliation), and Phase 7 (completeness gate) in main context. Agents find POTENTIAL gaps — YOU verify which ones are real. Use code/data facts to downgrade doc-vs-doc conflicts to "confirmed / confirm-and-fix / still-open." Compare playwright-test-planner's discovered flows against document-based findings to catch undocumented features.
