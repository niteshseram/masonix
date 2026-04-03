import { useMemo } from "react";
import { createPositioner } from "../core/positioner";
import type { Positioner } from "../types";

export interface UsePositionerOptions {
  columnCount: number;
  columnWidth: number;
  gap: number;
}

/**
 * Returns a fresh Positioner whenever layout configuration changes.
 * The positioner has no items placed on creation — callers are responsible
 * for populating it (e.g. via `set()` during render or layout effects).
 */
export function usePositioner({ columnCount, columnWidth, gap }: UsePositionerOptions): Positioner {
  return useMemo(
    () =>
      createPositioner({
        columnCount,
        columnWidth,
        columnGap: gap,
        rowGap: gap,
      }),
    [columnCount, columnWidth, gap],
  );
}
