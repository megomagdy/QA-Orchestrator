# Issue-tracker retest comments

Post only after the user's go-ahead. Follow the project's tracker rules first — some projects close with **no comment**
(then skip the "Fixed" comment and just transition). State the problem only: no root cause, no suggested fix.
Build the comment in a file, in the tracker's rich format so the @mention notifies the developer (e.g. Jira ADF, Azure DevOps HTML, GitHub Markdown); never inline a long text in a shell
string (apostrophes and backticks break it). Read the issue back after posting.

## Fixed → close ("Done" / "Testing is Done")

**Retest on {env}, {D Mon YYYY}: fixed.**

**Steps**
1. {step as run, with the data used}
2. {…}

**Result:** {what now happens, with the figures / message / state that prove it}.

**Also checked around the fix:** {neighbour 1}, {neighbour 2}, {neighbour 3} — all as expected.

## Not fixed / partly fixed → return (Reopen / To Do), reassigned to the developer who moved it to In Testing

@{developer} **Retest on {env}, {D Mon YYYY}: still reproduces.** {one line: which path fails}

**Steps**
1. {step}
2. {…}

**Expected:** {expected}.

**Actual:** {actual — with the figures / message / request that show it}.

**Passes on this build:** {what the fix did fix, so the developer does not redo it}.

{Evidence: screenshot / recording attached.}
