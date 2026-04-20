---
name: pinterest-scraper
description: Scrape design inspiration from Pinterest URLs and analyze with Vision AI to generate precise geometric and aesthetic prompts.
author: Antigravity Architect
version: 1.0.0
tags: [vision, research, scraping, design]
dependencies:
  - openclaw-browser
  - gemini-vision
---

# Pinterest Inspiration Scraper

## Overview
This skill instructs OpenClaw to act as the first stage of the **Million-Brain Pipeline**. It uses browser automation to visit a requested Pinterest URL or search query, extracts the best visual inspiration (e.g., Islamic geometric patterns, minimalist industrial mats), and passes the image to a Vision AI model.

## Instructions
1. When a user asks for "inspiration" or provides a Pinterest link, use the `browser_subagent` tool to navigate to the URL.
2. If given a visual style like "Minimalist Islamic Geometry", go to `https://pinterest.com/search/pins/?q=...`
3. Capture a screenshot or extract the image URL of the most relevant design.
4. Pass the image to the `gemini-vision` or `gpt-4o` model with the following strict analysis prompt:
   > "Decode the geometry, pattern, color theory, and texture of this design. Then, formulate a completely new, industrial, minimalist text prompt suitable for Midjourney v6 or Stable Diffusion 3 that retains this exact vibe but is distinct and production-ready."
5. Output the finalized text prompt to the user or pass it directly to the next stage of the pipeline (Design Generator).

## Execution Environment
- Requires DOM manipulation capabilities or API-level image extraction.
- Requires access to a Vision model for feature extraction.
