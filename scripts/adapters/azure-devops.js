/**
 * Azure DevOps Boards Adapter
 * ===========================
 *
 * Implements the adapter contract described in _template.js for Azure DevOps
 * Boards (Azure DevOps Services, and Server 2020+).
 *
 * SETUP
 * -----
 *   1. In your project's bug-reporter.config.json:
 *
 *        "tracker": "azure-devops",
 *        "projectKey": "Takeoff",              // the ADO *project name*
 *        "issueTypeName": "Bug",               // work item type
 *        "sprintId": null,                     // see iterationPath below
 *        "trackerOptions": {
 *          "orgUrl": "https://dev.azure.com/your-org",
 *          "areaPath": "Takeoff\\Agency Registration",   // optional
 *          "iterationPath": "Takeoff\\Sprint 12",        // optional
 *          "descriptionField": null,           // optional override, see below
 *          "apiVersion": "7.1"                 // optional
 *        }
 *
 *      "assignees" in the config must hold ADO identities — a user's email /
 *      UPN (e.g. "jane.doe@your-company.com") works, as does the full
 *      "Display Name <email>" form.
 *
 *   2. Put credentials in .env (project folder or this script folder):
 *
 *        AZURE_DEVOPS_PAT=<PAT with Work Items: Read & write>
 *
 *      Create one at https://dev.azure.com/<org>/_usersSettings/tokens
 *
 * DESIGN NOTES
 * ------------
 * - Work items are created with JSON Patch, not plain JSON: the body is an
 *   ARRAY of {op, path, value} and the Content-Type must be
 *   "application/json-patch+json". A normal application/json POST returns 400.
 *
 * - The work item type goes in the URL prefixed with a literal "$"
 *   ("/workitems/$Bug"), sent url-encoded as %24Bug.
 *
 * - PAT auth is HTTP Basic with an EMPTY username and the PAT as the password.
 *
 * - Which field holds the bug body depends on the project's PROCESS, and
 *   getting it wrong is the most common failure here:
 *       Agile / Scrum process  ->  Microsoft.VSTS.TCM.ReproSteps
 *       Basic process          ->  System.Description
 *   This adapter defaults to ReproSteps for Bug-like types and falls back to
 *   System.Description automatically when ADO rejects the field, so it works on
 *   either process with no configuration. Set trackerOptions.descriptionField
 *   to pin it explicitly.
 *
 * - Those fields are HTML, not markdown. The core script hands us markdown, so
 *   this adapter converts markdown -> HTML locally (see mdToHtml). No
 *   third-party deps: the global QA folder stays copy-paste portable.
 *
 * - Priority is an INTEGER 1-4, not a name. The generic priority names are
 *   mapped: Highest->1, High->2, Medium->3, Low->4.
 *
 * - "Sprint" in ADO is an iteration PATH string ("Project\\Sprint 12"), not the
 *   numeric board id Jira uses. config.sprintId is therefore honoured only when
 *   it is a string; trackerOptions.iterationPath takes precedence.
 *
 * - Parenting is a link, not a field: a relation of type
 *   System.LinkTypes.Hierarchy-Reverse pointing at the parent's work item URL.
 *   Unlike Jira's subtask types, an ADO Bug does not require a parent.
 *
 * - An optional field the project's process does not accept (a custom priority
 *   scheme, an unknown assignee, a stale area path) would otherwise cost the
 *   whole bug report. Each is dropped and retried individually, and the drop is
 *   printed. Title and parent are never dropped.
 *
 * - Attachments are a TWO-step API: upload the bytes to get an attachment URL,
 *   then PATCH the work item to add an AttachedFile relation pointing at it.
 */

const fs = require("fs");
const path = require("path");

const DEFAULT_API_VERSION = "7.1";

// ─── Auth / URLs ─────────────────────────────────────────────────────────────

function authHeader() {
  // Azure DevOps PAT auth: empty username, PAT as the password.
  return "Basic " + Buffer.from(":" + (process.env.AZURE_DEVOPS_PAT || "")).toString("base64");
}

function orgRoot(opts) {
  const org = String(opts.orgUrl || "").trim().replace(/\/+$/, "");
  if (!org) {
    throw new Error(
      'Azure DevOps adapter: "orgUrl" missing from trackerOptions in bug-reporter.config.json. ' +
        'Expected something like "https://dev.azure.com/<organization>".'
    );
  }
  return org;
}

function witBase(opts, project) {
  if (!project) {
    throw new Error(
      'Azure DevOps adapter: "projectKey" missing from bug-reporter.config.json. ' +
        'For Azure DevOps this is the project NAME, e.g. "Takeoff".'
    );
  }
  return orgRoot(opts) + "/" + encodeURIComponent(project) + "/_apis/wit";
}

function apiVersion(opts) {
  return opts.apiVersion || DEFAULT_API_VERSION;
}

// ─── Markdown → HTML ─────────────────────────────────────────────────────────
// Covers what bug reports actually contain: headings, paragraphs, bullet and
// ordered lists, fenced code blocks, tables, block quotes, horizontal rules,
// and inline bold / italic / code / links.

const INLINE_RE =
  /(\*\*[^*]+\*\*|__[^_]+__|\*[^*\n]+\*|_[^_\n]+_|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Escapes first, then applies inline markup, so bug text can never inject tags.
function inlineHtml(text) {
  const safe = esc(text);
  let out = "";
  let last = 0;
  for (const m of safe.matchAll(INLINE_RE)) {
    out += safe.slice(last, m.index);
    const tok = m[0];
    if (tok.startsWith("**") || tok.startsWith("__")) {
      out += "<strong>" + tok.slice(2, -2) + "</strong>";
    } else if (tok.startsWith("`")) {
      out += "<code>" + tok.slice(1, -1) + "</code>";
    } else if (tok.startsWith("[")) {
      const link = tok.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      out += '<a href="' + link[2] + '">' + link[1] + "</a>";
    } else {
      out += "<em>" + tok.slice(1, -1) + "</em>";
    }
    last = m.index + tok.length;
  }
  out += safe.slice(last);
  return out;
}

function splitRow(line) {
  return line.replace(/^\s*\|/, "").replace(/\|\s*$/, "").split("|");
}

function mdToHtml(md) {
  const lines = String(md == null ? "" : md).replace(/\r\n/g, "\n").split("\n");
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // blank
    if (!line.trim()) { i++; continue; }

    // fenced code block
    const fence = line.match(/^\s*```(\w+)?\s*$/);
    if (fence) {
      const body = [];
      i++;
      while (i < lines.length && !/^\s*```\s*$/.test(lines[i])) body.push(lines[i++]);
      i++; // closing fence
      out.push("<pre><code>" + esc(body.join("\n")) + "</code></pre>");
      continue;
    }

    // horizontal rule
    if (/^\s*([-*_])\s*\1\s*\1[\s\-*_]*$/.test(line)) {
      out.push("<hr />");
      i++;
      continue;
    }

    // heading
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      out.push("<h" + level + ">" + inlineHtml(h[2].trim()) + "</h" + level + ">");
      i++;
      continue;
    }

    // table (header row + separator row)
    if (/^\s*\|/.test(line) && i + 1 < lines.length && /^\s*\|[\s:|-]+\|?\s*$/.test(lines[i + 1])) {
      const head = splitRow(line).map((c) => "<th>" + inlineHtml(c.trim()) + "</th>").join("");
      const rows = ["<tr>" + head + "</tr>"];
      i += 2;
      while (i < lines.length && /^\s*\|/.test(lines[i])) {
        const cells = splitRow(lines[i]).map((c) => "<td>" + inlineHtml(c.trim()) + "</td>").join("");
        rows.push("<tr>" + cells + "</tr>");
        i++;
      }
      out.push("<table>" + rows.join("") + "</table>");
      continue;
    }

    // block quote
    if (/^\s*>\s?/.test(line)) {
      const body = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        body.push(lines[i].replace(/^\s*>\s?/, ""));
        i++;
      }
      out.push("<blockquote>" + inlineHtml(body.join(" ").trim()) + "</blockquote>");
      continue;
    }

    // lists
    const bullet = line.match(/^\s*[-*+]\s+(.*)$/);
    const ordered = line.match(/^\s*\d+[.)]\s+(.*)$/);
    if (bullet || ordered) {
      const isOrdered = !!ordered;
      const tag = isOrdered ? "ol" : "ul";
      const items = [];
      while (i < lines.length) {
        const m = isOrdered
          ? lines[i].match(/^\s*\d+[.)]\s+(.*)$/)
          : lines[i].match(/^\s*[-*+]\s+(.*)$/);
        if (!m) break;
        items.push("<li>" + inlineHtml(m[1].trim()) + "</li>");
        i++;
      }
      out.push("<" + tag + ">" + items.join("") + "</" + tag + ">");
      continue;
    }

    // paragraph — join consecutive plain lines
    const buf = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^\s*```/.test(lines[i]) &&
      !/^(#{1,6})\s+/.test(lines[i]) &&
      !/^\s*\|/.test(lines[i]) &&
      !/^\s*>\s?/.test(lines[i]) &&
      !/^\s*[-*+]\s+/.test(lines[i]) &&
      !/^\s*\d+[.)]\s+/.test(lines[i]) &&
      !/^\s*([-*_])\s*\1\s*\1[\s\-*_]*$/.test(lines[i])
    ) {
      buf.push(lines[i].trim());
      i++;
    }
    out.push("<p>" + inlineHtml(buf.join(" ")) + "</p>");
  }

  return out.join("\n") || "<p></p>";
}

// ─── Field helpers ───────────────────────────────────────────────────────────

// ADO stores priority as an integer 1-4, not a name.
const PRIORITY_MAP = { Highest: 1, High: 2, Medium: 3, Low: 4 };

function descriptionFieldFor(config) {
  const explicit = (config.trackerOptions || {}).descriptionField;
  if (explicit) return explicit;
  // Agile/Scrum bugs use ReproSteps; everything else uses Description.
  const type = String(config.issueTypeName || "Bug");
  return /bug|defect/i.test(type) ? "Microsoft.VSTS.TCM.ReproSteps" : "System.Description";
}

function iterationPathFor(config) {
  const opts = config.trackerOptions || {};
  if (opts.iterationPath) return opts.iterationPath;
  // Jira-style numeric sprint ids have no meaning in ADO — only accept a path.
  if (typeof config.sprintId === "string" && config.sprintId.trim()) return config.sprintId.trim();
  return null;
}

function findOp(ops, fieldPath) {
  return ops.findIndex((o) => o.path === fieldPath);
}

function dropOp(ops, fieldPath) {
  const idx = findOp(ops, fieldPath);
  if (idx === -1) return false;
  ops.splice(idx, 1);
  return true;
}

// ─── HTTP ────────────────────────────────────────────────────────────────────

async function sendPatch(url, ops, method) {
  const res = await fetch(url, {
    method: method || "POST",
    headers: {
      Authorization: authHeader(),
      // JSON Patch is mandatory here — plain application/json returns 400.
      "Content-Type": "application/json-patch+json",
      Accept: "application/json",
    },
    body: JSON.stringify(ops),
  });
  return { ok: res.ok, status: res.status, text: await res.text() };
}

function errorDetail(text) {
  try {
    const j = JSON.parse(text);
    if (j.message) return j.message;
  } catch { /* keep raw body */ }
  // A wrong/expired PAT gets an HTML sign-in page rather than JSON.
  if (/^\s*</.test(text)) {
    return (
      "received an HTML sign-in page instead of JSON — AZURE_DEVOPS_PAT is likely " +
      "invalid, expired, or lacks the 'Work Items: Read & write' scope."
    );
  }
  return String(text).slice(0, 600);
}

// ─── Adapter ─────────────────────────────────────────────────────────────────

module.exports = {
  name: "azure-devops",

  // Exported for local testing of the markdown->HTML conversion.
  _mdToHtml: mdToHtml,

  requiredEnv: ["AZURE_DEVOPS_PAT"],

  async createIssue(config, issue) {
    const opts = config.trackerOptions || {};
    const base = witBase(opts, config.projectKey);
    const type = config.issueTypeName || "Bug";
    const url =
      base +
      "/workitems/" +
      encodeURIComponent("$" + type) +
      "?api-version=" +
      encodeURIComponent(apiVersion(opts));

    let descField = descriptionFieldFor(config);

    const ops = [
      { op: "add", path: "/fields/System.Title", value: String(issue.summary || "").slice(0, 255) },
      { op: "add", path: "/fields/" + descField, value: mdToHtml(issue.description) },
    ];

    if (issue.priority && PRIORITY_MAP[issue.priority] != null) {
      ops.push({
        op: "add",
        path: "/fields/Microsoft.VSTS.Common.Priority",
        value: PRIORITY_MAP[issue.priority],
      });
    }
    if (issue.assigneeId) {
      ops.push({ op: "add", path: "/fields/System.AssignedTo", value: issue.assigneeId });
    }
    if (issue.label) {
      ops.push({ op: "add", path: "/fields/System.Tags", value: issue.label });
    }
    if (opts.areaPath) {
      ops.push({ op: "add", path: "/fields/System.AreaPath", value: opts.areaPath });
    }
    const iteration = iterationPathFor(config);
    if (iteration) {
      ops.push({ op: "add", path: "/fields/System.IterationPath", value: iteration });
    }
    if (issue.parentKey) {
      // Parenting is a relation, not a field.
      ops.push({
        op: "add",
        path: "/relations/-",
        value: {
          rel: "System.LinkTypes.Hierarchy-Reverse",
          url: orgRoot(opts) + "/_apis/wit/workItems/" + encodeURIComponent(issue.parentKey),
        },
      });
    }

    let { ok, status, text } = await sendPatch(url, ops);

    // A field the project's process does not accept would otherwise cost the
    // whole bug report. Drop the offending optional field and retry, one at a
    // time, rather than losing the bug. Title and parent are never dropped.
    // Notes are collected and printed only once the issue actually lands, so a
    // recovery that is followed by a further failure is still reported.
    const recoveries = [];
    for (let attempt = 0; !ok && attempt < 4; attempt++) {
      const detail = errorDetail(text);
      let recovered = null;

      if (/ReproSteps/i.test(detail) && descField !== "System.Description") {
        // Wrong process guess — swap ReproSteps for Description.
        const idx = findOp(ops, "/fields/" + descField);
        if (idx !== -1) {
          descField = "System.Description";
          ops[idx].path = "/fields/System.Description";
          recovered = "bug body field switched to System.Description (Basic process)";
        }
      } else if (/AssignedTo|identity/i.test(detail) && dropOp(ops, "/fields/System.AssignedTo")) {
        recovered = 'assignee "' + issue.assigneeId + '" not resolvable — created unassigned';
      } else if (/Priority/i.test(detail) && dropOp(ops, "/fields/Microsoft.VSTS.Common.Priority")) {
        recovered = 'priority "' + issue.priority + '" rejected — created without it';
      } else if (/IterationPath/i.test(detail) && dropOp(ops, "/fields/System.IterationPath")) {
        recovered = 'iteration path "' + iteration + '" rejected — created in the default iteration';
      } else if (/AreaPath/i.test(detail) && dropOp(ops, "/fields/System.AreaPath")) {
        recovered = 'area path "' + opts.areaPath + '" rejected — created in the default area';
      } else if (/Tags/i.test(detail) && dropOp(ops, "/fields/System.Tags")) {
        recovered = 'tag "' + issue.label + '" rejected — created without tags';
      }

      if (!recovered) break;
      recoveries.push(recovered);
      ({ ok, status, text } = await sendPatch(url, ops));
    }

    if (!ok) {
      throw new Error("Azure DevOps API " + status + ": " + errorDetail(text));
    }

    for (const note of recoveries) console.log("  NOTE: " + note + ".");

    return String(JSON.parse(text).id);
  },

  async addAttachments(config, issueKey, filePaths) {
    const opts = config.trackerOptions || {};
    const base = witBase(opts, config.projectKey);
    const ver = encodeURIComponent(apiVersion(opts));
    const failures = [];

    for (const filePath of filePaths) {
      const name = path.basename(filePath);
      try {
        // Step 1 — upload the bytes, get back an attachment URL.
        const upload = await fetch(
          base + "/attachments?fileName=" + encodeURIComponent(name) + "&api-version=" + ver,
          {
            method: "POST",
            headers: {
              Authorization: authHeader(),
              "Content-Type": "application/octet-stream",
              Accept: "application/json",
            },
            body: fs.readFileSync(filePath),
          }
        );
        const uploadText = await upload.text();
        if (!upload.ok) {
          failures.push(name + ": upload " + upload.status + " " + errorDetail(uploadText));
          continue;
        }
        const attachmentUrl = JSON.parse(uploadText).url;

        // Step 2 — link it to the work item as an AttachedFile relation.
        const link = await sendPatch(
          base + "/workitems/" + encodeURIComponent(issueKey) + "?api-version=" + ver,
          [
            {
              op: "add",
              path: "/relations/-",
              value: { rel: "AttachedFile", url: attachmentUrl, attributes: { comment: "" } },
            },
          ],
          "PATCH"
        );
        if (!link.ok) {
          failures.push(name + ": link " + link.status + " " + errorDetail(link.text));
        }
      } catch (e) {
        failures.push(name + ": " + e.message);
      }
    }

    if (failures.length) {
      throw new Error("Attachment upload failed for " + issueKey + " — " + failures.join(" ; "));
    }
  },
};
