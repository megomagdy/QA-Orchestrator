# UI Recovery and Automation Mechanics (any UI-automation tool)

Applies to web, mobile and desktop UIs. Web-specific details are marked "e.g.".

## 1. Five-step recovery when an overlay blocks a step

When a dialog, sheet, banner, onboarding tour or system prompt blocks the next step, try in order, re-capturing the
screen between attempts:

1. **Tap or click outside it** — the backdrop or scrim behind it (e.g. on the web: the overlay element behind a modal).
2. **Send the platform's dismiss key or gesture** — e.g. Escape on the web or desktop, Back on a mobile device.
3. **Use its own close control** — a close icon, Cancel or Close button, or a control whose accessible name is "close".
4. **Leave the screen and come back** — navigate to another screen, then return to the target one.
5. **Reload or restart** — e.g. a full page refresh on the web, or relaunch the app — then navigate back to the target screen.

If all five fail, the case is **Not complete** (not Blocked — Blocked needs a named failed case), with the screen captures
as evidence. Note which step worked, so the next run can start there.

Typical causes: dialogs left open by an earlier step or case, consent prompts, session-timeout warnings, onboarding
overlays, error dialogs from a previous failure.

## 2. Mechanics that make a step act on the wrong thing

- **Floating widgets covering controls** (chat bubbles, help buttons, toasts): close or move them, or act on the control by
  its element reference rather than by position.
- **Banners shift the layout.** A success or error banner pushes content down, so a captured coordinate now points at a
  different row. Re-capture the screen before any action by coordinate.
- **Icon-only controls:** confirm visually (capture and look) what the icon is before acting. With no text label, element
  search guesses from position and can pick a neighbouring icon.
- **Bulk actions:** before confirming, check the selection count the action will apply to. "Select all" may select beyond
  the filtered list.
- **Brief messages:** install a UI-change observer (e.g. on the web, a mutation observer that logs added text) before an
  action whose confirmation or error may disappear before the next capture.
- **One-character-per-box inputs** (e.g. one-time codes): type box by box, then read every box back before submitting.

## 3. Evidence the screen cannot give

- **Capture network responses before each action** (e.g. hook the page's request functions, or read the tool's network
  log), so the API's answer can be compared with what the screen shows.
- For "nothing happens" expectations, take the before/after reading from the data store or log (SKILL.md §0.5).
- If the screen or response differs between scripted input (script-set values, programmatic clicks) and real input,
  trust the real input — see the scripted-input check in [defects.md](defects.md).
