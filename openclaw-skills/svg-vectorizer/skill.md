---
name: svg-vectorizer
description: Instantly convert raster PNG/JPG design generations into mathematically perfect, scalable SVG files for production printing.
author: Antigravity Architect
version: 1.0.0
tags: [conversion, svg, vector, graphics]
---

# Production Vector Transformer

## Overview
This is Stage 3 of the **Million-Brain Pipeline**. AI image generators produce pixel-based raster graphics. If printed on a 5x2 foot physical mat, they will pixelate. This skill takes the raster image and passes it through an auto-tracing API (like Vectorizer.ai or local Potrace) to convert it into a resolution-independent SVG.

## Instructions
1. Receive the path to the generated raster image (e.g., `/tmp/openclaw_designs/raw_mat_01.png`).
2. Make a multipart/form-data POST request to the `Vectorizer.ai` API (or equivalent vectorization service).
3. Payload parameters:
   - `image`: the file stream.
   - `mode`: "color".
   - `colors`: 8 (to keep the print layers clean).
4. Save the API response as an `.svg` file in `/tmp/openclaw_designs/`.
5. The SVG is now mathematically perfect and will not lose quality at any print size. Pass this SVG file path to the final stage (Figma Assembly).

## Requirements
- `VECTOR_API_KEY` must be configured in your environment.
