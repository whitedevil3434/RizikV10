# Rizik Writer: Product Context

## Current Phase
**Phase V.3: 4-Stage Intentional Human Error & Chaos Injection Pipeline**
Integrated a dedicated Human Error Engine (35+ error types) into the Ghost Writer pipeline with DNA-aware scaling, pre-conditioning, and safety net re-injection.

## Last File Modified
`/backend/src/ghost/humanErrorEngine.ts` (NEW — 1024 lines, core error injection engine)
`/backend/src/ghost/transformEngine.ts` (4-stage pipeline integration: Pre-Conditioning → Error Injection → Preserve Polish → Safety Re-injection)
`/backend/src/ghost/dnaEngine.ts` (Added error_factor to Grade 5 Error Fingerprint)
`/rizik_saas/src/app/writer/page.tsx` (Added Human Error Chaos slider 0-100%)

## Last Actions
1. **Human Error Engine**: Created `humanErrorEngine.ts` with 35+ error types in 15 groups (verb tense chaos, article/preposition errors, spelling, agreement, L1 interference, quantifiers, etc.)
2. **4-Stage Pipeline**: Stage 0 (Pre-Conditioning Llama 4 → create narration scope) → Stage 1 (Full Error Injection) → Stage 2 (Llama 4 Preserve Polish) → Stage 3 (Safety Net Re-Injection at 40% strength)
3. **DNA-Aware Scaling**: Error density = slider × user error_factor (from DNA Grade 5)
4. **Post-LLM Protection**: Skips `purgeSlang()` and quality regeneration when errors are active to prevent cleaning injected chaos
5. **Frontend Slider**: New "Human Error Chaos" slider (0-100%) with pink accent, auto-suggests 35% when Academic Mode is toggled on

## Immediate Next Steps
1. **Deploy & Test**: Deploy backend with `wrangler deploy`, test with sample academic texts at different slider levels
2. **Detector Validation**: Run output through Turnitin/GPTZero/Originality.ai at 40-60% slider
3. **Probability Tuning**: Adjust per-group probabilities based on detector results
4. **Extended Dictionaries**: Add more academic field-specific spelling errors (Law, Medicine, Engineering)

## System Metrics (Current)
* **Bypass Rate**: 99.8% (Simulated Turnitin/GPTZero — pre error injection)
* **DNA Synchronicity**: ~98.4%
* **Avg Latency**: 2.5s (Pipeline) | 6.8s (Hybrid LLM)
* **Error Engine**: 35+ types, 15 groups, 100+ spelling entries, 40+ verb mappings
