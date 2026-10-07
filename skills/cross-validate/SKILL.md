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
9. **Coverage Gaps** — checked at **clause level**, not just story level: every clause in `traceability-matrix.md` (requirement bullets, table rows, state-matrix cells, copy strings, design-only elements, implied areas) maps to an existing case, or is marked out of scope / deferred with a reason / superseded (naming the replacing decision). Flag unmapped clauses, dangling case IDs (in the matrix but not in the suite) and orphan cases (in the suite but tied to no clause). Also flag stories with 0 TCs. If the project has no matrix yet, build it before judging coverage.
10. **Delta File Integrity** — Delta/correction file headers match main file
11. **Duplicates** — two or more cases with the **same expected result** or that **verify the same thing**: state/screen/endpoint/persona variants of one rule as separate cases, or one case whose assertions are all inside another. Recommend merging into one case (variants as steps). Not duplicates: UI vs API enforcement, opposite outcomes, Verify vs Save timing, genuinely different designs. **Read every case per behaviour group** — a lexical similarity check is only a tripwire (on a real suite it flagged 65 pairs where reading found 210 duplicates). Also flag final expected results that don't name the case's own outcome (generic endings hide opposite outcomes).
12. **Spec-silent gaps** — any behaviour listed as "not covered" or "no case written" because the spec doesn't answer it. It needs a case on a stated, tagged assumption (`REVISIT:`), not a gap entry.

## Agent Orchestration
- **dom-auditor agent** → Verify UI elements in TCs actually exist in live app
- **playwright-test-planner agent** → Discover flows not covered by any TC

## Output
### Contradiction Report
| TC ID | Issue Type | TC Says | Source Says | Source Ref | Severity |

### Coverage Gaps
| Clause / Story | Issue (unmapped / dangling / orphan / 0 TCs / spec-silent) | Action Needed |

### Duplicates
| Case IDs | Same expected result / same rule | Merge into (survivor) |

### Verdict
- ✅ CLEAN — TCs ready
- ⚠️ NEEDS CORRECTION — [N] TCs need updates
- ❌ MAJOR ISSUES — do NOT proceed until fixed
