---
name: save-url
description: Store reference URLs (PRD, design files, API specs, issue tracker, docs platform, GitHub, Postman) in project-references.md. Auto-detects URL type and categorizes. Use to register any project URL for cross-session access.
argument-hint: "URL and optional label"
---

# Save Reference URL — $ARGUMENTS

## Execution
1. Parse URL from $ARGUMENTS
2. Auto-detect type: PRD, Design file (Figma/etc.), Swagger/API, Issue tracker Epic/Story (Jira, Azure DevOps, Linear, GitHub Issues...), Docs platform (Notion, Confluence, SharePoint...), Repo, Postman
3. Extract label (from $ARGUMENTS or auto-generate from URL)
4. Read `project-references.md` — check for duplicates
5. Append to correct section in project-references.md

## File Format
```markdown
# Project References

## PRD / Requirements
- [PRD - Feature Name](https://notion.so/...)

## Design
- [Figma - Feature Name](https://figma.com/file/...)

## Issue Tracker
- [Epic - Feature Name](https://tracker.example.com/browse/PROJ-...)

## API Specs
- [Swagger - API Name](https://api.example.com/swagger)

## Other
- [Label](URL)
```

## Rules
- Check for duplicates before adding
- Supports batch mode: multiple URLs in one call
- All saved URLs available to every command across sessions
