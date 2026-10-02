import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { MasonryVirtual } from '../../components/masonry-virtual';
import type { MasonryRenderProps } from '../../types';

const items = [100, 180, 220, 140, 160];

function Card({ data }: MasonryRenderProps<number>) {
  return <article data-card={data}>{data}</article>;
}

function estimate(height: number) {
  return height;
}

describe('feed server output', () => {
  it('renders an explicit initial slice using per-item estimates and axis gaps', () => {
    const html = renderToString(
      <MasonryVirtual
        items={items}
        render={Card}
        columns={2}
        defaultWidth={420}
        rowGap={30}
        columnGap={20}
        estimatedItemHeight={estimate}
        initialItemCount={3}
      />,
    );
    expect(html.match(/data-card=/g)).toHaveLength(3);
    expect(html).toContain('top:130px');
    expect(html).toContain('width:200px');
    expect(html).toContain('inset-inline-start:220px');
  });

  it('retains the empty server default and sanitizes extra pinned indices', () => {
    const empty = renderToString(
      <MasonryVirtual
        items={items}
        render={Card}
        columns={2}
        defaultWidth={420}
      />,
    );
    expect(empty).not.toContain('data-card=');
    const pinned = renderToString(
      <MasonryVirtual
        items={items}
        render={Card}
        columns={2}
        defaultWidth={420}
        pinnedIndices={[4, 4, -1, 99, NaN, 0.5]}
        getItemHeight={estimate}
      />,
    );
    expect(pinned.match(/data-card=/g)).toHaveLength(1);
    expect(pinned).toContain('data-card="160"');
  });
});
