import type { PositionedItem, Positioner } from '../types';
import { normalizeNonNegativeFinite, normalizePositiveInteger } from './utils';

export interface PositionerOptions {
  columnCount: number;
  columnWidth: number;
  columnGap?: number;
  rowGap?: number;
}

/**
 * Shortest-column-first positioner.
 *
 * Each new item is placed in the column with the minimum current height,
 * ensuring visually balanced columns.
 */
export function createPositioner(
  options: PositionerOptions,
  initialItems: readonly PositionedItem[] = [],
): Positioner & {
  search: (
    low: number,
    high: number,
    callback: (index: number) => void,
  ) => void;
} {
  const columnCount = normalizePositiveInteger(options.columnCount, 1);
  const columnWidth = normalizeNonNegativeFinite(options.columnWidth);
  const columnGap = normalizeNonNegativeFinite(options.columnGap ?? 0);
  const rowGap = normalizeNonNegativeFinite(options.rowGap ?? 0);

  const columnHeights = new Float64Array(columnCount);
  const items: Array<PositionedItem | undefined> = [];
  // columnItems[col] = ordered list of item indices placed in that column
  const columnItems: number[][] = Array.from({ length: columnCount }, () => []);
  let placedCount = 0;
  for (const item of initialItems) {
    items[item.index] = item;
    columnItems[item.column].push(item.index);
    columnHeights[item.column] = item.top + item.height + rowGap;
    placedCount++;
  }

  function search(
    low: number,
    high: number,
    callback: (index: number) => void,
  ): void {
    for (const indices of columnItems) {
      let start = 0;
      let end = indices.length;
      while (start < end) {
        const middle = Math.floor((start + end) / 2);
        const item = items[indices[middle]]!;
        if (item.top + item.height < low) {
          start = middle + 1;
        } else {
          end = middle;
        }
      }
      for (let offset = start; offset < indices.length; offset++) {
        const item = items[indices[offset]]!;
        if (item.top > high) {
          break;
        }
        callback(item.index);
      }
    }
  }

  function computeLeft(column: number): number {
    return column * (columnWidth + columnGap);
  }

  function set(index: number, height: number): PositionedItem {
    if (!Number.isInteger(index) || index < 0) {
      throw new RangeError(
        'Positioner item index must be a non-negative integer.',
      );
    }

    const existingItem = items[index];
    if (existingItem) {
      update([[index, height]]);
      return existingItem;
    }

    const column = shortestColumn();
    const top = columnHeights[column];
    const left = computeLeft(column);
    const normalizedHeight = normalizeNonNegativeFinite(height);

    columnHeights[column] = top + normalizedHeight + rowGap;
    columnItems[column].push(index);

    const item: PositionedItem = {
      index,
      top,
      left,
      width: columnWidth,
      height: normalizedHeight,
      column,
    };
    items[index] = item;
    placedCount++;
    return item;
  }

  function get(index: number): PositionedItem | undefined {
    return items[index];
  }

  function update(updates: Array<[number, number]>): PositionedItem[] {
    const affectedColumns = new Set<number>();
    for (const [index, requestedHeight] of updates) {
      const item = items[index];
      const newHeight = normalizeNonNegativeFinite(requestedHeight);
      if (item && item.height !== newHeight) {
        item.height = newHeight;
        affectedColumns.add(item.column);
      }
    }

    const updated: PositionedItem[] = [];

    for (const column of affectedColumns) {
      let top = 0;
      for (const index of columnItems[column]) {
        const item = items[index]!;
        item.top = top;
        top += item.height + rowGap;
        updated.push(item);
      }
      columnHeights[column] = top;
    }

    return updated;
  }

  function getColumnHeights(): number[] {
    return Array.from(columnHeights, (height, column) =>
      columnItems[column].length > 0 ? Math.max(0, height - rowGap) : 0,
    );
  }

  function shortestColumn(): number {
    let minColIndex = 0;
    for (let colIndex = 1; colIndex < columnCount; colIndex++) {
      if (columnHeights[colIndex] < columnHeights[minColIndex]) {
        minColIndex = colIndex;
      }
    }
    return minColIndex;
  }

  function tallestColumnHeight(): number {
    let max = 0;
    for (let colIndex = 0; colIndex < columnCount; colIndex++) {
      const contentHeight =
        columnItems[colIndex].length > 0
          ? Math.max(0, columnHeights[colIndex] - rowGap)
          : 0;
      if (contentHeight > max) {
        max = contentHeight;
      }
    }
    return max;
  }

  function estimateHeight(totalItems: number, defaultHeight: number): number {
    const normalizedTotalItems = Math.max(
      0,
      Math.floor(normalizeNonNegativeFinite(totalItems)),
    );
    const normalizedDefaultHeight = normalizeNonNegativeFinite(defaultHeight);
    const placed = placedCount;
    if (placed === 0) {
      const rows = Math.ceil(normalizedTotalItems / columnCount);
      return rows * normalizedDefaultHeight + Math.max(0, rows - 1) * rowGap;
    }
    const tallestHeight = tallestColumnHeight();
    if (normalizedTotalItems <= placed) {
      return tallestHeight;
    }
    const totalPlacedHeight = items.reduce(
      (sum, item) => sum + (item?.height ?? 0),
      0,
    );
    const averageItemHeight = totalPlacedHeight / placed;
    const remainingRows = Math.ceil(
      (normalizedTotalItems - placed) / columnCount,
    );
    return tallestHeight + remainingRows * (averageItemHeight + rowGap);
  }

  function size(): number {
    return placedCount;
  }

  function all(): PositionedItem[] {
    return items.filter((item): item is PositionedItem => item !== undefined);
  }

  function clear(): void {
    columnHeights.fill(0);
    items.length = 0;
    placedCount = 0;
    for (let colIndex = 0; colIndex < columnCount; colIndex++) {
      columnItems[colIndex] = [];
    }
  }

  return {
    columnCount,
    columnWidth,
    search,
    set,
    get,
    update,
    getColumnHeights,
    shortestColumn,
    tallestColumnHeight,
    estimateHeight,
    size,
    all,
    clear,
  };
}
