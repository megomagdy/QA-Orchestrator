# Learning Classification

| Content Contains | Category | CLAUDE.md Section |
|-----------------|----------|------------------|
| QC decision, QC confirmed, product confirmed | QC Decision | QC Decisions Reference |
| bug, defect, always fails when, breaks when | Defect Pattern | Common Defect Patterns |
| rule, must always, never do, constraint | Rule / Constraint | Matching domain section |
| validation, fires at, blocked when | Validation Behavior | Lessons Learned |
| process, workflow, from now on, better to | Process Improvement | Workflow section |
| tool, test tool, issue tracker, import, export | Tool Integration | Tool-Specific Rules |
| test pattern, heuristic, always check | Testing Heuristic | Advanced Testing Heuristics |
| foundational, system-wide, applies to all | Foundational Rule | Foundational Rules Registry |
| Claude mistake, don't generate, false gap | Claude Behavior Rule | Investigation section |

## Formats
**QC decisions:** `| QC-[N] | [Decision text] | [Source] | [Impact on TCs] | [date] |`
**Foundational rules:** `| FR-[N] | [Rule] | [Source] | [Impact] |`
**Defect patterns:** `| DP-[N] | [Pattern] | [How to test] | [Severity] |`

## Auto-Trigger Patterns
| Trigger | Document As |
|---------|-----------|
| User corrects Claude | Rule: "When X, do Y not Z" |
| User says "remember this" | Whatever follows |
| QC decision confirmed | Exact wording |
| Unexpected app behavior | Defect pattern |
| False gap identified | "Don't ask about X — answered in Y" |
