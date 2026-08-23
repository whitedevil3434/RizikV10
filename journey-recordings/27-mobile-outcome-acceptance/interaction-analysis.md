# Mobile outcome acceptance-boundary audit

Viewport: 390×844, live browser device metrics. Dataset: `demo=goods_handoff`.

`Outcome Outbox → Buyer acceptance pending → Open outcome` fits in the mobile queue sheet, opens `Review outcome` above the same World, and closes back to the execution slice with `focus=outcome:primary` while removing only the transient workbench/detail state.
