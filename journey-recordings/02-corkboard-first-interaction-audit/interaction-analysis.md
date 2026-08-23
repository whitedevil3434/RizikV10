# C-Link corkboard-first interaction audit

## Direct screen recording

- `live-capture/corkboard-local-chrome.mov` — local app in a visible Chrome window; includes More, focus, and inspector interaction.
- `live-capture/corkboard-clean-inspector.mov` — clean fullscreen take of the focused record inspector opening and closing.

The first OS-level take (`corkboard-live-screen.mov`) was rejected because the foreground app showed a blank in-app browser tab rather than the C-Link surface. The recording was retained as a capture diagnostic, not as product evidence.

## Observed journey

1. World opens as a calm cork surface with a compact persistent rail, an attention card, connected records, and a restrained action bar.
2. More reveals Search, Relations, Contexts, Profile, and Settings without changing the board surface.
3. Start here / Blocked by interaction approval moves the camera to Beta user feedback and exposes a focused record summary.
4. Open record expands the same focused record into a provenance-aware inspector: state, responsible party, connections, evidence, uncertainty, canonical identity, and decision basis.
5. Close living detail returns to the same focused board state; the record focus remains intact.

## Motion and micro-feel

- Camera focus is the strongest motion cue and supports inspection rather than freeform arrangement.
- The right inspector enters as a stable paper surface; it does not visually compete with the board or imply an editor canvas.
- Pins, yarn, slight paper rotation, and the warm cork texture make the surface recognisable without turning it into a design tool.
- The More disclosure is easy to understand as secondary navigation. After route/focus changes it collapses, so stale navigation does not linger over a new record.
- The safest-action language is visible early enough to orient the user before they inspect the canonical record.

## Remaining QA note

For product review, use the clean fullscreen recording rather than the browser-window take. The browser chrome/debug infobar is capture context, not part of the C-Link UI.
