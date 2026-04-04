---
"masonix": minor
---

Fix O(n) double-pass container height calculation in `MasonryBalanced`

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
