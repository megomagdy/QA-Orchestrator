# Test Management Excel Output Format

> **This file documents the RULES for building a multi-row import file, using a Qmetry 25-column template as the worked example. If your team uses a different tool (TestRail, Zephyr, Xray, Azure Test Plans...), the same rules apply — but copy the headers/columns from YOUR tool's real template instead.**

**Sheet name:** `TestCases` (or whatever your template uses)

**CRITICAL: If a test-import template file exists in the project root (registered by `/init-workspace` or `/init-project`), read it FIRST and copy its headers, column order, and styling exactly. NEVER rename, reorder, or add/remove columns.**

**Example row 1 headers — Qmetry format (25 columns):**

```
Work Key | Summary | Description | Precondition | Status | Priority | Assignee | Reporter | Estimated Time | Labels | Components | Sprint | Fix Versions | Step Summary | Test Data | Expected Result | Version | Folder | TestCase Type | Created By | Created On | Updated By | Updated On | Story Linkages | Is Shareable Step
```

## Column Fill Rules

| Header | When to Fill | Value |
|--------|-------------|-------|
| Work Key | EMPTY always | Tool assigns on import |
| Summary | TC first row | `[Category] Description` |
| Description | TC first row | Optional longer description |
| Precondition | TC first row | Multi-line with `\n` |
| Status | EMPTY always | Tool manages |
| Priority | TC first row | `High` or `Medium` |
| Assignee | TC first row | Account ID or empty |
| Reporter | TC first row | Account ID or empty |
| Estimated Time | EMPTY always | |
| Labels | TC first row | Optional |
| Components | TC first row | Optional |
| Sprint | EMPTY always | |
| Fix Versions | EMPTY always | |
| Step Summary | EVERY row | `1. Navigate to...`, `2. Click...` |
| Test Data | First step row ONLY | Test data for this TC |
| Expected Result | Last step row ONLY | Full expected outcome |
| Version | TC first row | `1.0` |
| Folder | TC first row | `/{Module}/{Epic Name}` |
| TestCase Type | TC first row | `Manual` or `Automated` |
| Created By | EMPTY always | Tool auto-fills |
| Created On | EMPTY always | Tool auto-fills |
| Updated By | EMPTY always | Tool auto-fills |
| Updated On | EMPTY always | Tool auto-fills |
| Story Linkages | TC first row | Issue key(s) e.g. `PROJ-5117`; a cross-story case lists every key (e.g. `PROJ-5117, PROJ-5120`) and adds an `also-<KEY>` label per non-primary story |
| Is Shareable Step | EVERY row | `FALSE` |

## Multi-Row Pattern (CRITICAL)

```
Row N:   [empty] [Summary] [Precondition] [Priority] ... [Step 1] [Test Data] [       ] ... [Story] [FALSE]
Row N+1: [     ] [       ] [            ] [        ] ... [Step 2] [         ] [       ] ... [     ] [FALSE]
Row N+2: [     ] [       ] [            ] [        ] ... [Step 3] [         ] [Expected] ... [     ] [FALSE]
                                                                               ↑ ONLY on last step

Row N+3: [empty] [Summary] [Precondition] [Priority] ... [Step 1] [Test Data] [       ] ... [Story] [FALSE]  ← NEXT TC
```

## Summary Prefix Format
| Category | Prefix |
|----------|--------|
| Happy Path | `[Happy]` |
| Positive | `[Positive]` |
| Negative | `[Negative]` |
| Boundary | `[Boundary]` |
| Edge Case | `[Edge]` |
| Integration | `[Integration]` |
| Security | `[Security]` |
| Localization | `[Localization]` |
| Accessibility | `[Accessibility]` |

## Priority Mapping
| Internal | Tool |
|----------|--------|
| P0/P1 | `High` |
| P2/P3 | `Medium` |

Save as: `TC-[feature-name]-[YYYY-MM-DD].xlsx`
