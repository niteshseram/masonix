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
export function createPositioner(options: PositionerOptions): Positioner {
  const columnCount = normalizePositiveInteger(options.columnCount, 1);
  const columnWidth = normalizeNonNegativeFinite(options.columnWidth);
  const columnGap = normalizeNonNegativeFinite(options.columnGap ?? 0);
  const rowGap = normalizeNonNegativeFinite(options.rowGap ?? 0);

  const columnHeights = new Float64Array(columnCount);
  const items: Array<PositionedItem | undefined> = [];
  // columnItems[col] = ordered list of item indices placed in that column
  const columnItems: number[][] = Array.from({ length: columnCount }, () => []);
  let placedCount = 0;

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

    for (const col of affectedColumns) {
      const colItems = columnItems[col];
      let currentTop = 0;

      for (
        let colItemIndex = 0;
        colItemIndex < colItems.length;
        colItemIndex++
      ) {
        const item = items[colItems[colItemIndex]];
        if (!item) {
          continue;
        }

        // Only recompute top for items whose column changed height.
        if (item.column === col) {
          let top = 0;
          if (colItemIndex > 0) {
            const prevItem = items[colItems[colItemIndex - 1]];
            top = prevItem ? prevItem.top + prevItem.height + rowGap : 0;
          }
          item.top = top;
          currentTop = item.top;
          updated.push(item);
        }

        // Propagate column height
        currentTop = item.top + item.height + rowGap;
        columnHeights[item.column] = currentTop;
      }
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
    set: (index, height) => set(index, height),
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
