# Optional: route Claude Code through OmniRoute

[OmniRoute](https://github.com/cheaper-inference/OmniRoute) is a local AI gateway. Pointing Claude Code at it lets you use other providers' models (or fall back across several) instead of calling Anthropic directly. It is **opt-in per machine** — nothing in this repo turns it on, and no keys are committed.

## Setup

```bash
npm install -g omniroute
omniroute            # dashboard at http://localhost:20128
```

In the dashboard: connect at least one provider, then copy an OmniRoute API key from **Endpoints**.

Then, in this repo:

```bash
cp .claude/settings.local.json.example .claude/settings.local.json
# edit it and paste your OmniRoute key
```

`.claude/settings.local.json` is gitignored. Restart Claude Code in the repo. To switch back to Anthropic directly, delete that file.

## Before you enable it

- Every prompt, and every file Claude Code reads, is sent to whichever provider OmniRoute picks. Keep this repo's credentials (`scripts/.env`, `workspace.config.json`) and any client data away from aggregators you don't trust.
- Avoid providers OmniRoute labels **Web cookie** (they reuse a website login and can get that account banned) and anything it marks `tos: avoid`. Prefer official API-key providers or local models.
- OmniRoute must be running, or Claude Code requests will fail.
