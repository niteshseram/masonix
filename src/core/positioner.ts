import type { PositionedItem, Positioner } from "../types";

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
 * ensuring visually balanced columns. Supports RTL.
 */
export function createPositioner(options: PositionerOptions): Positioner {
  const { columnCount, columnWidth, columnGap = 0, rowGap = 0 } = options;

  const columnHeights = new Float64Array(columnCount);
  const items: PositionedItem[] = [];
  // columnItems[col] = ordered list of item indices placed in that column
  const columnItems: number[][] = Array.from({ length: columnCount }, () => []);
  let placedCount = 0;

  function computeLeft(column: number): number {
    return column * (columnWidth + columnGap);
  }

  function set(index: number, height: number): PositionedItem {
    // Guard: treat 0-height items as needing estimation
    // Callers should pass estimatedItemHeight if height is 0

    const column = shortestColumn();
    const top = columnHeights[column];
    const left = computeLeft(column);

    columnHeights[column] = top + height + rowGap;
    columnItems[column].push(index);

    const item: PositionedItem = {
      index,
      top,
      left,
      width: columnWidth,
      height,
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
    for (const [index, newHeight] of updates) {
      const item = items[index];
      if (item && item.height !== newHeight) {
        item.height = newHeight;
        affectedColumns.add(item.column);
      }
    }

    const updated: PositionedItem[] = [];

    for (const col of affectedColumns) {
      const colItems = columnItems[col];
      let currentTop = 0;

      for (let colItemIndex = 0; colItemIndex < colItems.length; colItemIndex++) {
        const item = items[colItems[colItemIndex]];
        if (!item) continue;

        // Only recompute top for items whose primary column is `col`
        if (item.column === col) {
          // Top is max height of all spanned columns just before this item
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
    return Array.from(columnHeights);
  }

  function shortestColumn(): number {
    let minColIndex = 0;
    for (let colIndex = 1; colIndex < columnCount; colIndex++) {
      if (columnHeights[colIndex] < columnHeights[minColIndex]) minColIndex = colIndex;
    }
    return minColIndex;
  }

  function tallestColumnHeight(): number {
    let max = 0;
    for (let colIndex = 0; colIndex < columnCount; colIndex++) {
      if (columnHeights[colIndex] > max) max = columnHeights[colIndex];
    }
    return max;
  }

  function estimateHeight(totalItems: number, defaultHeight: number): number {
    const placed = placedCount;
    if (placed === 0) {
      const rows = Math.ceil(totalItems / columnCount);
      return rows * (defaultHeight + rowGap);
    }
    const avgHeight = tallestColumnHeight() / Math.max(1, placed / columnCount);
    const remainingRows = Math.ceil((totalItems - placed) / columnCount);
    return tallestColumnHeight() + remainingRows * (avgHeight + rowGap);
  }

  function size(): number {
    return placedCount;
  }

  function all(): PositionedItem[] {
    return items.slice(0, placedCount);
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
