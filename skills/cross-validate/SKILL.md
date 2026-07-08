---
name: cross-validate
description: Audit test cases against QC decisions, source documents, and live DOM to catch contradictions, ghost elements, and coverage gaps. Use after /write-tests before executing.
argument-hint: "TC file or feature-name"
---

# Cross-Validate Test Cases — $ARGUMENTS

Read `qa-rules-condensed.md` from the project root for condensed QA rules.

## Checks
1. **QC Contradiction** — TC expected result vs QC decision
2. **Timing Error** — Validation fires at wrong stage
3. **Blocking Violation** — Linked-state rules not applied
4. **Ghost Element** — TC references UI element not in live app
5. **PRD Mismatch** — TC contradicts PRD
6. **Missing Boundary** — Numeric/text field without boundary TCs
7. **Missing Auth TC** — Action without authorization TCs
8. **Missing A11y TC** — Interactive screen without accessibility TCs
9. **Coverage Gaps** — Stories with 0 TCs
10. **Delta File Integrity** — Delta/correction file headers match main file

## Agent Orchestration
- **dom-auditor agent** → Verify UI elements in TCs actually exist in live app
- **playwright-test-planner agent** → Discover flows not covered by any TC

## Output
### Contradiction Report
| TC ID | Issue Type | TC Says | Source Says | Source Ref | Severity |

### Coverage Gaps
| Story | Issue | Action Needed |

### Verdict
- ✅ CLEAN — TCs ready
- ⚠️ NEEDS CORRECTION — [N] TCs need updates
- ❌ MAJOR ISSUES — do NOT proceed until fixed
