---
name: checkpoint
description: Save current session context to a checkpoint file for later resumption. Use before stepping away or ending a session.
argument-hint: "optional label"
---

# Save Checkpoint — $ARGUMENTS

Save session state so /session-resume can continue later.

## What Gets Saved
1. Current phase and step within the workflow
2. Feature/epic being worked on
3. Files created/modified in this session
4. Findings so far (review results, TC progress, test results)
5. Pending actions (what's next)
6. Active cache files
7. Any blocking issues or unanswered questions

## Filename
`checkpoint-[feature]-[YYYY-MM-DD]-[label].md`

## Rules
- Save to project root
- Include enough context for a fresh Claude session to continue
- List all file paths that were worked on
- Note which commands have been run and which are pending
