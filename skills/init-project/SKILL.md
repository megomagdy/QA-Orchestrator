---
name: init-project
description: Initialize a new project with full QA infrastructure. Creates CLAUDE.md from the playbook template, LINKS skills and agents to the global QA folder (never copies — copies go stale), creates the standard project structure, and asks setup questions to fill placeholders. Use when starting QA work on a new project.
argument-hint: "project-name"
---

# Initialize QA Project — $ARGUMENTS

One-command setup for a new project. Creates the complete QA infrastructure.

## Step 1: Resolve the Global QA Folder Path

1. Check the `QA_GLOBAL_HOME` environment variable (set by `/init-workspace`). If set and valid, use it — confirm with the user.
2. If not set, **DO NOT search the filesystem or guess the path. ASK immediately:**

```
"What is the full path to your Global QA folder?"
```

**DO NOT search parent directories. DO NOT assume any path. WAIT for the user's answer.**

Verify the folder exists and contains: skills/, agents/, templates/, and templates/qa-rules-condensed.md. If `workspace.config.json` is missing from it, suggest running `/init-workspace` first (it captures the tracker, test tool, and docs platform once for all projects).

## Step 2: Create CLAUDE.md
1. Copy `[global]/templates/QA_Test_Design_Playbook_-_Template.md` as `CLAUDE.md`
2. Append `---` + Skills Usage section (from `[global]/templates/CLAUDE-md-skills-section.md`)
3. Append `---` + Caching Rules section (from `[global]/templates/CLAUDE-md-caching-section.md`)
4. Append Global QA Folder path section

## Step 3: Link Skills & Agents to the Global Folder, then add Support Files

**Read [`[global]/LINK-VS-COPY.md`](../../LINK-VS-COPY.md) — it defines which files are linked and which are copied. The test: link what the project only CONSUMES, copy what the project AUTHORS.**

**The global folder is the single source of truth. NEVER copy skills or agents into a project — link them.**
Copies become stale snapshots: a project keeps running an old version of a skill long after the global one improved, silently and with no error. (This has already happened: projects held April copies while the global folder had July/August versions, so an enhanced `/review` never ran.)

1. **Link skills** — create a directory link at `.claude/skills` → `[global]/skills`
   - Windows: `New-Item -ItemType Junction -Path "<project>\.claude\skills" -Target "<global>\skills"`
   - macOS/Linux: `ln -s "<global>/skills" "<project>/.claude/skills"`
2. **Link agents** — same, `.claude/agents` → `[global]/agents`
3. Before linking, if `.claude/skills` or `.claude/agents` already exists as a real directory: **diff it against the global folder first.** Promote anything that exists only locally INTO the global folder, then rename the local one aside (`.claude/skills-backup-<date>`) and create the link. Never discard local-only skills.
4. If directory links are unavailable in the environment, fall back to copying — but tell the user explicitly that the project now holds snapshots that will drift, and note it in CLAUDE.md.
5. **COPY** `[global]/templates/qa-rules-condensed.md` to the project root — do **not** link it. `/learn` writes project learnings into this file, and `/sync-global` later promotes the reviewed ones to the global copy. Linking would let `/learn` write straight into the shared file, bypassing that review gate and mixing unvalidated project-specific rules into every other project.

Note: if the user's `~/.claude/skills` and `~/.claude/agents` are already links to `[global]`, project-level links are redundant but harmless — they make the dependency explicit and survive moving the project to another machine. Verify with the user which they prefer.
4. Copy the test-management import template to project root ONLY if one is registered in `workspace.config.json` (field `testToolTemplate`). Do NOT fall back to the shipped `templates/qmetry-template.xlsx` — it is a Qmetry-format authoring example, and copying it for a team using a different test tool (or none) makes /write-tests produce a wrong-format file. If `testToolTemplate` is null, tell the user no import template is registered and /write-tests will output Markdown + a generic Excel.
5. Create empty `project-references.md`
6. Create the `Manual Execution/` folder with a seeded `Bug Summaries.txt` (see Step 3b)

## Step 3b: Create the Manual Execution Folder

Create `{project}/Manual Execution/` — the working folder for manual test execution and bug reporting (used by `/report-bugs` and referenced by `/execute-tc` and `/bug-report`). Seed it with `Bug Summaries.txt` containing this starter template:

```
Epic 1:
--------


Epic 2:
--------

```

Tell the user how the folder works:
- Type each bug as a one-liner under its Epic section: `Bug 1: <what happens>` — add `(back end)` / `(BE)` suffix for backend bugs, `(FE)` for frontend (default)
- Drop evidence in a matching `Epic N/` subfolder, named by bug: `Bug 5.png`, `Bug 11.mp4`, `Bug 13 (2).png` (small projects can keep evidence flat in `Manual Execution/`)
- `/report-bugs` reads this folder, polishes the summaries, creates the issues, and attaches the evidence

## Step 4: Fill Placeholders
See [setup-questions.md](setup-questions.md) for the 13 interactive questions.

## Step 5: Confirm
Report created files and suggest: `/save-url` then `/review`

## Rules
- **The global QA folder is the single source of truth for skills, agents, and rules. LINK, never copy.** A copied skill is a snapshot that silently drifts; the only per-project files are project-specific content (CLAUDE.md, project-references.md, test cases, Manual Execution).
- If any local-only skill/agent is found during linking, **promote it to the global folder first** — never discard it.
- NEVER overwrite an existing CLAUDE.md — if one exists, STOP and ask
- NEVER skip placeholder questions — unfilled {PLACEHOLDER} values are useless
- Default QA lead: the value stored in `workspace.config.json` (field `qaLead`), set during /init-workspace
