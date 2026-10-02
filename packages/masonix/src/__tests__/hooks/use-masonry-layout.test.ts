import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { createPositioner } from '../../core/positioner';
import { useMasonryLayout } from '../../hooks/use-masonry-layout';

function getItemHeight(height: number) {
  return height;
}

const emptyMeasurements = new Map<number, number>();

function useFixture(items: number[], stable = false) {
  return useMasonryLayout({
    items,
    measurementIndexes: items.map((_, index) => index),
    measuredHeights: emptyMeasurements,
    columnCount: 3,
    columnWidth: 100,
    columnGap: 10,
    rowGap: 20,
    estimatedItemHeight: 150,
    getItemHeight,
    layoutUpdates: stable ? 'stable' : 'balanced',
  });
}

describe('incremental masonry layout', () => {
  it('matches a fresh layout after append, changed heights, and deletion', () => {
    const { result, rerender } = renderHook(({ items }) => useFixture(items), {
      initialProps: { items: [100, 200, 300, 140] },
    });
    for (const items of [
      [100, 200, 300, 140, 90, 240],
      [400, 200, 300, 140, 90, 240],
      [400, 200],
    ]) {
      const before = result.current.positionedItems.map((item) => ({
        ...item,
      }));
      const previous = result.current;
      rerender({ items });
      const expected = createPositioner({
        columnCount: 3,
        columnWidth: 100,
        columnGap: 10,
        rowGap: 20,
      });
      items.forEach((height, index) => expected.set(index, height));
      expect(
        result.current.positionedItems.map(
          ({ measured: _measured, ...item }) => item,
        ),
      ).toEqual(expected.all());
      expect(previous.positionedItems).toEqual(before);
      const hits: number[] = [];
      result.current.rangeIndex.search(100, 350, (index) => hits.push(index));
      hits.sort((first, second) => first - second);
      expect(hits).toEqual(
        expected
          .all()
          .filter((item) => item.top <= 350 && item.top + item.height >= 100)
          .map((item) => item.index),
      );
    }
  });

  it('keeps columns stable without mutating the previously committed layout', () => {
    const { result, rerender } = renderHook(
      ({ items }) => useFixture(items, true),
      {
        initialProps: { items: [100, 200, 300, 100, 100, 100] },
      },
    );
    const previous = result.current;
    const before = previous.positionedItems.map((item) => ({ ...item }));
    rerender({ items: [500, 200, 300, 100, 100, 100] });
    expect(result.current.positionedItems.map((item) => item.column)).toEqual(
      before.map((item) => item.column),
    );
    expect(result.current.positioner.get(3)?.top).toBe(520);
    expect(previous.positionedItems).toEqual(before);
    expect(previous.positioner.get(3)?.top).toBe(120);
  });
});
