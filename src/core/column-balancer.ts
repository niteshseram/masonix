import { createPositioner } from "./positioner";
import { createRowPositioner } from "./row-positioner";
import type { Positioner } from "../types";

export interface ColumnBalancerOptions {
  columnCount: number;
  columnWidth: number;
  columnGap?: number;
  rowGap?: number;
  strategy?: "shortest-first" | "row-wise";
}

/**
 * Factory that returns the correct positioner for the requested strategy.
 * Centralises the strategy decision so components don't need to import
 * both positioner modules directly.
 */
export function createBalancedPositioner(options: ColumnBalancerOptions): Positioner {
  const { strategy = "shortest-first", ...rest } = options;

  if (strategy === "row-wise") {
    return createRowPositioner(rest);
  }

  return createPositioner(rest);
}

/**
 * Given a set of items with known heights, compute how balanced the column
 * distribution is. Returns the height difference between the tallest and
 * shortest column — 0 is perfectly balanced.
 *
 * Useful for testing and diagnostics.
 */
export function measureBalance(positioner: Positioner): number {
  const heights = positioner.getColumnHeights();
  if (heights.length === 0) return 0;
  const max = Math.max(...heights);
  const min = Math.min(...heights);
  return max - min;
}
