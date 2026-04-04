export type ComponentMode = "masonry" | "masonry-balanced" | "masonry-virtual";
export type ColumnMode = "fixed" | "custom" | "columnWidth";
export type GapMode = "fixed" | "custom";
export type HeightMode = "stepped" | "random" | "uniform";
export type CardStyle = "color-block" | "text-card";

export interface BpEntry {
  minWidth: number;
  value: number;
}

export interface Config {
  component: ComponentMode;

  itemCount: number;
  cardStyle: CardStyle;
  heightMode: HeightMode;
  minItemH: number;
  maxItemH: number;
  uniformHeight: number;

  columnMode: ColumnMode;
  fixedColumns: number;
  customColBps: BpEntry[];
  autoColumnWidth: number;
  maxColumns: number;
  useMaxColumns: boolean;

  gapMode: GapMode;
  fixedGap: number;
  customGapBps: BpEntry[];

  role: "list" | "grid" | "none";
  enableNative: boolean;

  as: "div" | "ul" | "section" | "main";
  itemAs: "div" | "li" | "article";
  ariaLabel: string;

  useKnownHeights: boolean;
  estimatedItemHeight: number;
  useMinItemHeight: boolean;
  minItemHeight: number;

  overscanBy: number;
}

export const DEFAULT_CONFIG: Config = {
  component: "masonry",

  itemCount: 20,
  cardStyle: "color-block",
  heightMode: "stepped",
  minItemH: 80,
  maxItemH: 480,
  uniformHeight: 200,

  columnMode: "custom",
  fixedColumns: 3,
  customColBps: [
    { minWidth: 0, value: 1 },
    { minWidth: 600, value: 2 },
    { minWidth: 900, value: 3 },
    { minWidth: 1200, value: 4 },
  ],
  autoColumnWidth: 200,
  maxColumns: 6,
  useMaxColumns: false,

  gapMode: "custom",
  fixedGap: 16,
  customGapBps: [
    { minWidth: 0, value: 8 },
    { minWidth: 900, value: 16 },
  ],

  role: "list",
  enableNative: false,

  as: "div",
  itemAs: "div",
  ariaLabel: "",

  useKnownHeights: false,
  estimatedItemHeight: 150,
  useMinItemHeight: false,
  minItemHeight: 80,

  overscanBy: 2,
};
