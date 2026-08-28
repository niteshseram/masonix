---
'masonix': minor
---

Prepare Masonix 0.5 with explicit accessibility defaults and observable native layout mode.

- Remove the legacy `role="grid"` compatibility value.
- Make item-count announcements opt-in.
- Restrict `enableNative` and `columnClassName` to the `Masonry` prop type where they are implemented.
- Export `MasonryLayoutMode`, add `onLayoutModeChange`, and expose the active engine through `data-masonix-layout`.
