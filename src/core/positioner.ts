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
 * ensuring visually balanced columns. Supports RTL and column spanning.
 */
export function createPositioner(options: PositionerOptions): Positioner {
  const { columnCount, columnWidth, columnGap = 0, rowGap = 0 } = options;

  const columnHeights = new Float64Array(columnCount);
  const items: PositionedItem[] = [];
  // columnItems[col] = ordered list of item indices placed in that column
  const columnItems: number[][] = Array.from({ length: columnCount }, () => []);

  function computeLeft(column: number): number {
    return column * (columnWidth + columnGap);
  }

  function shortestColumnIndex(span = 1): number {
    if (span === 1) {
      let minCol = 0;
      for (let i = 1; i < columnCount; i++) {
        if (columnHeights[i] < columnHeights[minCol]) minCol = i;
      }
      return minCol;
    }

    // For spanning items: find the group of `span` consecutive columns whose
    // max height is minimal
    const maxStart = columnCount - span;
    let bestStart = 0;
    let bestMaxHeight = -Infinity;

    for (let start = 0; start <= maxStart; start++) {
      let groupMax = 0;
      for (let c = start; c < start + span; c++) {
        groupMax = Math.max(groupMax, columnHeights[c]);
      }
      if (bestMaxHeight === -Infinity || groupMax < bestMaxHeight) {
        bestMaxHeight = groupMax;
        bestStart = start;
      }
    }

    return bestStart;
  }

  function set(index: number, height: number, span = 1): PositionedItem {
    // Guard: treat 0-height items as needing estimation
    // Callers should pass estimatedItemHeight if height is 0

    const clampedSpan = Math.min(span, columnCount);
    const startCol = shortestColumnIndex(clampedSpan);

    // Top = max height among all spanned columns
    let top = 0;
    for (let c = startCol; c < startCol + clampedSpan; c++) {
      top = Math.max(top, columnHeights[c]);
    }

    const left = computeLeft(startCol);
    const itemWidth =
      clampedSpan === 1 ? columnWidth : clampedSpan * columnWidth + (clampedSpan - 1) * columnGap;

    // Update all spanned columns
    const newHeight = top + height + rowGap;
    for (let c = startCol; c < startCol + clampedSpan; c++) {
      columnHeights[c] = newHeight;
      columnItems[c].push(index);
    }

    const item: PositionedItem = {
      index,
      top,
      left,
      width: itemWidth,
      height,
      column: startCol,
      span: clampedSpan,
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
        for (let c = item.column; c < item.column + item.span; c++) {
          affectedColumns.add(c);
        }
      }
    }

    const updated: PositionedItem[] = [];

    for (const col of affectedColumns) {
      const colItems = columnItems[col];
      let currentTop = 0;

      for (let i = 0; i < colItems.length; i++) {
        const item = items[colItems[i]];
        if (!item) continue;

        // Only recompute top for items whose primary column is `col`
        if (item.column === col) {
          // Top is max height of all spanned columns just before this item
          let top = 0;
          if (i > 0) {
            const prevItem = items[colItems[i - 1]];
            top = prevItem ? prevItem.top + prevItem.height + rowGap : 0;
          }
          item.top = top;
          currentTop = item.top;
          updated.push(item);
        }

        // Propagate column height
        currentTop = item.top + item.height + rowGap;
        for (let c = item.column; c < item.column + item.span; c++) {
          columnHeights[c] = currentTop;
        }
      }
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
    for (let i = 0; i < columnCount; i++) {
      columnItems[i] = [];
    }
  }

  return {
    columnCount,
    columnWidth,
    set: (index, height, span?) => set(index, height, span),
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
