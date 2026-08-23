# Intent-first recovery flow

This pass records a live C-Link World sequence after the focus-panel language was tightened around business intent. The timeline covers:

1. World at rest with the attention board and Copilot teaser.
2. Copilot suggestions opened as an advisory surface.
3. AI lens activated and returned through the visible `Active World lens` status.
4. A deliberately unmatched search query, with explicit empty-state feedback.
5. `Start here` opening the blocked `Beta user feedback` record.
6. The focus panel showing `Inspect record context`, then the intent-first `Clarify` action.
7. Detail context opened to expose decision basis, current state, authority, and connections.
8. Escape stepping back from detail to focus, then back to the project slice.

## What the interaction teaches

- The board remains the primary visual field. Attention, Copilot, search, and detail are temporary overlays around the record rather than parallel workspaces.
- `Clarify` is materially clearer than the previous generic `Open record` label for a blocked task. The user can understand the next safe action before opening a legacy form.
- The focus panel has a useful two-step rhythm: inspect the record context first, then take the business action. This keeps provenance and the action distinct.
- The detail panel earns its space when it exposes decision basis, authority, evidence, and connections. It reads as operational inspection, not freeform editing.
- Empty search feedback is immediate and bounded: “No visible object matches…” appears without changing the board or inventing a result.
- Escape is deliberately incremental. One press leaves detail and restores the focus panel; a second press restores the slice. This preserves orientation instead of dropping the user back to an unrelated route.
- AI lens status remains visible after the Copilot panel closes, so the user can tell why records are emphasized and can return to the neutral World view.

## Mobile read

At 390×844 the selected paper stays visible above the bottom detail sheet, while the sheet carries the same `Clarify` action and compact state grid. The mobile journey rail makes the current level explicit (`World → Slice → Focus → Detail`), and the secondary rail reveals Search, Relations, Contexts, Profile, and Settings only after `More`. The attention sheet is intentionally scrollable before a record is selected; once focus opens it disappears, leaving the corkboard and selected paper readable.

## Remaining observation

The browser automation bridge does not reliably advance native focus with a simulated Tab key. Escape, click/tap actions, live routing, and focus-panel recovery are verified in this pass; native keyboard traversal still needs an OS-level keyboard verification.

The MP4 is a live-tab viewport timeline assembled from the recorded browser states. The accepted raw OS-level capture remains in `journey-recordings/02-corkboard-first-interaction-audit/live-capture/corkboard-clean-inspector.mov`.
