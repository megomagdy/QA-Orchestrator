---
name: check-catalog
description: Check the QA-Orchestrator pack for drift between skills/ and agents/ on disk and the counts and catalogs in README.md and reference/*.txt, plus broken SKILL.md frontmatter. Use before committing changes to skills or agents.
---

# Check pack catalog

Read-only audit. Report findings; only edit if the user asks.

## Checks

1. **Counts.** Count folders in `skills/` that contain a `SKILL.md`, and `*.md` files in `agents/`. Compare with every stated count in `README.md` (intro line, folder-structure block) and `reference/QA-Folder-Structure-Reference.txt`.
2. **Coverage.** Every skill and agent name on disk appears in the README catalogs; every name in the catalogs exists on disk (catch renamed or deleted items).
3. **Frontmatter.** Each `SKILL.md` starts with `---`, has `name` equal to its folder name and a non-empty `description`. Each agent has `name`, `description`, `tools`.
4. **Links.** Relative links inside `SKILL.md` files (e.g. `output-format.md`, `../../LINK-VS-COPY.md`) resolve.
5. **Leaks.** Grep `skills/`, `agents/`, `templates/` for things that break the tool-agnostic rule: real-looking URLs to company trackers, API tokens, emails, `.atlassian.net`, `dev.azure.com/<org>` with a real org.

## Output

A short table: check → pass/fail → specifics (file and line). End with the exact edits needed to fix each failure.
