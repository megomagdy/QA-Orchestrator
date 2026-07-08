---
name: bug-report
description: Create a structured, tracker-ready bug report from test execution failures. Follows severity classification and evidence-based reporting. Use after test execution produces failures.
argument-hint: "bug-title or TC-ID that failed"
---

# Bug Report — $ARGUMENTS

Read `qa-rules-condensed.md` for bug report rules.

## Title Formula
`[Action] [Component] - [Symptom]`

## Severity
- **Critical (S1):** Crash, data loss, security breach — immediate fix
- **High (S2):** Core functionality broken, no workaround — this sprint
- **Major (S3):** Impaired, workaround exists — 1-2 sprints
- **Minor (S4):** Cosmetic — when convenient

## Report Structure
1. **Title** (formula above)
2. **Environment** (URL, browser, OS, user role)
3. **Preconditions** (what must be true before reproducing)
4. **Steps to Reproduce** (exact: URL, click target, input value, button name)
5. **Expected Result** (from TC)
6. **Actual Result** (what happened)
7. **Evidence** (screenshot, HAR, console logs)
8. **Severity + Priority**
9. **Affected TCs** (list TC IDs)
10. **Workaround** (if any)
11. **Reproducibility** (always / intermittent / once)

## Evidence & the Manual Execution Folder

Evidence lives in the project's `Manual Execution/` folder using the standard convention:
- Multi-epic projects: `Manual Execution/Epic {n}/Bug {m}.png` / `.mp4` (` (2)`, ` (3)` suffixes for extra files)
- Small projects: `Manual Execution/Bug {m}.png` flat in the folder

When writing a bug report, reference the evidence file paths from this folder. When a screenshot/recording is captured during this session (e.g., from `/execute-tc`), SAVE it into the folder following the naming convention so `/report-bugs` can auto-attach it later.

## Feeding the Batch Reporter

After the user confirms a bug is real, ALSO append it as a one-liner to `Manual Execution/Bug Summaries.txt` under the correct Epic section (`Bug {next-number}: <summary>` with `(back end)` suffix if BE) — this is the input queue for `/report-bugs`, which creates the tracker issues in batch with zero API tokens. Skip this only if the user wants the bug reported immediately and individually.

## Rules
- One bug per ticket. Group related failures to same root cause.
- NEVER mark an environment issue as a bug
- For API bugs: include full request + response
- For mobile bugs: include device model, OS version
- Keep `Bug Summaries.txt` numbering sequential per Epic section — never reuse a number that has a `[REPORTED: ...]` marker
