// Components
export { Masonry } from "./components/masonry";

// Hooks
export { useContainerWidth } from "./hooks/use-container-width";
export { useColumns } from "./hooks/use-columns";

// Core positioners (advanced / low-level usage)
export { createPositioner } from "./core/positioner";
export { createRowPositioner } from "./core/row-positioner";
export { createBalancedPositioner, measureBalance } from "./core/column-balancer";
export { createIntervalTree } from "./core/interval-tree";

// Core utilities
export { resolveResponsiveValue, computeColumns, effectiveColumnCount } from "./core/utils";

// Types
export type {
  MasonryProps,
  MasonryBalancedProps,
  MasonryRenderProps,
  ResponsiveValue,
  PositionedItem,
  Positioner,
} from "./types";
