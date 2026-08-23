# Entry-screen interaction audit

Live browser evidence:

- Desktop Login: cork texture, pinned paper card, restrained brown/green palette and clear sign-in hierarchy.
- Mobile Login → Create account → Sign in: the entry mode changes in place without leaving the auth surface or losing the `next=/clink/world-engine` destination.
- Recipient invalid-link state: the same paper/cork surface explains the recovery path without mounting a board or pretending a share exists.

Route/source check: `/clink/onboarding` remains protected behind the authenticated workspace guard; unauthenticated users are returned to Login rather than seeing an operational onboarding shell without a session. The onboarding card uses the shared paper/pin/cork tokens in `styles.css`.
