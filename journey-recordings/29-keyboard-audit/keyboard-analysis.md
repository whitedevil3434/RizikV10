# Keyboard traversal audit

Live browser attempt:

- Login email input accepts real fill/focus through the browser bridge.
- Calling locator `press("Tab")` leaves focus on the email input.
- Calling the browser CUA Tab keypress also leaves focus on the email input.
- This is a bridge limitation: the same control can fill and report focus, but the bridge does not dispatch native Tab traversal. No application keyboard defect is proven by this result.

Source evidence remains present for the World overlay: capture-phase Escape ownership, first/last focusable handling, Shift+Tab wrapping and heading restoration are covered by `world-shell-architecture.test.ts`. A physical/native keyboard runner is still required for definitive Tab acceptance evidence.
