# Slice and search interaction audit

## Sequence

The timeline moves through Personal, Company, Project, and Execution slices, then searches for “Beta user feedback” from the Execution slice. The cross-slice result identifies the record as a Project-slice task before opening its detail state.

## Findings

- Slice changes are easy to read because the selected pill, breadcrumb, card population, and yarn geometry change together.
- Search is a strong inspect-and-act entry point: the result carries type, source slice, and match reason, then opens the canonical focused detail rather than a generic result page.
- The URL, breadcrumb, pressed slice, connected journey, and detail context all agree on `region:project` after search selection. This is a good canonical-orientation signal.
- The search panel temporarily occupies the visual center, but it is compact and disappears after selection; it does not turn the board into a dense editor toolbar.
