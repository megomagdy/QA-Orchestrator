# Skills Usage — Workflow Mapping

> **MANDATORY: This section maps which skills MUST be consulted for each workflow phase. Claude MUST read and apply the relevant skill files before executing any command. Skipping a mapped skill produces incomplete or incorrect output.**

## Skills Inventory

| # | Skill | Location | Primary Use |
|---|-------|----------|-------------|
| 1 | unified-qa | `.claude/skills/unified-qa/SKILL.md` | Master QA methodology — investigation, test design, test-management import format, QC compliance |
| 2 | test-plan-generation | `.claude/skills/test-plan-generation/SKILL.md` | Risk analysis, coverage matrices, estimation, traceability |
| 3 | playwright-e2e-testing | `.claude/skills/playwright-e2e-testing/SKILL.md` | POM pattern, selectors, fixtures, assertions, config |
| 4 | playwright-enhanced | `.claude/skills/playwright-enhanced/SKILL.md` | Multi-env config, advanced fixtures, trace debugging, visual testing |
| 5 | playwright-api-testing | `.claude/skills/playwright-api-testing/SKILL.md` | APIRequestContext for REST/GraphQL testing |
| 6 | form-validation-breaker | `.claude/skills/form-validation-breaker/SKILL.md` | Boundary values, injection payloads, encoding edge cases, client-bypass |
| 7 | auth-bypass-tester | `.claude/skills/auth-bypass-tester/SKILL.md` | RBAC, IDOR, JWT manipulation, session management, privilege escalation |
| 8 | owasp-security-testing | `.claude/skills/owasp-security-testing/SKILL.md` | OWASP Top 10, injection, security headers, CORS, ZAP |
| 9 | axe-core-accessibility | `.claude/skills/axe-core-accessibility/SKILL.md` | WCAG 2.1 AA, keyboard nav, screen reader, focus management |
| 10 | bug-report-writing | `.claude/skills/bug-report-writing/SKILL.md` | Bug templates, severity matrix, evidence collection, API/mobile bugs |
| 11 | api-testing-rest | `.claude/skills/api-testing-rest/SKILL.md` | REST patterns, HTTP methods, status codes, schema validation |
| 12 | postman-api-testing | `.claude/skills/postman-api-testing/SKILL.md` | Collections, environments, Newman CI, data-driven testing |
| 13 | appium-mobile-testing | `.claude/skills/appium-mobile-testing/SKILL.md` | iOS/Android automation, Appium patterns |
| 14 | ci-cd-pipeline-config | `.claude/skills/ci-cd-pipeline-config/SKILL.md` | GitHub Actions, Azure DevOps, Jenkins CI integration |
| 15 | advanced-allure-reporting | `.claude/skills/advanced-allure-reporting/SKILL.md` | Allure reports, trends, flaky detection, CI dashboards |
| 16 | maestro-mobile-testing | `.claude/skills/maestro-mobile-testing/SKILL.md` | YAML-based mobile UI testing flows |

## Workflow → Skills Mapping

### Phase 1: Review & Gap Analysis (`/review`, `/gap-report-doc`, `/gap-report-push`)

| Skill | Why It's Needed |
|-------|----------------|
| **unified-qa** (MANDATORY) | Investigation process, SFDP framework, screen type classification, QC decision compliance |
| **test-plan-generation** (MANDATORY) | Requirements analysis structure, risk identification |
| **form-validation-breaker** | Identify missing validation specs (boundary values, encoding, client vs server) |
| **auth-bypass-tester** | Identify missing RBAC/permission definitions in specs |
| **owasp-security-testing** | Flag security gaps in design (injection vectors, access control) |
| **axe-core-accessibility** | Flag missing accessibility requirements |

### Phase 2: Test Case Design (`/write-tests`, `/cross-validate`)

| Skill | Why It's Needed |
|-------|----------------|
| **unified-qa** (MANDATORY) | SFDP framework, TC format, test-import conventions, QC decision alignment |
| **test-plan-generation** (MANDATORY) | Equivalence partitioning, boundary value analysis, decision tables, coverage matrix |
| **form-validation-breaker** (MANDATORY) | Boundary payloads, encoding edge cases, multi-step form attack vectors |
| **auth-bypass-tester** (MANDATORY) | RBAC enforcement TCs, IDOR scenarios, session TCs |
| **owasp-security-testing** | Injection TCs, security header TCs, rate limiting TCs |
| **axe-core-accessibility** | WCAG compliance TCs, keyboard nav TCs, focus management TCs |
| **api-testing-rest** | API contract TCs, status code validation, schema TCs |
| **postman-api-testing** | Data-driven test patterns, API workflow chains |

### Phase 3: Automation (`/scaffold-automation`, `/run-automation`)

| Skill | Why It's Needed |
|-------|----------------|
| **playwright-e2e-testing** (MANDATORY) | POM architecture, selector priority, assertion patterns, fixture design |
| **playwright-enhanced** (MANDATORY) | Multi-env config, advanced fixtures, trace debugging, visual testing |
| **playwright-api-testing** (MANDATORY) | APIRequestContext for REST test specs |
| **form-validation-breaker** | Payload generator utility, boundary calculator |
| **auth-bypass-tester** | Security test spec structure, token factory, role matrix |
| **axe-core-accessibility** | axe-helper utility, a11y spec structure |
| **ci-cd-pipeline-config** (MANDATORY) | CI workflow files, artifact management, parallel execution |
| **advanced-allure-reporting** | Report configuration, trend tracking |
| **appium-mobile-testing** | iOS/Android-specific test patterns |

### Phase 4: Execution (`/execute-tc`)

| Skill | Why It's Needed |
|-------|----------------|
| **unified-qa** (MANDATORY) | TC format, expected result compliance with QC decisions |
| **form-validation-breaker** | Input validation testing technique, encoding-aware input |
| **playwright-e2e-testing** | Selector strategies applied to MCP interactions |
| **appium-mobile-testing** | iOS-specific interaction patterns |

### Phase 5: Reporting (`/bug-report`, `/report-bugs`)

> **Manual Execution folder convention:** manual-testing bugs are typed as one-liners into `Manual Execution/Bug Summaries.txt` (under `Epic N:` sections) with evidence saved as `Manual Execution/Epic N/Bug {m}.png` / `.mp4`. `/report-bugs` batch-creates the tracker issues and attaches the evidence.

| Skill | Why It's Needed |
|-------|----------------|
| **bug-report-writing** (MANDATORY) | Template, title formula, severity matrix, evidence patterns, API/mobile formats |
| **unified-qa** | Defect report template |

### Session Management (`/checkpoint`, `/session-resume`, `/save-url`, `/learn`)

| Skill | Why It's Needed |
|-------|----------------|
| **unified-qa** | Playbook Section 11 — Continuous Learning & Documentation Rule |

## IMPORTANT: How to Apply Skills

When executing ANY command:

1. **Read the "SKILLS TO APPLY" section** at the top of the command
2. **For each skill marked MANDATORY:** Read the full SKILL.md file before starting work
3. **For each skill NOT marked mandatory:** Consult the relevant sections as needed during execution
4. **If a skill provides a specific pattern or template:** Use it as-is, don't reinvent
5. **If two skills conflict:** The `unified-qa` skill takes precedence (it's the master methodology)
6. **After completing work:** Check if any skill's anti-patterns list was violated

## Auto-Trigger Rules

Claude should also apply skills proactively (without explicit command) when it detects:

| Context Detected | Auto-Apply Skill |
|-----------------|-----------------|
| User mentions "test cases" or "write tests" | unified-qa + test-plan-generation |
| User mentions "Playwright" or "automation" | playwright-e2e-testing + playwright-enhanced |
| User mentions "API test" or "endpoint" | api-testing-rest + playwright-api-testing |
| User mentions "bug" or "defect" or "issue" | bug-report-writing |
| User mentions "security" or "injection" or "auth" | owasp-security-testing + auth-bypass-tester |
| User mentions "accessibility" or "WCAG" or "a11y" | axe-core-accessibility |
| User mentions "form" or "validation" or "input" | form-validation-breaker |
| User mentions "mobile" or "iOS" or "Android" | appium-mobile-testing |
| User mentions "CI" or "pipeline" or "GitHub Actions" | ci-cd-pipeline-config |
| User mentions "report" or "Allure" | advanced-allure-reporting |
| User mentions "Postman" or "Newman" or "collection" | postman-api-testing |
