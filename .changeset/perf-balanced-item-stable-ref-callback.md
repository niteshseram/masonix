---
"masonix": minor
---

Stabilize `BalancedItem` ref callback to prevent recreation on index changes

The ref callback in `BalancedItem` depended on `[setItemRef, index]`. Since `setItemRef` is permanently stable (created with `useCallback([], [])` in `useItemHeights`), `index` was the only reason the callback was ever recreated — which caused React to detach and re-attach the ref on any render where index changed.

`index` is now kept in a ref updated on every render. The `useCallback` dep list is reduced to `[setItemRef]`, so the callback is created once on mount and never recreated. `indexRef.current` is always up-to-date when the callback fires during React's commit phase.
