# masonix

The React masonry layout library that gets the fundamentals right — correct reading order, balanced columns, optional virtualization, SSR-ready, RTL-aware, Tailwind-compatible.

## Why another masonry library?

Every existing library has at least one of these problems:

| Problem                  | Example                                                                  |
| ------------------------ | ------------------------------------------------------------------------ |
| Wrong item order         | CSS column-fill puts items `1,4,2,5,3,6` instead of `1,2,3,4,5,6`        |
| Unbalanced columns       | Shortest-column-first breaks with lazy images and wrong height estimates |
| Always-on virtualization | Overhead even for small lists                                            |
| No SSR support           | Layout flash on hydration                                                |
| Unmaintained             | Most popular options haven't shipped a release since 2022                |

masonix solves all of these with a three-tier progressive enhancement model — use only what you need.

## Install

```bash
npm install masonix
# or
pnpm add masonix
```

Requires React 18 or 19.

## Components

### `Masonry` — CSS mode (~3 kB)

CSS-positioned layout — no item height measurement, no absolute positioning. Uses a `ResizeObserver` to track container width and compute column count, then distributes items into CSS flexbox columns round-robin. Item placement is handled entirely by the browser, preserving source order left-to-right, top-to-bottom.

```tsx
import { Masonry } from "masonix";

<Masonry
  items={photos}
  columns={{ 0: 1, 640: 2, 1024: 3, 1280: 4 }}
  className="gap-4"
  columnClassName="gap-4"
  render={({ data }) => <img src={data.src} alt={data.alt} className="w-full rounded-lg" />}
/>;
```

### `MasonryBalanced` — JS-measured mode

Measures rendered item heights via `ResizeObserver` and places each item in the shortest column. Items are absolutely positioned — no CSS columns. Handles lazy images, variable content, and resize.

```tsx
import { MasonryBalanced } from "masonix";

<MasonryBalanced
  items={posts}
  columns={{ 0: 1, 640: 2, 1024: 3, 1280: 4 }}
  gap={{ 0: 12, 640: 16, 1024: 24 }}
  render={({ data, width }) => <PostCard post={data} width={width} />}
/>;
```

Pass `getItemHeight` to skip two-phase measurement and enable zero-CLS SSR:

```tsx
<MasonryBalanced
  items={photos}
  columns={3}
  gap={16}
  getItemHeight={(photo, _, columnWidth) => columnWidth * (photo.height / photo.width)}
  render={({ data }) => <Photo photo={data} />}
/>
```

### `MasonryVirtual` — virtualized mode

Only renders items within the viewport. Handles 10,000+ items smoothly. Drops in as a replacement for `MasonryBalanced`.

```tsx
import { MasonryVirtual } from "masonix/virtual";

<MasonryVirtual
  items={photos}
  columns={3}
  gap={16}
  estimatedItemHeight={300}
  overscanBy={3}
  onLoadMore={(start, stop) => fetchMore(start, stop)}
  render={({ data }) => <Photo photo={data} />}
/>;
```

## Props

### Common props (`Masonry`, `MasonryBalanced`, `MasonryVirtual`)

| Prop              | Type                                    | Description                                       |
| ----------------- | --------------------------------------- | ------------------------------------------------- |
| `items`           | `T[]`                                   | Data array                                        |
| `render`          | `ComponentType<{ index, data, width }>` | Item renderer                                     |
| `columns`         | `number \| Record<number, number>`      | Fixed count or `{ minWidthPx: columns }` map      |
| `columnWidth`     | `number`                                | Auto-calculate column count from min column width |
| `maxColumns`      | `number`                                | Upper bound on column count                       |
| `gap`             | `number \| Record<number, number>`      | Fixed gap or `{ minWidthPx: gap }` map (px)       |
| `dir`             | `'ltr' \| 'rtl' \| 'auto'`              | Layout direction                                  |
| `defaultColumns`  | `number`                                | SSR fallback column count (default: 3)            |
| `defaultWidth`    | `number`                                | SSR fallback container width                      |
| `empty`           | `ReactNode`                             | Rendered when `items` is empty                    |
| `className`       | `string`                                | Container class                                   |
| `columnClassName` | `string`                                | Per-column class (CSS mode)                       |
| `itemClassName`   | `string`                                | Per-item wrapper class                            |
| `as`              | `ElementType`                           | Container element (default: `div`)                |
| `itemKey`         | `(data, index) => string \| number`     | Stable item keys                                  |

### `MasonryBalanced` additional props

| Prop                  | Type                                   | Description                                                |
| --------------------- | -------------------------------------- | ---------------------------------------------------------- |
| `getItemHeight`       | `(data, index, columnWidth) => number` | Pre-known height — skips measurement, enables zero-CLS SSR |
| `estimatedItemHeight` | `number`                               | Placeholder height before measurement                      |
| `getColumnSpan`       | `(data, index) => number`              | Multi-column item spanning                                 |
| `resizeDebounce`      | `number`                               | Height re-measure debounce in ms                           |

### `MasonryVirtual` additional props

| Prop              | Type                        | Description                                        |
| ----------------- | --------------------------- | -------------------------------------------------- |
| `overscanBy`      | `number`                    | Extra rows to render outside viewport (default: 3) |
| `scrollContainer` | `RefObject<HTMLElement>`    | Custom scroll container (default: window)          |
| `onLoadMore`      | `(start, stop) => void`     | Infinite scroll callback                           |
| `isItemLoaded`    | `(index) => boolean`        | Loaded state for infinite scroll                   |
| `totalItems`      | `number`                    | Known total for infinite scroll                    |
| `scrollRef`       | `Ref<MasonryVirtualHandle>` | Imperative scroll control                          |
| `onRangeChange`   | `(start, stop) => void`     | Fires when visible range changes                   |

## Responsive columns

Column count and gap both accept a plain number or a `Record<number, number>` where each key is a min-width threshold in pixels:

```tsx
// Numeric breakpoints — activates at each min-width threshold
columns={{ 0: 1, 600: 2, 900: 3, 1200: 4 }}
gap={{ 0: 8, 600: 12, 900: 16 }}

// Fixed
columns={3}
gap={16}

// Auto-calculate count from a minimum column width
columnWidth={240}
```

## Tailwind usage

masonix is styling-agnostic. Internal styles are layout-only; all visual styles come from your class names.

```tsx
// CSS mode: Tailwind-driven gaps
<Masonry
  items={items}
  columns={{ 0: 1, 640: 2, 1024: 3 }}
  className="gap-4 sm:gap-6"
  columnClassName="gap-4 sm:gap-6"
  render={({ data }) => <Card data={data} />}
/>

// Balanced mode: numeric gap required for JS math
<MasonryBalanced
  items={items}
  columns={3}
  gap={20}
  className="mx-auto max-w-6xl px-4"
  render={({ data }) => (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <Card data={data} />
    </div>
  )}
/>
```

## Bundle size

| Entry             | Target          |
| ----------------- | --------------- |
| `masonix`         | < 5 kB gzipped  |
| `masonix/virtual` | < 10 kB gzipped |

Two entry points keep the virtual layer (interval tree, scroll tracking) out of the main bundle. `"sideEffects": false` enables full tree-shaking.

## Development

```bash
pnpm install
pnpm test:run      # run all tests
pnpm build         # typecheck + build
pnpm playground    # start dev sandbox at localhost:3000
pnpm lint          # lint src/
pnpm format        # format src/
```

## License

MIT
