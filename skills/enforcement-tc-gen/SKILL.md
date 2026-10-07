---
name: enforcement-tc-gen
description: |
  **Permission Enforcement Test Case Generator**: Generates role×module×action micro test cases for RBAC/permission enforcement testing. Creates .docx and .md deliverables with TC IDs, steps, expected results, and priority levels. Use this skill whenever: generating permission test cases, creating RBAC enforcement tests, building role-based access control test suites, producing test matrices for roles×modules×actions, generating micro TCs for permission validation, or creating test case documents for multi-tenant ERP systems.
  - MANDATORY TRIGGERS: enforcement test cases, permission tests, RBAC tests, role permission matrix, micro TCs, role enforcement, access control tests, permission test generation, roles permissions test cases
---

# Permission Enforcement Test Case Generator

## Purpose

Generates comprehensive, traceable micro test cases for role-based access control (RBAC) enforcement testing. The output is a complete test suite where every role×module×action combination has an explicit test case with a unique TC ID, detailed steps, and expected results.

The pattern works for any RBAC system of any size — N roles × M modules. Role names, module names, and counts all come from the project's own config; nothing here is domain-specific.

## Architecture

The generator works from three data sources:

1. **Module Areas Config** (see the `module-areas-manager` skill): Defines modules, their areas/widgets, available CRUD actions, and element selectors
2. **Role Config**: Defines roles and their module-level permission matrix (one boolean per module)
3. **Role Area Overrides**: Special cases where a role has partial access within a module (e.g. a role may View an area but not Add to it)

### TC Generation Logic

```
For each role:
  For each module:
    If role HAS access to module:
      For each area in module:
        For each action in area:
          → Generate PERMITTED test case (verify action works)
          → Check for overrides (may flip to DENIED)
    If role does NOT have access:
      → Generate single ACCESS DENIED test case
```

### TC ID Format

`TC-ENF-XXXX` where XXXX is a zero-padded sequential number across all roles.

### Priority Levels

- **P0**: Standard enforcement (most test cases) — action should be PERMITTED or module should be DENIED
- **P1**: Override cases — action is DENIED despite module access (special permission restrictions)

## Input Requirements

### Module Areas Structure

Each module needs:
```typescript
{
  index: number,           // 0-based module index
  moduleKey: string,       // e.g., 'settlements'
  modulePath: string,      // e.g., '/app/settlements'
  moduleTitle: string,     // e.g., 'Attendance & Settlements'
  areas: [{
    name: string,          // e.g., 'Settlements'
    actions: ActionType[], // ['View', 'Add', 'Edit', 'Delete']
    selectors: { ... }     // CSS selectors for each action
  }]
}
```

**Critical rule**: The `actions` array must ONLY contain actions verified via live DOM audit. Never include speculative actions. If in doubt, use the `qa-dom-audit` skill first.

### Role Permission Matrix

A boolean array per role, one entry per module:
```typescript
{
  // one boolean per module, in the same order as the module-areas config
  admin:    [true,  true,  true,  ...],   // M booleans
  employee: [true,  false, true,  ...],   // true = has access
}
```

### Overrides

For partial access scenarios:
```typescript
{
  roleKey: 'employee',
  moduleKey: 'records',
  areaName: 'Leave Balance',
  action: 'Add',
  expected: 'DENIED'  // Despite having module access
}
```

## Output Formats

### DOCX Output

Professional landscape A4 document with:
- **Title page**: Document name, total TC count, generation date
- **Summary table**: TC count per role
- **Per-role sections**: Each role gets a heading + table with columns:
  - TC ID | Module | Area | Action | Priority | Test Steps | Expected Result | Status

Uses the `docx` npm package. Column widths optimized for landscape:
```javascript
const colWidths = [1100, 1200, 1400, 700, 600, 4000, 4600, 798];
```

### Markdown Output

Simpler table format for quick reference:
```markdown
| TC ID | Module | Area | Action | Expected | Pri |
|-------|--------|------|--------|----------|-----|
| TC-ENF-0001 | Home | Employees Widget | View | PERMITTED | P0 |
```

## Generator Script Pattern

The generator script (`gen_micro_tcs.js`) uses this structure:

```javascript
const modules = [
  { idx: 0, key: 'home', title: 'Home', route: '/app/home', areas: [
    { name: 'Area Name', actions: ['View', 'Add'],
      steps: { View: '1. Navigate to...\n2. Verify...', Add: '1. Click...' },
      expected: { View: 'Table visible with data.', Add: 'Button opens form.' }
    },
  ]},
  // ... all modules
];
```

Each area includes:
- `steps`: Per-action test steps (numbered, newline-separated)
- `expected`: Per-action expected results

### Test Steps Best Practices

Steps should be concrete and reference actual UI elements:
```
✓ "Click 'Add Shifts' button"
✓ "Verify eye icon in Actions column opens detail view"
✓ "Verify Filter button is functional"

✗ "Click Add button" (which Add button?)
✗ "Verify actions work" (too vague)
✗ "Click Send button" (verify it exists first!)
```

### ACCESS DENIED Test Cases

For modules a role can't access, generate a single TC that checks:
1. Module is NOT visible in sidebar
2. Direct URL navigation redirects to home or shows 403
3. No data from this module is accessible

## Running the Generator

```bash
# Install docx package if needed
npm install docx

# Generate DOCX
node gen_micro_tcs.js

# Generate Markdown
node gen_micro_tcs_md.js
```

## Maintenance Workflow

When the app UI changes:

1. Run `qa-dom-audit` skill to re-verify all modules
2. Update the module-areas config with corrected actions
3. Update the generator's module data to match
4. Regenerate every output format the project uses
5. Compare TC counts — changes indicate spec drift

## Reference Scale (anonymized case study)

A real run on an enterprise ERP platform, useful for sanity-checking your own counts:

- 8 roles × 23 modules
- 101 DOM-verified actions across all module areas
- **526** micro test cases generated
- The first version produced **566** — **40 were invalid**, generated from ghost UI elements
- Re-auditing corrected 8 modules and removed the phantom actions

Takeaway: a TC count that only ever grows is a warning sign. Expect a re-audit to *remove* cases.
