---
"masonix": minor
---

Replace O(n) `filter(Boolean)` scans in positioner with O(1) `placedCount`

`size()`, `all()`, and `estimateHeight()` each called `items.filter(Boolean)` on every invocation, scanning the full items array each time. A `placedCount` variable is now incremented in `set()` and reset in `clear()`, making `size()` and `estimateHeight()` O(1). `all()` uses `items.slice(0, placedCount)` which avoids the per-element truthiness check.
