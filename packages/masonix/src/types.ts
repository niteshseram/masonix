import type * as React from 'react';

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
}

export interface Positioner {
  readonly columnCount: number;
  readonly columnWidth: number;
  /** Place an item, or update its height when the index already exists. */
  set(index: number, height: number): PositionedItem;
  /** Get a placed item by index */
  get(index: number): PositionedItem | undefined;
  /** Batch-update heights; recomputes only affected columns */
  update(updates: Array<[index: number, height: number]>): PositionedItem[];
  /** Current column content heights, excluding trailing row gaps. */
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

export type MasonryLayoutMode = 'fallback' | 'native';

export interface MasonryVirtualRange {
  startIndex: number;
  stopIndex: number;
  itemCount: number;
  totalItems: number;
}

export interface MasonryCommonProps<T = unknown> {
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

  // --- Accessibility ---
  role?: 'list' | 'none';
  'aria-label'?: string;
  /** Announce item-count changes through a polite live region. Defaults to false. */
  announceItemCountChanges?: boolean;

  // --- Styling ---
  className?: string;
  style?: React.CSSProperties;
  itemClassName?: string;

  // --- Container element ---
  as?: React.ElementType;
  ref?: React.Ref<HTMLElement>;

  // --- Item element ---
  itemAs?: React.ElementType;
  itemKey?: (data: T, index: number) => string | number;
}

export interface MasonryProps<T = unknown> extends MasonryCommonProps<T> {
  enableNative?: boolean;
  onLayoutModeChange?: (mode: MasonryLayoutMode) => void;
  columnClassName?: string;
}

export interface MasonryBalancedProps<
  T = unknown,
> extends MasonryCommonProps<T> {
  /** Pre-known height — skips two-phase measurement, enables zero-CLS SSR */
  getItemHeight?: (data: T, index: number, columnWidth: number) => number;
  estimatedItemHeight?: number;
  minItemHeight?: number;
}

export interface MasonryVirtualProps<
  T = unknown,
> extends MasonryBalancedProps<T> {
  overscanBy?: number;
  scrollContainer?: React.RefObject<HTMLElement | null>;
  totalItems?: number;
  initialScrollIndex?: number | MasonryInitialScrollPosition;
  scrollRef?: React.Ref<MasonryVirtualHandle>;
  onRangeChange?: (startIndex: number, stopIndex: number) => void;
  onEndReached?: (info: MasonryVirtualRange) => void;
  endReachedThreshold?: number;
  scrollSeek?: {
    velocityThreshold?: number;
    placeholder?: React.ComponentType<
      MasonryRenderProps<T> & { height: number }
    >;
  };
}

export type MasonryScrollAlign = 'start' | 'center' | 'end' | 'auto';

export interface MasonryScrollOptions {
  smooth?: boolean;
}

export interface MasonryScrollToIndexOptions extends MasonryScrollOptions {
  align?: MasonryScrollAlign;
}

export interface MasonryInitialScrollPosition {
  index: number;
  align?: MasonryScrollAlign;
}

export interface MasonryVirtualHandle {
  scrollToIndex(index: number, options?: MasonryScrollToIndexOptions): void;
  scrollToOffset(offset: number, options?: MasonryScrollOptions): void;
  scrollBy(delta: number, options?: MasonryScrollOptions): void;
}
