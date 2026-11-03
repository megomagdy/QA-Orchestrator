# 5-Step Popup Recovery (any browser-automation tool)

When a popup, modal or framework dialog (Angular Material, MUI, Bootstrap, native `<dialog>`, …) blocks execution:

## Step 1: Try clicking the backdrop/overlay
```
Click the backdrop / overlay behind the dialog (e.g. `.cdk-overlay-backdrop`, `.MuiBackdrop-root`, `.modal-backdrop`, `::backdrop`)
```

## Step 2: Try pressing Escape
```
Press Escape key to dismiss the dialog
```

## Step 3: Try clicking a close/cancel button
```
Look for: X button, Cancel button, Close button, an icon button labelled "close" (`aria-label`)
```

## Step 4: Try navigating away
```
Navigate to a different URL, then back to the target page
```

## Step 5: Force refresh
```
Full page refresh (F5 / Ctrl+R), then re-navigate to the target screen
```

## When to Use
- Framework dialogs that appear unexpectedly
- Cookie consent banners
- Session timeout warnings
- Tour/onboarding overlays
- Error dialogs from previous test failures

## Important
- Try steps in order (1 → 2 → 3 → 4 → 5)
- Wait 500ms between attempts
- If all 5 fail, mark the TC as BLOCKED with evidence
- Log which recovery step worked for future reference
