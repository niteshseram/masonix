import { useEffect, useMemo, useRef } from 'react';

import { createPositioner } from '../core/positioner';
import {
  normalizeNonNegativeFinite,
  normalizePositiveFinite,
} from '../core/utils';
import type { PositionedItem } from '../types';

interface LayoutOptions<T> {
  items: T[];
  measurementIndexes: number[];
  measuredHeights: Map<number, number>;
  columnCount: number;
  columnWidth: number;
  columnGap: number;
  rowGap: number;
  estimatedItemHeight:
    | number
    | ((data: T, index: number, width: number) => number);
  getItemHeight?: (data: T, index: number, width: number) => number;
  layoutUpdates?: 'balanced' | 'stable';
}

type MeasuredItem = PositionedItem & { measured: boolean };

interface LayoutSnapshot {
  positionedItems: MeasuredItem[];
  identities: number[];
  configuration: number[];
}

export function useMasonryLayout<T>({
  items,
  measurementIndexes,
  measuredHeights,
  columnCount,
  columnWidth,
  columnGap,
  rowGap,
  estimatedItemHeight,
  getItemHeight,
  layoutUpdates,
}: LayoutOptions<T>) {
  const committedRef = useRef<LayoutSnapshot | null>(null);
  const layout = useMemo(() => {
    const previous = committedRef.current;
    const configuration = [columnCount, columnWidth, columnGap, rowGap];
    const compatible =
      previous !== null &&
      previous.configuration.every(
        (value, index) => value === configuration[index],
      );
    const heights = items.map((data, index) => {
      const estimate = normalizePositiveFinite(
        typeof estimatedItemHeight === 'function'
          ? estimatedItemHeight(data, index, columnWidth)
          : estimatedItemHeight,
        150,
      );
      const measuredHeight = measuredHeights.get(measurementIndexes[index]);
      return {
        height: getItemHeight
          ? normalizeNonNegativeFinite(
              getItemHeight(data, index, columnWidth),
              estimate,
            )
          : (measuredHeight ?? estimate),
        measured: getItemHeight !== undefined || measuredHeight !== undefined,
      };
    });
    const keepColumns = layoutUpdates === 'stable';
    let prefix = 0;
    if (compatible) {
      while (
        prefix < items.length &&
        prefix < previous.positionedItems.length &&
        previous.identities[prefix] === measurementIndexes[prefix]
      ) {
        if (
          !keepColumns &&
          previous.positionedItems[prefix].height !== heights[prefix].height
        ) {
          break;
        }
        prefix++;
      }
    }
    const seed = compatible ? previous.positionedItems.slice(0, prefix) : [];
    const positioner = createPositioner(
      { columnCount: Math.max(1, columnCount), columnWidth, columnGap, rowGap },
      layoutUpdates === 'stable' ? seed.map((item) => ({ ...item })) : seed,
    );
    if (layoutUpdates === 'stable') {
      const updates: Array<[number, number]> = [];
      for (let index = 0; index < prefix; index++) {
        if (seed[index].height !== heights[index].height) {
          updates.push([index, heights[index].height]);
        }
      }
      positioner.update(updates);
    }
    const positionedItems: MeasuredItem[] = heights.map(
      ({ height, measured }, index) => {
        const position =
          index < prefix
            ? positioner.get(index)!
            : positioner.set(index, height);
        return { ...position, measured };
      },
    );
    return {
      positionedItems,
      positioner,
      rangeIndex: positioner,
      containerHeight: positioner.tallestColumnHeight(),
      identities: measurementIndexes,
      configuration,
    };
  }, [
    items,
    measurementIndexes,
    measuredHeights,
    columnCount,
    columnWidth,
    columnGap,
    rowGap,
    estimatedItemHeight,
    getItemHeight,
    layoutUpdates,
  ]);
  useEffect(() => {
    committedRef.current = layout;
  }, [layout]);
  return layout;
}
