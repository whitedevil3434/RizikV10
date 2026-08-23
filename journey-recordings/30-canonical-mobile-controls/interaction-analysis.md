# Canonical goods-handoff mobile controls audit

Viewport: 390×844, live browser device metrics. Dataset: `demo=goods_handoff`.

Timeline:

- `00-world`: domain fixture opens as a populated execution corkboard with four attention actions.
- `01-board-tools`: Board tools stays compact and exposes World controls, saved perspectives and lens selection without adding a dense editor toolbar.
- `02-risk-lens`: selecting Risk closes the menu and reports `4 records highlighted`.
- `03-simulation`: Simulate safely produces a readable `SIMULATION · NOT FACT` state with a branch URL.
- `04-record-overlay`: the focused Evidence record uses `Add evidence`; the aggregate section labels its separate action as `Thread-level next action`, avoiding a false conflict between record and thread scope.
