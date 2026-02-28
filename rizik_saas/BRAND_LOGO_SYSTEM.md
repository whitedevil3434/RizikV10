# Rizik Logo System (Canonical)

## Master Reference
- Canonical full logo: `/public/rizik-logo.svg`
- Canonical mark (icon-only): `/public/rizik-mark.svg`
- Reusable component: `src/components/brand/rizik-logo.tsx`

## Visual DNA (from provided master logo)
- Structure: custom R mark + geometric uppercase wordmark
- Primary logo ink: `#04204C` (Deep Navy)
- Preferred brand background: warm cream family (`#F5F2EB`)
- Character: technical, engineered, disciplined, high-trust

## Approved Variants
1. `full + navy` (default): light backgrounds
2. `full + light`: dark backgrounds (same geometry, inverted tone)
3. `mark + navy`: compact placements, QR centers, avatars, favicons

## Usage Rules
- Never redraw letterforms manually in UI text (no "RizikERP" as logo replacement).
- Use the `RizikLogo` component for app UI consistency.
- Maintain clear space around logo: at least the height of the `R` stem.
- Minimum sizes:
  - Full logo: `h-7` (28px) or larger in UI
  - Mark: `24px` or larger
- Avoid gradients, outlines, shadows, distortions on the logo geometry.
- Do not change aspect ratio.

## App Mapping
- Top navigation: `RizikLogo` full/navy
- Login and auth: `RizikLogo` full/navy
- ERP/Portal dark sidebars: `RizikLogo` full/light + optional text chip (`ERP`/`Portal`)
- QR embedding center: `/rizik-mark.svg`
