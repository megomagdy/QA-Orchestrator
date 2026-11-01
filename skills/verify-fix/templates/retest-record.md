# Retest of {STORY} bugs in "In Testing" — {D Mon YYYY}

Environment: {env / tenant / company}, {build: FE bundle Last-Modified, BE branch / version}, signed in as {user / role}.
Scope: In Testing bugs reported by {user} {or: the tickets / filter the user named}.
{N} bugs were In Testing (moved there {when}, by {developer}). **{N} of {N} retested; {x} fixed, {y} not fixed, {z} waiting.**
Skipped (fix not delivered): {KEY — status}, … · Not yours, not verified: {KEY — reporter}, …

| Bug | Fix | Verdict | Regression | Tracker action |
|---|---|---|---|---|
| {KEY} — {short title} | `{sha}` ({branch}) | Fixed / Partly fixed / Not fixed | {n} of {m} probes ran, {findings} | Waiting / Closed / Returned |

---

## {KEY} — {bug title}

### Bug verdict: {Fixed / Partly fixed / Not fixed}

- **Fix:** `{sha}` — {one line on what the diff changes}. On {branches}; deployed {how confirmed}.
- **Data:** {records used, created fresh or existing; why they match the preconditions}.
- **Steps used:** {numbered, as run}.
- **Result:** {what happened}. **Old build would:** {why this check tells the builds apart}.
- **Evidence:** API `{METHOD path}` → {status} `{body excerpt}`; DB {table.column before → after}; screenshot `{path}`.

### Charter

| Fix | Could also affect | Probes |
|---|---|---|
| {what changed} | {neighbours: other states, mirror action, shared component, other surfaces, roles, data side effects} | {concrete probes, with data} |

### Regression probes — {n} of {m} ran

| # | Probe | Data | Result | Evidence |
|---|---|---|---|---|
| R1 | {probe} | {fixture} | OK / Finding F1 / Observation | {API / DB / screenshot} |

### Tracker action

{Waiting for the user's go-ahead / Closed (transition, comment id or "no comment") / Returned to {developer}: comment {id},
assigned, moved to {state} / Waiting for the user's ruling on F1}.

---

## Run summary

- **Verified:** {N of M} In Testing bugs — closed {list}, returned {list}, waiting {list}.
- **Findings** (not filed — the user decides):
  - F1 — {one line}. Repro: {steps}. Pre-existing? {compared with live branch / live app, or "could not compare"}.
    **Ruling:** {e.g. Not a bug — same behaviour on the live app ({name}, {date})}.
- **Observations:** {spec-silent / UX / out-of-scope items}.
- **Predictions (not run):** {case} — {what the code says will happen} — {why it could not run}.
- **Not covered:** {probe} — {reason: no data in that state / second account / tenant-wide job / not reachable from the UI}.

## Data left

| Record | Change | Restored? | Rollback / backup |
|---|---|---|---|
| {user / company / id} | {created / changed} | Yes / No — {why} | `{path}` |
