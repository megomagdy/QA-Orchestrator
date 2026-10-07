---
name: init-workspace
description: One-time setup wizard for a new user/company adopting this Global QA folder. Asks which issue tracker, test management tool, and docs platform the team uses, sets the QA_GLOBAL_HOME environment variable, and writes workspace.config.json. Run this ONCE after copying the folder to a new machine — before the first /init-project.
argument-hint: "(no arguments)"
---

# Initialize QA Workspace — First-Time Setup

Run this once per user/machine after receiving a copy of the Global QA folder. It captures everything that is specific to YOUR company and tools, so all skills work without hardcoded assumptions.

## Step 0: Locate the Global QA Folder

The folder containing this skill IS the global folder. Resolve its absolute path (the parent of `skills/`). Confirm with the user:

```
"Your Global QA folder is at: <path> — correct?"
```

## Step 1: Set QA_GLOBAL_HOME

Set a persistent environment variable pointing to the global folder so scripts and skills can reference it as `%QA_GLOBAL_HOME%` (Windows cmd) / `$env:QA_GLOBAL_HOME` (PowerShell) / `$QA_GLOBAL_HOME` (macOS/Linux):

- **Windows:** `setx QA_GLOBAL_HOME "<path>"` (tell the user to restart open terminals)
- **macOS/Linux:** append `export QA_GLOBAL_HOME="<path>"` to the user's shell profile (`~/.zshrc` or `~/.bashrc`)

Verify afterward by echoing the variable in a NEW shell, or tell the user how to.

## Step 1b: LINK Skills & Agents User-Level (makes the /commands work everywhere)

Claude Code only discovers skills from `.claude/skills/` (project) or `~/.claude/skills/` (user). This folder ships them in `skills/` at its root, so on a fresh copy NO slash command is registered yet — including `/init-project`.

**Read [`[global]/LINK-VS-COPY.md`](../../LINK-VS-COPY.md) first — it defines the link-vs-copy rule for every file in this folder. The test: link what is only CONSUMED (skills, agents, shared scripts), copy what is AUTHORED locally (CLAUDE.md, qa-rules-condensed.md, bug templates, `.env`).**

**LINK them — never copy.** The global folder is the single source of truth. A copy is a snapshot that silently drifts: the user keeps running an old version of a skill long after the global one improved, with no error and no warning. (Real incident: project folders held April copies while the global folder had August versions, so an enhanced `/review` never ran and nobody noticed until its new phase failed to appear.) A link cannot drift — editing the global folder updates every consumer instantly, and Step 1b never needs re-running.

Create a directory link for each of `skills` and `agents`:

- **Windows (PowerShell):**
  `New-Item -ItemType Junction -Path "$env:USERPROFILE\.claude\skills" -Target "<global>\skills"`
  `New-Item -ItemType Junction -Path "$env:USERPROFILE\.claude\agents" -Target "<global>\agents"`
  (Junctions need no admin rights. Use `mklink /J` from cmd if PowerShell is unavailable.)
- **macOS/Linux:**
  `mkdir -p ~/.claude && ln -s "<global>/skills" ~/.claude/skills && ln -s "<global>/agents" ~/.claude/agents`

**If `~/.claude/skills` or `~/.claude/agents` already exists as a real directory:**
1. Diff it against the global folder (`diff -rq`, or compare listings).
2. **Promote anything that exists ONLY locally into the global folder first** — never discard a local-only skill or agent.
3. Check which side is newer for files that differ; keep the better version in the global folder.
4. Rename the local directory aside (`skills-backup-<date>`), then create the link. Keep the backup until the user confirms everything works.

Verify the link resolves: `Get-Item "$env:USERPROFILE\.claude\skills" | Select-Object LinkType, Target` (Windows) or `ls -l ~/.claude` (macOS/Linux), then confirm a known skill file is readable through it.

If directory links are unavailable in the environment (restricted policy, some network/virtual filesystems), fall back to copying — but tell the user explicitly that they now hold snapshots which will drift, and that the copy must be re-run after every global change.

After this, `/init-workspace`, `/init-project`, and all other commands are available in ANY folder — which is what makes running `/init-project` inside a brand-new empty project folder possible.

## Step 2: Ask Workspace Questions (AskUserQuestion)

1. **Your name and title?** → `qaLead` (e.g., "Jane Smith, Senior QA Engineer")
2. **Company/organization name?** → `organization`
3. **Issue tracker?** → `issueTracker` (Jira, Azure DevOps, Linear, GitHub Issues, other)
   - Follow-up: base URL / org URL / cloud ID as applicable → `issueTrackerOptions`
   - Follow-up: is an MCP server connected for it? → `issueTrackerMcp` (true/false)
4. **Test management tool?** → `testTool` (Qmetry, TestRail, Zephyr, Xray, Azure Test Plans, spreadsheet-only, other)
   - Follow-up: "Do you have a real import template file (.xlsx/.csv) from your tool? Provide its path — it will be copied into the global folder's templates/ so /write-tests can match it exactly." → `testToolTemplate` (relative path under templates/, or null)
5. **Where do PRDs and open questions live?** → `docsPlatform` and `questionsPlatform` (Notion, Confluence, SharePoint, Google Docs, wiki, other)
6. **Design tool?** → `designTool` (Figma, Sketch, Adobe XD, other)
7. **Default localization requirement?** → `localization` (e.g., "Arabic + English, RTL", "English only", "per-project")

## Step 3: Write workspace.config.json

Write to the global folder root:

```json
{
  "qaLead": "<name, title>",
  "organization": "<company>",
  "issueTracker": "<tool>",
  "issueTrackerOptions": { },
  "issueTrackerMcp": false,
  "testTool": "<tool>",
  "testToolTemplate": "templates/<file>.xlsx or null",
  "docsPlatform": "<tool>",
  "questionsPlatform": "<tool>",
  "designTool": "<tool>",
  "localization": "<requirement>",
  "createdAt": "<ISO date>"
}
```

All skills read defaults from this file. `/init-project` uses it to pre-fill its 13 setup questions.

## Step 4: Bug-Reporter Adapter (optional but recommended)

If the team wants zero-token bug reporting via `/report-bugs`:

1. Check `scripts/adapters/` for an adapter matching `issueTracker`.
2. If none exists, offer to create one now: copy `scripts/adapters/_template.js` to `scripts/adapters/<tracker>.js` and implement `createIssue()` together with the user (they provide API docs and auth method). The contract is documented in the template.
3. Copy `scripts/.env.example` to `scripts/.env` and tell the user to fill in the credentials the adapter requires. **Remind them: `.env` must never be shared or committed.**

## Step 5: Confirm

Report what was configured and suggest next steps:

```
Workspace configured:
  QA_GLOBAL_HOME = <path>
  Skills + agents LINKED user-level (~/.claude/skills, ~/.claude/agents -> <global>)
    → edit the global folder once; every project sees it immediately, nothing to re-run
  Tracker: <tool> | Test tool: <tool> | Docs: <tool>

Next: cd into a project folder and run /init-project <name>
```

If a fallback copy was used instead of a link, say so explicitly and warn that those copies will drift and must be refreshed after every global change.

## Rules

- **The global folder is the single source of truth for skills, agents, and rules. LINK, never copy.** Copies are snapshots that silently run stale versions. Only credentials (`.env`) and tool templates are genuinely per-user files.
- If a local skills/agents directory already exists, **promote any local-only content INTO the global folder before linking** — never discard it, and back the directory up rather than deleting it.
- NEVER store credentials in workspace.config.json — credentials go ONLY in `.env` files
- NEVER guess tool URLs or IDs — ask
- If workspace.config.json already exists, show current values and ask which to change (don't silently overwrite)
- This skill configures the WORKSPACE (user/company level). Per-project setup stays in /init-project.
