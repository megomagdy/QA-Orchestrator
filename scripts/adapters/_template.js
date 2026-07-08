/**
 * Tracker Adapter Template
 * ========================
 *
 * report-bugs.js delegates ALL tracker API calls to an adapter file in this
 * folder. To connect your issue tracker (Jira, Azure DevOps, Linear, GitHub
 * Issues, GitLab, ...):
 *
 *   1. Copy this file to <tracker-name>.js  (e.g., azure-devops.js)
 *   2. Implement createIssue() below
 *   3. In your project's bug-reporter.config.json set:
 *        "tracker": "<tracker-name>"
 *      and put any adapter-specific settings under "trackerOptions"
 *      (org URL, cloud ID, repo, area path, ...).
 *   4. List the credential env vars your adapter needs in requiredEnv.
 *      Users put the values in a .env file (project folder or script folder).
 *      See .env.example.
 *
 * THE CONTRACT
 * ------------
 * module.exports = {
 *   name:           string   — adapter display name (used in error messages)
 *   requiredEnv:    string[] — env var names that must be set before running
 *   createIssue:    async (config, issue) => issueKey
 *   addAttachments: async (config, issueKey, filePaths) => void   [OPTIONAL]
 * }
 *
 * createIssue(config, issue)
 *   config — the full parsed bug-reporter.config.json (with _readme fields
 *            stripped). Useful fields:
 *              config.projectKey     e.g. "PROJ"
 *              config.issueTypeName  e.g. "Bug"
 *              config.sprintId       number|null
 *              config.trackerOptions your adapter-specific settings
 *   issue — one bug ready to be created:
 *              issue.summary      one-line title (≤ 255 chars)
 *              issue.description  full bug report in MARKDOWN
 *              issue.parentKey    parent story key/id, or null
 *              issue.assigneeId   tracker user id from config.assignees
 *              issue.priority     "Highest" | "High" | "Medium" | "Low"
 *              issue.label        "FE" | "BE" | "Product"
 *              issue.attachments  absolute paths of evidence files discovered
 *                                 in the Manual Execution folder (screenshots,
 *                                 recordings). Informational here — upload is
 *                                 done via addAttachments() after creation.
 *   returns — the created issue's key/id as a string (e.g. "PROJ-123" or
 *             "4512"). It is written into the bug file as [REPORTED: <key>]
 *             and into reported-bugs.json.
 *   throws  — an Error with a helpful message on failure. The core script
 *             catches it, prints it, and continues with the next bug.
 *
 * addAttachments(config, issueKey, filePaths)   [OPTIONAL]
 *   Called once per created issue when evidence files exist for the bug
 *   (Manual Execution convention: "Epic {n}/Bug {m}.png", "Bug {m}.mp4",
 *   "Bug {m} (2).png", ...). Upload each file to the issue using your
 *   tracker's attachments API (usually multipart/form-data).
 *   If the adapter does not implement this, the script prints the file list
 *   with "[attach manually: ...]" so the user can drag them into the tracker.
 *   Throwing is non-fatal: the issue stays created and the error is printed.
 *
 * NOTES FOR IMPLEMENTERS
 * ----------------------
 * - The description arrives as markdown. If your tracker needs another
 *   format (e.g., Jira Cloud needs ADF, Azure DevOps needs HTML), convert
 *   INSIDE the adapter. Keep the core script format-agnostic.
 * - Some trackers have API quirks that need multi-step creation (e.g.,
 *   create with a placeholder description, then edit — this avoids newline
 *   corruption on some Jira instances). Handle such quirks inside
 *   createIssue(); the core script calls it exactly once per bug.
 * - Map the generic priority names to your tracker's scheme here if they
 *   differ.
 * - Use global fetch (Node 18+). No third-party dependencies, so the global
 *   QA folder stays copy-paste portable.
 */

module.exports = {
  // Shown in error messages, e.g. "Missing credentials for adapter 'template'"
  name: "template",

  // Env vars the user must provide in .env before this adapter can run.
  // Rename these to whatever your tracker needs, e.g.:
  //   Jira:         ["ATLASSIAN_EMAIL", "ATLASSIAN_API_TOKEN"]
  //   Azure DevOps: ["AZURE_DEVOPS_PAT"]
  //   GitHub:       ["GITHUB_TOKEN"]
  requiredEnv: ["TRACKER_API_TOKEN"],

  /**
   * Create one issue in the tracker and return its key/id as a string.
   */
  async createIssue(config, issue) {
    // ── Replace everything below with real API calls to your tracker. ──

    // Typical shape of an implementation:
    //
    // const { orgUrl } = config.trackerOptions;         // adapter settings
    // const token = process.env.TRACKER_API_TOKEN;      // credentials
    //
    // const res = await fetch(`${orgUrl}/api/issues`, {
    //   method: "POST",
    //   headers: {
    //     Authorization: `Bearer ${token}`,
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     project: config.projectKey,
    //     type: config.issueTypeName || "Bug",
    //     title: issue.summary,
    //     body: issue.description,               // convert format if needed
    //     assignee: issue.assigneeId,
    //     priority: issue.priority,
    //     labels: [issue.label],
    //     parent: issue.parentKey || undefined,
    //   }),
    // });
    //
    // if (!res.ok) {
    //   throw new Error(`Tracker API ${res.status}: ${await res.text()}`);
    // }
    // const data = await res.json();
    // return data.key;

    throw new Error(
      "This is the adapter template. Copy it to adapters/<your-tracker>.js, " +
        "implement createIssue(), and set \"tracker\" in bug-reporter.config.json."
    );
  },

  // OPTIONAL — delete this method if your tracker has no attachments API
  // (the script will then print "[attach manually: ...]" per bug instead).
  //
  // async addAttachments(config, issueKey, filePaths) {
  //   for (const filePath of filePaths) {
  //     const form = new FormData();
  //     form.append("file", new Blob([require("fs").readFileSync(filePath)]),
  //       require("path").basename(filePath));
  //     const res = await fetch(`${config.trackerOptions.orgUrl}/api/issues/${issueKey}/attachments`, {
  //       method: "POST",
  //       headers: { Authorization: `Bearer ${process.env.TRACKER_API_TOKEN}` },
  //       body: form,
  //     });
  //     if (!res.ok) throw new Error(`Attachment upload ${res.status}: ${await res.text()}`);
  //   }
  // },
};
