# Link vs Copy — the rule for everything in this folder

This global folder is the **single source of truth**. When wiring it into a machine or a project, every file falls into exactly one of two categories. Getting this wrong is the most common way this system breaks.

## The test

> **Does the consumer WRITE to it?**
>
> - **No — it only consumes it** → **LINK** it. Shared logic that must be identical everywhere and improve globally.
> - **Yes — it authors or diverges on it** → **COPY** it. Local content that is *supposed* to differ per project/machine.

Shorthand: **link what you consume, copy what you author.**

## LINK — shared, consumed, must never drift

| What | Where it lands |
|---|---|
| `skills/` | `~/.claude/skills` (user) and/or `<project>/.claude/skills` |
| `agents/` | `~/.claude/agents` and/or `<project>/.claude/agents` |
| `scripts/` + `scripts/adapters/` | invoked via `$QA_GLOBAL_HOME` — never duplicated into projects |

**Why linking matters:** a copy is a snapshot that silently runs an old version. Real incident — project folders held April copies while the global folder had August versions, so an enhanced `/review` never ran and nobody noticed until its new phase failed to appear. There is no error, no warning, and the symptom looks like a broken skill rather than a stale file.

Mechanism: `New-Item -ItemType Junction` (Windows, no admin needed) or `ln -s` (macOS/Linux).

## COPY — local, authored, meant to diverge

| What | Why it must be a copy |
|---|---|
| `CLAUDE.md` (from `templates/QA_Test_Design_Playbook_-_Template.md`) | project-specific content and placeholders; holds the project's Lessons Learned log |
| `qa-rules-condensed.md` | `/learn` **writes** project learnings here; `/sync-global` promotes reviewed ones to global. Linking bypasses that review gate and leaks unvalidated project rules into every other project |
| Test-management import template (e.g. `qmetry-template.xlsx`) | the starting point for the project's own test-case file |
| `Manual Execution/` + `Bug Summaries.txt` | the project's own bug log and evidence |
| `bug-reporter.config.json` | per-project keys, assignees, parent stories, sprint |
| `project-references.md` | per-project URLs |
| `.env` | credentials — **never** link or share, never commit |

## Migrating an existing directory to a link

Never clobber. In order:

1. **Diff** the local directory against the global one (`diff -rq`).
2. **Promote anything local-only INTO the global folder first.** Never discard a local-only skill or agent. (This has real teeth: one workspace held 6 skills that existed nowhere else — a blind junction would have destroyed them.)
3. For files that differ, check **which side is newer** and keep the better version in the global folder.
4. **Rename the local directory aside** (`skills-backup-<date>`), then create the link. Keep the backup until the user confirms everything works.
5. **Verify** the link resolves and a known file is readable through it.

## Fallback

If directory links are unavailable (restricted policy, some network/virtual filesystems), copy — but **say so explicitly** and warn that those copies will drift and must be refreshed after every global change.

## Consequence of linking

Editing a linked file *through any project path* edits the **global** file — that is the intent. It also means there is no per-project override. If a project genuinely needs one, replace that project's link with a real directory and accept that it will diverge.
