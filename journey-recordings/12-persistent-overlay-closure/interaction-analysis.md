# Intent action and persistent overlay closure

This live World sequence covers the final business-intent path: board at rest → `Start here` → blocked task focus → `Clarify` → `Review record` overlay → explicit close → the same focused task in the World.

## Findings

- The fixture task had no canonical href. Before the fix, `Clarify` silently opened only more inspector detail. The action now crosses the record boundary even without a fixture href and lands on the honest `Review record` fallback.
- The overlay keeps the same World, camera, slice and selected record underneath. Its copy makes the canonical-action boundary explicit instead of presenting a fake editor or a fake submission form.
- Closing the overlay preserves `slice=region:project` and `focus=task:beta-feedback`; the user returns to the focused paper rather than losing orientation.
- The focused panel now separates `Inspect record context` from `Clarify`, so provenance/decision basis and consequential intent are distinct choices.
- The overlay heading receives focus on open, and the implementation owns Escape plus Tab containment. The in-app browser keyboard bridge still routes simulated Escape/Tab inconsistently in this environment, so explicit close and code-level focus ownership are the stronger evidence in this recording.

The MP4 is assembled from live browser viewport states. The raw OS-level direct capture remains in the earlier corkboard interaction recording.
