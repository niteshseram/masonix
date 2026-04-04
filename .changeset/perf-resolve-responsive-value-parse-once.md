---
"masonix": minor
---

Avoid re-sorting breakpoints on every resize in `resolveResponsiveValue`

Previously, every call to `resolveResponsiveValue` with an object value re-parsed and re-sorted breakpoints — including on every container resize, which is the hot path.

`resolveResponsiveValue` is now split into two primitives:

- `parseBreakpoints(value)` — parses and sorts breakpoints once, O(n log n)
- `applyBreakpoints(breakpoints, containerWidth)` — linear scan against a pre-sorted array, O(n)

`resolveResponsiveValue` remains as a convenience wrapper for callers that don't need caching.

`useColumns` now pre-parses `gap` and `columns` responsive values in dedicated `useMemo` calls that only re-run when those props change. The main layout memo uses `applyBreakpoints` directly, so a container resize only triggers the O(n) scan — not the parse and sort.
