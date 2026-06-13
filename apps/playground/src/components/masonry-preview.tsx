import { Masonry, MasonryBalanced } from 'masonix';
import type { MasonryRenderProps } from 'masonix';
import { MasonryVirtual } from 'masonix/virtual';
import type {
  MasonryVirtualHandle,
  MasonryVirtualRange,
} from 'masonix/virtual';
import React from 'react';

import type { Photo } from '../demo-data';
import { ColorBlock, TextCard } from './cards';
import type { Config, BpEntry } from './config-panel';

function bpsToRecord(bps: BpEntry[]): Record<number, number> {
  const out: Record<number, number> = {};
  for (const { minWidth, value } of bps) out[minWidth] = value;
  return out;
}

function deriveLayoutProps(config: Config) {
  let columns: number | Record<number, number> | undefined;
  let columnWidth: number | undefined;

  if (config.columnMode === 'fixed') {
    columns = config.fixedColumns;
  } else if (config.columnMode === 'custom') {
    columns = bpsToRecord(config.customColBps);
  } else {
    columnWidth = config.autoColumnWidth;
  }

  const maxColumns = config.useMaxColumns ? config.maxColumns : undefined;
  const gap: number | Record<number, number> =
    config.gapMode === 'fixed'
      ? config.fixedGap
      : bpsToRecord(config.customGapBps);

  return { columns, columnWidth, maxColumns, gap };
}

interface MasonryPreviewProps {
  items: Photo[];
  config: Config;
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
  scrollHandleRef?: React.RefObject<MasonryVirtualHandle | null>;
  onVirtualRangeChange?: (range: MasonryVirtualRange) => void;
  onVirtualEndReached?: (range: MasonryVirtualRange) => void;
}

function ScrollSeekPlaceholder({
  height,
}: MasonryRenderProps<Photo> & { height: number }) {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900"
      style={{ height }}
    >
      <div className="h-full animate-pulse bg-gradient-to-br from-zinc-800 via-zinc-900 to-zinc-800" />
    </div>
  );
}

export function MasonryPreview({
  items,
  config,
  scrollContainerRef,
  scrollHandleRef,
  onVirtualRangeChange,
  onVirtualEndReached,
}: MasonryPreviewProps) {
  const { columns, columnWidth, maxColumns, gap } = deriveLayoutProps(config);

  const Render = config.cardStyle === 'text-card' ? TextCard : ColorBlock;

  const handleRangeChange = React.useCallback(
    (startIndex: number, stopIndex: number) => {
      onVirtualRangeChange?.({
        startIndex,
        stopIndex,
        itemCount: items.length,
        totalItems: items.length,
      });
    },
    [items.length, onVirtualRangeChange],
  );

  // Known heights only meaningful for color-block cards with explicit heights
  const getItemHeight =
    config.useKnownHeights && config.cardStyle === 'color-block'
      ? (photo: unknown) => (photo as Photo).height
      : undefined;

  const commonProps = {
    columns,
    columnWidth,
    maxColumns,
    gap,
    role: config.role as 'list' | 'grid' | 'none',
    as: config.as as 'div' | 'ul' | 'section' | 'main',
    itemAs: config.itemAs as 'div' | 'li' | 'article',
    'aria-label': config.ariaLabel || undefined,
    itemKey: (photo: unknown) => (photo as Photo).id,
  };

  const minItemHeight = config.useMinItemHeight
    ? config.minItemHeight
    : undefined;

  if (config.component === 'masonry-virtual') {
    return (
      <MasonryVirtual
        {...commonProps}
        items={items}
        render={Render}
        getItemHeight={getItemHeight}
        estimatedItemHeight={config.estimatedItemHeight}
        minItemHeight={minItemHeight}
        overscanBy={config.overscanBy}
        scrollContainer={scrollContainerRef}
        scrollRef={scrollHandleRef}
        onRangeChange={handleRangeChange}
        onEndReached={onVirtualEndReached}
        endReachedThreshold={config.endReachedThreshold}
        scrollSeek={
          config.enableScrollSeek
            ? {
                velocityThreshold: config.scrollSeekVelocityThreshold,
                placeholder: ScrollSeekPlaceholder,
              }
            : undefined
        }
        defaultWidth={800}
      />
    );
  }

  if (config.component === 'masonry') {
    return (
      <Masonry
        {...commonProps}
        items={items}
        render={Render}
        enableNative={config.enableNative}
      />
    );
  }

  return (
    <MasonryBalanced
      {...commonProps}
      items={items}
      render={Render}
      getItemHeight={getItemHeight}
      estimatedItemHeight={config.estimatedItemHeight}
      minItemHeight={minItemHeight}
    />
  );
}
