---
'masonix': patch
---

Add edge case test coverage and improve dev tooling.

**Edge case tests** (6 new assertions across 4 test files):

- `positioner.update()` with unchanged heights returns `[]` — verifies no spurious re-layouts when measurements stabilise
- `computeColumns(0, …)` never returns a negative `columnWidth` — the gap arithmetic produces a negative intermediate value that must be clamped to zero
- `columns: 0` clamps to 1 column — defensive guard against invalid prop values
- `useColumns` with `itemCount: 1` and multiple configured columns returns 1 effective column — single item gets a single column, no empty column wrappers
- `useContainerWidth` recovers to the correct non-zero width after a 0-width entry — covers the tab-panel / hidden-element lifecycle where the element briefly reports 0px before becoming visible
- `useContainerWidth` handles an empty `ResizeObserver` entries array without throwing

**Docs updates**:

- Update README file
