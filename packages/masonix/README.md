# Masonix

Build React grids where photos, products, and stories can each have their own
height. Masonix arranges your cards into responsive columns and offers measured
balancing and virtualization as your collection grows.

You own the card markup and styling. Masonix handles column sizing, spacing, and
placement, with optional controls to keep the reader's place as content changes.
It supports React 18 and 19, includes TypeScript types, and needs no CSS import.

[Try the playground](https://masonix.vercel.app/playground) ·
[Read the guides](https://masonix.vercel.app/docs/guide/getting-started) ·
[Browse the API](https://masonix.vercel.app/docs/reference/common-props)

## Add Masonix to your app

```sh
npm install masonix
```

Or use `pnpm add masonix` or `yarn add masonix`. Your application must also have
`react` and `react-dom` installed.

## Your first gallery

Pass an array of items, a stable key, and a React component that renders a card.
The render component receives `data`, `index`, and the available `width`.

```tsx
import { Masonry, type MasonryRenderProps } from 'masonix';

type Photo = {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
};

function PhotoCard({ data }: MasonryRenderProps<Photo>) {
  return (
    <img
      src={data.src}
      alt={data.alt}
      width={data.width}
      height={data.height}
      loading="lazy"
      style={{ display: 'block', width: '100%', height: 'auto' }}
    />
  );
}

export function Gallery({ photos }: { photos: Photo[] }) {
  return (
    <Masonry
      items={photos}
      columns={{ 0: 1, 640: 2, 1024: 3 }}
      gap={16}
      itemKey={(photo) => photo.id}
      render={PhotoCard}
      aria-label="Photo gallery"
    />
  );
}
```

Breakpoint keys are minimum **container widths in pixels**. At 640 px, this grid
uses two columns; at 1024 px, it uses three.

Declare `PhotoCard` outside `Gallery`. The `render` prop takes a component type;
creating it inline can remount cards and reset their local state on parent renders.

## Choose how your grid lays out cards

| Component         | How it works                                                                     | Use it for                                        |
| ----------------- | -------------------------------------------------------------------------------- | ------------------------------------------------- |
| `Masonry`         | Distributes items across column wrappers without measuring each card by default. | Simple galleries and lightweight grids.           |
| `MasonryBalanced` | Measures cards and places each in the shortest column. Renders every item.       | Uneven card heights where visual balance matters. |
| `MasonryVirtual`  | Uses measured placement and mounts a window of items around the viewport.        | Large collections and scrolling feeds.            |

Import `Masonry` and `MasonryBalanced` from `masonix`. Import `MasonryVirtual`
from `masonix/virtual` so non-virtual grids do not pull in virtualization code.

[More about choosing a component](https://masonix.vercel.app/docs/guide/choosing-a-component)

## Fit the space available

Using `photos` and `PhotoCard` from above, let Masonix choose how many columns fit:

```tsx
<Masonry
  items={photos}
  columnWidth={260}
  maxColumns={5}
  rowGap={20}
  columnGap={{ 0: 12, 768: 24 }}
  itemKey={(photo) => photo.id}
  render={PhotoCard}
/>
```

`columnWidth` guides the column count; cards stretch to fill the available space.
`gap` sets both axes, while `rowGap` and `columnGap` override their respective axes.

## Balance cards with different heights

For uneven images, use `MasonryBalanced`. With known image dimensions, calculate
card height from the column width to skip the initial measurement wait:

```tsx
import { MasonryBalanced } from 'masonix';

<MasonryBalanced
  items={photos}
  columns={{ 0: 1, 640: 2, 1024: 3 }}
  gap={16}
  itemKey={(photo) => photo.id}
  getItemHeight={(photo, _index, columnWidth) =>
    columnWidth * (photo.height / photo.width)
  }
  render={PhotoCard}
/>;
```

This example reuses the image-only `PhotoCard` above. `getItemHeight` must account
for the entire rendered card, including any captions or padding you add.
For content with unknown heights, omit it and let Masonix measure the cards.

## Grow into a scrolling feed

`MasonryVirtual` scrolls with the window by default. This example accepts loaded
items and an application-owned loading callback:

```tsx
import { MasonryVirtual } from 'masonix/virtual';

type Post = {
  id: string;
  title: string;
  body: string;
};

function PostCard({ data }: { data: Post }) {
  return (
    <article>
      <h2>{data.title}</h2>
      <p>{data.body}</p>
    </article>
  );
}

export function Feed({
  posts,
  loadMore,
  hasMore,
  isLoading,
}: {
  posts: Post[];
  loadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
}) {
  function handleEndReached() {
    if (hasMore && !isLoading) {
      loadMore();
    }
  }

  return (
    <MasonryVirtual
      items={posts}
      columns={{ 0: 1, 720: 2, 1080: 3 }}
      gap={16}
      estimatedItemHeight={280}
      itemKey={(post) => post.id}
      render={PostCard}
      onEndReached={handleEndReached}
      endReachedThreshold={8}
      preserveScrollPosition
      aria-label="Latest posts"
    />
  );
}
```

Masonix handles layout and range detection; your application handles fetching,
loading state, and deduplicating requests. Choose an estimate close to typical
card height, or pass an `estimatedItemHeight` callback for per-item estimates.
For a scrolling panel, pass its element ref through `scrollContainer`.

[Virtual feed guide](https://masonix.vercel.app/docs/guide/virtual-feeds) ·
[Programmatic scrolling](https://masonix.vercel.app/docs/examples/programmatic-scroll)

## Keep changing feeds predictable

Use stable, unique `itemKey` values and update items immutably.

| Goal                                                            | Option                                                     | What to know                                                                                                  |
| --------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Keep the reader's place when items are prepended or resized     | `preserveScrollPosition` on balanced or virtual layouts    | Requires stable item keys. Disabled by default.                                                               |
| Keep cards in their columns as heights change                   | `layoutUpdates="stable"` on balanced or virtual layouts    | May leave columns less evenly balanced. Width changes still rebuild the layout.                               |
| Retain card state across responsive column changes in `Masonry` | `preserveItemState`                                        | Uses a measured flat layout and ignores `columnClassName` and `enableNative`. Choose this mode when mounting. |
| Keep selected virtual cards mounted                             | `pinnedIndices` or `rangeExtractor`                        | Keeping many cards mounted reduces virtualization's benefit.                                                  |
| Restore a virtual feed                                          | `scrollRef.current?.getSnapshot?.()` and `initialSnapshot` | Measurement reuse depends on matching column width; see the virtual API reference.                            |

Virtual cards normally unmount when they leave the rendered range. Keep durable
form or selection state outside the card component. A focused card stays mounted
while focus remains within it.

## Server rendering and Next.js

Use Masonix inside a Client Component in Next.js; place `'use client'` at the top
of the file that defines your gallery and render component.

- `defaultColumns` and `defaultWidth` describe the initial layout before the browser
  can measure the container. The layout can change after hydration.
- `MasonryVirtual` renders no cards on the server by default. Set `initialItemCount`
  to include a first slice; provide known heights for visible server-rendered cards.
- Known image dimensions help reserve space and reduce layout movement.

[SSR and Next.js guide](https://masonix.vercel.app/docs/guide/ssr-and-nextjs)

## Explore further

- [Common props](https://masonix.vercel.app/docs/reference/common-props): items,
  rendering, responsive sizing, spacing, and styling
- [Virtual props](https://masonix.vercel.app/docs/reference/virtual-props): scrolling,
  range callbacks, placeholders, and snapshots
- [Performance](https://masonix.vercel.app/docs/guide/performance): estimates,
  measurement, incremental updates, and virtualization tradeoffs
- [Accessibility](https://masonix.vercel.app/docs/guide/accessibility): semantics,
  reading order, focus, and item-count announcements
- [Playground](https://masonix.vercel.app/playground): try layouts with different
  column counts, spacing, and data
- [Changelog](https://github.com/niteshseram/masonix/blob/main/packages/masonix/CHANGELOG.md):
  release notes and version history

## License

[MIT](https://github.com/niteshseram/masonix/blob/main/LICENSE)
