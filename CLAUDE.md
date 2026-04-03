# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm test:run          # run all tests once (106 tests, ~550ms)
pnpm test              # run tests in watch mode
pnpm test:coverage     # run with v8 coverage
pnpm build             # tsc typecheck + vp pack (tsdown, dual ESM/CJS)
pnpm tc                # tsc --noEmit only
pnpm lint              # oxlint on src/
pnpm format            # oxfmt on src/
pnpm format:check      # format check without writing
pnpm playground        # start apps/playground dev server (port 3000)
```

Run a single test file:

```bash
pnpm vp test src/__tests__/core/positioner.test.ts
```

## Toolchain

This project uses **vite-plus** (`vp` CLI), which bundles vite, oxlint, oxfmt, and tsdown into one package. All tool config lives in the root `vite.config.ts` under the `pack`, `test`, `lint`, and `fmt` keys — there are no separate tool config files (no `vitest.config`, no `oxlintrc.json`).

Build output (`vp pack` / tsdown):

- `dist/index.mjs` + `dist/index.d.mts` (ESM)
- `dist/index.cjs` + `dist/index.d.cts` (CJS)
- Same for `dist/virtual.*`

## Repository Structure

```
apps/playground/    dev sandbox; vite aliases masonix → ../../src/index.ts
src/
  core/             pure TS layout engines (no React)
  __tests__/core/   unit tests for all core modules
  types.ts          all shared TypeScript interfaces
  index.ts          public entry — re-exports only
  virtual.ts        virtual entry — types only (Phase 3)
  test/setup.ts     vitest setup: ResizeObserver mock only
```

`tsconfig.json` covers `src/` only. `tsconfig.node.json` covers `vite.config.ts` and `apps/*/vite.config.ts` (needs `@types/node` for `import.meta.dirname`). `tsconfig.build.json` is used by tsdown for declaration emit.

## Architecture

### Progressive Enhancement Stack

Three components, one package, increasing complexity:

1. **`Masonry`** — CSS flexbox, ~3 kB, zero JS layout (Phase 2)
2. **`MasonryBalanced`** — JS-measured, shortest-column-first (Phase 2)
3. **`MasonryVirtual`** — virtualized for 10K+ items, interval tree for O(log n) range queries (Phase 3)

### Core Engines (Phase 1 — complete)

**`src/core/positioner.ts`** — `createPositioner`: shortest-column-first placement. Each `set(index, height, span?)` places an item in the shortest available column. Maintains `columnItems[][]` for incremental `update()` without full re-layout.

**`src/core/column-balancer.ts`** — `createBalancedPositioner`: thin factory wrapping `createPositioner`. Components import only this, not the positioner directly.

**`src/core/interval-tree.ts`** — augmented red-black tree. Stores items as `[top, top+height]` intervals for `search(low, high)` — O(log n + k) viewport intersection queries used by `MasonryVirtual`.

**`src/core/utils.ts`** — `resolveResponsiveValue` (Tailwind-compatible breakpoints: sm/md/lg/xl/2xl), `computeColumns` (column count from fixed `columns`, auto from `columnWidth`, or `defaultColumns`), `effectiveColumnCount`.

**`src/core/scroll.ts`** — scroll utilities for the virtual layer.

### Positioner interface (`src/types.ts`)

All positioners implement `Positioner`. The key method is `set(index, height, span?)` — `span` is only meaningful in `createPositioner` (column spanning). `update()` does incremental re-layout: only recomputes columns that had a height change, not a full reset.

### Responsive values

`ResponsiveValue<T>` accepts a plain value, named breakpoints (`{ sm: 2, lg: 4 }`), or numeric keys (`{ 600: 2, 900: 3 }`). All match Tailwind's default breakpoint scale.

## Code Style

- **No single-letter variable names.** Use descriptive names everywhere — `columnIndex` not `c`, `measuredHeight` not `h`, `option` not `o`, `event` not `e`, etc. The only exception is generic type parameters (`T`, `K`, `V`).

## Key Constraints

- **RTL is a render-layer concern.** Positioners always compute LTR `left` values. Components apply `inset-inline-start` or flip via CSS `direction`. The `rtl` option exists in positioner options interfaces but has no effect on math.
- **`src/index.ts` and `src/virtual.ts` are thin re-export barrels.** Never add logic there; never import Phase N+1 symbols until those files exist.
- All filenames are lowercase with hyphens.
- `react` and `react-dom` are peer dependencies — never bundle them. External pattern in `vite.config.ts`: `['react', 'react-dom', 'react/jsx-runtime', /^react-dom\//]`.
- The `"use client"` banner is prepended to all output files by tsdown.
