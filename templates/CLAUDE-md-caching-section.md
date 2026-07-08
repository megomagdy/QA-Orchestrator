# Token Usage Optimization & Caching Rules

> **MANDATORY: These rules reduce token consumption by 50-70%. Follow them strictly.**

## Rule 1: Use Condensed Rules, Not Full Skills

**NEVER load all individual SKILL.md files at the start of a command.**

Instead:
1. Load `qa-rules-condensed.md` from the project root (copied during `/init-project`)
2. Only load a full SKILL.md when you need specific code patterns, templates, or detailed examples
3. Example: For `/write-tests`, load condensed rules upfront. Only open `form-validation-breaker SKILL.md` when you're actually generating boundary payloads and need the code template.

**Location:** Project root — `./qa-rules-condensed.md`. Copied from global folder during `/init-project`. Updated by `/learn` during project work. Synced back to global folder by `/sync-global`.

**Token savings:** ~3,000-5,000 tokens per command.

## Rule 2: Use Cache Files Before Re-Analyzing

Before reading source documents (PRD, stories, design files), check for cache files:

```
cache-[feature]-investigation.md  → confirmed behaviors, fields, states, permissions
cache-[feature]-questions.md      → blocking questions and their status
cache-[feature]-tc-summary.md     → TC counts, coverage, automation candidates
cache-[feature]-dom-audit.md      → verified UI elements, ghost elements
```

IF cache exists AND is < 7 days old:
  → Read cache instead of re-analyzing source documents
  → Only read source documents for specific details not in cache

IF cache doesn't exist:
  → Read source documents normally
  → After analysis, offer to run /cache-build

**Token savings:** ~60-70% on subsequent commands for the same feature.

## Rule 3: Agent Spawn Thresholds

Do NOT spawn agents for small tasks:

| Scope | Agent Policy |
|-------|-------------|
| 1-3 stories | NEVER spawn agents. Do everything in main context. |
| 4-7 stories | Maximum 2 agents. Ask user first. |
| 8+ stories | Use full agent orchestration. Ask user first. |

**ALWAYS ask before spawning:** "This task covers [N] stories. Should I use agents for parallel processing, or handle it directly? (Agents use more of your usage quota)"

**Token savings:** 3-5x per avoided agent spawn.

## Rule 4: Model Selection Per Command

Use the most efficient model for each task:

| Command | Recommended Model | Reason |
|---------|------------------|--------|
| /review | Opus | Deep reasoning needed |
| /write-tests | Opus | Comprehensive coverage thinking |
| /cross-validate | Opus | Contradiction detection |
| /gap-report-doc | **Sonnet** | Document formatting, not reasoning |
| /gap-report-push | **Sonnet** | Data pushing, not reasoning |
| /scaffold-automation | **Sonnet** | Code generation from patterns |
| /run-automation | **Sonnet** | Execution and reporting |
| /execute-tc | **Sonnet** | Step execution |
| /bug-report | **Sonnet** | Template filling |
| /checkpoint | **Sonnet** | File writing |
| /session-resume | **Sonnet** | File reading |
| /save-url | **Sonnet** | Simple file append |
| /learn | **Sonnet** | File editing |
| /cache-build | **Sonnet** | Data extraction |

**Token savings:** Sonnet uses ~3-5x less quota than Opus per message.

## Rule 5: Minimize Output Verbosity

- Don't repeat the command instructions back in the output
- Don't explain what you're about to do — just do it
- Don't add preambles like "I'll now proceed to..."
- For tables: include data rows only, skip empty rows
- For reports: skip sections with zero findings

## Rule 6: Session Boundaries

- Use /checkpoint before stepping away (saves context to file)
- Start new sessions for new phases (don't continue a review session into test writing)
- Each session = one major command + its follow-up actions
- Ideal session pattern: /session-resume → one /command → /checkpoint

## Rule 7: Ask, Don't Guess

**When a command says "ask the user", STOP and ask. Do NOT:**
- Search the filesystem for files that look like the answer
- Look at parent directories to infer paths
- Assume values based on folder names or file contents
- Skip the question because you think you found the answer

**ALWAYS wait for the user's explicit answer before proceeding.** A wrong assumption wastes more time than a 5-second question.

## Rule 8: Never Break Markdown Tables

**NEVER insert a blank line inside a markdown table.** A blank line breaks the table — everything after it renders as raw text.

When adding rows to ANY table in CLAUDE.md, qa-rules-condensed.md, or any markdown file:
1. Find the last row (last line starting with `|`)
2. Add new row IMMEDIATELY after it — NO blank line
3. After editing, re-read the file and verify no blank lines between table rows
