import { BREAKPOINTS, type ResponsiveValue } from "../types";

// ---------------------------------------------------------------------------
// Breakpoint resolution
// ---------------------------------------------------------------------------

/**
 * Resolve a ResponsiveValue<number> to a concrete number given a container
 * width in pixels.
 *
 * Named breakpoints match Tailwind defaults:
 *   sm=640, md=768, lg=1024, xl=1280, 2xl=1536
 */
export function resolveResponsiveValue(
  value: ResponsiveValue<number>,
  containerWidth: number,
): number {
  if (typeof value === "number") return value;

  // Normalise named breakpoints to numeric keys
  const entries: Array<[number, number]> = [];

  for (const [key, val] of Object.entries(value)) {
    if (val === undefined) continue;
    if (key === "default") {
      entries.push([0, val as number]);
    } else if (key in BREAKPOINTS) {
      entries.push([BREAKPOINTS[key as keyof typeof BREAKPOINTS], val as number]);
    } else {
      const numeric = Number(key);
      if (!isNaN(numeric)) entries.push([numeric, val as number]);
    }
  }

  // Sort ascending by breakpoint
  entries.sort((a, b) => a[0] - b[0]);

  // Find the largest breakpoint that fits
  let result = entries[0]?.[1] ?? 1;
  for (const [bp, val] of entries) {
    if (containerWidth >= bp) result = val;
  }

  return result;
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
  const { columns, columnWidth, maxColumns, defaultColumns = 3, gap = 0 } = config;

  let columnCount: number;

  if (columns !== undefined) {
    columnCount = resolveResponsiveValue(
      typeof columns === "number" ? columns : columns,
      containerWidth,
    );
  } else if (columnWidth !== undefined && columnWidth > 0) {
    // Auto-calculate from minimum column width
    columnCount = Math.max(1, Math.floor((containerWidth + gap) / (columnWidth + gap)));
  } else {
    columnCount = defaultColumns;
  }

  if (maxColumns !== undefined) {
    columnCount = Math.min(columnCount, maxColumns);
  }

  columnCount = Math.max(1, columnCount);

  const totalGap = (columnCount - 1) * gap;
  const computedColumnWidth =
    columnCount > 0 ? Math.floor((containerWidth - totalGap) / columnCount) : containerWidth;

  return { columnCount, columnWidth: Math.max(0, computedColumnWidth) };
}

/**
 * Clamp the effective column count to the number of items.
 * Avoids empty column wrappers when there are fewer items than columns.
 */
export function effectiveColumnCount(columnCount: number, itemCount: number): number {
  if (itemCount === 0) return columnCount;
  return Math.min(columnCount, itemCount);
}
