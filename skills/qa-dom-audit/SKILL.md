---
name: qa-dom-audit
description: |
  **Live DOM QA Audit**: Systematic verification of web application UI elements against test case definitions using Chrome browser tools. Use this skill whenever the user asks to audit, verify, or validate that buttons, menus, actions, or UI elements actually exist on a live web page. Also trigger when: verifying test case accuracy against real UI, checking if documented actions match what's actually on screen, re-auditing modules after UI changes, finding ghost/phantom UI elements that don't exist, or cross-referencing a test spec with live DOM.
  - MANDATORY TRIGGERS: DOM audit, verify buttons, check UI, live audit, verify actions, button exists, UI verification, re-audit, ghost elements, phantom selectors
---

# Live DOM QA Audit Skill

## Purpose

This skill enables systematic, trustworthy verification of web application UI elements by inspecting the live DOM through Chrome browser tools (Claude in Chrome MCP). It was born from a real scenario where test cases referenced buttons that didn't exist (e.g., an "Add" button on a Settlements page that was never there), causing invalid test cases and eroding trust in the QA suite.

The core insight: **never trust documentation or config files about what UI elements exist — always verify against the live DOM.**

## When to Use

- You need to verify that buttons, menus, tabs, icons, or actions actually exist on a page
- Test cases reference UI elements that may not be real
- A module-areas config or test spec needs validation against the live app
- The user says something like "does this button actually exist?" or "audit the UI"
- After a UI redesign, you need to re-verify all documented actions

## Audit Workflow

### Phase 1: Preparation

1. **Confirm browser access**: Ensure Claude in Chrome MCP is connected and you have a valid tab ID
2. **Identify target URL**: Get the base URL and ensure you're logged in with the right role (typically the highest-privilege role like Owner/Admin for full visibility)
3. **List all modules/pages** to audit — get the complete scope upfront

### Phase 2: Systematic Page-by-Page Audit

For each module/page:

1. **Navigate** to the page URL using `navigate` tool
2. **Wait** 2-3 seconds for Angular/React SPAs to finish rendering
3. **Take a screenshot** to visually confirm the page loaded correctly
4. **Run a JavaScript audit script** via `javascript_tool` to extract:

```javascript
// Standard audit script — adapt selectors to your app
const audit = {};

// Headings
audit.headings = Array.from(document.querySelectorAll('h1,h2,h3,h4'))
  .map(h => ({ tag: h.tagName, text: h.textContent.trim() }));

// All visible buttons
audit.buttons = Array.from(document.querySelectorAll('button:not([hidden])'))
  .filter(b => b.offsetParent !== null)
  .map(b => ({
    text: b.textContent.trim().substring(0, 60),
    ariaLabel: b.getAttribute('aria-label'),
    disabled: b.disabled
  }));

// Tab navigation
audit.tabs = Array.from(document.querySelectorAll('a[role="tab"], [role="tab"]'))
  .map(t => ({ text: t.textContent.trim(), active: t.classList.contains('active') || t.getAttribute('aria-selected') === 'true' }));

// Table columns
audit.tables = Array.from(document.querySelectorAll('table')).map(t => ({
  headers: Array.from(t.querySelectorAll('th')).map(th => th.textContent.trim()),
  rowCount: t.querySelectorAll('tbody tr').length
}));

// Three-dot menus (common action pattern)
audit.threeDotMenus = document.querySelectorAll('[class*="more_vert"], button:has(mat-icon)').length;

// Icon buttons in table rows (view/edit/delete)
audit.rowActionIcons = document.querySelectorAll('td button svg, td button mat-icon, td a svg').length;

JSON.stringify(audit, null, 2);
```

5. **Take a screenshot** of the page to visually confirm what you found
6. **For pages with tabs**: Click each tab, wait, and repeat the audit for each tab's content
7. **Record findings** in a structured format

### Phase 3: Cross-Reference with Spec

Compare what the DOM actually has against what the test spec/config says:

| What to check | How to verify |
|---------------|---------------|
| "Add" button exists | Look for `button:has-text("Add...")` in audit results |
| "Edit" action exists | Look for edit icons, pencil icons, ⋮ menus with Edit option |
| "Delete" action exists | Look for delete icons, ⋮ menus with Delete option, trash icons |
| "Export" button | Look for `button:has-text("Export")` |
| Tab exists | Check `audit.tabs` array |
| Table with specific columns | Check `audit.tables[].headers` |

### Phase 4: Flag Discrepancies

For each discrepancy found, document:

1. **Module name and URL**
2. **What the spec says** (e.g., `actions: ['View', 'Add', 'Edit']`)
3. **What the DOM actually has** (e.g., only View with eye icon, no Add/Edit buttons)
4. **Evidence** (screenshot ID, JS audit output)
5. **Recommended fix** to the spec

## Common Pitfalls

These are real issues discovered during audits — watch for them:

- **Card-based UIs mistaken for tables**: Some modules use service cards (clickable tiles) not data tables. Don't assume tables with "Send" buttons when the UI has cards.
- **⋮ (three-dot) menus that don't exist**: Schedule/card layouts may not have more-options menus even if similar pages do.
- **Eye icon ≠ Edit**: An eye icon in an Actions column means View, not Edit. Don't conflate them.
- **Tabs that aren't `role="tab"`**: Some tabs use different HTML patterns (e.g., styled `<a>` or `<button>` elements without ARIA roles). Use screenshots to confirm visually.
- **"No data" states hiding buttons**: Some pages show "No Members Found" with no action buttons — the buttons may only appear when data exists. Note this.
- **Buttons only visible after clicking into a record**: Edit/Delete may only appear inside a detail view, not on the list page. Document which level the button appears at.

## Output Format

Present results as a table with one row per module:

```
| Module | URL | Verified Buttons | Verified Tabs | Discrepancies |
|--------|-----|-----------------|---------------|---------------|
| Home | /app/home | Display Code, row icons | — | Spec area not present in DOM |
| Settlements | /app/settlements | Filter, eye icon only | — | NO Add/Edit (spec says Add, Edit) |
```

## Case Study — the classes of ghost element to expect

From an audit of an enterprise ERP platform. The module names are illustrative; the **failure classes** are what recur everywhere:

- **Action that never existed**: spec said `['View', 'Add', 'Edit']`; reality was `['View']` only — no Add button had ever shipped.
- **Wrong interaction model**: spec described tables with per-row action buttons; reality was a card-based service interface with no such buttons at all.
- **Named button absent**: spec named a specific button for the Add action; no element with that label existed.
- **Action exists, but elsewhere**: spec placed Edit/Delete on the main view; they only appeared inside a detail modal.
- **Icon misread**: an eye icon documented as Edit was actually View-only.

These ghost elements produced **40+ invalid test cases** that could only ever fail — the reason this skill exists.
