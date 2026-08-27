---
'masonix': patch
---

Harden masonry layout correctness and browser behavior.

- Use the current CSS Grid Lanes syntax and enable it only after hydration.
- Normalize the legacy ARIA grid role to list semantics and allow item-count announcements to be disabled.
- Measure item and container border boxes without updating unchanged heights.
- Observe custom scroll container resizing without mutating containment styles.
- Preserve smooth programmatic scrolling across ordinary scroll events.
- Normalize invalid layout inputs and repair sparse or repeated positioner indexes.
