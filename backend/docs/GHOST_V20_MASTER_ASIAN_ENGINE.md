# Ghost V20 — Master Asian Engine

Ghost V20 lives in the error-injection stage (`backend/src/ghost/humanErrorEngine.ts`) and is responsible for persona-based “human chaos”.

## Personas

Personas are defined in `PERSONA_REGISTRY` (AUTO + 9 regional/persona profiles). Each persona whitelists a set of mutation rules and has an `intensityBias`.

## Controls (API options)

Send these under `options` to `/api/ghost/humanize`:

- `persona`: `"AUTO"` or a specific persona id (e.g. `"SA_RANTER"`, `"TAGLISH_PRO"`).
- `personaIntensity`: number in `0.1..1.0` (scales persona impact).
- `guardDropEnabled`: boolean (when `true`, mutation density ramps up deeper in the document).

Defaults:

- `persona = "AUTO"`
- `personaIntensity = 1.0`
- `guardDropEnabled = true`

## Specialized layers (Plan items)

Implemented mutation groups:

- Rant-Abbreviator: injects shorthand like `wdym`, `ppl`, `sth`
- Hyphen-Descriptor: creates occasional ad-hoc hyphenated descriptors
- Self-correction markers: inserts dash/parenthesis “I mean/actually” style corrections

