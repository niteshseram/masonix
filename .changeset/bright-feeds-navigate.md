---
'masonix': minor
---

Add virtual feed navigation controls.

- Restore an initial item position with `initialScrollIndex`, including items loaded after mount.
- Add visibility-preserving `auto` alignment to `scrollToIndex()`.
- Add absolute `scrollToOffset()` and relative `scrollBy()` handle methods.
- Preserve smooth index scrolling across unrelated layout rerenders.
