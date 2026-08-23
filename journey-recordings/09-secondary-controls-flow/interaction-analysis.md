# Secondary controls audit

## Captured sequence

1. Board overview
2. Participant responsibility queues / Inbox
3. Copilot suggestions
4. Copilot → evidence record focus
5. `Simulate safely`
6. `Return to Now`

Video: `secondary-controls-flow.mp4`

## Findings

- Inbox opens as a responsibility sheet with queue types and explicit empty-state copy. It reads as operational work intake rather than a generic notification drawer.
- Copilot remains advisory: each suggestion has a record-oriented reason, and the panel states that human approval is required before consequential changes.
- The evidence suggestion lands in `Prototype evidence` focus and exposes `Review proof` plus evidence/provenance state. This is a good inspect-and-act transition.
- `Simulate safely` initially changed the URL but failed to surface its branch mode in the demo board because temporal props were not wired through `PixiWorld`. The route now forwards temporal mode, event, cursor and geography.
- Branch availability now treats a local simulation as available branch state rather than unavailable historical snapshot. The board shows `SIMULATION · NOT FACT`, explains that changes stay inside the simulation, disables `+ New`, and provides `Return to Now`.
- Simulation actions close the More menu automatically, leaving the safety banner as the dominant signal instead of stacking a control palette over it.

