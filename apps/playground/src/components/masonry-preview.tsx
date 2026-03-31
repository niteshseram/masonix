import { Masonry, MasonryBalanced } from "masonix";
import { ColorBlock, TextCard } from "./cards";
import type { Config, BpEntry } from "./config-panel";
import type { Photo } from "../demo-data";

function bpsToRecord(bps: BpEntry[]): Record<number, number> {
  const out: Record<number, number> = {};
  for (const { minWidth, value } of bps) out[minWidth] = value;
  return out;
}

function deriveLayoutProps(config: Config) {
  let columns: number | Record<number, number> | undefined;
  let columnWidth: number | undefined;

  if (config.columnMode === "fixed") {
    columns = config.fixedColumns;
  } else if (config.columnMode === "custom") {
    columns = bpsToRecord(config.customColBps);
  } else {
    columnWidth = config.autoColumnWidth;
  }

  const maxColumns = config.useMaxColumns ? config.maxColumns : undefined;
  const gap: number | Record<number, number> =
    config.gapMode === "fixed" ? config.fixedGap : bpsToRecord(config.customGapBps);

  return { columns, columnWidth, maxColumns, gap };
}

interface MasonryPreviewProps {
  items: Photo[];
  config: Config;
}

export function MasonryPreview({ items, config }: MasonryPreviewProps) {
  const { columns, columnWidth, maxColumns, gap } = deriveLayoutProps(config);

  const Render = config.cardStyle === "text-card" ? TextCard : ColorBlock;

  // Known heights only meaningful for color-block cards with explicit heights
  const getItemHeight =
    config.useKnownHeights && config.cardStyle === "color-block"
      ? (p: unknown) => (p as Photo).height
      : undefined;

  const commonProps = {
    columns,
    columnWidth,
    maxColumns,
    gap,
    dir: config.dir as "ltr" | "rtl" | "auto",
    role: config.role as "list" | "grid" | "none",
    as: config.as as "div" | "ul" | "section" | "main",
    itemAs: config.itemAs as "div" | "li" | "article",
    "aria-label": config.ariaLabel || undefined,
    itemKey: (p: unknown) => (p as Photo).id,
    empty: <p className="w-full py-20 text-center text-sm text-zinc-600">No items to display.</p>,
  };

  if (config.component === "masonry") {
    return (
      <Masonry {...commonProps} items={items} render={Render} enableNative={config.enableNative} />
    );
  }

  return (
    <MasonryBalanced
      {...commonProps}
      items={items}
      render={Render}
      getItemHeight={getItemHeight}
      estimatedItemHeight={config.estimatedItemHeight}
    />
  );
}
