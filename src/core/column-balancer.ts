import { createPositioner } from "./positioner";
import type { Positioner } from "../types";

export interface ColumnBalancerOptions {
  columnCount: number;
  columnWidth: number;
  columnGap?: number;
  rowGap?: number;
}

/**
 * Factory that creates a shortest-column-first positioner.
 * Centralises positioner creation so components don't import positioner directly.
 */
export function createBalancedPositioner(options: ColumnBalancerOptions): Positioner {
  return createPositioner(options);
}
