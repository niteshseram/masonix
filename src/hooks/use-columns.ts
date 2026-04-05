import { useMemo } from 'react';

import {
  applyBreakpoints,
  computeColumns,
  effectiveColumnCount,
  parseBreakpoints,
} from '../core/utils';
import type { ResponsiveValue } from '../types';

export interface UseColumnsOptions {
  containerWidth: number;
  columns?: number | ResponsiveValue<number>;
  columnWidth?: number;
  maxColumns?: number;
  defaultColumns?: number;
  gap?: ResponsiveValue<number>;
  itemCount: number;
}

export interface UseColumnsResult {
  columnCount: number;
  columnWidth: number;
  gap: number;
}

/**
 * Computes the effective column count, column width, and resolved gap from
 * a container width and responsive column/gap configuration.
 */
export function useColumns({
  containerWidth,
  columns,
  columnWidth: columnWidthProp,
  maxColumns,
  defaultColumns,
  gap: gapOption,
  itemCount,
}: UseColumnsOptions): UseColumnsResult {
  // Parse breakpoints once when the responsive value changes — sorting is O(n log n).
  // The main memo then only does the O(n) scan on each containerWidth change.
  const parsedGap = useMemo(
    () =>
      gapOption !== undefined && typeof gapOption !== 'number'
        ? parseBreakpoints(gapOption)
        : null,
    [gapOption],
  );

  const parsedColumns = useMemo(
    () =>
      columns !== undefined && typeof columns !== 'number'
        ? parseBreakpoints(columns)
        : null,
    [columns],
  );

  return useMemo(() => {
    const gap =
      gapOption === undefined
        ? 0
        : typeof gapOption === 'number'
          ? gapOption
          : applyBreakpoints(parsedGap!, containerWidth);

    const resolvedColumns: number | undefined =
      columns === undefined || typeof columns === 'number'
        ? columns
        : applyBreakpoints(parsedColumns!, containerWidth);

    const { columnCount, columnWidth } = computeColumns(containerWidth, {
      columns: resolvedColumns,
      columnWidth: columnWidthProp,
      maxColumns,
      defaultColumns,
      gap,
    });

    const effective = effectiveColumnCount(columnCount, itemCount);

    // Keep the per-column width from the full layout — the effective count only
    // removes empty column wrappers, it doesn't spread items across more space.
    return { columnCount: effective, columnWidth, gap };
  }, [
    containerWidth,
    parsedGap,
    parsedColumns,
    gapOption,
    columns,
    columnWidthProp,
    maxColumns,
    defaultColumns,
    itemCount,
  ]);
}
