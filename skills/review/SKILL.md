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

## Phase 2: Cross-Reference
Compare every fact across all documents. For each finding, cite BOTH documents and exact sections.

## Phase 3: Classify Findings
For each finding, classify as: Confirmed Behavior (verified across docs), Conflict (docs contradict), Gap (missing info that blocks TCs), Ambiguity (multiple interpretations possible).

## Phase 4: Self-Verification (Two-Pass)
**Pass 1 — Premise Validation:** For every question, verify the premise. Check ALL documents before claiming something is missing.
**Pass 2 — Prior-Decision Check:** Check if any existing decisions/notes already answer the question.

## Phase 5: Ground-Truth Cross-Validation (each pillar only if available from Phase 0)
Run only the pillars the user confirmed available. Each resolves or upgrades findings that documents alone cannot settle. See [agents.md](agents.md) for orchestration.

- **Live app + adjacent-surface sweep:** DOM-audit the real screens; then sweep every NEIGHBOR surface that reads/displays/exports the feature's core entity (e.g. dashboards, related workflows, exports, every report, adjacent modules, entity-type variants, mobile, localization) for impact. Run a **current-system delta**: for every prototype element, does it exist in the app today (new / changed / absent)?
- **Existing-code baseline cross-validation:** locate the current implementation of each touched surface; verify every "unchanged / not changing" claim against the code; trace the entity's full read→display→export path and flag single-record / status-based lookups that a new state could bypass; enumerate variant branches (entity types, engines, migrated-vs-legacy paths); capture current constants as test oracles. Stale-guard: read the branch that reflects what's DEPLOYED, not a stale local checkout; stamp findings with the commit/date.
- **Current data store (read-only):** confirm entry-condition flags → select the test scope/tenant; verify the feature entity's schema (columns, statuses, contiguity, NULL vs value); hunt edge data (multi-record periods, unusual config, entity-type variants, unconfigured prerequisites); pull baseline rows as regression oracles. Guardrails: read-only, non-production, correct scope/tenant, no cross-scope/cross-tenant access.

## Phase 6: Manual-Notes Reconciliation (if the user has notes)
If the user provided (or has) a manual review, map every one of their notes against your findings: Covered (both) / Yours-only (they caught, you missed) / Mine-only / Resolved. Nothing from their notes is dropped.

## Phase 7: Completeness Gate (before output)
Self-critique: What did I review from text only that should have been rendered? Which adjacent surfaces did I not check? Which "not changing" claims did I not verify against code/data? Which displayed number did I check only for reconciliation, not for meaning? List anything skipped explicitly.

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
