# Exhaustive Scan Categories

**CRITICAL: Do NOT just look for obvious keywords. Scan the ENTIRE conversation systematically.**

**Step 1a:** Read existing Lessons Learned Log to know what's already documented.

**Step 1b:** Scan for EVERY category below:

| Category | What to look for |
|----------|-----------------|
| **Selector discoveries** | DOM audit revealed actual selector differs from assumed |
| **Workarounds applied** | `scrollIntoViewIfNeeded`, `force: true`, `page.addStyleTag`, `retryApiCall`, etc. |
| **App behavior discoveries** | Live app behaved differently than expected |
| **API contract discoveries** | Field naming, response nesting, validation rules, payload requirements |
| **Auth/session patterns** | Login flow, OTP handling, token storage, mid-run auth refresh |
| **Tool quirks** | Issue tracker API issues, Playwright strict mode, Chrome MCP limitations |
| **User corrections** | User corrected Claude's assumption or approach |
| **Process improvements** | Workflow changes agreed during session |
| **Bug patterns found** | Bugs discovered by automation not in manual bug list |
| **Test design lessons** | Patterns for writing better tests (`.or()` for multi-mode buttons, locale-agnostic selectors) |
| **Scope clarifications** | Features confirmed in/out of scope, QC decisions verified |
| **Document conflicts** | PRD vs story vs design contradictions from /review |
| **Gap analysis findings** | False gaps or missed gaps from investigation |
| **Validation timing** | When validation fires (form save? binding? submission?) |

**Step 1c:** Cross-reference each finding against existing LL entries. Only add NEW ones.

**Step 1d:** If LL has < 10 entries but conversation has 20+ tool calls → re-scan more carefully.

## Proportionality Rule

| Session Activity | Expected Learnings |
|-----------------|-------------------|
| Simple Q&A | 0-1 |
| Single command | 1-3 |
| Multi-step workflow | 3-5 |
| Full automation cycle | 10-20 |
| Multiple healing cycles across 3+ epics | 15-30 |
| Extended session with 100+ tool calls | 20-40 |

**Quality filter:** Skip micro-learnings only useful for one test. Generalize instead.
