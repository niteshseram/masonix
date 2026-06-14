# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm test:run          # run all tests once (106 tests, ~550ms)
pnpm test              # run tests in watch mode
pnpm test:coverage     # run with v8 coverage
pnpm build             # tsc typecheck + vp pack (tsdown, dual ESM/CJS)
pnpm tc                # tsc --noEmit only
pnpm lint              # oxlint on packages/masonix/src/
pnpm format            # oxfmt on packages/masonix/src/
pnpm format:check      # format check without writing
pnpm docs              # start apps/docs Next.js dev server
pnpm docs:build        # build apps/docs
pnpm playground        # alias for docs dev server; playground lives at /playground
```

Run a single test file:

```bash
pnpm -F masonix exec vp test src/__tests__/core/positioner.test.ts
```

## Toolchain

This project uses **vite-plus** (`vp` CLI), which bundles vite, oxlint, oxfmt, and tsdown into one package. Library tool config lives in `packages/masonix/vite.config.ts` under the `pack`, `test`, `lint`, and `fmt` keys — there are no separate tool config files (no `vitest.config`, no `oxlintrc.json`).

Build output (`vp pack` / tsdown):

- `dist/index.mjs` + `dist/index.d.mts` (ESM)
- `dist/index.cjs` + `dist/index.d.cts` (CJS)
- Same for `dist/virtual.*`

## Repository Structure

```
apps/docs/                Next.js docs site; includes the /playground route
packages/masonix/
  src/
    core/                 pure TS layout engines (no React)
    __tests__/core/       unit tests for all core modules
    types.ts              all shared TypeScript interfaces
    index.ts              public entry — re-exports only
    virtual.ts            virtual entry — types only (Phase 3)
    test/setup.ts         vitest setup: ResizeObserver mock only
  package.json            publishable masonix package metadata
  README.md               package-level usage docs
  vite.config.ts          build/test/lint/format config
```

The root `tsconfig.json` is a shared base config. `packages/masonix/tsconfig.json` covers the library `src/` directory. `tsconfig.node.json` covers package and app Vite configs (needs `@types/node` for `import.meta.dirname`). `packages/masonix/tsconfig.build.json` is used by tsdown for declaration emit.

## Architecture

### Progressive Enhancement Stack

Three components, one package, increasing complexity:

1. **`Masonry`** — CSS flexbox, ~3 kB, zero JS layout (Phase 2)
2. **`MasonryBalanced`** — JS-measured, shortest-column-first (Phase 2)
3. **`MasonryVirtual`** — virtualized for 10K+ items, interval tree for O(log n) range queries (Phase 3)

### Core Engines (Phase 1 — complete)

**`packages/masonix/src/core/positioner.ts`** — `createPositioner`: shortest-column-first placement. Each `set(index, height)` places an item in the shortest available column. Maintains `columnItems[][]` for incremental `update()` without full re-layout.

**`packages/masonix/src/core/interval-tree.ts`** — augmented red-black tree. Stores items as `[top, top+height]` intervals for `search(low, high)` — O(log n + k) viewport intersection queries used by `MasonryVirtual`.

**`packages/masonix/src/core/utils.ts`** — `resolveResponsiveValue` (numeric container-width breakpoints), `computeColumns` (column count from fixed `columns`, auto from `columnWidth`, or `defaultColumns`), `effectiveColumnCount`.

**`packages/masonix/src/core/scroll.ts`** — scroll utilities for the virtual layer.

### Positioner interface (`packages/masonix/src/types.ts`)

All positioners implement `Positioner`. The key method is `set(index, height)`. `update()` does incremental re-layout: only recomputes columns that had a height change, not a full reset.

### Responsive values

`ResponsiveValue<T>` accepts a plain value or numeric min-width keys (`{ 600: 2, 900: 3 }`). Breakpoints are based on the measured container width.

## Code Style

- **No single-letter variable names.** Use descriptive names everywhere — `columnIndex` not `c`, `measuredHeight` not `h`, `option` not `o`, `event` not `e`, etc. The only exception is generic type parameters (`T`, `K`, `V`).

## Key Constraints

- **`packages/masonix/src/index.ts` and `packages/masonix/src/virtual.ts` are thin re-export barrels.** Never add logic there; never import Phase N+1 symbols until those files exist.
- All filenames are lowercase with hyphens.
- `react` and `react-dom` are peer dependencies — never bundle them. External pattern in `vite.config.ts`: `['react', 'react-dom', 'react/jsx-runtime', /^react-dom\//]`.
- The `"use client"` banner is prepended to all output files by tsdown.
