# Self-Validation Checklist

Before outputting test cases, verify ALL of these:

- [ ] Every expected result matches QC decisions
- [ ] Validation timing correct (WHERE does validation fire?)
- [ ] Linked-state blocking consistently applied
- [ ] No TC tests for unconfirmed UI elements (Lesson 10.4)
- [ ] Every TC links to ≥ 1 issue tracker story
- [ ] No duplicates
- [ ] Localization coverage for every screen (if the product is multilingual — per project quality principle)
- [ ] Negative paths ≥ 30%
- [ ] Security TCs for every action with auth implications
- [ ] Accessibility TCs for every interactive screen
- [ ] Boundary values tested for every numeric/text field with limits
