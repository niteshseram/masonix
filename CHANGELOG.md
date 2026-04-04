# masonix

## 0.1.0

### Minor Changes

- 701f4a2: Initial release of masonix — a lightweight, progressive React masonry layout library.
  - `Masonry`: CSS flexbox-based, zero JS layout (~3 kB)
  - `MasonryBalanced`: JS-measured, shortest-column-first placement
  - `MasonryVirtual`: virtualized for 10K+ items using an interval tree for O(log n) viewport queries
  - Responsive column configuration with Tailwind-compatible breakpoints (sm/md/lg/xl/2xl)
  - SSR-ready, dual ESM/CJS output, full TypeScript support
