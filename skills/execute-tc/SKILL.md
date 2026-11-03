---
name: execute-tc
description: Execute test cases manually via whatever browser-automation tool the session has (a built-in browser, a browser extension, Playwright or Selenium MCP). Includes 5-step popup recovery for unexpected dialogs and overlays. Use for manual test execution with automated browser interaction.
argument-hint: "TC-ID or all or epic-name"
---

# Execute Test Cases — $ARGUMENTS

Execute test cases by driving a browser with the browser-automation tool available in the session (prefer one the user can watch).

Read `qa-rules-condensed.md` from the project root for condensed QA rules.

## Prerequisites
- [ ] Test cases exist (from /write-tests)
- [ ] Test environment is accessible
- [ ] A browser-automation tool is connected and can reach the environment

## Execution Flow
1. Read TC from the test case file (Markdown or cache)
2. For each step: execute it in the browser, capture result (pass/fail), take screenshot on failure
3. If popup/dialog blocks execution: See [popup-recovery.md](popup-recovery.md) for 5-step recovery
4. Record actual results alongside expected results
5. After execution: spawn bug-hunter + dom-auditor agents for failure analysis

## Agent Orchestration (Post-Execution)
- **bug-hunter agent** → Classify failures: Actual Bug, Locator Broken, Timing Issue, Environment Issue, Test Logic Error, Flaky
- **dom-auditor agent** → Verify UI elements that caused failures actually exist in the DOM

## Output
For each TC: TC ID, Status (PASS/FAIL/BLOCKED), Steps executed, Actual vs Expected, Screenshots (for failures), Root cause if failed.

Summary: Total TCs executed, Pass count, Fail count, Blocked count, Pass rate.

## Logging Confirmed Bugs (Manual Execution folder)

For every failure classified as an **Actual Bug** (after bug-hunter analysis and user confirmation):
1. Append a one-liner to `{project}/Manual Execution/Bug Summaries.txt` under the correct Epic section: `Bug {next-number}: <summary>` (add `(back end)` suffix for BE bugs)
2. Save the failure screenshot/recording as `Manual Execution/Epic {n}/Bug {m}.png` (or flat `Manual Execution/Bug {m}.png` for single-section projects; ` (2)`, ` (3)` for extra files)
3. Tell the user the bugs are queued — `/report-bugs` will create the tracker issues in batch and auto-attach the evidence

## Rules
- Execute TCs in the order specified (smoke first, then regression)
- Stop execution on CRITICAL failure (app crash, auth expired) — don't continue blindly
- Clean up test data after execution if tests created records
- Log full evidence for failures (screenshot path, console errors, network errors)
