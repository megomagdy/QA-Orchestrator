============================================================
  Bug Reporter Script — Command Reference (tracker-agnostic)
============================================================

  All commands run from: {project}/Manual Execution/
  (QA_GLOBAL_HOME = env var pointing to your global QA folder,
   set during /init-workspace)

============================================================

  USAGE (pick the form for your shell):
  macOS/Linux/Git Bash:
    node "$QA_GLOBAL_HOME/scripts/report-bugs.js" [options]
  Windows PowerShell:
    node "$env:QA_GLOBAL_HOME\scripts\report-bugs.js" [options]
  Windows cmd:
    node "%QA_GLOBAL_HOME%\scripts\report-bugs.js" [options]

  The command table below uses the short form "node report-bugs.js"
  — substitute the full path per your shell.

============================================================

  ┌──────────────────────────────────────────┬─────────────────────────────────────────┐
  │ Command                                  │ What it does                            │
  ├──────────────────────────────────────────┼─────────────────────────────────────────┤
  │ node report-bugs.js                      │ List all unreported bugs                │
  ├──────────────────────────────────────────┼─────────────────────────────────────────┤
  │ node report-bugs.js --epic 5 --bug 22    │ Report a specific bug                   │
  ├──────────────────────────────────────────┼─────────────────────────────────────────┤
  │ node report-bugs.js --epic 6 --all       │ Report all unreported in Epic 6         │
  ├──────────────────────────────────────────┼─────────────────────────────────────────┤
  │ node report-bugs.js --all                │ Report all unreported bugs              │
  ├──────────────────────────────────────────┼─────────────────────────────────────────┤
  │ node report-bugs.js --all --no-prompt    │ Report all (silent, no confirmations)   │
  ├──────────────────────────────────────────┼─────────────────────────────────────────┤
  │ node report-bugs.js --dry-run --all      │ Preview without creating issues         │
  ├──────────────────────────────────────────┼─────────────────────────────────────────┤
  │ node report-bugs.js --init               │ Generate config (first-time setup)      │
  └──────────────────────────────────────────┴─────────────────────────────────────────┘

============================================================

  TRACKER ADAPTERS (one-time setup per tracker):
  The script never calls a tracker API directly. It loads
  scripts/adapters/<tracker>.js based on the "tracker" field in
  bug-reporter.config.json.

  To connect YOUR tracker (Jira, Azure DevOps, Linear, GitHub...):
  1. Copy scripts/adapters/_template.js → scripts/adapters/<name>.js
  2. Implement createIssue() per the contract in the template
  3. Set "tracker": "<name>" in bug-reporter.config.json
  4. Put the adapter's credentials in .env (see .env.example)

============================================================

  REQUIRED FILES (in project's Manual Execution/ folder):
  - bug-reporter.config.json   → Project config (tracker, assignees, parents)
  - Bug Summaries.txt          → Bug list organized by epic
  - .env                       → Tracker credentials (or in script folder)

  EVIDENCE FILES (attachments — same folder, auto-discovered):
  - Epic {n}/Bug {m}.png       → screenshot for Epic n / Bug m
  - Epic {n}/Bug {m}.mp4       → recording for Epic n / Bug m
  - Epic {n}/Bug {m} (2).png   → extra evidence for the same bug
  - Bug {m}.png                → flat naming for small projects
                                 (used only when no Epic subfolder exists)
  Discovery rule: filename starts with "Bug {m}" not followed by
  another digit ("Bug 1.png" = Bug 1; "Bug 12.png" ≠ Bug 1).
  Override per bug via an "attachments" array in bug-descriptions.json.
  Upload: adapter's addAttachments() if implemented, otherwise the
  script prints "[attach manually: ...]" per created issue.

  AUTO-GENERATED FILES:
  - reported-bugs.json         → Tracks reported bugs (don't edit manually)
  - bug-overrides.json         → Per-bug parent/priority overrides
  - bug-descriptions.json      → Claude-written summaries & descriptions (smart text)

============================================================

  WORKFLOW (recommended):
  1. Run /report-bugs in Claude Code
     → Claude reads bugs, writes bug-descriptions.json + bug-overrides.json
  2. Claude runs the script automatically
     → Script uses Claude's summaries/descriptions for issue creation
  3. Zero tracker API tokens consumed by Claude

  STANDALONE (without Claude):
  - Without bug-descriptions.json → script uses raw text as summary
  - With bug-descriptions.json    → script uses Claude's polished text

  NOTES:
  - Bugs marked with [REPORTED: <key>] are skipped automatically
  - (back end) suffix → assigned to BE developer, labeled "BE"
  - No suffix → assigned to FE developer, labeled "FE"
  - Format conversion (markdown → tracker format) and any API quirks
    (e.g., two-step create-then-edit) are handled INSIDE the adapter
  - Labels (BE/FE) are passed to the adapter for the created issue

============================================================
