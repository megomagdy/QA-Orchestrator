---
name: session-resume
description: Load a checkpoint file and resume work from where the previous session left off. Use at the start of a new session to continue previous work.
argument-hint: "checkpoint-filename or latest"
---

# Resume Session — $ARGUMENTS

## Execution
1. If $ARGUMENTS is "latest" → find most recent checkpoint-*.md file
2. Read the checkpoint file
3. Load referenced cache files
4. Restore context: what phase, what's done, what's next
5. Read CLAUDE.md for project rules and learnings
6. Inform user: "Resumed from [checkpoint]. Ready to continue with [next step]."

## Rules
- Read ALL referenced files from the checkpoint (caches, TCs, review reports)
- Don't re-do completed work — continue from where it stopped
- If checkpoint references files that no longer exist, inform user
