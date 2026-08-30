import { clsx } from 'clsx';
import { Masonry, MasonryBalanced } from 'masonix';
import type { MasonryLayoutMode, MasonryRenderProps } from 'masonix';
import { MasonryVirtual } from 'masonix/virtual';
import type {
  MasonryVirtualHandle,
  MasonryVirtualRange,
} from 'masonix/virtual';
import React from 'react';

import type {
  Config,
  BpEntry,
} from '@/components/playground/config-panel/playground-config-panel';
import {
  EditorialCard,
  ProjectNoteCard,
} from '@/components/playground/playground-cards';
import type { PlaygroundItem } from '@/lib/playground/playground-demo-data';

function bpsToRecord(breakpoints: BpEntry[]): Record<number, number> {
  const breakpointRecord: Record<number, number> = {};
  for (const { minWidth, value } of breakpoints) {
    breakpointRecord[minWidth] = value;
  }
  return breakpointRecord;
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
  items: PlaygroundItem[];
  config: Config;
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
  scrollHandleRef?: React.RefObject<MasonryVirtualHandle | null>;
  onVirtualRangeChange?: (range: MasonryVirtualRange) => void;
  onVirtualEndReached?: (range: MasonryVirtualRange) => void;
  onLayoutModeChange?: (mode: MasonryLayoutMode) => void;
}

function ScrollSeekPlaceholder({
  height,
}: MasonryRenderProps<PlaygroundItem> & { height: number }) {
  return (
    <div
      className={clsx(
        'flex flex-col overflow-hidden',
        'p-4',
        'rounded-xl border',
        'border-zinc-800 bg-zinc-950',
      )}
      style={{ height }}
    >
      <div
        className={clsx(
          'h-2 w-20',
          'rounded-full',
          'bg-zinc-800',
          'animate-pulse',
        )}
      />
      <div
        className={clsx(
          'mt-auto h-4 w-3/4',
          'rounded-sm',
          'bg-zinc-800',
          'animate-pulse',
        )}
      />
      <div
        className={clsx(
          'mt-2 h-2 w-1/2',
          'rounded-full',
          'bg-zinc-900',
          'animate-pulse',
        )}
      />
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
  onLayoutModeChange,
}: MasonryPreviewProps) {
  const { columns, columnWidth, maxColumns, gap } = deriveLayoutProps(config);

  const Render =
    config.cardStyle === 'text-card' ? ProjectNoteCard : EditorialCard;

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

  const getItemHeight =
    config.useKnownHeights && config.cardStyle === 'color-block'
      ? (item: unknown) => (item as PlaygroundItem).height
      : undefined;

  const commonProps = {
    columns,
    columnWidth,
    maxColumns,
    gap,
    role: config.role as 'list' | 'none',
    as: config.as as 'div' | 'ul' | 'section' | 'main',
    itemAs: config.itemAs as 'div' | 'li' | 'article',
    'aria-label': config.ariaLabel || undefined,
    itemKey: (item: unknown) => (item as PlaygroundItem).id,
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
        onLayoutModeChange={onLayoutModeChange}
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
