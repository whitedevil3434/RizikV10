# C-Link whole-user journey recordings

This folder contains screen recordings and the accompanying user-perspective log for the end-to-end C-Link journey.

## Recording 01 — offline reconnect and device draft

- File: `01-offline-reconnect-and-device-draft.mov`
- Flow: authenticated session → `/clink/world` → live workspace unavailable guard → retry reconnect → Bangla natural-language Need draft → local device save
- Result: reconnect did not restore the live workspace. The draft was saved locally and explicitly remained unshared.
- UX finding: the outage-safe route is understandable and prevents accidental creation of a party, authority, commitment, or share link. The full Need → Commitment → Outcome journey cannot be truthfully continued until the permissioned workspace/API is available.

### Runtime evidence

- `GET /api/clink/v1/health` → `200`, API service healthy
- `GET /api/clink/v1/health/ready` → `503`, database unavailable
- Authenticated data flow therefore remains blocked at the workspace readiness boundary; the reconnect control was tried again and returned to the same offline draft surface.

## Recording rule

Every meaningful UI interaction should receive its own screen recording, with the interaction, resulting state, user intention, friction, and any recovery path logged beside it.
