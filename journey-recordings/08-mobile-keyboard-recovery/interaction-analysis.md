# Mobile keyboard and recovery audit

Viewport: 390 × 844

## Recorded sequence

1. Board overview
2. Attention item → `Interaction accepted` focus panel
3. `Settle outcome` → living detail
4. Canvas focus → `Escape`
5. Focus panel closes and the execution slice remains in the URL

Video: `mobile-keyboard-recovery.mp4`

## Findings

- Mobile state rail is visible, compact and correctly enables `World` and `Slice` while `Focus`/`Detail` remain disabled until a record is selected.
- `Slice` correctly clears focus on mobile and returns to the execution slice.
- Escape is a meaningful one-step recovery: detail/focus state closes without losing the slice context.
- The canvas stays keyboard-focusable, but the browser automation bridge does not advance normal Tab focus from canvas to the next control; repeated Tab observations remain on the canvas. This is not sufficient evidence that real keyboard traversal is broken, but it is also not enough to mark Tab acceptance as verified.
- Demo `+ New` correctly crosses into the guarded Need composer and lands on login with a `next` return path. That is an intentional auth boundary, but it is a noticeable context switch for unauthenticated demo visitors.

