---
name: add-qa-skill
description: Scaffold a new skill for the QA-Orchestrator pack in skills/<name>/SKILL.md and register it in every catalog (README, folder-structure and commands references). Use when adding a new QA skill to this repo.
argument-hint: "skill-name and one-line purpose"
---

# Add a pack skill — $ARGUMENTS

Maintainer skill for this repo only. The new skill goes in `skills/`, never in `.claude/skills/`.

## Steps

1. **Name.** Parse a kebab-case name from $ARGUMENTS. Stop if `skills/<name>/` or `agents/<name>.md` already exists.
2. **Pick the closest existing skill as a pattern.** Workflow commands (e.g. `save-url`, `write-tests`) vs reference/technique skills (e.g. `playwright-e2e-testing`). Read it and mirror its structure.
3. **Write `skills/<name>/SKILL.md`:**
   - Frontmatter: `name: <name>`, `description:` (what it does + when to use it, one or two sentences), `argument-hint:` if it takes arguments.
   - Body: purpose, inputs, numbered execution steps, outputs and where they are written, guardrails.
   - Tool-agnostic: read tracker/test-management/docs choices from `workspace.config.json`; no vendor URLs, project keys or secrets.
4. **Register it everywhere, in the same change:**
   - `README.md`: bump the skill count (intro line and folder-structure block) and add a row to the Skills Catalog in the right group.
   - `reference/QA-Folder-Structure-Reference.txt`: count + entry.
   - `reference/QA-Commands-Reference.txt`: add it if it is a user-invoked workflow command.
   - If the journey diagram in the README changes, update the Mermaid block too.
5. **Verify** with the `check-catalog` skill and fix anything it reports.
6. Summarise the files touched. Remind the user that linked installs pick the skill up immediately — no re-run of `/init-workspace` needed.
