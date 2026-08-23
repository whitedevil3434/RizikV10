# Primary route tour audit

The live route tour started on the unauthenticated local demo World. The World fixture is intentionally public, while `/clink/world/needs`, `/clink/world/commitments`, `/clink/world/reality`, and `/clink/world/inbox` are guarded live workspace routes. Clicking `Needs` therefore redirected to `/clink/login?next=/clink/world/needs`.

This is an auth-boundary finding, not evidence that the live authenticated routes fail. It does mean a visitor exploring the visual fixture can experience a hard context switch from corkboard to login when trying a primary board path. The login surface itself preserves the cork/paper/pin language and clearly explains the handoff.

For authenticated acceptance, repeat the route tour with an isolated workspace identity as required by `docs/testing.md`; no credentials or auth bypass were introduced for this visual audit.
