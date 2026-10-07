/**
 * Jira Cloud Adapter
 * ==================
 *
 * Implements the adapter contract described in _template.js for Jira Cloud.
 *
 * SETUP
 * -----
 *   1. In your project's bug-reporter.config.json:
 *
 *        "tracker": "jira",
 *        "projectKey": "PROJ",
 *        "issueTypeName": "Bug",
 *        "sprintId": 1234,                     // or null
 *        "trackerOptions": {
 *          "cloudId": "<your-atlassian-cloud-id>",
 *          "siteUrl": "https://your-company.atlassian.net",   // for printed links
 *          "sprintFieldId": "customfield_10020"            // optional
 *        }
 *
 *   2. Put credentials in .env (project folder or this script folder):
 *
 *        ATLASSIAN_EMAIL=you@company.com
 *        ATLASSIAN_API_TOKEN=<token from id.atlassian.com/manage-profile/security/api-tokens>
 *
 * DESIGN NOTES
 * ------------
 * - Jira Cloud REST v3 takes ADF (Atlassian Document Format), NOT markdown or
 *   wiki markup. The core script hands us markdown, so this adapter converts
 *   markdown -> ADF locally (see mdToAdf). No third-party deps: the global QA
 *   folder stays copy-paste portable.
 *
 * - The "create with a Placeholder description, then edit" workaround that the
 *   MCP path requires is NOT needed here. That bug is an MCP-layer
 *   double-escaping of "\n"; posting real ADF over REST has no such problem, so
 *   this adapter creates the issue once, fully populated.
 *
 * - Issue-type hierarchy matters. In some projects the
 *   "Bug" type is a SUBTASK (hierarchyLevel -1) and REQUIRES a parent that is
 *   itself a standard issue (Story/Task, hierarchyLevel 0). A Bug cannot be
 *   parented to another subtask. If parentKey is missing for a subtask type,
 *   Jira rejects the call — the error is surfaced verbatim so the cause is
 *   obvious.
 *
 * - The Sprint custom field takes a PLAIN NUMBER (1688), not an object
 *   ({id: 1688}) — the latter returns "Number value expected as the Sprint id."
 *
 * - Priority names vary per project. If Jira rejects the priority, the issue is
 *   retried once without it rather than losing the whole bug report.
 */

const fs = require("fs");
const path = require("path");

const API = (cloudId) => `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3`;

function authHeader() {
  const email = process.env.ATLASSIAN_EMAIL;
  const token = process.env.ATLASSIAN_API_TOKEN;
  return "Basic " + Buffer.from(`${email}:${token}`).toString("base64");
}

// ─── Markdown → ADF ──────────────────────────────────────────────────────────
// Covers what bug reports actually contain: headings, paragraphs, bullet and
// ordered lists, fenced code blocks, tables, block quotes, horizontal rules,
// and inline bold / italic / code / links.

const INLINE_RE =
  /(\*\*[^*]+\*\*|__[^_]+__|\*[^*\n]+\*|_[^_\n]+_|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;

function inlineNodes(text) {
  if (!text) return [];
  const out = [];
  let last = 0;
  for (const m of text.matchAll(INLINE_RE)) {
    if (m.index > last) out.push({ type: "text", text: text.slice(last, m.index) });
    const tok = m[0];
    if (tok.startsWith("**") || tok.startsWith("__")) {
      out.push({ type: "text", text: tok.slice(2, -2), marks: [{ type: "strong" }] });
    } else if (tok.startsWith("`")) {
      out.push({ type: "text", text: tok.slice(1, -1), marks: [{ type: "code" }] });
    } else if (tok.startsWith("[")) {
      const link = tok.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      out.push({
        type: "text",
        text: link[1],
        marks: [{ type: "link", attrs: { href: link[2] } }],
      });
    } else {
      out.push({ type: "text", text: tok.slice(1, -1), marks: [{ type: "em" }] });
    }
    last = m.index + tok.length;
  }
  if (last < text.length) out.push({ type: "text", text: text.slice(last) });
  return out.filter((n) => n.text !== "");
}

function para(text) {
  const content = inlineNodes(text);
  return { type: "paragraph", content: content.length ? content : [] };
}

function tableRow(cells, header) {
  return {
    type: "tableRow",
    content: cells.map((c) => ({
      type: header ? "tableHeader" : "tableCell",
      attrs: {},
      content: [para(c.trim())],
    })),
  };
}

function splitRow(line) {
  return line.replace(/^\s*\|/, "").replace(/\|\s*$/, "").split("|");
}

function mdToAdf(md) {
  const lines = String(md == null ? "" : md).replace(/\r\n/g, "\n").split("\n");
  const content = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // blank
    if (!line.trim()) { i++; continue; }

    // fenced code block
    const fence = line.match(/^\s*```(\w+)?\s*$/);
    if (fence) {
      const lang = fence[1];
      const body = [];
      i++;
      while (i < lines.length && !/^\s*```\s*$/.test(lines[i])) body.push(lines[i++]);
      i++; // closing fence
      content.push({
        type: "codeBlock",
        attrs: lang ? { language: lang } : {},
        content: body.length ? [{ type: "text", text: body.join("\n") }] : [],
      });
      continue;
    }

    // horizontal rule
    if (/^\s*([-*_])\s*\1\s*\1[\s\-*_]*$/.test(line)) {
      content.push({ type: "rule" });
      i++;
      continue;
    }

    // heading
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      content.push({
        type: "heading",
        attrs: { level: h[1].length },
        content: inlineNodes(h[2].trim()),
      });
      i++;
      continue;
    }

    // table (header row + separator row)
    if (/^\s*\|/.test(line) && i + 1 < lines.length && /^\s*\|[\s:|-]+\|?\s*$/.test(lines[i + 1])) {
      const rows = [tableRow(splitRow(line), true)];
      i += 2;
      while (i < lines.length && /^\s*\|/.test(lines[i])) {
        rows.push(tableRow(splitRow(lines[i]), false));
        i++;
      }
      content.push({ type: "table", attrs: { isNumberColumnEnabled: false, layout: "default" }, content: rows });
      continue;
    }

    // block quote
    if (/^\s*>\s?/.test(line)) {
      const body = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        body.push(lines[i].replace(/^\s*>\s?/, ""));
        i++;
      }
      content.push({ type: "blockquote", content: [para(body.join(" ").trim())] });
      continue;
    }

    // lists
    const bullet = line.match(/^\s*[-*+]\s+(.*)$/);
    const ordered = line.match(/^\s*\d+[.)]\s+(.*)$/);
    if (bullet || ordered) {
      const isOrdered = !!ordered;
      const items = [];
      while (i < lines.length) {
        const m = isOrdered
          ? lines[i].match(/^\s*\d+[.)]\s+(.*)$/)
          : lines[i].match(/^\s*[-*+]\s+(.*)$/);
        if (!m) break;
        items.push({ type: "listItem", content: [para(m[1].trim())] });
        i++;
      }
      content.push({ type: isOrdered ? "orderedList" : "bulletList", content: items });
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
    content.push(para(buf.join(" ")));
  }

  return { type: "doc", version: 1, content: content.length ? content : [para("")] };
}

// ─── Adapter ─────────────────────────────────────────────────────────────────

async function postIssue(cloudId, fields) {
  const res = await fetch(`${API(cloudId)}/issue`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ fields }),
  });
  const text = await res.text();
  return { ok: res.ok, status: res.status, text };
}

module.exports = {
  name: "jira",

  // Exported for local testing of the markdown->ADF conversion.
  _mdToAdf: mdToAdf,

  requiredEnv: ["ATLASSIAN_EMAIL", "ATLASSIAN_API_TOKEN"],

  async createIssue(config, issue) {
    const opts = config.trackerOptions || {};
    const cloudId = opts.cloudId;
    if (!cloudId) {
      throw new Error(
        'Jira adapter: "cloudId" missing from trackerOptions in bug-reporter.config.json. ' +
          "Find it at https://<site>.atlassian.net/_edge/tenant_info"
      );
    }

    const fields = {
      project: { key: config.projectKey },
      issuetype: { name: config.issueTypeName || "Bug" },
      summary: String(issue.summary || "").slice(0, 255),
      description: mdToAdf(issue.description),
    };

    if (issue.parentKey) fields.parent = { key: issue.parentKey };
    if (issue.assigneeId) fields.assignee = { id: issue.assigneeId };
    if (issue.label) fields.labels = [issue.label];
    if (issue.priority) fields.priority = { name: issue.priority };

    // Sprint custom field takes a PLAIN NUMBER, not { id: n }.
    if (config.sprintId != null) {
      fields[opts.sprintFieldId || "customfield_10020"] = Number(config.sprintId);
    }

    let { ok, status, text } = await postIssue(cloudId, fields);

    // Priority names differ per project — retry once without it rather than
    // dropping the bug report entirely.
    if (!ok && fields.priority && /priority/i.test(text)) {
      const retry = { ...fields };
      delete retry.priority;
      ({ ok, status, text } = await postIssue(cloudId, retry));
      if (ok) {
        console.log(
          `  NOTE: priority "${issue.priority}" rejected by Jira — issue created without it.`
        );
      }
    }

    if (!ok) {
      let detail = text;
      try {
        const j = JSON.parse(text);
        const msgs = [...(j.errorMessages || []), ...Object.entries(j.errors || {}).map(([k, v]) => `${k}: ${v}`)];
        if (msgs.length) detail = msgs.join(" | ");
      } catch { /* keep raw body */ }
      throw new Error(`Jira API ${status}: ${detail}`);
    }

    return JSON.parse(text).key;
  },

  async addAttachments(config, issueKey, filePaths) {
    const cloudId = (config.trackerOptions || {}).cloudId;
    const failures = [];

    for (const filePath of filePaths) {
      try {
        const buf = fs.readFileSync(filePath);
        const name = path.basename(filePath);
        const form = new FormData();
        form.append("file", new Blob([buf], { type: mimeFor(name) }), name);

        const res = await fetch(`${API(cloudId)}/issue/${issueKey}/attachments`, {
          method: "POST",
          headers: {
            Authorization: authHeader(),
            // Required by Jira for multipart uploads — without it: 403 XSRF check failed.
            "X-Atlassian-Token": "no-check",
            Accept: "application/json",
          },
          body: form,
        });

        if (!res.ok) {
          failures.push(`${name}: ${res.status} ${await res.text()}`);
        }
      } catch (e) {
        failures.push(`${path.basename(filePath)}: ${e.message}`);
      }
    }

    if (failures.length) {
      throw new Error(`Attachment upload failed for ${issueKey} — ${failures.join(" ; ")}`);
    }
  },
};

function mimeFor(name) {
  const ext = path.extname(name).toLowerCase();
  return (
    {
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".mp4": "video/mp4",
      ".mov": "video/quicktime",
      ".webm": "video/webm",
      ".pdf": "application/pdf",
      ".txt": "text/plain",
      ".log": "text/plain",
      ".json": "application/json",
      ".har": "application/json",
    }[ext] || "application/octet-stream"
  );
}
