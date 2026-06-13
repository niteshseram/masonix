# masonix

## 0.3.2

### Patch Changes

- ff26f1d: Harden virtual masonry release quality.
  - Refresh virtual container offsets during range calculation so window and custom scroll containers compute the correct visible items.
  - Render virtual items from interval-tree hits instead of scanning every positioned item.
  - Resolve scroll containers when `scrollToIndex()` is called so custom scroll-area refs do not get stuck on `window`.
  - Keep measured heights attached to `itemKey` identity in measured masonry modes.
  - Make `MasonryVirtual` honor `role="none"` for item wrappers and stabilize virtual item ref callbacks.
  - Add the missing coverage tooling dependency so `pnpm test:coverage` works in release verification.
