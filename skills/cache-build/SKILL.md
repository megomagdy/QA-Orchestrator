---
name: cache-build
description: Build investigation cache for a feature. Saves structured analysis output so subsequent commands read cache instead of re-analyzing. Reduces token usage by 60-70%. Use after /review completes.
argument-hint: "feature-name"
---

# Build Investigation Cache — $ARGUMENTS

Run heavy analysis ONCE, save results as cache files for all subsequent commands.

## Cache Files
1. `cache-[feature]-investigation.md` — Confirmed behaviors, fields, states, permissions, validation rules
2. `cache-[feature]-questions.md` — Blocking questions and their status
3. `cache-[feature]-tc-summary.md` — TC counts, coverage, automation candidates (after /write-tests)
4. `cache-[feature]-dom-audit.md` — Verified UI elements, ghost elements (after DOM audit)

## How Other Commands Use Cache
- `/write-tests` → reads investigation cache instead of all source documents
- `/cross-validate` → reads tc-summary cache
- `/scaffold-automation` → reads tc-summary for automation candidates
- `/execute-tc` → reads tc-summary for TC list

## Execution
1. Check what's available (which phases have been run)
2. Extract structured data from current session context
3. Save to appropriate cache files
4. Confirm: file names, counts, estimated token savings

## Rules
- Cache files are NEVER deleted automatically
- Warn if cache is > 7 days old
- Cache is per-feature, not global
- If source documents change, user should re-run /cache-build
