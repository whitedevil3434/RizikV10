# Mobile secondary-navigation interaction audit

Viewport: 390×844, live browser device metrics.

Timeline:

- `00-world`: the compact World shell opens with primary rail, board controls and the attention sheet.
- `01-more-open`: More reveals Search, Relations, Contexts, Profile and Settings as a secondary layer.
- `02-search-route`: Search opens as a fixture-preview overlay above the same World.
- `03-returned-world`: closing the overlay returns to `/clink/world-engine?fixture=goods-handoff`; the fixture context is preserved.

Finding fixed during this audit: secondary fixture navigation previously discarded `fixture=goods-handoff`, so closing an operational preview could silently reset the board. Demo rail destinations now carry the non-transient World query state through the route.
