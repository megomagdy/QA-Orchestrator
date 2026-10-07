# Self-Validation Checklist

Before outputting test cases, verify ALL of these:

- [ ] Every expected result matches QC decisions
- [ ] Validation timing correct (WHERE does validation fire?)
- [ ] Linked-state blocking consistently applied
- [ ] No TC tests for unconfirmed UI elements (Lesson 10.4)
- [ ] Every TC links to ≥ 1 issue tracker story
- [ ] Requirement clause inventory (`traceability-matrix.md`) written BEFORE the cases (SKILL.md Step 2a): every clause → behaviour → case, no "not covered" rows, every out-of-scope or deferred row has a reason
- [ ] Coverage Gate passes: no unmapped clause, no dangling case ID, no orphan case; every agent returned an empty (or justified) "not covered" list; superseded clauses name the replacing decision
- [ ] When the feature replaces existing behaviour: every branch of the current code is a clause (covered or superseded)
- [ ] Behaviour inventory written BEFORE the cases (SKILL.md Step 2b); every case carries exactly one B-ID and every B-ID has exactly one case
- [ ] No duplicates — no two cases with the same expected result or verifying the same thing (state/screen/endpoint/persona variants are steps inside one case, not separate cases); the Duplicate Gate passes
- [ ] A reading pass was done per behaviour group — the similarity gate alone is a tripwire, not the review
- [ ] Every final expected result names its distinguishing outcome; no two opposite-outcome cases end in the same sentence
- [ ] Cross-story cases list every story key in Story Linkages plus an `also-<KEY>` label
- [ ] Anything kept separate despite looking similar is on the allow-list with a reason (UI vs API enforcement, opposite outcomes, Verify vs Save timing, different designs)
- [ ] Localization coverage for every screen (if the product is multilingual — per project quality principle)
- [ ] Negative paths ≥ 30%
- [ ] Security TCs for every action with auth implications
- [ ] Accessibility TCs for every interactive screen (unless the project has removed the category — then the generator must reject it)
- [ ] Boundary values tested for every numeric/text field with limits
