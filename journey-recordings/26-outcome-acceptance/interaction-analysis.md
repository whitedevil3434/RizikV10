# Outcome acceptance-boundary audit

Viewport: 1440×900, live browser device metrics. Dataset: `demo=goods_handoff`.

Timeline:

- `00-world`: the goods-handoff World shows a waiting Buyer acceptance outcome.
- `01-outcome-outbox`: Outcome Outbox explains that the result is ready for acceptance or dispute and names the Acceptance authority.
- `02-outcome-review`: `Open outcome` opens `Review outcome` above the same World with `workbench=outcome` and typed `outcome:primary` focus retained.

The UI does not imply automatic acceptance; it explicitly frames acceptance, partial acceptance or dispute as the authenticated canonical act. State-aware source logic still reserves `Resolve divergence` for partial/disputed/rejected/variance outcomes.
