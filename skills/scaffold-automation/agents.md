# Agent Orchestration for /scaffold-automation

## Step A: Discover (playwright-test-planner agent)
Spawn FIRST. Explores the live app via browser MCP tools:
- Navigates all screens in scope
- Discovers all interactive elements, forms, navigation paths
- Maps primary user journeys and critical paths
- Creates a comprehensive test plan with steps and expected outcomes
- Saves the plan as a markdown file

## Step B: Generate (playwright-test-generator agent)
Spawn AFTER planner completes. For each test scenario from the plan:
- Sets up the page via `generator_setup_page`
- Executes each step in real-time using Playwright MCP browser tools
- Captures the interaction log via `generator_read_log`
- Writes the actual test code via `generator_write_test`

## Step C: Structure (main context)
After generator produces test files:
- Organize into POM structure
- Extract page objects from the generated selectors
- Add fixtures, auth setup, and CI config
- Tag tests per the TC mapping

## Why This Matters
```
WITHOUT agents: Tests may not work because selectors are guessed from specs
WITH agents: Tests work immediately because they were built against live UI
```
