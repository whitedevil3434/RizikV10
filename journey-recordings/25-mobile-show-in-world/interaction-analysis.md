# Mobile queue “Show in world” audit

Viewport: 390×844, live browser device metrics. Dataset: `demo=goods_handoff`.

`Evidence Inbox → Condition record → Show in world` closes the mobile queue sheet, returns to the execution slice with `focus=evidence:1`, and shows the same “Capture the required evidence…” safe action on the focused record. No stale queue sheet remains mounted visibly.
