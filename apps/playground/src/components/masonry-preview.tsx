import React from "react";
import { Masonry, MasonryBalanced } from "masonix";
import { MasonryVirtual } from "masonix/virtual";
import type { MasonryVirtualHandle } from "masonix/virtual";
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
  onLoadMore?: (start: number, stop: number) => void;
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
  scrollHandleRef?: React.RefObject<MasonryVirtualHandle | null>;
}

export function MasonryPreview({
  items,
  config,
  onLoadMore,
  scrollContainerRef,
  scrollHandleRef,
}: MasonryPreviewProps) {
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
    empty: (
      <div className="flex w-full flex-col items-center justify-center gap-3 py-28">
        <div className="flex items-center justify-center gap-1">
          {[40, 64, 32, 56, 48].map((h, i) => (
            <div key={i} className="w-6 rounded-md bg-zinc-800" style={{ height: h }} />
          ))}
        </div>
        <p className="text-sm font-medium text-zinc-600">No items</p>
        <p className="text-xs text-zinc-700">Drag the count slider up to add some</p>
      </div>
    ),
  };

  if (config.component === "masonry-virtual") {
    return (
      <MasonryVirtual
        {...commonProps}
        items={items}
        render={Render}
        getItemHeight={getItemHeight}
        estimatedItemHeight={config.estimatedItemHeight}
        overscanBy={config.overscanBy}
        onLoadMore={config.useInfiniteScroll ? onLoadMore : undefined}
        totalItems={config.useInfiniteScroll ? config.virtualTotalItems : undefined}
        scrollContainer={scrollContainerRef}
        scrollRef={scrollHandleRef}
        defaultWidth={800}
      />
    );
  }

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
