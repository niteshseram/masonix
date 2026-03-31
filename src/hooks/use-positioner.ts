import { useMemo } from "react";
import { createBalancedPositioner } from "../core/column-balancer";
import type { Positioner } from "../types";

export interface UsePositionerOptions {
  columnCount: number;
  columnWidth: number;
  gap: number;
  strategy?: "shortest-first" | "row-wise";
}

/**
 * Returns a fresh Positioner whenever layout configuration changes.
 * The positioner has no items placed on creation — callers are responsible
 * for populating it (e.g. via `set()` during render or layout effects).
 */
export function usePositioner({
  columnCount,
  columnWidth,
  gap,
  strategy,
}: UsePositionerOptions): Positioner {
  return useMemo(
    () =>
      createBalancedPositioner({
        columnCount,
        columnWidth,
        columnGap: gap,
        rowGap: gap,
        strategy,
      }),
    [columnCount, columnWidth, gap, strategy],
  );
}
