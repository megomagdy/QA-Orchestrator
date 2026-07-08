---
name: scaffold-automation
description: Scaffold a Playwright automation framework with POM, custom fixtures, multi-environment config, mobile emulation, and API testing support. Use when setting up test automation for a feature after test cases are written.
argument-hint: "feature-name"
---

# Scaffold Automation Framework — $ARGUMENTS

Read `qa-rules-condensed.md` from the project root for condensed QA rules.

## Prerequisites
- [ ] Test cases exist (from /write-tests) — needed to identify automation candidates
- [ ] Test environment URL known

## Agent Orchestration (Key Differentiator)
Playwright MCP agents dramatically accelerate scaffolding. See [agents.md](agents.md) for the full workflow.

### Quick Summary:
1. **playwright-test-planner** → Explores live app via browser, creates test plan
2. **playwright-test-generator** → Creates real tests by interacting with live browser
3. **Main context** → Organizes into POM structure, adds fixtures, CI config

## Framework Structure
See [project-structure.md](project-structure.md) for the complete directory layout, POM patterns, and configuration files.

## Steps
1. Create project structure and install dependencies
2. Configure multi-environment settings (local/staging/production)
3. Create BasePage with common actions
4. Create concrete page objects per screen
5. Create custom fixtures (auth, data factory, API helpers)
6. Create spec files mapped to TCs (only automation candidates)
7. Create security test structure
8. Create accessibility test structure
9. Configure CI/CD pipeline
10. Map TCs to specs (TC ID as comment above each test)

## Rules
- Selector priority: getByRole > getByLabel > getByPlaceholder > getByText > getByTestId > CSS
- NEVER use page.waitForTimeout() — use auto-waiting or explicit event waits
- Each test must be independent — no shared mutable state
- Tag tests: @smoke, @regression, @security, @a11y
