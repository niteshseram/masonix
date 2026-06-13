import type { ResponsiveValue } from '../types';

// ---------------------------------------------------------------------------
// Breakpoint resolution
// ---------------------------------------------------------------------------

/**
 * Parse and sort breakpoints from a responsive object value.
 * Call once at initialization; the result can be reused across container width changes.
 */
export function parseBreakpoints(
  value: Record<number, number>,
): Array<[number, number]> {
  const entries: Array<[number, number]> = Object.entries(value)
    .map(([keyStr, rawValue]): [number, number] => [
      Number(keyStr),
      rawValue as number,
    ])
    .filter(([key]) => !isNaN(key));
  entries.sort((entryA, entryB) => entryA[0] - entryB[0]);
  return entries;
}

/**
 * Apply pre-parsed breakpoints to a container width. O(n) scan — call on every resize.
 * Pair with parseBreakpoints to avoid re-sorting on every call.
 */
export function applyBreakpoints(
  breakpoints: Array<[number, number]>,
  containerWidth: number,
): number {
  let result = breakpoints[0]?.[1] ?? 1;
  for (const [breakpoint, breakpointValue] of breakpoints) {
    if (containerWidth >= breakpoint) result = breakpointValue;
  }
  return result;
}

/**
 * Resolve a ResponsiveValue<number> to a concrete number given a container
 * width in pixels.
 *
 * Numeric keys are treated as min-width thresholds in pixels:
 *   { 0: 1, 600: 2, 900: 3 } → 1 col below 600px, 2 col at 600px, 3 col at 900px
 *
 * For hot paths called on every resize, prefer parseBreakpoints + applyBreakpoints
 * to avoid re-sorting on each call.
 */
export function resolveResponsiveValue(
  value: ResponsiveValue<number>,
  containerWidth: number,
): number {
  if (typeof value === 'number') return value;
  return applyBreakpoints(parseBreakpoints(value), containerWidth);
}

// ---------------------------------------------------------------------------
// Column count computation
// ---------------------------------------------------------------------------

export interface ColumnConfig {
  columns?: number | ResponsiveValue<number>;
  columnWidth?: number;
  maxColumns?: number;
  defaultColumns?: number;
  gap?: number;
}

/**
 * Compute column count and individual column width given a container width.
 */
export function computeColumns(
  containerWidth: number,
  config: ColumnConfig,
): { columnCount: number; columnWidth: number } {
  const {
    columns,
    columnWidth,
    maxColumns,
    defaultColumns = 3,
    gap = 0,
  } = config;

  let columnCount: number;

  if (columns !== undefined) {
    columnCount = resolveResponsiveValue(
      typeof columns === 'number' ? columns : columns,
      containerWidth,
    );
  } else if (columnWidth !== undefined && columnWidth > 0) {
    // Auto-calculate from minimum column width
    columnCount = Math.max(
      1,
      Math.floor((containerWidth + gap) / (columnWidth + gap)),
    );
  } else {
    columnCount = defaultColumns;
  }

  if (maxColumns !== undefined) {
    columnCount = Math.min(columnCount, maxColumns);
  }

  columnCount = Math.max(1, columnCount);

  const totalGap = (columnCount - 1) * gap;
  const computedColumnWidth =
    columnCount > 0
      ? Math.floor((containerWidth - totalGap) / columnCount)
      : containerWidth;

  return { columnCount, columnWidth: Math.max(0, computedColumnWidth) };
}

/**
 * Clamp the effective column count to the number of items.
 * Avoids empty column wrappers when there are fewer items than columns.
 */
export function effectiveColumnCount(
  columnCount: number,
  itemCount: number,
): number {
  if (itemCount === 0) return columnCount;
  return Math.min(columnCount, itemCount);
}
