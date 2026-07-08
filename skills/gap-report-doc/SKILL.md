---
name: gap-report-doc
description: Generate a Word document from review findings for manual review before pushing to the team's questions tracker. Use after /review to share gap report with stakeholders.
argument-hint: "feature-name"
---

# Generate Gap Report Document — $ARGUMENTS

## Prerequisites
- `/review` must have been run first
- Review findings must exist in current session or cache

## Execution
1. Read review findings (from session or `cache-[feature]-investigation.md`)
2. Generate a professional Word document (.docx) with:
   - Executive summary (total findings, priority breakdown)
   - Conflicts table (Doc A vs Doc B with exact references)
   - Questions/Gaps table (Q-ID, Priority, Epic, Category, Affected Stories)
   - Recommendations (proceed / wait for answers)
3. Save as: `QA-Review-Report-[feature]-[YYYY-MM-DD].docx`

## Output
Word document ready for review. User reviews and approves before /gap-report-push pushes to the configured questions tracker (Notion, Confluence, Azure DevOps, etc.).

## Rules
- Include ALL findings, not just high priority
- Sort by priority (CRITICAL first)
- Include document references for every finding
