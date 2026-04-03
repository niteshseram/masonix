import type * as React from "react";

// ---------------------------------------------------------------------------
// Breakpoints
// ---------------------------------------------------------------------------

export type ResponsiveValue<T> = T | Record<number, T>;

// ---------------------------------------------------------------------------
// Core layout types
// ---------------------------------------------------------------------------

export interface PositionedItem {
  /** Original array index */
  index: number;
  /** Distance from container top in px */
  top: number;
  /** Distance from container left in px */
  left: number;
  /** Column width in px */
  width: number;
  /** Measured height in px */
  height: number;
  /** Column index (0-based) */
  column: number;
  /** Number of columns this item spans */
  span: number;
}

export interface Positioner {
  readonly columnCount: number;
  readonly columnWidth: number;
  /** Place an item, returns its computed PositionedItem. span is only used by positioners that support it. */
  set(index: number, height: number, span?: number): PositionedItem;
  /** Get a placed item by index */
  get(index: number): PositionedItem | undefined;
  /** Batch-update heights; recomputes only affected columns */
  update(updates: Array<[index: number, height: number]>): PositionedItem[];
  /** All current column heights */
  getColumnHeights(): number[];
  /** Index of the shortest column */
  shortestColumn(): number;
  /** Total height of the tallest column (container height estimate) */
  tallestColumnHeight(): number;
  /** Estimate total container height for N items with a given default height */
  estimateHeight(totalItems: number, defaultHeight: number): number;
  /** Number of items placed */
  size(): number;
  /** All placed items */
  all(): PositionedItem[];
  /** Clear all items and reset column heights */
  clear(): void;
}

// ---------------------------------------------------------------------------
// Masonry component prop types
// ---------------------------------------------------------------------------

export interface MasonryRenderProps<T> {
  index: number;
  data: T;
  width: number;
}

export interface MasonryProps<T = unknown> {
  // --- Data ---
  items: T[];
  render: React.ComponentType<MasonryRenderProps<T>>;

  // --- Columns ---
  columns?: number | ResponsiveValue<number>;
  columnWidth?: number;
  maxColumns?: number;

  // --- Spacing ---
  gap?: ResponsiveValue<number>;

  // --- SSR ---
  defaultColumns?: number;
  defaultWidth?: number;

  // --- Native CSS masonry ---
  enableNative?: boolean;

  // --- Accessibility ---
  role?: "grid" | "list" | "none";
  "aria-label"?: string;

  // --- Styling ---
  className?: string;
  style?: React.CSSProperties;
  columnClassName?: string;
  itemClassName?: string;

  // --- Container element ---
  as?: React.ElementType;
  ref?: React.Ref<HTMLElement>;

  // --- Item element ---
  itemAs?: React.ElementType;
  itemKey?: (data: T, index: number) => string | number;
}

export interface MasonryBalancedProps<T = unknown> extends MasonryProps<T> {
  getColumnSpan?: (data: T, index: number) => number;
  /** Pre-known height — skips two-phase measurement, enables zero-CLS SSR */
  getItemHeight?: (data: T, index: number, columnWidth: number) => number;
  estimatedItemHeight?: number;
  minItemHeight?: number;
}

export interface MasonryVirtualProps<T = unknown> extends MasonryBalancedProps<T> {
  overscanBy?: number;
  scrollContainer?: React.RefObject<HTMLElement | null>;
  totalItems?: number;
  scrollRef?: React.Ref<MasonryVirtualHandle>;
  onRangeChange?: (startIndex: number, stopIndex: number) => void;
}

export interface MasonryVirtualHandle {
  scrollToIndex(
    index: number,
    options?: { align?: "start" | "center" | "end"; smooth?: boolean },
  ): void;
  scrollToOffset(offset: number, options?: { smooth?: boolean }): void;
  getVisibleRange(): [startIndex: number, stopIndex: number];
}
