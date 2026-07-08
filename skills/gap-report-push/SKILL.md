---
name: gap-report-push
description: Push confirmed gap/question report to the team's Open Questions tracker (Notion database, Confluence page, Azure DevOps wiki/queries, SharePoint list, etc. — whatever the workspace config specifies). Each feature gets its own database/page. Asks user whether to create new or use existing. Use after /gap-report-doc is reviewed and approved.
argument-hint: "feature-name"
---

# Push Gap Report to Questions Tracker — $ARGUMENTS

## Platform

The target platform is defined in the workspace config (`workspace.config.json` in the global QA folder, field `questionsPlatform`) or the project's CLAUDE.md. Common choices: Notion database, Confluence page with a table, Azure DevOps wiki/work items, SharePoint list. Use the platform's MCP tools if connected; otherwise ask the user how to push (or fall back to a markdown file they can paste).

## Prerequisites
- `/review` and `/gap-report-doc` completed
- ASK: "Have you reviewed and approved the gap report doc?"
- Do NOT push without explicit user confirmation

## Step 1: Determine Target Database/Page
**NEVER use a hardcoded database/page ID. ALWAYS ask the user.**

Check `project-references.md` for an existing Open Questions database/page for this feature.
- If found → confirm with user
- If NOT found → ask: "Create NEW or use EXISTING? (provide URL)"

## Step 2: Create or Validate Schema
**New:** Create with this schema (map to your platform's field types):
Question (title), Question ID (text), Epic (select), Priority (select: CRITICAL/HIGH/MEDIUM/LOW), Affected Stories (text), Category (select), Answer (text), Status (select: Unanswered/Answered/Partially Answered)

## Step 3: Push Questions
Each question entry MUST have:
- **Properties:** Short summary as title, Question ID, Epic, Priority, Affected Stories, Category, Status=Unanswered
- **Body/Content (MANDATORY):**
  ```
  ## Context
  [What the conflict/gap is and where it comes from]
  ## Example Scenario
  [Concrete example showing the ambiguity]
  ## Why It Matters
  [Why this blocks test case writing]
  ```

## Rules
- NEVER mix different features' questions in the same database/page
- Title = SHORT summary for scanning. Full detail goes in the entry body.
- Titles should be full self-contained questions (end in "?"), not terse labels — stakeholders scan titles
- Save the database/page URL in project-references.md after creating
- Platform quirks to watch for: some platforms (e.g., Notion MCP) have no hard delete — verify removals by re-querying
