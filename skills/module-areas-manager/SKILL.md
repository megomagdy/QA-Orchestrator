---
name: module-areas-manager
description: |
  **Module Areas Config Manager**: Maintains the module-areas config — the source-of-truth file that maps an application's modules to their UI areas, CRUD actions, and element selectors. Use this skill whenever: updating the module-areas config, adding/removing module actions, correcting selectors after UI changes, syncing the config with the live DOM, managing the config that drives permission-enforcement tests, or maintaining the mapping between an app's navigation modules and their UI capabilities.
  - MANDATORY TRIGGERS: module-areas, update selectors, fix module actions, module config, area actions, sync module config, update module definitions
---

# Module Areas Configuration Manager

## Purpose

Maintains the **module-areas config** — the single source of truth that maps every module in an application's navigation to its UI areas, available CRUD actions, and element selectors. This config drives both the automated enforcement tests and the micro test-case generator (see `enforcement-tc-gen`).

Getting this file wrong means invalid test cases that always fail and erode QA trust. This skill keeps the config accurate.

## File Location

There is no fixed path — **ask, or discover it.** Common conventions:

```
<automation-suite>/tests/config/module-areas.ts     # TypeScript suites (Playwright)
<automation-suite>/config/module_areas.py           # Python suites
<automation-suite>/fixtures/module-areas.json       # framework-neutral
```

Record the resolved path in the project's CLAUDE.md so later sessions don't re-hunt for it. The examples below use TypeScript; the same data model applies in any language.

## Data Model

```typescript
// One entry per module in the app's navigation (N modules, index 0..N-1)
interface ModuleAreasDef {
  index: number;          // position in the permission matrix
  moduleKey: string;      // stable id, e.g., 'settlements'
  modulePath: string;     // route, e.g., '/app/settlements'
  moduleTitle: string;    // navigation display name
  areas: AreaDef[];       // UI areas within the module
}

// Each area within a module
interface AreaDef {
  name: string;           // Display name (e.g., 'Records', 'Balances')
  actions: ActionType[];  // ['View', 'Add', 'Edit', 'Delete'] — VERIFIED only
  selectors: {
    container: string;        // Area container selector
    viewIndicator?: string;   // Selector proving View works
    addButton?: string;       // "Add" button selector
    editButton?: string;      // "Edit" button/icon selector
    deleteButton?: string;    // "Delete" button/icon selector
  };
}

type ActionType = 'View' | 'Add' | 'Edit' | 'Delete';
```

Keep `index` aligned with the permission matrix used by `enforcement-tc-gen`; if the app gains or loses a module, both must move together.

## Golden Rules

### 1. Actions Must Be DOM-Verified

Never add an action to the `actions` array unless you've confirmed the corresponding UI element exists in the live DOM. This is the rule that prevents ghost test cases.

```typescript
// BAD — assumed Add button exists
actions: ['View', 'Add', 'Edit']

// GOOD — only verified actions
actions: ['View']  // Only filter + eye icon confirmed
```

### 2. Selectors Must Match Real Elements

Every selector should target an element confirmed via screenshot or a JavaScript/DOM audit. Common patterns:

```typescript
// Buttons with text (use the app's real labels)
addButton: 'button:has-text("Add Record")'
addButton: 'button:has-text("New Item")'

// Overflow / three-dot menus (⋮)
editButton: 'button:has-text("⋮"), [aria-label*="more" i]'

// Icon buttons in table rows
editButton: 'td button svg, button[aria-label*="edit" i]'

// Tab containers
container: 'a:has-text("<Tab Name>")[role="tab"], main'

// Heading-based containers
container: 'h1:has-text("<Page Heading>"), main'
container: 'h4:has-text("<Section Heading>")'
```

### 3. Remove Selectors When Removing Actions

If an action is removed from the `actions` array, also remove its corresponding selector:

```typescript
// When changing from ['View', 'Add', 'Edit'] to ['View']:
// Remove addButton and editButton from selectors
selectors: {
  container: 'main',
  viewIndicator: 'table tbody, button:has-text("Filter")',
  // addButton: REMOVED
  // editButton: REMOVED
}
```

### 4. Keep Related Files in Sync

When the config changes, whatever consumes it must be regenerated. Typical chain:

| Consumer | What to update |
|------|---------------|
| Micro-TC generator script(s) | Module data array (actions, steps, expected results) |
| Generated documents (.docx / .md / .xlsx) | Regenerate by re-running the generator |
| Automated enforcement specs | Re-run to confirm selectors still resolve |

Record the actual generator commands in the project's CLAUDE.md — they differ per project.

### 5. Comment Discrepancies

When a module's live UI doesn't match expectations, add a comment explaining what was found:

```typescript
/**
 * Module 3: Settlements (/app/settlements)
 * DOM audit: View-only table with filter and eye icon (detail view)
 * NOTE: No Add or Edit buttons exist despite the module name suggesting editability
 */
```

## Common Module Patterns

These recur across enterprise applications regardless of domain — classify each module by **shape**, not by name:

### View-Only Modules
Only a View action; no data modification.
- Typical: reports, analytics, dashboards, read-only integrations, permission viewers
- Pattern: table or cards with no action buttons, perhaps only filters
- Watch for: an **eye icon = View, not Edit**

### Card-Based Service Modules
Clickable service cards instead of CRUD tables.
- Typical: third-party service integrations, request-initiation hubs
- Pattern: cards launch a workflow; no Add/Edit/Delete in the traditional sense

### Tab-Based Modules
Multiple tabs, each potentially with different actions.
- Pattern: **audit EACH tab separately** — actions commonly differ between tabs

### Table + Overflow Menu Modules
Edit/Delete live inside a ⋮ menu per row.
- Pattern: ⋮ visible on rows → verify the Edit/Delete options actually appear when opened

### Wizard / Multi-Step Modules
Creation happens through a stepped flow.
- Pattern: Add exists but leads to a wizard; Edit may only be available in a draft state

## Update Checklist

- [ ] Run `qa-dom-audit` on affected modules first
- [ ] Update `actions` arrays to match verified DOM
- [ ] Update `selectors` to match actual selectors
- [ ] Remove selectors for removed actions
- [ ] Update the comment block for the module
- [ ] Update the verification-status comment at the top of the file
- [ ] Update the micro-TC generator's module data
- [ ] Regenerate all generated outputs
- [ ] Verify the new TC count delta makes sense (log the output)
- [ ] Confirm `index` values still align with the permission matrix

## Module Index Reference

**Do not hardcode a module list here.** Build it from the application's own navigation, then store it in the project's CLAUDE.md. Use this shape:

| Idx | Key | Title | Route |
|-----|-----|-------|-------|
| 0 | home | Home | /app/home |
| 1 | records | Records | /app/records |
| 2 | settlements | Settlements | /app/settlements |
| … | … | … | … |
| N-1 | settings | Settings | /app/settings |

How to derive it:
1. Log in with the highest-privilege role so every module is visible.
2. Enumerate the navigation items in order — that order defines `index`.
3. Capture each item's route and display title verbatim from the UI.
4. Cross-check the count against the permission matrix used by `enforcement-tc-gen`; a mismatch means one of the two is stale.
