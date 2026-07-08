---
name: sync-global
description: Sync generalized learnings from the current project back to the global QA folder. Updates ONLY the playbook template and condensed rules. Use at end of project/sprint to share learnings with future projects.
argument-hint: "path-to-global-folder or empty to use saved path"
---

# Sync Learnings to Global Folder — $ARGUMENTS

ONLY updates 2 files in the global folder. NEVER touches commands, agents, or skills.

## Step 1: Find Global Folder Path
**CRITICAL: DO NOT search the filesystem or guess. Read CLAUDE.md for "Global QA Folder" section. If not found → ASK and WAIT.**

## Step 2: Validate
Verify `[global]/templates/QA_Test_Design_Playbook_-_Template.md` and `[global]/templates/qa-rules-condensed.md` exist.

## Step 3: Extract Learnings
Read ENTIRE project CLAUDE.md. Extract from:
- Section 11.3 Lessons Learned Log (primary)
- QC Decisions (9.2), Defect Patterns (6.3), Foundational Rules (2.3), Lessons (10)
- Any section with `Added:` timestamps
- Filter: only entries NOT marked `✅ Synced to global`
- If learning exists in a section but NOT in LL log → include AND backfill the LL entry

Also compare project's `qa-rules-condensed.md` against global version for new rules.

## Step 4: Generalize
| Project-Specific | Replace With |
|-----------------|-------------|
| Project names | `{MODULE}` or remove |
| Story keys | `{STORY_KEY}` or remove |
| Entity names | `{ENTITY}` |
| Specific fields/endpoints/errors | Generic descriptions |
**Keep specific:** universal patterns (WebKit, tool quirks, Claude behavior)

## Step 5: Update Global Files
- Playbook template: add generalized learnings to correct sections. Check duplicates first.
- Condensed rules: add one-line summaries to correct sections (1-11).

## Step 6: Mark as Synced
Update project LL log entries: `✅ Synced to global`

## Rules
- ONLY update playbook template + condensed rules — NEVER commands/agents/skills
- NEVER copy project-specific content — ALWAYS generalize
- If contradicts existing rule → replace (latest wins)
- NEVER insert blank lines inside markdown tables
- Preserve {PLACEHOLDER} syntax in the template
