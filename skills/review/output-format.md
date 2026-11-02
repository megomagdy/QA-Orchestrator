# Review Output Format

## Structure
Present findings in this order:

### 0. Inputs Consulted (always first)
State which sources fed the review, so confidence is explicit:
- Documents: [list]
- Rendered prototype: [yes/no] · Live app: [used / unavailable / declined] · Existing code: [branch + date / unavailable] · Data store: [scope/tenant / unavailable] · Manual notes: [reconciled / none]
- **Coverage limitations:** explicitly name any ground-truth source NOT consulted and what class of finding that leaves unverified (e.g. "no live app → prototype UI detail & adjacent surfaces unverified").

### 1. Confirmed Behaviors
| # | Behavior | Source 1 | Source 2 | Worked example (boundary) | Confidence |
Every calculation, ordering rule and displayed column the spec defines gets a row with a worked example at its boundary (mid-period change, same-day steps, each value a column can show).

### 2. Conflicts Found
| # | Conflict | Doc A Says | Doc B Says | Doc A Ref | Doc B Ref | Ground-truth (code/DB/app) | Impact |

### 3. Gaps Found (Questions)
| Q-ID | Question | Priority | Epic | Affected Stories | Category |

Categories: `Design-Story Discrepancy` | `Missing AC / Gap` | `Ambiguous Behavior` | `Cross-Epic Conflict` | `PRD vs Story Conflict` | `Prototype-vs-App` | `Adjacent-Surface` | `Implementation (code/DB)`

### 4. Per-Screen Field & Calculation Table (when a prototype exists)
| Screen | Field / Column / Tooltip / Calc | In prototype? | In doc? | Calc defined? | Gap |
Enumerate every field, column, tooltip, and calculation unit — not just behaviors.

### 4b. Spec-Silent Inventories (Phase 2b, always)
**Data shapes & lifecycle**
| Entity / rule | Shape (repeated change, in progress at release, past row after correction, entity variant, extreme range) | Answered by (source) or Q-ID |

**Entity × action (view included)**
| Entity | Action (view, create, edit, delete, export, bulk, API, on behalf of) | Who may | Rule / message | Source or Q-ID |

**Screen states (implementer pass)**
| Screen / form | State (loading / calculating, empty, error, no permission, disabled, limit) | Defined in (source) or Q-ID |

**Rule intersections**
| Record state (closed period, past, scheduled…) | Rules acting on it | Surfaces (balance, history, timesheet, payroll, report) | Combined outcome or Q-ID |

**Domain eligibility**
| Gated type / option | Attributes the spec names | Attributes the domain implies | Field in the data (fill rate) | Source or Q-ID |

No cell is left blank: each cites a source or a question / stated assumption.

### 5. Manual-Notes Reconciliation (when the user or a teammate has notes)
| # | Their note | Answer in their notes (who, date) | Our finding that raised it (ID) | Status (covered / theirs only / mine only / resolved) | Why we missed it (theirs only) |
"Covered" requires a finding ID; a match in a transcription or inventory doesn't count.

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
