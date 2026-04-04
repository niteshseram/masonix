---
"masonix": minor
---

Fix O(n) full iteration in `MasonryVirtual` render for invisible items

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
