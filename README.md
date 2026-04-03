<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/niteshseram/masonix/main/brand/logo-dark.svg" />
    <img src="https://raw.githubusercontent.com/niteshseram/masonix/main/brand/logo.svg" alt="masonix" height="52" />
  </picture>
</p>

<p align="center"><strong>The React masonry layout library that gets the fundamentals right.</strong></p>

Correct reading order. Balanced columns. Optional virtualization. SSR-ready. Tailwind-compatible

---

## Why masonix?

Every popular masonry library has at least one of these problems:

| Problem                       | Root cause                                                                      |
| ----------------------------- | ------------------------------------------------------------------------------- |
| **Wrong reading order**       | CSS `column-fill` places items `1, 4, 2, 5, 3, 6` instead of `1, 2, 3, 4, 5, 6` |
| **Unbalanced columns**        | Height guesses break shortest-column-first; lazy images make it worse           |
| **Always-on virtualization**  | Overhead even for 20-item galleries                                             |
| **Layout flash on hydration** | No SSR fallback or pre-known heights                                            |
| **Unmaintained**              | Most popular options haven't shipped a release since 2022                       |

masonix solves all of these with a **three-tier progressive enhancement model** — use only what your use case needs.

---

## Pick the right component

|                         |          `Masonry`          |     `MasonryBalanced`      |        `MasonryVirtual`        |
| ----------------------- | :-------------------------: | :------------------------: | :----------------------------: |
| Layout engine           |         CSS flexbox         |       JS positioner        | JS positioner + virtualization |
| Item height measurement |    None (browser-native)    |       ResizeObserver       |         ResizeObserver         |
| Absolute positioning    |             No              |            Yes             |              Yes               |
| Handles lazy images     |             No              |            Yes             |              Yes               |
| Correct reading order   |             Yes             |            Yes             |              Yes               |
| SSR with zero CLS       | Yes (with `defaultColumns`) | Yes (with `getItemHeight`) |   Yes (with `getItemHeight`)   |
| 10,000+ items           |             No              |             No             |            **Yes**             |
| Bundle size             |            ~3 kB            |           ~5 kB            |             ~10 kB             |
| Import                  |          `masonix`          |         `masonix`          |       `masonix/virtual`        |

**Decision guide:**

- Static or known-height images → **`Masonry`**
- Variable-height cards (blog posts, user content) → **`MasonryBalanced`**
- Large datasets, infinite feeds, 1000+ items → **`MasonryVirtual`**

---

## Installation

```bash
npm install masonix
# or
pnpm add masonix
# or
yarn add masonix
```

Requires **React 18 or 19** as a peer dependency.

---

## Quick start

### `Masonry` — CSS mode

Zero JS measurement. Items are distributed into flexbox columns round-robin (1→col0, 2→col1, 3→col2, 4→col0, …), preserving left-to-right, top-to-bottom reading order.

```tsx
import { Masonry } from "masonix";

function Gallery({ photos }) {
  return (
    <Masonry
      items={photos}
      columns={{ 0: 1, 640: 2, 1024: 3, 1280: 4 }}
      gap={16}
      render={({ data }) => <img src={data.src} alt={data.alt} className="w-full rounded-lg" />}
    />
  );
}
```

### `MasonryBalanced` — JS-measured mode

Measures rendered item heights via `ResizeObserver` and places each item into the shortest column. Handles lazy images, variable-height content, and container resize automatically.

```tsx
import { MasonryBalanced } from "masonix";

function Blog({ posts }) {
  return (
    <MasonryBalanced
      items={posts}
      columns={{ 0: 1, 640: 2, 1024: 3 }}
      gap={24}
      render={({ data, width }) => <PostCard post={data} width={width} />}
    />
  );
}
```

#### Zero-CLS with pre-known heights

If you can compute item height ahead of time (e.g. from image aspect ratios), pass `getItemHeight` to skip two-phase measurement entirely. This enables **zero layout shift** on SSR.

```tsx
<MasonryBalanced
  items={photos}
  columns={3}
  gap={16}
  getItemHeight={(photo, _index, columnWidth) => columnWidth * (photo.height / photo.width)}
  render={({ data }) => <Photo photo={data} />}
/>
```

### `MasonryVirtual` — virtualized mode

Renders only items within the viewport. Built for 10,000+ item feeds. Drop-in replacement for `MasonryBalanced`.

```tsx
import { MasonryVirtual } from "masonix/virtual";

function Feed({ items }) {
  return (
    <MasonryVirtual
      items={items}
      columns={3}
      gap={16}
      estimatedItemHeight={300}
      overscanBy={3}
      render={({ data }) => <Card data={data} />}
    />
  );
}
```

> **Why a separate import?** `masonix/virtual` includes the interval tree and scroll tracking code. Keeping it separate ensures these never land in your main bundle unless you use them.

---

## Props reference

### Common props (all three components)

| Prop              | Type                                           | Default  | Description                                                                        |
| ----------------- | ---------------------------------------------- | -------- | ---------------------------------------------------------------------------------- |
| `items`           | `T[]`                                          | required | Data array. Generic — works with any shape.                                        |
| `render`          | `ComponentType<{ index, data, width }>`        | required | Item renderer. `width` is the computed column width in px.                         |
| `columns`         | `number \| Record<number, number>`             | —        | Fixed column count or responsive map `{ minWidthPx: count }`.                      |
| `columnWidth`     | `number`                                       | —        | Auto-compute column count from a minimum column width in px.                       |
| `maxColumns`      | `number`                                       | —        | Upper bound when using `columnWidth`.                                              |
| `gap`             | `number \| Record<number, number>`             | `0`      | Row and column gap in px. Accepts a responsive map.                                |
| `defaultColumns`  | `number`                                       | `3`      | Column count used during SSR before the container is measured.                     |
| `defaultWidth`    | `number`                                       | —        | Container width used during SSR. Set to your expected width to avoid layout shift. |
| `className`       | `string`                                       | —        | CSS class on the outer container.                                                  |
| `style`           | `CSSProperties`                                | —        | Inline styles on the outer container.                                              |
| `columnClassName` | `string`                                       | —        | CSS class on each column wrapper (`Masonry` only).                                 |
| `itemClassName`   | `string`                                       | —        | CSS class on each item wrapper.                                                    |
| `as`              | `ElementType`                                  | `"div"`  | Override the container element type.                                               |
| `itemAs`          | `ElementType`                                  | `"div"`  | Override the item wrapper element type (e.g. `"article"`, `"li"`).                 |
| `itemKey`         | `(data: T, index: number) => string \| number` | —        | Stable React key extractor. Recommended when items can be reordered.               |
| `role`            | `"grid" \| "list" \| "none"`                   | `"list"` | ARIA role on the container. Pass `"none"` to suppress.                             |
| `aria-label`      | `string`                                       | —        | ARIA label on the container.                                                       |
| `ref`             | `Ref<HTMLElement>`                             | —        | Forwarded ref to the container element.                                            |

### `MasonryBalanced` additional props

| Prop                  | Type                                                      | Default | Description                                                                              |
| --------------------- | --------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------- |
| `getItemHeight`       | `(data: T, index: number, columnWidth: number) => number` | —       | Pre-compute item height to skip ResizeObserver measurement. Enables zero-CLS SSR.        |
| `estimatedItemHeight` | `number`                                                  | `150`   | Placeholder height (px) used before a item is measured. Items are hidden until measured. |
| `minItemHeight`       | `number`                                                  | —       | Clamp all measured heights to at least this value.                                       |
| `getColumnSpan`       | `(data: T, index: number) => number`                      | —       | Return a span count to have an item stretch across multiple columns.                     |

### `MasonryVirtual` additional props

| Prop                  | Type                                              | Default | Description                                                                                       |
| --------------------- | ------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------- |
| `estimatedItemHeight` | `number`                                          | `150`   | Placeholder height for unrendered items. More accurate estimates improve initial scroll position. |
| `overscanBy`          | `number`                                          | `2`     | Number of extra viewport-heights to render above and below the visible area.                      |
| `scrollContainer`     | `RefObject<HTMLElement \| null>`                  | —       | Custom scroll container. Defaults to `window`. Use when the masonry sits inside a scrollable div. |
| `totalItems`          | `number`                                          | —       | Total item count for `aria-setsize` (useful when items are loaded in pages).                      |
| `scrollRef`           | `Ref<MasonryVirtualHandle>`                       | —       | Ref to gain imperative scroll control (see [scrollToIndex](#scrolltoindex)).                      |
| `onRangeChange`       | `(startIndex: number, stopIndex: number) => void` | —       | Called when the visible index range changes. Use this to implement infinite scroll.               |

---

## Responsive values

Both `columns` and `gap` accept a plain number **or** a breakpoint map where each key is a **minimum container width in pixels**:

```tsx
// Activates at each threshold — similar to Tailwind breakpoints
columns={{ 0: 1, 640: 2, 1024: 3, 1280: 4 }}
gap={{ 0: 8, 640: 12, 1024: 16 }}

// Fixed value
columns={3}
gap={16}

// Auto-compute count from a minimum column width
// e.g. a 1200px container with columnWidth=280 → 4 columns
columnWidth={280}
maxColumns={5}
```

---

## SSR / Next.js

All three components render on the server using `defaultColumns` and `defaultWidth` as fallbacks. Since the container hasn't been measured yet, the initial render uses these values.

```tsx
// Next.js example — avoids column count mismatch on hydration
<MasonryBalanced
  items={posts}
  columns={{ 0: 1, 768: 2, 1200: 3 }}
  defaultColumns={3}
  defaultWidth={1200}
  gap={24}
  render={({ data }) => <PostCard post={data} />}
/>
```

For **zero CLS** on image-heavy pages, provide `getItemHeight`:

```tsx
// Known aspect ratios → no layout shift, no measurement phase
<MasonryBalanced
  items={photos}
  columns={3}
  gap={16}
  defaultWidth={900}
  getItemHeight={(photo, _index, columnWidth) =>
    Math.round(columnWidth * (photo.naturalHeight / photo.naturalWidth))
  }
  render={({ data }) => <Photo photo={data} />}
/>
```

---

## Column spanning

`MasonryBalanced` and `MasonryVirtual` support items that span multiple columns:

```tsx
<MasonryBalanced
  items={items}
  columns={4}
  gap={16}
  getColumnSpan={(data, index) => {
    // Make every 5th item a full-width banner
    if (index % 5 === 0) return 4;
    return 1;
  }}
  render={({ data, width }) => <Card data={data} width={width} />}
/>
```

---

## Infinite scroll

Use `onRangeChange` on `MasonryVirtual` to load more items when the user approaches the bottom of the list:

```tsx
const [items, setItems] = useState(initialItems);
const [isLoading, setIsLoading] = useState(false);

async function loadMore() {
  if (isLoading) return;
  setIsLoading(true);
  const next = await fetchNextPage();
  setItems((prev) => [...prev, ...next]);
  setIsLoading(false);
}

<MasonryVirtual
  items={items}
  columns={3}
  gap={16}
  estimatedItemHeight={300}
  onRangeChange={(startIndex, stopIndex) => {
    if (stopIndex >= items.length - 10 && !isLoading) {
      loadMore();
    }
  }}
  render={({ data }) => <Card data={data} />}
/>;
```

---

## Scroll to index

Use `scrollRef` to programmatically scroll to any item:

```tsx
import { useRef } from "react";
import { MasonryVirtual, type MasonryVirtualHandle } from "masonix/virtual";

function Feed({ items }) {
  const scrollRef = useRef<MasonryVirtualHandle>(null);

  return (
    <>
      <button onClick={() => scrollRef.current?.scrollToIndex(0, { align: "start", smooth: true })}>
        Back to top
      </button>
      <MasonryVirtual
        items={items}
        columns={3}
        gap={16}
        estimatedItemHeight={300}
        scrollRef={scrollRef}
        render={({ data }) => <Card data={data} />}
      />
    </>
  );
}
```

**`scrollToIndex(index, options?)`**

| Option   | Values                         | Default   | Description                              |
| -------- | ------------------------------ | --------- | ---------------------------------------- |
| `align`  | `"start" \| "center" \| "end"` | `"start"` | Where to align the item in the viewport. |
| `smooth` | `boolean`                      | `false`   | Use smooth scrolling.                    |

---

## Custom scroll container

By default `MasonryVirtual` tracks the `window` scroll. To use a scrollable div instead:

```tsx
const containerRef = useRef<HTMLDivElement>(null);

<div ref={containerRef} style={{ height: "100vh", overflow: "auto" }}>
  <MasonryVirtual
    items={items}
    columns={3}
    gap={16}
    estimatedItemHeight={300}
    scrollContainer={containerRef}
    render={({ data }) => <Card data={data} />}
  />
</div>;
```

---

## Semantic HTML

Use `itemAs` and `as` to produce meaningful markup:

```tsx
<MasonryBalanced
  items={articles}
  columns={3}
  gap={24}
  as="ul"
  itemAs="li"
  role="list"
  aria-label="Latest articles"
  render={({ data }) => <ArticleCard article={data} />}
/>
```

---

## Tailwind usage

masonix applies only structural styles. All visual styles come from your class names and render function.

```tsx
// CSS mode — Tailwind gaps via className
<Masonry
  items={items}
  columns={{ 0: 1, 640: 2, 1024: 3 }}
  className="p-4"
  columnClassName="gap-4"
  itemClassName="overflow-hidden rounded-xl"
  render={({ data }) => <Card data={data} />}
/>

// Balanced mode — gap must be numeric (used in JS math)
<MasonryBalanced
  items={items}
  columns={3}
  gap={20}
  className="mx-auto max-w-6xl px-4"
  itemClassName="overflow-hidden rounded-xl shadow-sm"
  render={({ data }) => (
    <div className="bg-white p-4">
      <Card data={data} />
    </div>
  )}
/>
```

> **Note:** In `MasonryBalanced` and `MasonryVirtual`, row and column gaps are applied via inline styles since they participate in the JS layout math. Use `gap` (numeric) rather than Tailwind gap classes for these components.

---

## Native CSS masonry (experimental)

`Masonry` supports the upcoming `grid-template-rows: masonry` CSS spec via the `enableNative` prop. When the browser supports it, the component switches from flexbox columns to a native CSS grid — no JS layout at all.

```tsx
<Masonry
  items={items}
  columns={3}
  gap={16}
  enableNative
  render={({ data }) => <Card data={data} />}
/>
```

The component gracefully falls back to flexbox columns in unsupported browsers. As of 2025, native masonry is available behind a flag in Chrome and enabled by default in Firefox.

---

## TypeScript

All types are exported from both entry points:

```ts
// From masonix
import type {
  MasonryProps,
  MasonryBalancedProps,
  MasonryRenderProps,
  ResponsiveValue,
  PositionedItem,
  Positioner,
} from "masonix";

// From masonix/virtual
import type { MasonryVirtualProps, MasonryVirtualHandle } from "masonix/virtual";
```

All components are fully generic over your item type:

```ts
interface Photo {
  id: string;
  src: string;
  width: number;
  height: number;
}

// render receives { data: Photo, index: number, width: number }
<MasonryBalanced<Photo>
  items={photos}
  columns={3}
  gap={16}
  render={({ data }) => <img src={data.src} alt={`Photo ${data.id}`} />}
/>
```

---

## Bundle size

| Entry point       | Gzipped |
| ----------------- | ------- |
| `masonix`         | < 5 kB  |
| `masonix/virtual` | < 10 kB |

Two separate entry points ensure the interval tree, scroll tracking, and virtualization code are never included in your bundle unless you import from `masonix/virtual`. `"sideEffects": false` enables full tree-shaking.

Both ESM and CJS builds are provided. The `"use client"` directive is included for React Server Components compatibility.

---

## Development

```bash
pnpm install
pnpm test:run       # run all tests once
pnpm test           # watch mode
pnpm test:coverage  # coverage report
pnpm build          # typecheck + build dist/
pnpm playground     # dev sandbox at localhost:3000
pnpm lint           # lint src/
pnpm format         # format src/
```

Run a single test file:

```bash
pnpm vp test src/__tests__/core/positioner.test.ts
```

---

## License

MIT
