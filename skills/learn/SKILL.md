---
name: learn
description: Automatically documents new rules, insights, patterns, and lessons learned into the project's CLAUDE.md and qa-rules-condensed.md. Runs fully autonomously without asking questions. Use after any session with discoveries, corrections, or new patterns.
argument-hint: "learning description or empty for auto-detect"
---

# Learn & Document — $ARGUMENTS

## MODE: FULLY AUTOMATIC — DO NOT ASK QUESTIONS

This command runs without any user interaction. Detect, classify, document, and sync — all in one pass.

## Step 1: Identify the Learning

**If $ARGUMENTS is provided:** Use it as the learning to document.

**If $ARGUMENTS is empty (auto-detect — EXHAUSTIVE SCAN):** Perform a systematic scan of the ENTIRE conversation. See [scan-categories.md](scan-categories.md) for the full list of categories and what to look for.

## Step 2: Classify
Automatically determine category. See [classification.md](classification.md) for the mapping table.

## Step 3: Check for Duplicates
Read current CLAUDE.md. If same meaning exists → skip silently. If contradicts → replace (latest wins).

## Step 4: Write to Project CLAUDE.md
Add to correct section. Keep each learning to 3-5 lines max. Every learning MUST have a "Why" explanation.

## Step 4b: ALWAYS Update Lessons Learned Log (MANDATORY)
Every learning MUST be tracked in the LL Log (Section 11.3). This is the central index that /sync-global reads.
If the section does NOT exist → CREATE IT. Add entry: `| [N] | [date] | [description] | [section] | ⏳ Pending global sync |`

## Step 5: Update Project's qa-rules-condensed.md
Add one-line rule summary to the correct section (1-11).

## Step 6: Silent Confirmation
```
📝 Learned: [one-line summary]
   → Project CLAUDE.md: [section name]
   → Project qa-rules-condensed.md: updated
   ⏳ Run /sync-global to push to global folder
```

## Rules
- NEVER ask questions — decide autonomously
- NEVER touch the global folder — only project files. /sync-global updates global.
- NEVER insert blank lines inside markdown tables
- After every table edit, re-read and verify no blank lines between rows
- If contradicting existing rule, replace silently (latest wins)
