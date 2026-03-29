import { useMemo } from "react";
import { computeColumns, effectiveColumnCount, resolveResponsiveValue } from "../core/utils";
import type { ResponsiveValue } from "../types";

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
  return useMemo(() => {
    const gap = gapOption !== undefined ? resolveResponsiveValue(gapOption, containerWidth) : 0;

    const { columnCount, columnWidth } = computeColumns(containerWidth, {
      columns,
      columnWidth: columnWidthProp,
      maxColumns,
      defaultColumns,
      gap,
    });

    const effective = effectiveColumnCount(columnCount, itemCount);

    // Keep the per-column width from the full layout — the effective count only
    // removes empty column wrappers, it doesn't spread items across more space.
    return { columnCount: effective, columnWidth, gap };
  }, [containerWidth, columns, columnWidthProp, maxColumns, defaultColumns, gapOption, itemCount]);
}
