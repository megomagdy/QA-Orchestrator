# 5-Step Popup Recovery for Chrome MCP

When a popup, modal, or Angular Material dialog blocks execution:

## Step 1: Try clicking the backdrop/overlay
```
Click the element behind the dialog (mat-dialog-container backdrop, cdk-overlay-backdrop)
```

## Step 2: Try pressing Escape
```
Press Escape key to dismiss the dialog
```

## Step 3: Try clicking a close/cancel button
```
Look for: X button, Cancel button, Close button, mat-icon[close]
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
- Angular Material dialogs that appear unexpectedly
- Cookie consent banners
- Session timeout warnings
- Tour/onboarding overlays
- Error dialogs from previous test failures

## Important
- Try steps in order (1 → 2 → 3 → 4 → 5)
- Wait 500ms between attempts
- If all 5 fail, mark the TC as BLOCKED with evidence
- Log which recovery step worked for future reference
