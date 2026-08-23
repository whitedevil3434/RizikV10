# Mobile corkboard interaction audit

Viewport: 390 × 844.

## Captured sequence

`mobile-interaction-timeline.mp4` replays six live tab states: World, More open, focused Beta user feedback, living detail, detail closed, and World restored.

## What the user feels

- The bottom rail makes the persistent World feel like a place rather than a stack of mobile pages. The current route stays legible while the board remains visible.
- The attention card is the first readable object, so the user gets a next safe action before parsing the canvas.
- Focus mode changes the camera and brings a paper inspector into the lower-left without erasing the connected cards behind it. This preserves context and creates a useful “I am looking at this record” feeling.
- Detail mode adds provenance and decision basis in the same paper surface. The transition is additive rather than a modal replacement, which keeps the board mentally stable.
- Close living detail returns to the focused record; close focus returns to the slice view. The recovery path is predictable and does not reset the World unexpectedly.

## Friction and risk

- At 390px, the attention card becomes vertically scrollable and occupies much of the stage. It is still usable, but the user sees less of the connected board while deciding.
- More exposes secondary navigation through the bottom rail's horizontal continuation cue. The cue is discoverable, though the secondary labels are not all visible at once.
- The tiny bottom labels are readable in the live 390px surface but depend on sufficient contrast and should not be reduced further.
- Browser-client keyboard simulation kept focus on the More control, so keyboard evidence is incomplete; the implementation's explicit overlay focus trap and Escape handling remain separately inspectable in source and should receive a real hardware-key pass.

## Capture integrity note

OS-level captures taken while the in-app tab was rendered were rejected when the Codex window remained the foreground screen. The accepted evidence for this mobile pass is the direct live-tab sequence rendered into `mobile-interaction-timeline.mp4`; it is not presented as an OS-screen recording.
