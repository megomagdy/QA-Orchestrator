# Agent Orchestration for /review

This command delegates work to specialized agents when the scope is large:

1. **qa-reviewer agent** → Spawn one per document set (PRD, Stories, design files) to deep-read each in parallel. Each agent returns structured findings.
2. **security-scanner agent** → Analyze specs for OWASP security gaps (access control, injection vectors, sensitive data handling).
3. **a11y-auditor agent** → Check specs for accessibility gaps (WCAG 2.1 AA).
4. **dom-auditor agent** → If live app is accessible via Chrome MCP, verify UI elements exist before writing UI-dependent questions.
5. **playwright-test-planner agent** → If live app is accessible, explore the app via browser, discover all interactive elements, map user flows. Catches features in the app but missing from docs.

## Scope-Based Orchestration
- **Small scope (1-2 stories):** No agents. Do everything in main context.
- **Medium scope (3-5 stories):** Spawn qa-reviewer only. Handle rest in main context.
- **Large scope (full epic / multiple epics):** Spawn all 5 agents in parallel, merge findings in main context.
- **If live app is accessible:** ALWAYS spawn playwright-test-planner + dom-auditor to cross-reference specs against reality.

## Merging Agent Results
After agents return, combine all findings into one list, then run Phase 4 (Two-Pass Self-Verification) in main context. Agents find POTENTIAL gaps — YOU verify which ones are real. Compare playwright-test-planner's discovered flows against document-based findings to catch undocumented features.
