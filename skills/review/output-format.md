# Review Output Format

## Structure
Present findings in this order:

### 1. Confirmed Behaviors
| # | Behavior | Source 1 | Source 2 | Confidence |

### 2. Conflicts Found
| # | Conflict | Doc A Says | Doc B Says | Doc A Ref | Doc B Ref | Impact |

### 3. Gaps Found (Questions)
| Q-ID | Question | Priority | Epic | Affected Stories | Category |

Categories: `Design-Story Discrepancy` | `Missing AC / Gap` | `Ambiguous Behavior` | `Cross-Epic Conflict` | `PRD vs Story Conflict`

### 4. Summary
- Total findings: [N]
- Conflicts: [N]
- Gaps/Questions: [N] (CRITICAL: X, HIGH: X, MEDIUM: X, LOW: X)
- Confirmed behaviors: [N]
- Recommendation: Proceed with /write-tests OR Wait for answers on CRITICAL/HIGH questions

## Priority Classification
- **CRITICAL:** Blocks ALL test case writing for the affected area. Must be answered before /write-tests.
- **HIGH:** Blocks key test cases. Should be answered before /write-tests.
- **MEDIUM:** Affects edge case TCs. Can proceed with /write-tests but flag as assumption.
- **LOW:** Nice to clarify. Won't block test case writing.
