# Queue “Show in world” interaction audit

Viewport: 1440×900, live browser device metrics. Dataset: `demo=goods_handoff`.

Timeline:

- `00-world`: goods-handoff World is the starting surface.
- `01-expanded-evidence`: Evidence Inbox explains the waiting Condition record and its capture intent.
- `02-focused-evidence`: `Show in world` closes the queue sheet, focuses the typed `evidence:1` record in the execution slice, and exposes the same safe action on the board.

Findings fixed during this audit: the focused Evidence record previously showed the generic execution-level next action (“Acceptance authority must review…”) even though the queue item’s recorded operation required evidence capture. Its primary button also said “Review proof” while the evidence was still waiting. The selected record operation now owns both the visible Next safe action and state-aware primary action (“Add evidence”), keeping queue and corkboard semantics aligned.
