# QA-Orchestrator — working on this repo

This repo **is** a Claude Code skill pack: 38 skills in `skills/`, 10 agents in `agents/`, plus templates, reference docs and tracker scripts. This file is for sessions that **maintain the pack itself**. For using the pack on a project, see `README.md` → Quick Start.

## How the pack is consumed

- Users link `skills/` and `agents/` into `~/.claude/` (see `skills/init-workspace/SKILL.md` and `LINK-VS-COPY.md`). Anything you change in `skills/` or `agents/` goes live for every linked user immediately — treat edits as releases.
- `.claude/skills/` in this repo holds **maintainer-only** skills (authoring, catalog checks). They must never be added to `skills/`, and nothing in `skills/` should be copied into `.claude/skills/` — duplicate names would clash with the user-level links.

## Rules for skills and agents

- One folder per skill: `skills/<kebab-name>/SKILL.md`, with YAML frontmatter `name` (matches the folder) and `description` (what it does + when to use it). Optional `argument-hint`. Supporting files sit next to `SKILL.md` and are linked from it.
- **Tool-agnostic.** No company names, tracker URLs, project keys or credentials in skills, agents or templates. Read tool choices from `workspace.config.json` (per-user, gitignored) and secrets from `scripts/.env` (gitignored).
- Agents: `agents/<name>.md` with `name`, `description`, and `tools` frontmatter.
- When adding, renaming or removing a skill or agent, update **all** catalogs in the same change: `README.md` (counts + Skills/Agents Catalog), `reference/QA-Folder-Structure-Reference.txt`, and `reference/QA-Commands-Reference.txt` / `reference/QA-Agents-Reference.txt` where the item belongs. Use `/check-catalog` to verify.
- Tracker adapters live in `scripts/adapters/`; new ones start from `_template.js`.

## Never commit

`.env`, `scripts/.env`, `workspace.config.json`, `.claude/settings.local.json`, `.upload-zips/`, `.backups/` — all gitignored. Don't weaken those ignore rules.

## Maintainer skills

- `/add-qa-skill <name>` — scaffold a new pack skill and wire it into every catalog.
- `/check-catalog` — report drift between `skills/`, `agents/` and the README/reference catalogs.

## Automations (from the claude-code-setup plugin's recommendations)

- **Hooks** (`.claude/hooks/`): edits to `.env` files are blocked; every edit to a `SKILL.md` or agent file is checked for valid frontmatter (`name` matches folder, `description`, agent `tools`), with a reminder to sync catalogs.
- **MCP**: `context7` (`.mcp.json`) for current docs on Playwright, Appium, Maestro, axe-core, Allure, Postman, etc. when writing technique skills.
- **Plugin**: `claude-code-setup` is enabled for the repo — run `/claude-code-setup:claude-automation-recommender` to revisit.

## Optional: route Claude Code through OmniRoute

See `docs/OMNIROUTE.md`. Opt-in per machine via `.claude/settings.local.json`; nothing is committed.
