# Review Output Format

## Structure
Present findings in this order:

### 0. Inputs Consulted (always first)
State which sources fed the review, so confidence is explicit:
- Documents: [list]
- Rendered prototype: [yes/no] · Live app: [used / unavailable / declined] · Existing code: [branch + date / unavailable] · Data store: [scope/tenant / unavailable] · Manual notes: [reconciled / none]
- **Coverage limitations:** explicitly name any ground-truth source NOT consulted and what class of finding that leaves unverified (e.g. "no live app → prototype UI detail & adjacent surfaces unverified").

### 1. Confirmed Behaviors
| # | Behavior | Source 1 | Source 2 | Confidence |

### 2. Conflicts Found
| # | Conflict | Doc A Says | Doc B Says | Doc A Ref | Doc B Ref | Ground-truth (code/DB/app) | Impact |

### 3. Gaps Found (Questions)
| Q-ID | Question | Priority | Epic | Affected Stories | Category |

Categories: `Design-Story Discrepancy` | `Missing AC / Gap` | `Ambiguous Behavior` | `Cross-Epic Conflict` | `PRD vs Story Conflict` | `Prototype-vs-App` | `Adjacent-Surface` | `Implementation (code/DB)`

### 4. Per-Screen Field & Calculation Table (when a prototype exists)
| Screen | Field / Column / Tooltip / Calc | In prototype? | In doc? | Calc defined? | Gap |
Enumerate every field, column, tooltip, and calculation unit — not just behaviors.

### 5. Manual-Notes Reconciliation (when the user has notes)
| User note | Covered (both) | Yours-only (missed) | Mine-only | Resolved | Notes |

### 6. Summary
- Total findings: [N]
- Conflicts: [N] (resolved by code/DB: [N])
- Gaps/Questions: [N] (CRITICAL: X, HIGH: X, MEDIUM: X, LOW: X)
- Confirmed behaviors: [N]
- Ground-truth pillars run: [list] · skipped: [list]
- Recommendation: Proceed with /write-tests OR Wait for answers on CRITICAL/HIGH questions

## Priority Classification
- **CRITICAL:** Blocks ALL test case writing for the affected area. Must be answered before /write-tests.
- **HIGH:** Blocks key test cases. Should be answered before /write-tests.
- **MEDIUM:** Affects edge case TCs. Can proceed with /write-tests but flag as assumption.
- **LOW:** Nice to clarify. Won't block test case writing.
