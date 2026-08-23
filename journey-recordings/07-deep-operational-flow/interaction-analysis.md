# Deep operational flow audit

## Captured journey

1. Board overview
2. More controls opened
3. Attention item: `Acceptance authority pending`
4. Focus panel: `Interaction accepted`
5. Primary action: `Settle outcome`
6. Detail inspector and typed relationship path
7. Relationship inspector: `Responsive test verifies Interaction accepted`
8. Close relationship inspector, close detail, close focus panel

Video: `deep-operational-flow.mp4`

## What the journey communicates well

- The attention surface produces a clear first decision: the user starts from a blocked/awaiting record rather than an empty canvas.
- The outcome focus panel keeps the safe action, current state, responsibility, evidence and uncertainty together.
- Detail mode explains the record before exposing relationship facts, which supports inspect-before-act behaviour.
- Relationship inspection explicitly says that an edge is a recorded fact and does not by itself imply ownership, authority or obligation.
- Closing relationship → detail → focus restores the same board context and preserves the execution slice in the URL.

## Friction found and addressed

- The `More` menu exposed `Card arrangement`, `Undo paper move`, `Redo paper move` and `Reset paper positions`. Those labels created a direct editor/canvas mental model, so they were removed. World controls now focus on zoom and fit/navigation; history simulation remains separate and explicitly safe.
- The desktop journey rail existed in the DOM but sat underneath the search lane in the visual composition. It was hidden on desktop because breadcrumb, slice tabs and the inspector already provide orientation. The compact journey rail remains for handset layouts, where it is useful as a primary orientation cue.

## Remaining follow-up

- The desktop journey rail's `Slice` action did not visibly transition when activated through browser automation, while the visible `Execution slice` tab did correctly return from focus to slice. This needs a focused event-path investigation before calling the rail interaction fully verified; it is currently not used as a desktop affordance after the rail was hidden there.
- Browser-level Tab sequencing is still not fully proven by automation. Overlay code contains Escape/focus handling, but a real keyboard pass should be done in a visible browser session.

