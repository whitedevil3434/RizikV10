# Entry-screen continuity flow

This live-tab timeline covers Login, the create-account toggle, onboarding, a ready-to-continue onboarding form, and the 390×844 mobile variants.

## Findings

- The entry screens share the same restrained cork/paper language as the World without pretending to be a board: one pinned paper, one clear task, and no spatial canvas controls.
- Login has a clean hierarchy: identity, provider/email choice, credentials, then the disabled submit boundary. The test-only Cloudflare challenge is visually noisy in this environment, but it is infrastructure feedback rather than product navigation.
- The create-account toggle keeps the user on the same paper and swaps only the intent copy/button. That feels like one entry surface, not a second editor route.
- Onboarding starts with the user's desired change rather than workspace setup. After text is entered, the primary button becomes visually active and the next step is obvious.
- At 390×844 the card remains readable, the textarea retains enough writing height, and the primary action stays visible without a horizontal overflow or board-like distraction.
- The phrase `Continue with this need` is consistent with the current product vocabulary, though `Describe this Need` or `Continue to review` would be more explicit if the next step is an interpretation review rather than a record submission.

The MP4 is a live-tab viewport timeline, not a raw OS-level capture. The raw direct capture remains in the earlier corkboard interaction recording.
