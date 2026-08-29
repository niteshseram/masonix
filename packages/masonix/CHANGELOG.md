# masonix

## 0.6.0

### Minor Changes

- 2e00cd5: Add virtual feed navigation controls.
  - Restore an initial item position with `initialScrollIndex`, including items loaded after mount.
  - Add visibility-preserving `auto` alignment to `scrollToIndex()`.
  - Add absolute `scrollToOffset()` and relative `scrollBy()` handle methods.
  - Preserve smooth index scrolling across unrelated layout rerenders.

## 0.5.0

### Minor Changes

- 05a9ec7: Prepare Masonix 0.5 with explicit accessibility defaults and observable native layout mode.
  - Remove the legacy `role="grid"` compatibility value.
  - Make item-count announcements opt-in.
  - Restrict `enableNative` and `columnClassName` to the `Masonry` prop type where they are implemented.
  - Export `MasonryLayoutMode`, add `onLayoutModeChange`, and expose the active engine through `data-masonix-layout`.

## 0.4.2

### Patch Changes

- b1aaab4: Harden masonry layout correctness and browser behavior.
  - Use the current CSS Grid Lanes syntax and enable it only after hydration.
  - Normalize the legacy ARIA grid role to list semantics and allow item-count announcements to be disabled.
  - Measure item and container border boxes without updating unchanged heights.
  - Observe custom scroll container resizing without mutating containment styles.
  - Preserve smooth programmatic scrolling across ordinary scroll events.
  - Normalize invalid layout inputs and repair sparse or repeated positioner indexes.

## 0.4.1

### Patch Changes

- 0bdf9df: Keep virtual masonry spacer sizing local to custom scroll containers by adding layout containment only when the container does not already provide it.

## 0.4.0

### Minor Changes

- 5f5ea8c: Add virtual feed APIs for end-reached callbacks and scroll-seek placeholders, export virtual range metadata, and expose scroll velocity from `useScroller`.

## 0.3.2

### Patch Changes

- ff26f1d: Harden virtual masonry release quality.
  - Refresh virtual container offsets during range calculation so window and custom scroll containers compute the correct visible items.
  - Render virtual items from interval-tree hits instead of scanning every positioned item.
  - Resolve scroll containers when `scrollToIndex()` is called so custom scroll-area refs do not get stuck on `window`.
  - Keep measured heights attached to `itemKey` identity in measured masonry modes.
  - Make `MasonryVirtual` honor `role="none"` for item wrappers and stabilize virtual item ref callbacks.
  - Add the missing coverage tooling dependency so `pnpm test:coverage` works in release verification.
