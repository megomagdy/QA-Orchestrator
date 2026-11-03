---
name: gap-report-push
description: Push confirmed gap/question report to the team's Open Questions tracker (Notion database, Confluence page, Azure DevOps wiki/queries, SharePoint list, etc. — whatever the workspace config specifies). Each feature gets its own database/page. Pushes every open item of the report — questions, conflicts without a question, decision findings, and design divergences as one combined entry — and verifies the push against that inventory. Asks user whether to create new or use existing. Use after /gap-report-doc is reviewed and approved.
argument-hint: "feature-name"
---

# Push Gap Report to Questions Tracker — $ARGUMENTS

## Platform

The target platform is defined in the workspace config (`workspace.config.json` in the global QA folder, field `questionsPlatform`) or the project's CLAUDE.md. Common choices: Notion database, Confluence page with a table, Azure DevOps wiki/work items, SharePoint list. Use the platform's MCP tools if connected; otherwise ask the user how to push (or fall back to a markdown file they can paste).

## Prerequisites
- `/review` and `/gap-report-doc` completed
- ASK: "Have you reviewed and approved the gap report doc?"
- Do NOT push without explicit user confirmation

## Step 0: Build the Push Inventory from the WHOLE Report (before asking anything)
The report holds more than the questions table. List every OPEN item in every section and decide where each one lands — nothing is left out silently:

| Report item | Default treatment |
|---|---|
| Open question (incl. partly answered) | One entry; partly answered ones carry only the open part |
| Conflict that a question already asks to resolve | Mapped to that question (no extra entry); name the mapping |
| Conflict with NO matching question | **Its own entry** (title as a question: "Is A or B right?") |
| New finding that needs a product decision | Its own entry, or mapped to the question that covers it |
| New finding that is QA-internal (data caveat, oracle note) | Not pushed; list it as excluded with the reason |
| Design / prototype divergences | **One combined entry** listing every item (screen, frame, design shows vs spec says), unless the user wants one per issue or a separate design database |
| Answered / resolved items | Not pushed (unless the user asks for an answered log) |

Show the inventory to the user as counts per category plus the mapping (conflict → question, finding → question / excluded) and confirm the scope together with the approval question. Every open item in the report (and any companion page such as an HTML summary) must end up as a pushed entry, a mapping, or an explicit exclusion.

**Run the gate script (mandatory)** — it builds the inventory from the report's tables and refuses to continue while any open item has no treatment:
```
node <skill-dir>/scripts/push-inventory.js plan <project>/review-findings.md --decisions <project>/push-decisions.json --out <project>/push-plan.json
```
- Exit 2 = some items are UNDECIDED. Put each in `push-decisions.json` (`"entry": [...]`, `"map": {"CF-16": "Q-17"}`, `"exclude": {"NF-07": "reason"}`, `"design": "combined" | "separate" | "skip"`) after agreeing it with the user, then re-run until exit 0.
- Check every automatic mapping marked "check it really resolves it"; override wrong ones in the decisions file (e.g. a question that only says a part "became CF-20").
- Show the user the script's output (counts, entries, mappings, exclusions) as the inventory. Keep `push-decisions.json` and `push-plan.json` in the project as the record of the push scope.
- A companion page (HTML summary, slide) the script doesn't read: compare its counts by hand with the plan and add any extra item to the decisions file.
- A conflict whose row contains `**Resolved by D-xx:**` (the `/review` convention) is treated as closed and left out. Older reports mark resolution as `[Resolved` in the conflict cell, which still works.
- Items outside the tables (decisions, answered items, developer notes) are invisible to the script. Say in the inventory what happens to each: decisions and answered items are not pushed; a developer note about today's behaviour that affects users, money or downstream data must already be a question (keep-or-change) — if one is not, stop and raise it before pushing.
**Why:** a push of "the open questions" silently dropped a conflict with no matching question, 3 findings and 19 design divergences that the report and its HTML summary listed; the user found the gap by comparing counts.

## Step 1: Determine Target Database/Page
**NEVER use a hardcoded database/page ID. ALWAYS ask the user.**

Check `project-references.md` for an existing Open Questions database/page for this feature.
- If found → confirm with user
- If NOT found → ask: "Create NEW or use EXISTING? (provide URL)"
- **Visibility (ask with the location):** should the tracker be **private to the user** for now, or **shared** with the page's audience? A database created under a shared page inherits that page's sharing. For a private tracker, create it at workspace level (Notion: parent omitted or moved to `workspace`), or move it there right after creation. Re-fetch it and check its ancestor path is empty. Remind the user to check **Share** for people added directly, since the connector cannot read page permissions.
  **Why:** on one feature, a tracker was created under the shared engineering hand-off at the user's choice, then the user wanted both lists private; they had to be moved out after creation.
- **Write access:** a connector can usually read a page it can't edit. If creating under the chosen parent fails with a permission error, stop and ask: create it as a private page the user moves later, have the user grant the integration edit access (e.g. Notion: Share → Connections) and retry, or use another parent. Never work around the permission through another session or tool.

## Step 2: Create or Validate Schema
**New:** Create with this schema (map to your platform's field types):
Question (title), Question ID (text), Epic (select), Priority (select: CRITICAL/HIGH/MEDIUM/LOW), Affected Stories (text), Category (select — include the question categories plus `Design-Story` and a conflict category), Answer (text), Status (select: Unanswered/Answered/Partially Answered), Related questions (self-relation, two-way), Related conflicts & findings (text), Follow-ups (relation to the Follow-ups list below)

**Follow-ups list (create with the tracker):** a second database/list, one row per follow-up, so a question can carry any number of follow-ups, each with its own answer and status:
Follow-up (title — the full follow-up question), Follow-up ID (text: `<Question ID>-F<n>`, e.g. `Q-29-F1`), Question (two-way relation to the tracker → creates the tracker's "Follow-ups" column), Priority (same options as the tracker; default = the question's), Status (select: Open / Answered / Closed — Answered = stakeholder replied, Closed = QA confirmed it settles it), Answer (text), Asked on (date), Answered on (date), Raised by (select: QA / Product / Dev)

**Default sort:** both lists open sorted by **Priority ascending** (option order CRITICAL → LOW), then by ID. Order the Priority options CRITICAL, HIGH, MEDIUM, LOW so the select order is the severity order. Show the Follow-ups column in the tracker's default view.
- Notion: a two-way **self**-relation creates two columns (the relation and its reverse, auto-named e.g. "Related questions 1"). Rename the reverse one right away (e.g. "Related from") so stakeholders don't fill both.
- Notion: put several sort keys in ONE clause (`SORT BY "Priority" ASC, "Follow-up ID" ASC`); separate `SORT BY` statements replace each other. Re-fetch the view and check its `sorts`.
- Notion: a formula over a relation with a select comparison (`prop("Follow-ups").filter(current.prop("Status") != "Closed").length()`) is rejected with "Type error with formula" — don't block on a count column; the relation column itself shows the follow-ups.

**Existing tracker:** never restructure a tracker stakeholders already use (columns, page bodies, merges, sorts) beyond what the user asks for. Add only the requested column; offer the rest for the next project.

## Step 3: Push Entries
Push every item the inventory marked as an entry: questions, unmapped conflicts (Question ID = the conflict ID), decision findings, and the combined design entry (Question ID e.g. `DESIGN`).
Each entry MUST have:
- **Properties:** Short summary as title, Question ID, Epic, Priority, Affected Stories, Category, Status=Unanswered, Answer empty
- **Body/Content (MANDATORY):**
  ```
  ## Context
  [What the conflict/gap is and where it comes from]
  ## Example Scenario
  [Concrete example showing the ambiguity]
  ## Why It Matters
  [Why this blocks test case writing]
  ```
- The combined design entry lists every divergence as a numbered item: screen, frame/node, what the design shows, what the spec says (with section), so the design team can work through it in one place.

### Related items: fold, link, merge only rarely
- **Fold** each conflict / finding mapped to a question (Step 0) into that question's page under `## Related conflicts and findings` (ID + one line each) and list the IDs in the "Related conflicts & findings" column. The answer to the question resolves them; they get no row of their own.
- **Link** questions on the same topic but with separate decisions through "Related questions" — keep them as separate rows with their own answer and status. Never merge them just because they share a screen or epic.
- **Merge** two or more questions into one row only when ALL hold: one decision answers all of them; at most 2–3 sub-questions; the page has a numbered answer slot per sub-question (`### Q-12a … Answer:`); the user confirmed the merge in the Step 0 inventory. Judge the answer per sub-question — a merged row closes only when every part is answered.
**Why:** a page that bundles several decisions gets one answer for the first part and the rest is silently left open; context folded in, related rows linked, and rare merges with per-part slots keep each decision answerable.

## Step 4: Verify the Push Against the Inventory
Query the tracker back (not the create responses): count entries per priority and list every Question ID. Write the IDs to a file (one per line or a JSON array) and run:
```
node <skill-dir>/scripts/push-inventory.js verify <project>/push-plan.json <tracker-ids.txt>
```
Exit 1 lists entries MISSING from the tracker, entries NOT in the plan, and DUPLICATES — fix them and verify again; never report a push as done before exit 0. Then report to the user: pushed N (per priority), mapped conflicts/findings and to which question, excluded items with reasons. Save the URL (and the entry count) in `project-references.md`.
**Why:** replaying a past feature's first push (26 entries) through `verify` fails with "MISSING from tracker: CF-07, DESIGN" — the exact gap the user had to find by hand.

## Step 5: Hand-off and Answer Tracking (offer, don't assume)
- Offer a ready-to-paste message for the stakeholders: the tracker URL, the counts, that every row is a page with Context / Example / Why it matters, where to write the answer, and the HIGH items listed by title. Remind the user to share the tracker first if it is private.
- Offer a recurring answer check. When judging answers, read the **content**, not the Status: stakeholders set "Answered" on deferrals ("separate document", "after technical planning") and on requests for clarification ("needs more info"). Each answer is CLOSES (definite, testable, consistent with the spec, decisions and code) or NEEDS FOLLOW-UP (vague, partial, contradicts a source, or raises a new case), with the exact follow-up question. "As today" answers are checked against what today actually is (code / data) before they count as closed. Answers the user relays in chat are recorded with "via user" and queued for the next push.
- **Pushing follow-ups** (only when the user says so): one Follow-ups row per follow-up question, linked to its question, Status=Open, Asked on = today, Raised by = QA. A second round on the same question is a new row (`-F2`), never an edit of the first one's text, so every answer stays next to the question it answers. Set a follow-up to Closed once its answer closes it; a question closes when its own answer and all its follow-ups are closed. Answer checks read the Follow-ups list too.

## Rules
- NEVER mix different features' questions in the same database/page
- Title = SHORT summary for scanning. Full detail goes in the entry body.
- Titles should be full self-contained questions (end in "?"), not terse labels — stakeholders scan titles
- Save the database/page URL in project-references.md after creating
- Platform quirks to watch for: some platforms (e.g., Notion MCP) have no hard delete — verify removals by re-querying
- Push the report, not just its questions table: conflicts without a question, decision findings and design divergences are part of the push (Step 0)
- The pushed set must match the report's open items: a pushed entry, a named mapping, or an explicit exclusion for each — verify by re-querying (Step 4)
- The gate script is mandatory: no push starts before `plan` exits 0, and no push is reported done before `verify` exits 0
- Trackers open sorted by Priority (CRITICAL first); follow-ups live in their own linked list, one row per follow-up
- Fold mapped conflicts/findings into their question's page, link related questions, merge only under the Step 3 conditions
