# masonix

## 0.3.0

### Minor Changes

- 7ee3fd8: Stabilize `BalancedItem` ref callback to prevent recreation on index changes

  The ref callback in `BalancedItem` depended on `[setItemRef, index]`. Since `setItemRef` is permanently stable (created with `useCallback([], [])` in `useItemHeights`), `index` was the only reason the callback was ever recreated — which caused React to detach and re-attach the ref on any render where index changed.

  `index` is now kept in a ref updated on every render. The `useCallback` dep list is reduced to `[setItemRef]`, so the callback is created once on mount and never recreated. `indexRef.current` is always up-to-date when the callback fires during React's commit phase.

- 153b939: Fix O(n) double-pass container height calculation in `MasonryBalanced`

  Container height was previously computed with a second full scan over all positioned items after layout:

  ```tsx
  // Before — second O(n) pass + spread that can stack-overflow on large lists
  const containerHeight =
    positionedItems.length > 0
      ? Math.max(...positionedItems.map((item) => item.top + item.height))
      : 0;
  ```

  `maxBottom` is now tracked incrementally inside the existing placement loop, so no extra pass is needed. This matches the pattern already used by `MasonryVirtual` and avoids the `Math.max(...spread)` call that can throw `RangeError: Maximum call stack size exceeded` with very large item lists.

  ```tsx
  // After — single pass, maxBottom updated per item
  let maxBottom = 0;
  const positioned = items.map((data, index) => {
    const item = positioner.set(index, height);
    const bottom = item.top + item.height;
    if (bottom > maxBottom) maxBottom = bottom;
    return { ...item, measured };
  });
  return { positionedItems: positioned, containerHeight: maxBottom };
  ```

- 153b939: Fix O(n) full iteration in `MasonryVirtual` render for invisible items

  Previously, the render path mapped over all positioned items and returned `null` for those outside the viewport — defeating the purpose of virtualization for large lists:

  ```tsx
  // Before — iterates all 10K+ items, most return null
  {positionedItems.map(({ index, ... }) => {
    if (!visibleIndices.has(index)) return null;
    // ...
  })}
  ```

  A `.filter()` now pre-selects only visible items before `.map()`, so the render callback only executes for the O(k) items actually in the viewport:

  ```tsx
  // After — only iterates visible items
  {positionedItems
    .filter(({ index }) => visibleIndices.has(index))
    .map(({ index, ... }) => {
      // ...
    })}
  ```

- 153b939: Replace O(n) `filter(Boolean)` scans in positioner with O(1) `placedCount`

  `size()`, `all()`, and `estimateHeight()` each called `items.filter(Boolean)` on every invocation, scanning the full items array each time. A `placedCount` variable is now incremented in `set()` and reset in `clear()`, making `size()` and `estimateHeight()` O(1). `all()` uses `items.slice(0, placedCount)` which avoids the per-element truthiness check.

- 153b939: Remove duplicate `shortestColumnIndex` function in positioner

  `shortestColumnIndex` was an internal private function with identical logic to the public `shortestColumn`. The internal `set` now calls `shortestColumn` directly, eliminating the dead duplicate.

- 153b939: Avoid re-sorting breakpoints on every resize in `resolveResponsiveValue`

  Previously, every call to `resolveResponsiveValue` with an object value re-parsed and re-sorted breakpoints — including on every container resize, which is the hot path.

  `resolveResponsiveValue` is now split into two primitives:
  - `parseBreakpoints(value)` — parses and sorts breakpoints once, O(n log n)
  - `applyBreakpoints(breakpoints, containerWidth)` — linear scan against a pre-sorted array, O(n)

  `resolveResponsiveValue` remains as a convenience wrapper for callers that don't need caching.

  `useColumns` now pre-parses `gap` and `columns` responsive values in dedicated `useMemo` calls that only re-run when those props change. The main layout memo uses `applyBreakpoints` directly, so a container resize only triggers the O(n) scan — not the parse and sort.

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
    [setItemRef, index],
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
