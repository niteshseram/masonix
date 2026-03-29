import type { PositionedItem, Positioner } from "../types";

export interface RowPositionerOptions {
  columnCount: number;
  columnWidth: number;
  columnGap?: number;
  rowGap?: number;
  /** When true, positions are mirrored for RTL layouts */
  rtl?: boolean;
}

/**
 * Row-wise positioner (key differentiator).
 *
 * Items are placed at `column = index % columnCount`, preserving the source
 * array order left-to-right, top-to-bottom. Unlike shortest-column-first,
 * this guarantees that item order in the DOM matches the visual grid order.
 *
 * Example: items [1,2,3,4,5,6] with 3 columns →
 *   Col 0: [1, 4]   Col 1: [2, 5]   Col 2: [3, 6]
 *   Reading order: 1, 2, 3, 4, 5, 6 ✓
 *
 * Top positions still respect actual column heights (items are not forced into
 * a rigid grid — variable heights flow naturally).
 */
export function createRowPositioner(options: RowPositionerOptions): Positioner {
  const { columnCount, columnWidth, columnGap = 0, rowGap = 0 } = options;

  const columnHeights = new Float64Array(columnCount);
  const items: PositionedItem[] = [];

  function computeLeft(column: number): number {
    return column * (columnWidth + columnGap);
  }

  function set(index: number, height: number): PositionedItem {
    const column = index % columnCount;
    const top = columnHeights[column];
    const left = computeLeft(column);

    columnHeights[column] = top + height + rowGap;

    const item: PositionedItem = {
      index,
      top,
      left,
      width: columnWidth,
      height,
      column,
      span: 1,
    };
    items[index] = item;
    return item;
  }

  function get(index: number): PositionedItem | undefined {
    return items[index];
  }

  function update(updates: Array<[number, number]>): PositionedItem[] {
    const affectedColumns = new Set<number>();
    for (const [index, newHeight] of updates) {
      const item = items[index];
      if (item && item.height !== newHeight) {
        item.height = newHeight;
        affectedColumns.add(item.column);
      }
    }

    const updated: PositionedItem[] = [];

    for (const col of affectedColumns) {
      let currentTop = 0;
      // Find all items in this column and recompute their tops
      for (let i = col; i < items.length; i += columnCount) {
        const item = items[i];
        if (!item) continue;
        item.top = currentTop;
        currentTop += item.height + rowGap;
        updated.push(item);
      }
      columnHeights[col] = currentTop;
    }

    return updated;
  }

  function getColumnHeights(): number[] {
    return Array.from(columnHeights);
  }

  function shortestColumn(): number {
    let min = 0;
    for (let i = 1; i < columnCount; i++) {
      if (columnHeights[i] < columnHeights[min]) min = i;
    }
    return min;
  }

  function tallestColumnHeight(): number {
    let max = 0;
    for (let i = 0; i < columnCount; i++) {
      if (columnHeights[i] > max) max = columnHeights[i];
    }
    return max;
  }

  function estimateHeight(totalItems: number, defaultHeight: number): number {
    const placed = items.filter(Boolean).length;
    if (placed === 0) {
      const rows = Math.ceil(totalItems / columnCount);
      return rows * (defaultHeight + rowGap);
    }
    const avgHeight = tallestColumnHeight() / Math.max(1, placed / columnCount);
    const remainingRows = Math.ceil((totalItems - placed) / columnCount);
    return tallestColumnHeight() + remainingRows * (avgHeight + rowGap);
  }

  function size(): number {
    return items.filter(Boolean).length;
  }

  function all(): PositionedItem[] {
    return items.filter(Boolean);
  }

  function clear(): void {
    columnHeights.fill(0);
    items.length = 0;
  }

  return {
    columnCount,
    columnWidth,
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
