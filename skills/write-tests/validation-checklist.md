# Self-Validation Checklist

Before outputting test cases, verify ALL of these:

- [ ] Every expected result matches QC decisions
- [ ] Validation timing correct (WHERE does validation fire?)
- [ ] Linked-state blocking consistently applied
- [ ] No TC tests for unconfirmed UI elements (Lesson 10.4)
- [ ] Every TC links to ≥ 1 issue tracker story
- [ ] Requirement clause inventory (`traceability-matrix.md`) written BEFORE the cases (SKILL.md Step 2a): every clause → behaviour → case, no "not covered" rows, every out-of-scope or deferred row has a reason
- [ ] Coverage Gate passes: no unmapped clause, no dangling case ID, no orphan case; every agent returned an empty (or justified) "not covered" list
- [ ] Behaviour inventory written BEFORE the cases (SKILL.md Step 2b); every case carries exactly one B-ID and every B-ID has exactly one case
- [ ] No duplicates — no two cases with the same expected result or verifying the same thing (state/screen/endpoint/persona variants are steps inside one case, not separate cases); the Duplicate Gate passes
- [ ] Anything kept separate despite looking similar is on the allow-list with a reason (UI vs API enforcement, opposite outcomes, Verify vs Save timing, different designs)
- [ ] Localization coverage for every screen (if the product is multilingual — per project quality principle)
- [ ] Negative paths ≥ 30%
- [ ] Security TCs for every action with auth implications
- [ ] Accessibility TCs for every interactive screen (unless the project has removed the category — then the generator must reject it)
- [ ] Boundary values tested for every numeric/text field with limits
