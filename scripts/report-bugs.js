/**
 * Bug Reporter — tracker-agnostic script for any QA project.
 *
 * Reads a bug summaries text file, parses bugs by epic/section, and creates
 * issues in YOUR issue tracker through a pluggable adapter. The core script
 * never talks to any tracker API directly — it delegates to an adapter file
 * in ./adapters/<tracker>.js selected by the "tracker" field in the config.
 *
 * To connect your tracker (Jira, Azure DevOps, Linear, GitHub Issues, ...):
 *   1. Copy adapters/_template.js to adapters/<your-tracker>.js
 *   2. Implement createIssue() (and optionally lookups) per the contract
 *   3. Set "tracker": "<your-tracker>" in bug-reporter.config.json
 *
 * Usage:
 *   node report-bugs.js                     # List all unreported bugs
 *   node report-bugs.js --epic 5 --bug 21   # Report specific bug (interactive)
 *   node report-bugs.js --epic 6            # Report all unreported in Epic 6
 *   node report-bugs.js --all               # Report ALL unreported (interactive)
 *   node report-bugs.js --all --no-prompt   # Report all using defaults (no questions)
 *   node report-bugs.js --dry-run --all     # Preview without creating
 *   node report-bugs.js --init              # Generate a starter config file
 *
 * Interactive mode (default):
 *   For each bug, the script shows the details and asks you to confirm/edit:
 *   - Assignee (FE/BE) — auto-detected, press Enter to accept
 *   - Parent story — shows default from config, type a different key to override
 *   - Priority — shows default, press Enter to accept
 *   - Final confirmation — Y to create, n/skip to skip
 *
 * Setup:
 *   1. Create .env in this script's folder (or project folder) with the
 *      credentials your adapter requires (see adapters/_template.js and
 *      .env.example).
 *
 *   2. Create bug-reporter.config.json in your project folder (or run --init)
 *
 *   3. Run the script from your project's Manual Execution folder:
 *      macOS/Linux/Git Bash:  node "$QA_GLOBAL_HOME/scripts/report-bugs.js"
 *      PowerShell:            node "$env:QA_GLOBAL_HOME\scripts\report-bugs.js"
 *      Windows cmd:           node "%QA_GLOBAL_HOME%\scripts\report-bugs.js"
 *      (QA_GLOBAL_HOME is the environment variable pointing to your global
 *       QA folder — set during /init-workspace)
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

// ─── Resolve paths ───────────────────────────────────────────────────────────

const SCRIPT_DIR = __dirname;
const PROJECT_DIR = process.cwd();
const CONFIG_FILE = path.join(PROJECT_DIR, "bug-reporter.config.json");
const REPORTED_FILE = path.join(PROJECT_DIR, "reported-bugs.json");
const OVERRIDES_FILE = path.join(PROJECT_DIR, "bug-overrides.json");
const DESCRIPTIONS_FILE = path.join(PROJECT_DIR, "bug-descriptions.json");

// .env lookup: the folder the script runs from (Manual Execution/), then its
// parent (the project root), then the script's own folder
const ENV_FILE = [
  path.join(PROJECT_DIR, ".env"),
  path.join(path.dirname(PROJECT_DIR), ".env"),
  path.join(SCRIPT_DIR, ".env"),
].find((p) => fs.existsSync(p)) || path.join(SCRIPT_DIR, ".env");

// ─── Init command ────────────────────────────────────────────────────────────

function initConfig() {
  if (fs.existsSync(CONFIG_FILE)) {
    console.log(`  Config already exists: ${CONFIG_FILE}`);
    console.log(`  Delete it first if you want to regenerate.`);
    return;
  }

  const template = {
    _readme: "Bug Reporter config. See field descriptions below.",
    tracker: "",
    _tracker_readme:
      "Adapter name. Must match a file in <script folder>/adapters/<tracker>.js. Copy adapters/_template.js to create one for your tracker.",
    projectKey: "PROJ",
    issueTypeName: "Bug",
    trackerOptions: {
      _readme:
        "Adapter-specific settings (e.g., cloud ID, organization URL, repo name). Your adapter reads these — see its header comment for required fields.",
    },
    assignees: {
      _readme:
        "Map labels to tracker user IDs. Look up IDs via your tracker's UI, API, or MCP tools.",
      FE: "",
      BE: "",
    },
    defaultParents: {
      _readme: "Map epic numbers to default parent story keys. Use string keys for named sections.",
      1: "",
      2: "",
    },
    epicSectionNames: {
      _readme:
        "Custom epic section headers in the bug file. Map the header text to an epic key used in defaultParents. Default: 'Epic N:' is auto-detected.",
    },
    defaultPriority: "High",
    bugFile: "Bug Summaries.txt",
    sprintId: null,
    modulePath: "",
    _modulePath_readme: "Navigation path used in generated descriptions, e.g. 'HR > Payroll'.",
    environmentName: "Staging",
  };

  fs.writeFileSync(CONFIG_FILE, JSON.stringify(template, null, 2));
  console.log(`\n  Created: ${CONFIG_FILE}`);
  console.log(`  Edit it with your project's tracker details, then run the script again.\n`);

  // Also create overrides template
  if (!fs.existsSync(OVERRIDES_FILE)) {
    const overridesTemplate = {
      _readme:
        "Per-bug overrides. Key format: E{epic}-B{bugNum}. Fields: parent (issue key), priority (Highest/High/Medium/Low), assignee (tracker user ID). The E99-B99 entry is a sample — replace it with real bug keys.",
      "E99-B99": { parent: "PROJ-1234", priority: "High" },
    };
    fs.writeFileSync(OVERRIDES_FILE, JSON.stringify(overridesTemplate, null, 2));
    console.log(`  Created: ${OVERRIDES_FILE}`);
    console.log(`  Use this to override parent story or priority for specific bugs.\n`);
  }
}

// ─── Load config ─────────────────────────────────────────────────────────────

function stripReadmes(raw) {
  const out = {};
  for (const [k, v] of Object.entries(raw)) {
    if (k === "_readme" || k.endsWith("_readme")) continue;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      out[k] = stripReadmes(v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

function loadConfig() {
  if (!fs.existsSync(CONFIG_FILE)) {
    console.error(`ERROR: No bug-reporter.config.json found in ${PROJECT_DIR}`);
    console.error(`Run: node "${path.join(SCRIPT_DIR, "report-bugs.js")}" --init`);
    process.exit(1);
  }
  return stripReadmes(JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8")));
}

// ─── Load adapter ────────────────────────────────────────────────────────────

function loadAdapter(config) {
  if (!config.tracker) {
    console.error(`ERROR: No "tracker" set in bug-reporter.config.json.`);
    console.error(`Set it to the name of an adapter file in ${path.join(SCRIPT_DIR, "adapters")}.`);
    console.error(`To create one, copy adapters/_template.js to adapters/<your-tracker>.js and implement it.`);
    process.exit(1);
  }
  const adapterPath = path.join(SCRIPT_DIR, "adapters", `${config.tracker}.js`);
  if (!fs.existsSync(adapterPath)) {
    console.error(`ERROR: No adapter found for tracker "${config.tracker}".`);
    console.error(`Expected: ${adapterPath}`);
    console.error(`Copy adapters/_template.js to that path and implement the contract described in it.`);
    process.exit(1);
  }
  const adapter = require(adapterPath);
  if (typeof adapter.createIssue !== "function") {
    console.error(`ERROR: Adapter "${config.tracker}" does not export a createIssue() function.`);
    console.error(`See adapters/_template.js for the required contract.`);
    process.exit(1);
  }
  return adapter;
}

// ─── Load .env ───────────────────────────────────────────────────────────────

function loadEnv(adapter) {
  if (fs.existsSync(ENV_FILE)) {
    const lines = fs.readFileSync(ENV_FILE, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex).trim();
      const val = trimmed.slice(eqIndex + 1).trim();
      process.env[key] = val;
    }
  }

  // Adapters declare which env vars they need via requiredEnv
  const required = Array.isArray(adapter.requiredEnv) ? adapter.requiredEnv : [];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    console.error(`ERROR: Missing credentials for adapter "${adapter.name || "unknown"}": ${missing.join(", ")}`);
    console.error(`Add them to a .env file in the folder you run from, the project root, or: ${SCRIPT_DIR}`);
    console.error(`See .env.example next to this script.`);
    process.exit(1);
  }
}

// ─── Bug parser ──────────────────────────────────────────────────────────────

function parseBugFile(config) {
  const bugFile = path.join(PROJECT_DIR, config.bugFile || "Bug Summaries.txt");
  if (!fs.existsSync(bugFile)) {
    console.error(`ERROR: Bug file not found: ${bugFile}`);
    process.exit(1);
  }

  const text = fs.readFileSync(bugFile, "utf-8");
  const lines = text.split("\n");
  const bugs = [];
  let currentEpic = null;

  // Build custom section name map
  const sectionMap = {};
  if (config.epicSectionNames) {
    for (const [name, key] of Object.entries(config.epicSectionNames)) {
      sectionMap[name.toLowerCase()] = key;
    }
  }

  for (const line of lines) {
    const trimmed = line.trim();

    // Standard epic header: "Epic N:"
    const epicMatch = trimmed.match(/^Epic\s+(\d+)\s*:/i);
    if (epicMatch) {
      currentEpic = parseInt(epicMatch[1]);
      continue;
    }

    // Custom section headers from config
    for (const [name, key] of Object.entries(sectionMap)) {
      if (trimmed.toLowerCase().startsWith(name)) {
        currentEpic = key;
        break;
      }
    }

    // Separator line
    if (/^-+$/.test(trimmed)) continue;

    // Skip already-reported lines
    if (/\[REPORTED:\s*[^\]]+\]/i.test(trimmed)) continue;

    // Bug line: "Bug N: description"
    const bugMatch = trimmed.match(/^Bug\s+(\d+)\s*:\s*(.+)/i);
    if (bugMatch && currentEpic !== null) {
      const bugNum = parseInt(bugMatch[1]);
      const rawText = bugMatch[2].trim();

      // Detect label from "(back end)" / "(BE)" / "(FE)" / "(product)" / "(PD)" suffix
      let label = "FE"; // default
      if (/\(back\s*end\)\s*$/i.test(rawText) || /\(BE\)\s*$/i.test(rawText)) {
        label = "BE";
      } else if (/\(FE\)\s*$/i.test(rawText)) {
        label = "FE";
      } else if (/\(product\)\s*$/i.test(rawText) || /\(PD\)\s*$/i.test(rawText)) {
        label = "Product";
      }

      // Clean text — remove label suffix
      const cleanText = rawText
        .replace(/\s*\(back\s*end\)\s*$/i, "")
        .replace(/\s*\(BE\)\s*$/i, "")
        .replace(/\s*\(FE\)\s*$/i, "")
        .replace(/\s*\(product\)\s*$/i, "")
        .replace(/\s*\(PD\)\s*$/i, "")
        .trim();

      bugs.push({
        epic: currentEpic,
        bugNum,
        rawText: cleanText,
        label,
        key: `E${currentEpic}-B${bugNum}`,
      });
    }
  }

  return bugs;
}

// ─── Attachment discovery ────────────────────────────────────────────────────
//
// Convention: evidence files live in the Manual Execution folder (= PROJECT_DIR),
// named after the bug they belong to:
//   Multi-epic projects:  Epic {n}/Bug {m}.png, Epic {n}/Bug {m}.mp4,
//                         Epic {n}/Bug {m} (2).png  (multiple files per bug)
//   Small projects:       Bug {m}.png etc. flat in the folder
// If an epic subfolder exists, only it is searched (flat names are ambiguous
// across epics). bug-descriptions.json can override discovery with an explicit
// "attachments" array of paths relative to the Manual Execution folder.

function findAttachments(config, bug) {
  const candidates = [];

  // Possible per-section folders: "Epic 3" for numeric epics, or the section
  // name itself for custom sections (e.g. "Permissions").
  const sectionDirs = [];
  if (typeof bug.epic === "number") {
    sectionDirs.push(path.join(PROJECT_DIR, `Epic ${bug.epic}`));
  } else {
    sectionDirs.push(path.join(PROJECT_DIR, String(bug.epic)));
    sectionDirs.push(path.join(PROJECT_DIR, `Epic ${bug.epic}`));
  }

  const existingSectionDir = sectionDirs.find((d) => fs.existsSync(d) && fs.statSync(d).isDirectory());
  // "Bug 1" must not match "Bug 10" / "Bug 12.png" — require a non-digit after the number
  const namePattern = new RegExp(`^Bug\\s*${bug.bugNum}(?!\\d)`, "i");

  const searchDir = existingSectionDir || PROJECT_DIR;
  for (const entry of fs.readdirSync(searchDir)) {
    const full = path.join(searchDir, entry);
    if (!fs.statSync(full).isFile()) continue;
    if (entry === (config.bugFile || "Bug Summaries.txt")) continue;
    if (namePattern.test(entry)) candidates.push(full);
  }

  return candidates.sort();
}

function resolveAttachments(config, bug, desc) {
  if (Array.isArray(desc.attachments)) {
    return desc.attachments
      .map((p) => (path.isAbsolute(p) ? p : path.join(PROJECT_DIR, p)))
      .filter((p) => {
        if (fs.existsSync(p)) return true;
        console.log(`  WARN ${bug.key}: attachment not found: ${p}`);
        return false;
      });
  }
  return findAttachments(config, bug);
}

// ─── Mark bug as reported in text file ───────────────────────────────────────

function markBugReportedInFile(config, bug, issueKey) {
  const bugFile = path.join(PROJECT_DIR, config.bugFile || "Bug Summaries.txt");
  const text = fs.readFileSync(bugFile, "utf-8");
  const lines = text.split("\n");
  let currentEpic = null;
  let modified = false;

  const sectionMap = {};
  if (config.epicSectionNames) {
    for (const [name, key] of Object.entries(config.epicSectionNames)) {
      sectionMap[name.toLowerCase()] = key;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();

    const epicMatch = trimmed.match(/^Epic\s+(\d+)\s*:/i);
    if (epicMatch) {
      currentEpic = parseInt(epicMatch[1]);
      continue;
    }
    for (const [name, key] of Object.entries(sectionMap)) {
      if (trimmed.toLowerCase().startsWith(name)) {
        currentEpic = key;
        break;
      }
    }

    const bugMatch = trimmed.match(/^Bug\s+(\d+)\s*:/i);
    if (bugMatch && currentEpic === bug.epic && parseInt(bugMatch[1]) === bug.bugNum) {
      lines[i] = lines[i].trimEnd() + ` [REPORTED: ${issueKey}]`;
      modified = true;
      break;
    }
  }

  if (modified) {
    fs.writeFileSync(bugFile, lines.join("\n"));
  }
}

// ─── Interactive prompts ─────────────────────────────────────────────────────

let rl = null;

function getRL() {
  if (!rl) {
    rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  }
  return rl;
}

function closeRL() {
  if (rl) {
    rl.close();
    rl = null;
  }
}

function ask(question) {
  return new Promise((resolve) => {
    getRL().question(question, (answer) => resolve(answer.trim()));
  });
}

/**
 * Interactively confirm/edit bug details before creating.
 * Shows defaults and lets user press Enter to accept or type a new value.
 */
async function promptBugDetails(bug, config, overrides) {
  const override = overrides[bug.key] || {};
  const epicKey = typeof bug.epic === "string" ? bug.epic : bug.epic.toString();

  const defaultParent = override.parent || config.defaultParents[epicKey] || "";
  const defaultPriority = override.priority || config.defaultPriority || "High";
  const defaultLabel = bug.label;

  const epicLabel = typeof bug.epic === "string" ? bug.epic : `Epic ${bug.epic}`;
  console.log(`\n  ─── ${bug.key}: ${epicLabel} Bug ${bug.bugNum} ───`);
  console.log(`  ${bug.rawText}`);
  console.log(`  Auto-detected: [${defaultLabel}]`);
  console.log();

  // Assignee label (FE/BE)
  const labelInput = await ask(`  Assignee [${defaultLabel}] (FE/BE): `);
  const label = labelInput ? labelInput.toUpperCase() : defaultLabel;
  if (!config.assignees[label]) {
    console.log(`  WARNING: No assignee ID configured for "${label}" in config. Skipping.`);
    return null;
  }

  // Parent story
  const parentInput = await ask(`  Parent story [${defaultParent || "none"}]: `);
  const parent = parentInput || defaultParent || null;

  // Priority
  const priorityInput = await ask(`  Priority [${defaultPriority}] (Highest/High/Medium/Low): `);
  const priority = priorityInput || defaultPriority;

  return { label, parent, priority, assigneeId: override.assignee || config.assignees[label] };
}

// ─── Description generator ──────────────────────────────────────────────────

function generateDescription(config, bug) {
  const epicLabel = typeof bug.epic === "string" ? bug.epic : `Epic ${bug.epic}`;
  const modulePath = config.modulePath || "the relevant module";
  const moduleName = config.modulePath ? config.modulePath.split(">").pop().trim() : "N/A";
  const environmentName = config.environmentName || "Staging";
  return [
    `## Summary`,
    ``,
    bug.rawText,
    ``,
    `## Steps to Reproduce`,
    ``,
    `1. Navigate to the relevant screen in ${modulePath}`,
    `2. Perform the action described in the summary`,
    `3. Observe the incorrect behavior`,
    ``,
    `## Expected Result`,
    ``,
    `The system should behave correctly as per the acceptance criteria.`,
    ``,
    `## Actual Result`,
    ``,
    bug.rawText,
    ``,
    `## Environment`,
    ``,
    `- **Module:** ${moduleName}`,
    `- **Epic:** ${epicLabel}`,
    `- **Side:** ${bug.label === "BE" ? "Back End" : "Front End"}`,
    `- **Environment:** ${environmentName}`,
  ].join("\n");
}

// ─── Tracking ────────────────────────────────────────────────────────────────

function loadReported() {
  if (!fs.existsSync(REPORTED_FILE)) return {};
  return JSON.parse(fs.readFileSync(REPORTED_FILE, "utf-8"));
}

function saveReported(reported) {
  fs.writeFileSync(REPORTED_FILE, JSON.stringify(reported, null, 2));
}

function loadOverrides() {
  if (!fs.existsSync(OVERRIDES_FILE)) return {};
  return stripReadmes(JSON.parse(fs.readFileSync(OVERRIDES_FILE, "utf-8")));
}

function loadDescriptions() {
  if (!fs.existsSync(DESCRIPTIONS_FILE)) return {};
  return stripReadmes(JSON.parse(fs.readFileSync(DESCRIPTIONS_FILE, "utf-8")));
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  // --init: generate config template
  if (args.includes("--init")) {
    initConfig();
    return;
  }

  const config = loadConfig();

  const dryRun = args.includes("--dry-run");
  const reportAll = args.includes("--all");
  const epicIdx = args.indexOf("--epic");
  const bugIdx = args.indexOf("--bug");

  const targetEpic = epicIdx !== -1 ? args[epicIdx + 1] : null;
  const targetBug = bugIdx !== -1 ? parseInt(args[bugIdx + 1]) : null;

  const bugs = parseBugFile(config);
  const reported = loadReported();
  const overrides = loadOverrides();
  const descriptions = loadDescriptions();

  // Filter unreported bugs
  let toReport = bugs.filter((b) => !reported[b.key]);

  if (targetEpic && targetBug) {
    const epicVal = isNaN(parseInt(targetEpic)) ? targetEpic.toLowerCase() : parseInt(targetEpic);
    toReport = toReport.filter((b) => b.epic === epicVal && b.bugNum === targetBug);
  } else if (targetEpic && !reportAll) {
    const epicVal = isNaN(parseInt(targetEpic)) ? targetEpic.toLowerCase() : parseInt(targetEpic);
    toReport = toReport.filter((b) => b.epic === epicVal);

    if (toReport.length === 0) {
      console.log(`No unreported bugs found for Epic ${targetEpic}.`);
      return;
    }
  } else if (!reportAll) {
    // List mode
    console.log(`\n  Project: ${path.basename(PROJECT_DIR)}`);
    console.log(`  Config:  ${CONFIG_FILE}`);
    console.log(`  Bugs:    ${config.bugFile || "Bug Summaries.txt"}`);
    console.log(`\n  Unreported bugs (${toReport.length}):\n`);
    for (const b of toReport) {
      const epicLabel = typeof b.epic === "string" ? b.epic : `Epic ${b.epic}`;
      console.log(
        `  ${b.key.padEnd(16)} [${b.label}] ${epicLabel} Bug ${b.bugNum}: ${b.rawText.slice(0, 70)}${b.rawText.length > 70 ? "..." : ""}`
      );
    }
    console.log(`\n  Commands:`);
    console.log(`    --epic N --bug M    Report a specific bug (interactive)`);
    console.log(`    --epic N            Report all unreported in Epic N`);
    console.log(`    --all               Report ALL unreported bugs (interactive)`);
    console.log(`    --all --no-prompt   Report all using defaults (no questions asked)`);
    console.log(`    --dry-run --all     Preview without creating`);
    console.log();
    return;
  }

  if (toReport.length === 0) {
    console.log("No unreported bugs found matching criteria.");
    return;
  }

  const noPrompt = args.includes("--no-prompt");

  // Load adapter + .env only when actually creating issues
  let adapter = null;
  if (!dryRun) {
    adapter = loadAdapter(config);
    loadEnv(adapter);
  }

  console.log(`\n  ${dryRun ? "[DRY RUN] " : ""}Reporting ${toReport.length} bug(s)...\n`);

  let successCount = 0;
  let errorCount = 0;
  let skipCount = 0;

  for (const bug of toReport) {
    let label, parentKey, priority, assigneeId;

    if (noPrompt || dryRun) {
      // Silent mode — use defaults/overrides without asking
      const override = overrides[bug.key] || {};
      const epicKey = typeof bug.epic === "string" ? bug.epic : bug.epic.toString();
      parentKey = override.parent || config.defaultParents[epicKey] || null;
      priority = override.priority || config.defaultPriority || "High";
      label = bug.label;
      assigneeId = override.assignee || config.assignees[label];
    } else {
      // Interactive mode — ask for each bug
      const details = await promptBugDetails(bug, config, overrides);
      if (!details) {
        skipCount++;
        continue;
      }
      label = details.label;
      parentKey = details.parent;
      priority = details.priority;
      assigneeId = details.assigneeId;
    }

    if (!assigneeId) {
      console.log(`  SKIP ${bug.key} — no assignee configured for label "${label}"`);
      skipCount++;
      continue;
    }

    // Use Claude-generated summary/description from bug-descriptions.json if available,
    // otherwise fall back to raw text from the bug file
    const desc = descriptions[bug.key] || {};
    const summary = desc.summary || `[${label}] ${bug.rawText}`;
    const truncatedSummary = summary.length > 255 ? summary.slice(0, 252) + "..." : summary;
    const description = desc.description || generateDescription(config, bug);
    const attachments = resolveAttachments(config, bug, desc);

    if (dryRun) {
      console.log(`  [DRY] ${bug.key}`);
      console.log(`         Summary:  ${truncatedSummary.slice(0, 100)}${truncatedSummary.length > 100 ? "..." : ""}`);
      console.log(`         Parent:   ${parentKey || "(none)"}`);
      console.log(`         Assignee: ${label}`);
      console.log(`         Priority: ${priority}`);
      console.log(`         Evidence: ${attachments.length ? attachments.map((p) => path.basename(p)).join(", ") : "(none found)"}`);
      console.log();
      continue;
    }

    // Confirm before creating
    if (!noPrompt) {
      const confirm = await ask(`\n  Create issue? (Y/n/skip): `);
      if (confirm.toLowerCase() === "n" || confirm.toLowerCase() === "skip") {
        console.log(`  Skipped ${bug.key}`);
        skipCount++;
        continue;
      }
    }

    try {
      // Delegate creation to the tracker adapter. The adapter receives the
      // description as markdown and is responsible for any format conversion
      // and multi-step API quirks its tracker requires.
      const issueKey = await adapter.createIssue(config, {
        summary: truncatedSummary,
        description,
        parentKey,
        assigneeId,
        priority,
        label,
        attachments,
      });
      process.stdout.write(`  ${issueKey} <- ${bug.key}`);

      // Upload evidence files if the adapter supports it; otherwise list them
      // so the user can attach manually in the tracker UI.
      if (attachments.length > 0) {
        if (typeof adapter.addAttachments === "function") {
          try {
            await adapter.addAttachments(config, issueKey, attachments);
            process.stdout.write(` [${attachments.length} attached]`);
          } catch (err) {
            process.stdout.write(` [attach FAILED: ${err.message}]`);
          }
        } else {
          process.stdout.write(` [attach manually: ${attachments.map((p) => path.basename(p)).join(", ")}]`);
        }
      }

      // Mark in text file
      markBugReportedInFile(config, bug, issueKey);
      console.log(` [marked]`);

      // Track in JSON
      reported[bug.key] = {
        issueKey,
        reportedAt: new Date().toISOString(),
        summary: truncatedSummary,
      };
      saveReported(reported);
      successCount++;
    } catch (err) {
      console.error(`  ERROR ${bug.key}: ${err.message}`);
      errorCount++;
    }
  }

  closeRL();
  console.log(`\n  Done: ${successCount} created, ${skipCount} skipped, ${errorCount} errors.\n`);
}

main().catch(console.error);
