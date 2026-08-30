'use client';

import { clsx } from 'clsx';
import { MasonryVirtual } from 'masonix/virtual';
import type { MasonryVirtualHandle } from 'masonix/virtual';
import { useRef, useState } from 'react';

type PerformanceItem = {
  id: string;
  height: number;
  title: string;
  detail: string;
};

const feedTitles = [
  'Release notes',
  'Customer research',
  'Performance review',
  'Design update',
  'Project status',
  'Support summary',
] as const;

const feedDetails = [
  'Updated a few minutes ago',
  '12 comments',
  'Ready for review',
  'Assigned to the product team',
] as const;

const performanceItems: PerformanceItem[] = Array.from(
  { length: 10_000 },
  (_, itemIndex) => ({
    id: `feed-item-${itemIndex}`,
    height: 64 + ((itemIndex * 11) % 30),
    title: feedTitles[itemIndex % feedTitles.length],
    detail: feedDetails[itemIndex % feedDetails.length],
  }),
);

function PerformanceCard({
  data,
  index,
}: {
  data: PerformanceItem;
  index: number;
}) {
  return (
    <article
      className={clsx(
        'flex items-start justify-between gap-4',
        'px-3 py-2.5',
        'rounded-md border',
        'border-fd-border bg-fd-background',
      )}
      style={{ height: data.height }}
    >
      <div className="min-w-0">
        <h3
          className={clsx(
            'truncate',
            'text-sm font-medium',
            'text-fd-foreground',
          )}
        >
          {data.title}
        </h3>
        <p
          className={clsx(
            'truncate',
            'mt-1',
            'text-xs',
            'text-fd-muted-foreground',
          )}
        >
          {data.detail}
        </p>
      </div>
      <span
        className={clsx(
          'shrink-0',
          'font-mono text-[10px]',
          'text-fd-muted-foreground',
        )}
      >
        {String(index + 1).padStart(5, '0')}
      </span>
    </article>
  );
}

export function HomePerformanceLab() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollHandleRef = useRef<MasonryVirtualHandle>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, stop: 15 });

  function scrollToIndex(targetIndex: number) {
    scrollHandleRef.current?.scrollToIndex(targetIndex, {
      align: 'center',
      smooth: true,
    });
  }

  function handleRangeChange(startIndex: number, stopIndex: number) {
    setVisibleRange({ start: startIndex, stop: stopIndex });
  }

  const windowSpan = Math.max(1, visibleRange.stop - visibleRange.start + 1);

  return (
    <div
      className={clsx(
        'grid overflow-hidden lg:grid-cols-[minmax(0,1fr)_14rem]',
        'rounded-lg border',
        'border-fd-border bg-fd-background',
      )}
    >
      <div className="min-w-0">
        <div
          className={clsx(
            'flex flex-wrap items-center justify-between gap-3',
            'px-4 py-3',
            'border-b',
            'border-fd-border',
          )}
        >
          <span className={clsx('text-sm font-medium', 'text-fd-foreground')}>
            10,000 item feed
          </span>
          <div className="flex items-center gap-1.5">
            <JumpButton label="Top" onClick={() => scrollToIndex(0)} />
            <JumpButton label="5,000" onClick={() => scrollToIndex(4_999)} />
            <JumpButton label="End" onClick={() => scrollToIndex(9_999)} />
          </div>
        </div>
        <div
          ref={scrollContainerRef}
          className={clsx(
            'masonix-home-lab-grid h-[24rem] overflow-y-auto',
            'p-3',
            'bg-fd-muted/20',
          )}
        >
          <MasonryVirtual
            items={performanceItems}
            render={PerformanceCard}
            columns={{ 0: 1, 500: 2, 760: 3 }}
            defaultColumns={3}
            defaultWidth={780}
            gap={8}
            getItemHeight={(item) => item.height}
            estimatedItemHeight={78}
            overscanBy={1}
            scrollContainer={scrollContainerRef}
            scrollRef={scrollHandleRef}
            onRangeChange={handleRangeChange}
            itemKey={(item) => item.id}
            aria-label="Ten thousand item virtual Masonix feed"
          />
        </div>
      </div>

      <aside
        className={clsx(
          'grid grid-cols-2 lg:grid-cols-1',
          'border-t lg:border-t-0 lg:border-l',
          'border-fd-border bg-fd-muted/15',
        )}
      >
        <PerformanceMetric label="Total items" value="10,000" />
        <PerformanceMetric
          label="Active range"
          value={`${visibleRange.start + 1}–${visibleRange.stop + 1}`}
        />
        <PerformanceMetric label="Window span" value={String(windowSpan)} />
        <PerformanceMetric label="Rendering" value="Windowed" />
      </aside>
    </div>
  );
}

function JumpButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'px-2.5 py-1.5',
        'rounded-md border',
        'text-xs font-medium',
        'border-fd-border bg-fd-background text-fd-muted-foreground',
        'cursor-pointer',
        'transition-colors',
        'hover:bg-fd-accent/50 hover:text-fd-foreground',
      )}
    >
      {label}
    </button>
  );
}

function PerformanceMetric({ label, value }: { label: string; value: string }) {
  return (
    <div
      className={clsx(
        'flex min-h-24 flex-col justify-center lg:min-h-0',
        'p-4',
        'odd:border-r lg:odd:border-r-0 lg:[&+&]:border-t',
        'border-fd-border',
      )}
    >
      <div className={clsx('text-xs', 'text-fd-muted-foreground')}>{label}</div>
      <div
        className={clsx(
          'mt-2',
          'font-mono text-base font-medium',
          'text-fd-foreground',
        )}
      >
        {value}
      </div>
    </div>
  );
}
