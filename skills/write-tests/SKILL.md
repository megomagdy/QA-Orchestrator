---
name: write-tests
description: Generate comprehensive test cases covering all categories (happy, negative, boundary, edge, security, accessibility, localization). Outputs both Markdown and a test-management-importable Excel file matching your tool's template. Use after /review is complete and all blocking questions are answered.
---

# Write Test Cases — $ARGUMENTS

Generate comprehensive test cases following SFDP framework and strict QA methodology.

Read `qa-rules-condensed.md` from the project root for condensed QA rules.

## Prerequisites (MANDATORY)
Before writing ANY test case:
1. [ ] `/review` completed for this feature?
2. [ ] ALL blocking questions answered by product?
3. [ ] Re-investigation done after answers received?
4. [ ] Foundational Rules Registry checked for cross-epic constraints?
5. [ ] Design exports resized to a readable size? (if the product has design specs and any export exceeds ~1800px)

If ANY is missing, STOP and inform the user.

**Design exports:** If your design tool's exports (Figma, Sketch, Adobe XD, Zeplin, screenshots, ...) are images too large to read reliably (e.g. >1800px in any dimension), resize them to ≤1800px FIRST before reading — oversized exports lose text and element detail. Save resized versions in a `resized/` subfolder.

**Test Tool Template:** If a test-management import template (e.g., `test-import-template.xlsx`, `qmetry-template.xlsx`, or whatever `/init-workspace` registered) exists in the project root, read it FIRST and match its exact column order, headers, and multi-row pattern.

## TC Design Process

### Step 1: Read Cache or Source Documents
Check for `cache-[feature]-investigation.md` first. If it exists, use it instead of re-reading all source documents. Only read originals for details not in cache.

### Step 2: SFDP Decomposition per Story
For each story, decompose into: **S**tates, **F**ields, **D**ata interactions, **P**ermission gates. Each dimension generates test cases.

### Step 3: Apply Coverage Requirements
- Happy path: 15% | Positive: 10% | Negative: 20% | Boundary: 10%
- Edge: 10% | Integration: 10% | Auth: 10% | Localization: 5%
- Accessibility: 5% | Security: 5%
- **Negative paths MUST be ≥ 30% of total**

### Step 4: TC Format
TC ID: `E{epic#}-{type}-{seq}` — Types: P=Positive, N=Negative, E=Edge, S=Security, L=Localization

### Step 5: Self-Validation
See [validation-checklist.md](validation-checklist.md) for the full self-validation checklist.

## Agent Orchestration
- **Small scope (< 5 stories):** Write directly in main context, no agents.
- **Large scope (5+ stories):** Spawn tc-writer agents per epic for parallel generation. Also spawn security-scanner and a11y-auditor for specialized TCs. After agents return, merge all TCs and run self-validation in main context.

## Output — Two Files
### File 1: Markdown — Readable tables grouped by epic/story.
### File 2: Excel — See [excel-output.md](excel-output.md) for the import format rules (worked example: 25-column Qmetry format; adapt to your tool's template).

## Rules
- NEVER write TCs for unconfirmed UI elements (check design files/DOM first)
- EVERY expected result MUST match QC decisions
- EVERY TC links to ≥ 1 issue tracker story
- Validation timing must be correct (WHERE does validation fire?)
