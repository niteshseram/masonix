# masonix

## 0.2.0

### Minor Changes

- 870e740: Fix infinite re-render loop in `MasonryBalanced` caused by unstable ref callbacks

  The `setItemRef` prop passed to `BalancedItem` was an inline arrow function created on every render:

  ```tsx
  // Before — new function on every render
  setItemRef={(node) => setItemRef(node, index)}
  ```

  React detects a changed ref callback and re-invokes it (cleanup with `null`, then re-attach with the node). This triggered the `ResizeObserver` on every render, which called `setMeasuredHeights`, which triggered another render — an infinite loop.

  The fix moves the bound callback inside `BalancedItem` using `useCallback`, so it is only recreated when `index` changes. The stable `setItemRef` function from `useItemHeights` is now passed directly as a prop:

  ```tsx
  // After — stable callback inside BalancedItem
  const refCallback = useCallback(
    (node: HTMLElement | null) => setItemRef?.(node, index),
    [setItemRef, index]
  );
  ```

- a8fde68: Fix broken logo in README on npm by using absolute GitHub raw URLs instead of relative paths
- 509b8bc: Remove `getColumnSpan` prop from `MasonryBalanced` and `MasonryVirtual`

  Column spanning produced unavoidable empty gaps in the layout because the positioner must align spanning items to the tallest of the spanned columns. This is a fundamental limitation of shortest-column-first placement and leads to poor UX by default.

  For hero/featured items that need to span multiple columns, use CSS Grid instead.

  **Breaking change:** Remove the `getColumnSpan` prop from `MasonryBalancedProps` and `MasonryVirtualProps`, and the `span` field from `PositionedItem`.

## 0.1.0

### Minor Changes

- 701f4a2: Initial release of masonix — a lightweight, progressive React masonry layout library.
  - `Masonry`: CSS flexbox-based, zero JS layout (~3 kB)
  - `MasonryBalanced`: JS-measured, shortest-column-first placement
  - `MasonryVirtual`: virtualized for 10K+ items using an interval tree for O(log n) viewport queries
  - Responsive column configuration with Tailwind-compatible breakpoints (sm/md/lg/xl/2xl)
  - SSR-ready, dual ESM/CJS output, full TypeScript support
