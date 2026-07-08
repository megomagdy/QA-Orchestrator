---
name: report-bugs
description: Parse Bug Summaries.txt and create issues in the configured issue tracker automatically. First run sets up project config (tracker adapter, assignees, parent stories). Subsequent runs auto-detect parent stories and delegate to a Node.js script for zero-token issue creation.
argument-hint: "[--setup] to reconfigure, or leave empty to report bugs"
---

# Report Bugs to Issue Tracker — $ARGUMENTS

## Overview

This skill reads `Bug Summaries.txt` from the current project's `Manual Execution/` folder, parses unreported bugs, auto-maps each bug to the correct parent story, and **delegates actual issue creation to the Node.js script** (`report-bugs.js`) to avoid consuming LLM tokens on API calls.

The script is **tracker-agnostic**: it loads an adapter from `scripts/adapters/<tracker>.js` based on the `tracker` field in the project config. Any tracker (Jira, Azure DevOps, Linear, GitHub Issues, ...) works once an adapter exists for it — see `scripts/adapters/_template.js` for the contract.

**Token strategy:** Claude handles intelligence (setup, parent auto-detection, writing professional bug descriptions). The script handles execution (tracker API calls). This keeps token usage minimal.

## Manual Execution Folder Convention (THE WORKFLOW)

Every project has a `Manual Execution/` folder in its root. This is where the QA engineer works during manual test execution:

```
{project}/Manual Execution/
├── Bug Summaries.txt            ← QA engineer TYPES bug summaries here (Epic sections)
├── Epic 1/                      ← evidence per epic (multi-epic projects)
│   ├── Bug 5.png                ← screenshot for Epic 1 Bug 5
│   ├── Bug 11.mp4               ← screen recording for Epic 1 Bug 11
│   └── Bug 13 (2).png           ← additional evidence for the same bug
├── Epic 2/
│   └── Bug 3.png
├── Bug 4.png                    ← small/single-section projects: evidence flat
├── bug-reporter.config.json     ← project config (created on first /report-bugs run)
├── bug-overrides.json           ← per-bug parent/priority overrides (Claude writes)
├── bug-descriptions.json        ← polished summaries/descriptions (Claude writes)
└── reported-bugs.json           ← tracking (script writes — never edit manually)
```

**The human workflow:** while manually testing, the QA engineer types each bug as a one-liner under its Epic section in `Bug Summaries.txt` and drops the evidence (screenshot/recording) into the matching `Epic N/` subfolder named `Bug M.png` / `Bug M.mp4` (add ` (2)`, ` (3)` for extra files). Then runs `/report-bugs` — Claude polishes, the script reports and attaches.

**Attachment discovery rules (the script applies these automatically):**
- If a subfolder exists for the bug's section (`Epic {n}/`, or the custom section name), only that subfolder is searched — flat names would be ambiguous across epics.
- Otherwise the `Manual Execution/` folder itself is searched (small projects).
- A file belongs to a bug when its name starts with `Bug {m}` not followed by another digit (`Bug 1.png` matches Bug 1; `Bug 12.png` does not).
- An explicit `"attachments"` array in `bug-descriptions.json` overrides discovery for that bug.

## File Locations

Paths below use `$QA_GLOBAL_HOME` notation — on Windows that's `%QA_GLOBAL_HOME%` (cmd) / `$env:QA_GLOBAL_HOME` (PowerShell). Set during `/init-workspace`.

- **Script:** `$QA_GLOBAL_HOME/scripts/report-bugs.js`
- **Adapters:** `$QA_GLOBAL_HOME/scripts/adapters/`
- **Config:** `{project}/Manual Execution/bug-reporter.config.json`
- **Overrides:** `{project}/Manual Execution/bug-overrides.json`
- **Descriptions:** `{project}/Manual Execution/bug-descriptions.json` ← Claude writes summaries/descriptions here
- **Tracking:** `{project}/Manual Execution/reported-bugs.json`
- **Credentials:** `.env` in the folder you run the script from (`Manual Execution/` — the script also checks its parent, the project root) or `$QA_GLOBAL_HOME/scripts/.env` (see `.env.example`)

## Workflow

### Step 1: Check if config exists

Look for `bug-reporter.config.json` in the project's `Manual Execution/` folder.

- If it **exists** AND `$ARGUMENTS` does NOT contain `--setup` → skip to Step 3
- If it **does not exist** OR `$ARGUMENTS` contains `--setup` → go to Step 2

### Step 2: First-time setup (interactive)

Ask the user the following questions using `AskUserQuestion`:

**Question 0 — Tracker:**
Ask: "Which issue tracker does this project use?"

- Check `$QA_GLOBAL_HOME/scripts/adapters/` for a matching adapter. If none exists, tell the user an adapter must be created first — copy `_template.js` to `adapters/<tracker>.js` and implement `createIssue()` per the contract in the template. Offer to write the adapter together (the user provides API docs / org URL / auth method).
- Also collect any adapter-specific settings (org URL, cloud ID, area path, ...) — these go under `trackerOptions` in the config.

**Question 1 — Assignees:**
Ask: "Who are the developers for this project?"
- FE developer name/ID (for front-end bugs)
- BE developer name/ID (for back-end bugs)

Look up their tracker user IDs using whatever the tracker provides — an MCP lookup tool if connected, the tracker's REST API, or ask the user to copy the IDs from the tracker UI.

**Question 2 — Parent stories:**
Ask: "Provide the parent stories that bugs can be linked to. Format: one per line as `<ISSUE-KEY>: Description`"

The user will provide something like:
```
PROJ-1035: Requests Tab
PROJ-1038: Detail Page
PROJ-1022: Confirmation Dialog
```

**Question 3 — Epic-to-story mapping:**
Ask: "Which stories belong to which epic? Format: `Epic N: <KEY>, <KEY>`"

The user will provide:
```
Epic 1: PROJ-1023, PROJ-1028, PROJ-1035
Epic 2: PROJ-1029, PROJ-1038, PROJ-1041
```

**Question 4 — Custom section names (optional):**
Ask: "Are there any custom section names in Bug Summaries.txt besides 'Epic N:'? (e.g., a 'Permissions' section that maps to a specific parent)"

**Question 5 — Environment details:**
Ask for the module navigation path (e.g., "HR > Payroll") and test environment name (e.g., "Staging") — used in generated descriptions.

**After collecting answers**, generate `bug-reporter.config.json` with this structure:

```json
{
  "tracker": "<adapter-name>",
  "projectKey": "PROJ",
  "issueTypeName": "Bug",
  "trackerOptions": {
    "<adapter-specific>": "<settings>"
  },
  "assignees": {
    "FE": "<looked-up-user-id>",
    "BE": "<looked-up-user-id>"
  },
  "epicStories": {
    "1": {
      "PROJ-1023": "Navigation & Dashboard",
      "PROJ-1035": "Requests Tab Summary Cards"
    },
    "2": {
      "PROJ-1038": "Detail Page",
      "PROJ-1041": "Approve Dialog"
    }
  },
  "defaultParents": {
    "1": "PROJ-1035",
    "2": "PROJ-1038"
  },
  "epicSectionNames": {},
  "defaultPriority": "High",
  "bugFile": "Bug Summaries.txt",
  "sprintId": null,
  "modulePath": "<Module navigation path>",
  "environmentName": "Staging"
}
```

### Step 3: Parse and auto-detect parents

1. Read `Bug Summaries.txt` from the project folder
2. Read `reported-bugs.json` (if exists) to identify already-reported bugs
3. For each **unreported** bug:
   a. Identify the epic from the section header
   b. Look at the `epicStories` config to get the list of stories for that epic
   c. **Auto-detect the best parent story** by analyzing the bug text against each story's description:
      - Use semantic understanding to match bug subject to story scope
      - Epic constraint: Only consider stories within the bug's epic
      - If no clear match → use `defaultParents[epicNumber]`
   d. Determine FE/BE from the `(back end)` suffix
   e. Set priority based on severity signals:
      - "500 error", "crash", "data loss", "corrupted" → Highest
      - "doesn't prevent", "overwrites", "wrong value" → High
      - Default → High

### Step 4: Generate proper summaries and descriptions (THE KEY STEP)

**This is where Claude adds value.** For each unreported bug, write a professional bug report:

For each bug, generate:
- **summary**: A clean, concise issue summary with `[BE]` or `[FE]` prefix. Rewrite the raw text into a proper bug title — not just copy-paste. Example:
  - Raw: `The attached files to requests download corrupted after submitting the request from details screen`
  - Summary: `[BE] Attached files download corrupted after request submission`
- **description**: A full markdown bug report with these sections:
  - `## Summary` — One paragraph explaining the bug clearly
  - `## Steps to Reproduce` — Specific numbered steps based on understanding of the feature
  - `## Expected Result` — What should happen
  - `## Actual Result` — What actually happens (the bug behavior)
  - `## Environment` — Module, Epic, Side (FE/BE), Environment (from config)

Write all results to `bug-descriptions.json`:

```json
{
  "E1-B8": {
    "summary": "[BE] Attached files download corrupted after request submission",
    "description": "## Summary\n\nWhen a request is submitted with file attachments, downloading those files from the detail screen produces corrupted files that cannot be opened.\n\n## Steps to Reproduce\n\n1. Navigate to {modulePath}\n2. Create a new request\n3. Attach one or more files during creation\n4. Submit the request\n5. Open the request detail screen\n6. Attempt to download the attached files\n\n## Expected Result\n\nAttached files should download in their original format and be openable.\n\n## Actual Result\n\nThe downloaded files are corrupted and cannot be opened.\n\n## Environment\n\n- **Module:** {module}\n- **Epic:** Epic 1\n- **Side:** Back End\n- **Environment:** {environmentName}"
  }
}
```

**Attachments:** the script auto-discovers evidence via the folder convention (see above) — you normally do NOT need to list attachments. Only add an `"attachments"` array (paths relative to `Manual Execution/`) to a bug's entry when the evidence file doesn't follow the `Bug {m}.*` naming or lives elsewhere:

```json
{
  "E1-B8": {
    "summary": "...",
    "description": "...",
    "attachments": ["Epic 1/corrupted-download-example.png"]
  }
}
```

**IMPORTANT:** Only write entries for UNREPORTED bugs. Preserve any existing entries.

### Step 5: Write overrides file

Write the auto-detected parents and priorities to `bug-overrides.json`:

```json
{
  "E1-B3": { "parent": "PROJ-1038", "priority": "Highest" },
  "E5-B21": { "parent": "PROJ-1022", "priority": "High" },
  "E6-B19": { "parent": "PROJ-1040", "priority": "High" }
}
```

**IMPORTANT:** Only write entries for UNREPORTED bugs. Preserve any existing overrides for already-reported bugs.

### Step 6: Show summary and confirm

Display a table of all bugs to be reported (run `--dry-run --all` to see what evidence the script discovered per bug):

```
Bug             | Label | Parent    | Priority | Evidence      | Summary
E5-B22          | BE    | PROJ-1022 | High     | 2 files       | Attached files download corrupted...
E6-B20          | FE    | PROJ-1040 | High     | Bug 20.png    | Three dots menu still visible...
```

Ask: "Should I report these N bugs to the tracker? (You can also say 'skip E5-B22' to exclude specific bugs)"

### Step 7: Execute via Node.js script (ZERO TOKENS on tracker API)

**DO NOT use tracker MCP tools (e.g., createJiraIssue) for bug creation.** Instead, run the script from the `Manual Execution/` folder — pick the form for the shell in use:

```bash
# macOS / Linux / Git Bash
cd "{project}/Manual Execution" && node "$QA_GLOBAL_HOME/scripts/report-bugs.js" --all --no-prompt
```

```powershell
# Windows PowerShell
Set-Location "{project}\Manual Execution"; node "$env:QA_GLOBAL_HOME\scripts\report-bugs.js" --all --no-prompt
```

```bat
:: Windows cmd
cd /d "{project}\Manual Execution" && node "%QA_GLOBAL_HOME%\scripts\report-bugs.js" --all --no-prompt
```

The script reads `bug-descriptions.json` and uses Claude's summaries/descriptions instead of raw text.

The script handles:
- Loading the tracker adapter and credentials
- Creating each issue via the adapter (format conversion and API quirks live inside the adapter)
- Discovering evidence files per bug (folder convention) and uploading them via the adapter's `addAttachments()` — if the adapter doesn't implement it, the script prints `[attach manually: ...]` per issue so the user can drag the files into the tracker UI
- Updating `reported-bugs.json` with new issue keys
- Appending `[REPORTED: <key>]` to bugs in `Bug Summaries.txt`

**This is the key optimization:** All tracker API calls happen in the script (zero LLM tokens), while Claude only spent tokens on the intelligent part (reading bugs, detecting parents, writing overrides).

### Step 8: Report results

Read the script's stdout output and display:

```
Created: 3 bugs
  PROJ-6205 <- E5-B22 (parent: PROJ-1022) [2 attached]
  PROJ-6206 <- E6-B20 (parent: PROJ-1040) [attach manually: Bug 20.png]
  PROJ-6207 <- E7-B8  (parent: PROJ-1018)
Skipped: 0
Errors: 0
```

If any bugs printed `[attach manually: ...]`, list them clearly for the user with the file paths so they can drag the evidence into the tracker UI.

## Token Budget

| Phase | Token Cost | Why |
|-------|-----------|-----|
| Setup (first time only) | ~5K | AskUserQuestion + user-ID lookup + write config |
| Parse & detect parents | ~3-5K | Read bug file + config + semantic matching |
| Script execution | ~0 | Node.js script handles all tracker API calls |
| **Total per run** | **~3-5K** | vs ~35-55K per bug with MCP tools |

## Bug Text Format

The script expects `Bug Summaries.txt` in this format:

```
Epic 1:
--------
Bug 1: Description of the bug
Bug 2: Another bug (back end)
Bug 3: Front end bug

Epic 2:
--------
Bug 1: Some other bug
```

- `(back end)` or `(BE)` suffix → BE label, assigned to BE developer
- No suffix or `(FE)` suffix → FE label, assigned to FE developer
- `[REPORTED: <key>]` suffix → already reported, skip
- Evidence for `Epic N: Bug M` → `Epic N/Bug M.png` (or `.mp4`, `... (2).png` for extras) in the same `Manual Execution/` folder

## Important Rules

1. **NEVER use tracker MCP tools for bug creation** — always delegate to the script. Claude's job is intelligence (parsing, detecting parents), not execution (API calls).
2. **Tracker-specific quirks live in the adapter** — format conversion (markdown → ADF/HTML), multi-step creation workarounds, priority name mapping. Never work around them in this skill.
3. **Never re-report** — always check `reported-bugs.json` and `[REPORTED:]` markers
4. **Parent story is required** — don't create bugs without a parent if the project uses subtasks
5. **Overrides file is the bridge** — Claude writes `bug-overrides.json`, script reads it for parent/priority per bug
