# Mobile queue-to-evidence interaction audit

Viewport: 390×844, live browser device metrics. Dataset: `demo=goods_handoff`.

Timeline:

- `00-world`: compact goods-handoff World with the attention surface visible.
- `01-queues`: the mobile queue sheet reports 4 actions and 7 visible records without horizontal overflow.
- `02-evidence-inbox`: Evidence Inbox is reachable from the queue tabs.
- `03-expanded`: Condition record exposes the safe-action explanation and action controls in the mobile sheet.
- `04-capture-intent`: Add evidence opens above the same World.
- `05-recovered`: closing returns to the execution slice and `evidence:1` focus, with the capture intent removed.

No canonical mutation is implied by the fixture preview; the action boundary remains explicit.
