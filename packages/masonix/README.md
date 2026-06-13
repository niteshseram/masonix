<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/niteshseram/masonix/main/public/logo-dark.svg" />
    <img src="https://raw.githubusercontent.com/niteshseram/masonix/main/public/logo.svg" alt="masonix" height="52" />
  </picture>
</p>

<p align="center"><strong>React masonry components for responsive grids, measured layouts, and virtualized feeds.</strong></p>

---

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

`masonix` supports React 18 and React 19. It does not require a stylesheet.

## Choose a component

| Use case                                             | Component         | Import            |
| ---------------------------------------------------- | ----------------- | ----------------- |
| Simple responsive grids with no item measurement     | `Masonry`         | `masonix`         |
| Variable-height cards that should stay visually even | `MasonryBalanced` | `masonix`         |
| Long feeds where rendering every item is expensive   | `MasonryVirtual`  | `masonix/virtual` |

Start with `Masonry`. Use `MasonryBalanced` when item heights vary enough to
make columns look uneven. Use `MasonryVirtual` when the list is large enough
that rendering every item hurts scroll performance.

## Quick Start

```tsx
import { Masonry } from 'masonix';

type Photo = {
  id: string;
  src: string;
  alt: string;
};

export function Gallery({ photos }: { photos: Photo[] }) {
  return (
    <Masonry
      items={photos}
      columns={{ 0: 1, 640: 2, 1024: 3, 1280: 4 }}
      gap={16}
      itemKey={(photo) => photo.id}
      render={({ data }) => (
        <img src={data.src} alt={data.alt} className="w-full rounded-lg" />
      )}
    />
  );
}
```

## Balanced Columns

`MasonryBalanced` measures rendered item heights with `ResizeObserver` and
places each item in the shortest column. Use it for cards, lazy-loaded media,
and other layouts where uneven columns are distracting.

```tsx
import { MasonryBalanced } from 'masonix';

function BlogGrid({ posts }) {
  return (
    <MasonryBalanced
      items={posts}
      columns={{ 0: 1, 720: 2, 1080: 3 }}
      gap={24}
      itemKey={(post) => post.slug}
      render={({ data, width }) => <PostCard post={data} width={width} />}
    />
  );
}
```

If item heights are known ahead of time, pass `getItemHeight`. That lets
`masonix` compute the layout before measurement and reduces layout shift during
SSR and hydration.

```tsx
<MasonryBalanced
  items={photos}
  columns={3}
  gap={16}
  defaultWidth={960}
  getItemHeight={(photo, _index, columnWidth) =>
    Math.round(columnWidth * (photo.height / photo.width))
  }
  render={({ data }) => <PhotoCard photo={data} />}
/>
```

## Virtualized Feeds

`MasonryVirtual` renders the items near the viewport and leaves the rest out of
the DOM. It lives in a separate entry point so virtualization code is only
included when you import `masonix/virtual`.

```tsx
import { MasonryVirtual } from 'masonix/virtual';

function Feed({ items }) {
  return (
    <MasonryVirtual
      items={items}
      columns={{ 0: 1, 720: 2, 1080: 3 }}
      gap={16}
      estimatedItemHeight={280}
      overscanBy={3}
      render={({ data }) => <FeedCard item={data} />}
    />
  );
}
```

Use `onRangeChange` for infinite loading:

```tsx
<MasonryVirtual
  items={items}
  columns={3}
  gap={16}
  estimatedItemHeight={300}
  onRangeChange={(_startIndex, stopIndex) => {
    if (stopIndex >= items.length - 10) {
      loadMore();
    }
  }}
  render={({ data }) => <Card data={data} />}
/>
```

Use `scrollRef` when you need imperative scrolling:

```tsx
import { useRef } from 'react';
import { MasonryVirtual, type MasonryVirtualHandle } from 'masonix/virtual';

function Feed({ items }) {
  const scrollRef = useRef<MasonryVirtualHandle>(null);

  return (
    <>
      <button
        onClick={() =>
          scrollRef.current?.scrollToIndex(0, {
            align: 'start',
            smooth: true,
          })
        }
      >
        Back to top
      </button>
      <MasonryVirtual
        scrollRef={scrollRef}
        items={items}
        columns={3}
        gap={16}
        estimatedItemHeight={300}
        render={({ data }) => <Card data={data} />}
      />
    </>
  );
}
```

## Responsive Values

`columns` and `gap` accept a fixed number or a breakpoint map. Breakpoint keys
are minimum container widths in pixels.

```tsx
<Masonry
  items={items}
  columns={{ 0: 1, 640: 2, 1024: 3, 1280: 4 }}
  gap={{ 0: 8, 640: 12, 1024: 16 }}
  render={({ data }) => <Card data={data} />}
/>
```

You can also let `masonix` compute the column count from a minimum column width:

```tsx
<Masonry
  items={items}
  columnWidth={280}
  maxColumns={5}
  gap={16}
  render={({ data }) => <Card data={data} />}
/>
```

## SSR

All components can render on the server. `defaultColumns` and `defaultWidth`
are used for the first render, then the layout updates after the browser
measures the container.

```tsx
<MasonryBalanced
  items={posts}
  columns={{ 0: 1, 768: 2, 1200: 3 }}
  defaultColumns={3}
  defaultWidth={1200}
  gap={24}
  render={({ data }) => <PostCard post={data} />}
/>
```

For image grids, combine `defaultWidth` with `getItemHeight` when image
dimensions are already available.

## Styling

`masonix` only handles layout. Bring your own card components, class names, and
inline styles.

```tsx
<MasonryBalanced
  items={items}
  columns={3}
  gap={20}
  className="mx-auto max-w-6xl px-4"
  itemClassName="overflow-hidden rounded-xl shadow-sm"
  render={({ data }) => <Card data={data} />}
/>
```

For `MasonryBalanced` and `MasonryVirtual`, use numeric `gap` values because the
gap is part of the layout calculation.

## Semantic Markup

Use `as`, `itemAs`, `role`, and `aria-label` when the masonry should render as a
list, section, article grid, or another semantic structure.

```tsx
<Masonry
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

## API Reference

### Common Props

These props are available on `Masonry`, `MasonryBalanced`, and
`MasonryVirtual`.

| Prop             | Type                                           | Default  | Description                                       |
| ---------------- | ---------------------------------------------- | -------- | ------------------------------------------------- |
| `items`          | `T[]`                                          | required | Items to render.                                  |
| `render`         | `ComponentType<{ index, data, width }>`        | required | Item renderer.                                    |
| `columns`        | `number \| Record<number, number>`             | -        | Fixed column count or responsive column map.      |
| `columnWidth`    | `number`                                       | -        | Minimum column width for automatic column counts. |
| `maxColumns`     | `number`                                       | -        | Maximum columns when using `columnWidth`.         |
| `gap`            | `number \| Record<number, number>`             | `0`      | Row and column gap in px.                         |
| `defaultColumns` | `number`                                       | `3`      | Column count used before measurement.             |
| `defaultWidth`   | `number`                                       | -        | Container width used before measurement.          |
| `className`      | `string`                                       | -        | Class name for the outer container.               |
| `style`          | `CSSProperties`                                | -        | Inline style for the outer container.             |
| `itemClassName`  | `string`                                       | -        | Class name for each item wrapper.                 |
| `as`             | `ElementType`                                  | `"div"`  | Outer container element.                          |
| `itemAs`         | `ElementType`                                  | `"div"`  | Item wrapper element.                             |
| `itemKey`        | `(data: T, index: number) => string \| number` | -        | Stable React key extractor.                       |
| `role`           | `"grid" \| "list" \| "none"`                   | `"list"` | ARIA role.                                        |
| `aria-label`     | `string`                                       | -        | ARIA label.                                       |
| `ref`            | `Ref<HTMLElement>`                             | -        | Ref for the outer container.                      |

### Masonry

| Prop              | Type      | Description                                          |
| ----------------- | --------- | ---------------------------------------------------- |
| `columnClassName` | `string`  | Class name for each CSS-mode column wrapper.         |
| `enableNative`    | `boolean` | Use native CSS masonry when the browser supports it. |

### MasonryBalanced

| Prop                  | Type                                                      | Default | Description                                      |
| --------------------- | --------------------------------------------------------- | ------- | ------------------------------------------------ |
| `getItemHeight`       | `(data: T, index: number, columnWidth: number) => number` | -       | Return a known item height and skip measurement. |
| `estimatedItemHeight` | `number`                                                  | `150`   | Placeholder height before measurement.           |
| `minItemHeight`       | `number`                                                  | -       | Clamp measured heights to at least this value.   |

### MasonryVirtual

`MasonryVirtual` also accepts `getItemHeight` and `minItemHeight` from
`MasonryBalanced`.

| Prop                  | Type                                              | Default  | Description                                                         |
| --------------------- | ------------------------------------------------- | -------- | ------------------------------------------------------------------- |
| `estimatedItemHeight` | `number`                                          | `150`    | Height estimate for unrendered items and initial layout.            |
| `overscanBy`          | `number`                                          | `2`      | Extra viewport-heights to render above and below the visible range. |
| `scrollContainer`     | `RefObject<HTMLElement \| null>`                  | `window` | Custom scroll container.                                            |
| `totalItems`          | `number`                                          | -        | Total item count for accessibility metadata.                        |
| `scrollRef`           | `Ref<MasonryVirtualHandle>`                       | -        | Imperative scroll handle.                                           |
| `onRangeChange`       | `(startIndex: number, stopIndex: number) => void` | -        | Called when the visible item range changes.                         |

## TypeScript

Components are generic over your item type.

```tsx
type Photo = {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
};

<MasonryBalanced<Photo>
  items={photos}
  columns={3}
  gap={16}
  render={({ data }) => <img src={data.src} alt={data.alt} />}
/>;
```

Common types are exported from both entry points.

```ts
import type {
  MasonryBalancedProps,
  MasonryProps,
  MasonryRenderProps,
  PositionedItem,
  Positioner,
  ResponsiveValue,
} from 'masonix';

import type {
  MasonryVirtualHandle,
  MasonryVirtualProps,
} from 'masonix/virtual';
```
