---
"masonix": minor
---

Remove `getColumnSpan` prop from `MasonryBalanced` and `MasonryVirtual`

Column spanning produced unavoidable empty gaps in the layout because the positioner must align spanning items to the tallest of the spanned columns. This is a fundamental limitation of shortest-column-first placement and leads to poor UX by default.

For hero/featured items that need to span multiple columns, use CSS Grid instead.

**Breaking change:** Remove the `getColumnSpan` prop from `MasonryBalancedProps` and `MasonryVirtualProps`, and the `span` field from `PositionedItem`.
