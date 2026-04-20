---
name: figma-assembly
description: Use the Figma REST API to autonomously assemble the final vector design, add branding borders, inject customer IDs, and export for printing.
author: Antigravity Architect
version: 1.0.0
tags: [figma, api, design, automation]
---

# Figma Automated Assembly Line

## Overview
This is Stage 4 (The Finale) of the **Million-Brain Pipeline**. OpenClaw will bypass the Figma UI entirely. Acting at machine speed via the Figma REST API, it will create a new canvas, import the generated SVG, apply the Rizik brand borders, inject the specific Customer/Tribe ID text, and export the final print-ready PDF to the Mac Mini for CUPS spooling.

## Instructions
1. Retrieve the `FIGMA_FILE_KEY` (a template file for Rizik Mats) and `FIGMA_PERSONAL_ACCESS_TOKEN` from the environment.
2. Receive the finalized SVG path and customer metadata (e.g., Name: SBT, ID: 001).
3. Using the Figma API:
   - Duplicate the Master Template node.
   - Upload the SVG to the Figma image fill endpoints and apply it to the main mat vector layer.
   - Find the Text Node labeled `CUSTOMER_ID` and update its characters via API to the provided ID.
4. Call the Figma `GET /v1/images/:key` exporting endpoint, requesting format `pdf` for the newly assembled node.
5. Download the PDF to the Mac Mini (e.g., `/tmp/openclaw_designs/final_print_001.pdf`).
6. Trigger the local CUPS printer command:
   ```bash
   lpr -P EPSON_L8050_Series -o media=A4 -o ColorModel=RGB /tmp/openclaw_designs/final_print_001.pdf
   ```
7. Report "Print Job Dispatched" back to the Supabase Database (rizik_openclaw_comms) so the web UI shows the success message.
