# Mobile focused-route recovery audit

Viewport: 390×844, live browser device metrics.

Timeline:

- `00-focused-world`: the board is already focused on `task:beta-feedback` in `region:project`.
- `01-more-open`: secondary navigation opens without changing the focused board context.
- `02-search-overlay`: Search opens above the same World with `fixture`, `slice` and typed `focus` preserved.
- `03-focused-return`: closing the preview returns to the exact focused URL and board context.

This pass caught and fixed two continuity defects: fixture query loss on secondary routes, and loss of spatial focus/slice when opening a secondary route from a focused record.
