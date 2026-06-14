# masonix

React masonry components for responsive grids, measured layouts, and
virtualized feeds.

## Install

```bash
npm install masonix
```

```bash
pnpm add masonix
```

```bash
yarn add masonix
```

## Components

| Use case | Component | Import |
| --- | --- | --- |
| Simple responsive grids | `Masonry` | `masonix` |
| Variable-height balanced layouts | `MasonryBalanced` | `masonix` |
| Long virtualized feeds | `MasonryVirtual` | `masonix/virtual` |

## Docs

The full documentation site lives in `apps/docs` and includes guides, API
reference pages, live examples, and the interactive playground.

```bash
pnpm docs
```

```bash
pnpm docs:build
```

The playground is now part of the docs app at `/playground`.

## Development

```bash
pnpm install
pnpm test:run
pnpm build
pnpm size
```

Package-specific scripts can be run with pnpm filters:

```bash
pnpm -F masonix test:run
pnpm -F masonix-docs build
```
