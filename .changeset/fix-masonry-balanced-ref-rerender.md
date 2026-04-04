---
"masonix": minor
---

Fix infinite re-render loop in `MasonryBalanced` caused by unstable ref callbacks

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
