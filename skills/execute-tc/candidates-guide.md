# Candidate Files — the Index and the Reproduction Guide

Every candidate lives in **two files that are always edited together**, in the locations the project files define (default:
`candidates.md` and `candidates-detailed.md` next to the results file):

| File | Reader | Purpose |
|---|---|---|
| **Candidates index** | the user ruling, the team triaging | one table row per candidate and its state at a glance |
| **Reproduction guide** | the person who reproduces, records evidence and later files the bug | one self-contained section per candidate, run top to bottom without opening another file |

A change to one (new candidate, ruling, corrected value, evidence, layer) is made in the other **in the same pass**.
**Why:** the guide is what a person follows to record evidence and file the bug; if it lags the index, the filed bug
carries stale steps or a dropped item gets filed.

## 1. The index

```markdown
# Candidates (deviations) — for the user's ruling

States: Open · Confirmed · Dropped · Parked. Layer = where the fix most likely belongs (see §5); "—" for dropped items.

| ID | Summary | Clause | Affected cases | State | Layer |
|---|---|---|---|---|---|
| CAND-01 | <symptom in plain words> | <work item / AC / design frame, or "spec-silent; <assumption id>"> | <case ids> | Open | |
| CAND-02 | … | … | … | **Confirmed** (<who>, <date>) — evidence [CAND-02.mp4](<evidence folder>/CAND-02.mp4) | Frontend |
| CAND-03 | … | … | … | **Dropped** (<who>, <date>: <reason in their words>) | — |
```

Below the table, an optional short note per candidate (steps, expected, actual in three bullets) for quick reading.

## 2. The reproduction guide

### 2.1 Top of the file — "Before you start"

- **Accounts:** a small table — role, sign-in (user name only; never passwords), what it is used for. Name the **default
  account** (the primary everyday account of the product, e.g. the account owner) that every candidate uses unless its
  Account line says otherwise.
- **Shared setup:** environment URL, data every candidate assumes (a settings value, a record, a search), and how to reset it.
- **Tools a step needs:** anything beyond the app (developer tools request blocking, a second tab, a screen reader, a time-zone
  change) — what it is, how to start and stop it, in plain words. Mark the steps that need a person.
- **How to read a section:** "Steps are one action each; Expected and Actual refer to step numbers; Clean-up returns the
  environment to the shared setup."

### 2.2 One section per candidate, in this order

```markdown
## CAND-NN — <the symptom in plain words, as a user would describe it>

> **Confirmed bug** — <who>, <date>. Evidence: [`<evidence folder>/CAND-NN.<ext>`](<relative path>).
> **Layer:** `Frontend` | `Backend` | `Frontend` + `Backend` (<one-line reason>) [(likely)]
<or, when dropped:>
> **Ruling: DROPPED** — <who>, <date>: <reason in their words>. Do not file. <effect on cases, e.g. "<case id> is now Pass">

**Summary:** <one or two sentences: what the user sees and why it is wrong>
**Source:** <clauses / question ids> · **Cases:** <case ids> · **Severity:** <level> (<why, in a few words>)

**Expected per:**
- <work item / AC with link>: *"<quoted text>"*
- <design frame file or name>: <what it shows for this state>
- <or> spec-silent — <assumption id and the assumption>

**Account:** <default account> <or the other role, and why it is needed>.

**Steps**
1. Sign in as **<account>** (`<user name>`).
2. Open **<menu item>** (<where it is>).
3. <one action with its literal value, e.g. Click **<option>**, type `<value>`, click **<button>**.>
4. Check: <a value that proves the setup is right>.
…

**Expected:** <per step number>.
**Actual (<date> <time>, seen as <account if different>):** <exact on-screen text quoted, per step number>.
**Why (for the developer):** <optional — request sent vs value stored, response codes; facts only, no fix>.
**Clean-up:** <exact steps back to the shared setup, or "none">.

---
```

### 2.3 Rules for the steps

1. **One action per step**, written as the user performs it: the control's visible label in bold, the value in `code`.
2. **Literal data inline** in the step that uses it — the record to pick, the value to type, the option to choose. Never a
   separate data or procedure table the reader must scroll to. **Why:** switching between a table and the steps is where a
   reproducer loses time and makes mistakes.
3. **Default account first.** Use another role only when the candidate depends on it (a permission, a role's own data), and
   say why on the Account line.
4. **Name the path and the exact record:** menu path, screen, and a unique key wherever names repeat. Label tabs or
   devices ("Tab 1:", "Tab 2:") in multi-tab steps.
5. **"Check:" steps** after setup, so the reproducer knows the state is right before the step that shows the deviation.
6. **Self-contained.** Never "Do CAND-xx steps 1–10" — copy the steps. **Why:** the referenced candidate may be dropped or
   rewritten later and silently break this one.
7. **Expected and Actual cite step numbers**; renumber them whenever steps are added or removed.
8. **Actual is what was seen, in the state actually used.** If the run used a different setup than the guide's default
   (another account, another settings value), give the observed value and the value to expect at the default.
9. Keep Summary and headings in plain user language; technical detail goes to "Why (for the developer)".

## 3. Recording rulings

| User's ruling | Index State | Guide line under the heading | Effect on cases |
|---|---|---|---|
| a bug | `**Confirmed** (<who>, <date>)` (+ evidence link when it arrives) | `> **Confirmed bug** — …` | stays Fail |
| not a bug / expected behaviour / very minor / pre-existing | `**Dropped** (<who>, <date>: <reason in their words>)` | `> **Ruling: DROPPED** — … Do not file. <effect>` | re-derive ([defects.md](defects.md) §4.1) |
| not yet | `**Parked** (<who>, <date>)` | `> **Parked** — …` | stays as is |

- Quote the user's reason; keep "not a bug" and "very minor" distinct — they mean different things to whoever reads the
  file later.
- A ruling that states a **general rule** (e.g. "a role that cannot do X must not see Y") is also written to the project's
  decisions log, and the open question it answers is marked answered.
- If the user disputes a candidate with a design frame, check which **state** the frame shows (e.g. collapsed vs expanded,
  empty vs filled) before replying; explain the difference once, then record their ruling.

## 4. Evidence for confirmed bugs

- One evidence folder for the project (or cycle), as the project files define; one file per confirmed candidate named
  `<CAND-id>.<ext>` (video or image; more than one file → `<CAND-id>-1.<ext>`, `<CAND-id>-2.<ext>`).
- When the user supplies the folder: check it is **1:1 with the confirmed set** (none missing, none extra), open every
  image to confirm it shows the deviation, and say plainly which files (e.g. videos) were matched by name only.
- Link each file from the index row and the guide section.
- If the batch bug-filing skill expects its own folder or naming (e.g. `Bug {m}.<ext>` beside the bug queue), copy each file
  there under that name when the bug is queued, and keep the `CAND-id → Bug m` mapping in the index row. Never rename the
  user's originals.

## 5. Layer tag (Frontend / Backend / both)

For each confirmed bug, record where the fix most likely belongs, so it can be routed:

| Evidence | Layer |
|---|---|
| the API returns the right value; the page shows, computes, enables or formats it wrongly | Frontend |
| the API returns the wrong value, accepts what it must refuse, ignores a parameter, or stores the wrong data | Backend |
| the page loses the value before sending **and** the server stores or returns it wrongly; or a permission is denied by the API **and** hidden by the page | Frontend + Backend (one-line reason) |
| the client sends one vocabulary and the server stores another (e.g. a filter sends a display label, the data holds a stored value) | the side that owns the mapping (usually the one that turns stored values into labels), marked "(likely)", naming the alternative |

- Judge from the page next to the request and response; for a permission bug, call the API with the **affected role's own
  session**.
- Mark "(likely)" whenever the layer is inferred without reading the code. Never add a root cause or fix to the bug itself.
- Carry the layer into the bug queue in the queue's own convention (e.g. a `(back end)` suffix on backend bugs; a bug
  tagged both gets the suffix and the frontend part named in its text, or two entries if the project files split them).

## 6. Safe bulk edits

- Anchor every state, ruling, evidence or layer edit on the **candidate ID at the start of its row or heading**, never on a
  value several rows can share (a case id, a phrase, a status). Assert exactly one match per id.
- After the edit, print every ID with its State (and Layer) and compare the list with the rulings.
**Why:** two candidates often point at the same case; an edit matched on the case id changes the wrong candidate silently.
