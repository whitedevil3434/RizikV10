# Mobile context-controls interaction audit

Viewport: 390×844, real browser device metrics.

Timeline:

1. World at rest — the board, attention surface and compact topbar remain primary.
2. Board tools — secondary controls are available without turning the header into a dense toolbar.
3. Risk lens — selection closes the menu and exposes a clear `records highlighted` status.
4. Simulation — `SIMULATION · NOT FACT` is separated from the state rail, slice tabs and search lane.
5. Record overlay — the same World remains underneath and the canonical action stays explicit.

Findings applied during this audit:

- Mobile Board tools had been hidden with no alternate lens/simulation entry; it is now a compact topbar control with a fixed secondary sheet.
- Temporal warning previously overlapped the state rail; mobile temporal lanes now reserve separate vertical space.
- Body, document and viewport widths all measured 390px; no horizontal overflow was observed.
