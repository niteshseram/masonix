<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/niteshseram/masonix/main/public/logo-dark.svg" />
    <img src="https://raw.githubusercontent.com/niteshseram/masonix/main/public/logo.svg" alt="masonix" height="52" />
  </picture>
</p>

<p align="center"><strong>React masonry components for responsive grids, measured layouts, and virtualized feeds.</strong></p>

<p align="center">
  <a href="https://masonix.vercel.app">Website</a>
  ·
  <a href="https://masonix.vercel.app/docs/guide/getting-started">Docs</a>
  ·
  <a href="https://masonix.vercel.app/playground">Playground</a>
</p>

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

Masonix supports React 18 and React 19. It does not require a stylesheet.

## Quick start

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

## Choose a component

| Use case                                           | Component         | Import            |
| -------------------------------------------------- | ----------------- | ----------------- |
| Simple responsive grids                            | `Masonry`         | `masonix`         |
| Variable-height cards that should visually balance | `MasonryBalanced` | `masonix`         |
| Long feeds and infinite lists                      | `MasonryVirtual`  | `masonix/virtual` |

Start with `Masonry`. Move to `MasonryBalanced` when rendered card heights matter.
Use `MasonryVirtual` when DOM size or scroll performance matters.

## Virtual feeds

```tsx
import { MasonryVirtual } from 'masonix/virtual';

type FeedItem = {
  id: string;
  title: string;
};

export function Feed({
  items,
  loadMore,
}: {
  items: FeedItem[];
  loadMore: () => void;
}) {
  return (
    <MasonryVirtual
      items={items}
      columns={{ 0: 1, 720: 2, 1080: 3 }}
      gap={16}
      estimatedItemHeight={280}
      endReachedThreshold={8}
      onEndReached={loadMore}
      itemKey={(item) => item.id}
      render={({ data }) => <article>{data.title}</article>}
    />
  );
}
```

## Documentation

- Website: https://masonix.vercel.app
- Getting started: https://masonix.vercel.app/docs/guide/getting-started
- API reference: https://masonix.vercel.app/docs/reference/common-props
- Playground: https://masonix.vercel.app/playground

## TypeScript

Components are generic over your item type, and common prop/handle types are
exported from the package entry points.

```ts
import type { MasonryRenderProps, MasonryBalancedProps } from 'masonix';

import type {
  MasonryVirtualHandle,
  MasonryVirtualRange,
} from 'masonix/virtual';
```
