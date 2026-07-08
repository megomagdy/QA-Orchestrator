---
name: run-automation
description: Execute the Playwright automation suite, collect results, and analyze failures. Spawns bug-hunter for triage and playwright-test-healer for auto-fixing broken tests.
argument-hint: "spec-file, tag, or all"
---

# Run Automation Suite — $ARGUMENTS

Read `qa-rules-condensed.md` from the project root for condensed QA rules.

## Execution
1. Determine what to run: specific spec file, tag (@smoke, @regression), or all
2. Run: `npx playwright test [target] --reporter=html,json`
3. Collect results from JSON reporter
4. If failures exist → trigger agent orchestration

## Agent Orchestration (Post-Execution)
1. **bug-hunter agent** → Classify each failure: Actual Bug, Locator Broken, Timing Issue, Environment Issue, Flaky
2. **api-tester agent** → If API tests failed, re-run specific endpoints for detailed evidence
3. **playwright-test-healer agent** → For "Locator Broken" and "Timing Issue" failures:
   - Runs failing test in debug mode via `test_debug`
   - Examines error, captures page snapshot
   - Auto-fixes test code (updates selectors, adds waits)
   - Re-runs to verify the fix
   - If unfixable → marks as `test.fixme()` with explanation

## Flow
```
Test suite completes → collect results
├─ All passed → done
├─ Failures → spawn bug-hunter → classify each
│   ├─ "Actual Bug" → prepare for /bug-report
│   ├─ "Locator Broken" → spawn playwright-test-healer → auto-fix
│   ├─ "Timing Issue" → spawn playwright-test-healer → auto-fix
│   ├─ "Environment Issue" → flag for retry
│   └─ "Flaky" → spawn playwright-test-healer → stabilize
└─ API failures → spawn api-tester for deeper investigation
```

After healing: re-run healed tests to confirm. Report what was fixed and what remains broken.

## Output
Test report path, pass/fail counts, failures classified, tests healed, remaining issues.
