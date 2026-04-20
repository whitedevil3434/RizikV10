# Ghost Writer Humanizer (Blader-Inspired)

The Ghost Writer pipeline (`backend/src/ghost/transformEngine.ts`) includes an optional deterministic cleanup stage inspired by `blader/humanizer`.

## What it does

Applied to *body paragraphs* (not headings/TOC/references), it removes or softens common AI-writing tells:

- Strips chatbot artifacts (e.g. “I hope this helps”, “Great question”)
- Strips signposting openers (e.g. “Let’s dive in”, “Here’s what you need to know”)
- Simplifies filler phrases (e.g. “in order to” → “to”)
- Simplifies copula-avoidance phrasing (e.g. “serves as” → “is”)
- Replaces a small set of high-frequency “AI vocabulary” words (conservative mapping)
- Normalizes em-dash/double-hyphen overuse into commas

Implementation lives in `backend/src/ghost/bladerHumanizer.ts`.

## How to enable/disable

- API option: send `options.bladerHumanizer: true|false` to `/api/ghost/humanize`.
- Default: enabled unless `bladerHumanizer` is explicitly set to `false`.

## Upstream reference

- Repo: `https://github.com/blader/humanizer` (MIT)
- Concept source: Wikipedia “Signs of AI writing” (WikiProject AI Cleanup)

