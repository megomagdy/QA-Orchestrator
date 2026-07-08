# Setup Questions for /init-project

Ask each question, then fill in CLAUDE.md placeholders:

1. **Project name?** → {PROJECT_NAME}
2. **One-line description?** → {PROJECT_DESCRIPTION}
3. **Your name and title?** → {QA_LEAD_NAME}, {QA_LEAD_TITLE} (default: the `qaLead` value from workspace.config.json)
4. **Architecture principle?** (Multi-tenancy / RBAC / API-first) → {ARCHITECTURE_PRINCIPLE}
5. **Quality principle?** (Localization / Accessibility / Responsive / Offline) → {QUALITY_PRINCIPLE}
6. **Regulatory/compliance concerns?** → {COMPLIANCE_DESCRIPTION} (if none: "No regulatory requirements")
7. **Representative story + epic IDs from your tracker?** → {STORY_KEY}, {EPIC_KEY}
   (Jira-style: `CRM-1234` / Azure DevOps & similar: plain work-item numbers like `4512` — both formats are fine)
   **Follow-up — workspace/cloud/org ID?** → {CLOUD_ID} (pre-fill from workspace.config.json `issueTrackerOptions` if set; answer "N/A" if your tracker has none)
8. **Issue tracker tool?** (Jira / Azure DevOps / Linear) → {TOOL_NAME}
9. **Test management tool?** (Qmetry / TestRail / Zephyr) → {TEST_TOOL}
10. **Design tool and location?** (e.g., Figma at figma.com/file/abc) → {DESIGN_TOOL_AND_LOCATION}
11. **PRD location?** (Notion / Confluence link) → {PRD_LINK_OR_PATH}
12. **Primary business entity?** (e.g., Loan Request, Shift) → {ENTITY}, {RELATED_ENTITY}
13. **Module path?** (e.g., HR > Loans, Shifts) → {MODULE}

After all answered: Replace ALL placeholders, remove Appendix A/B/C (setup guides).
If user provided URLs → auto-save to project-references.md.
