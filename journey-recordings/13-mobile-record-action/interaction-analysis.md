# Mobile record-action overlay

This 390×844 live sequence covers World → attention focus → `Clarify` → `Review record` → close → focused World.

## Findings

- The record overlay is readable on a narrow screen: the dark intent header, record title, canonical-action boundary and `World stays alive` note all fit without horizontal overflow.
- The selected papers remain visible above the overlay before it opens, and after close the focused paper plus `Clarify` action return in the same slice.
- The mobile state rail correctly changes from `World / Slice` to `Focus / Detail` while the overlay is active, then returns to `Focus` after close.
- The bottom persistent rail remains available but does not compete with the record overlay; the overlay’s close control remains above the fold.
- The attention sheet is the heaviest pre-focus element on mobile, but it disappears once a record is selected. This keeps the action state more important than the queue list during decision-making.

The MP4 is a live-tab viewport timeline; no real account or record submission was performed.
