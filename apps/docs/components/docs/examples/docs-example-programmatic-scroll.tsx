'use client';

import { clsx } from 'clsx';
import { MasonryVirtual, type MasonryVirtualHandle } from 'masonix/virtual';
// docs:start programmatic-scroll
import { useRef, useState } from 'react';
// docs:end programmatic-scroll

import { demoFeedItems } from '@/components/docs/examples/docs-example-feed-data';
import { DemoFrame } from '@/components/docs/examples/docs-example-frame';

// docs:start programmatic-scroll
type FeedItem = {
  id: string;
  author: string;
  handle: string;
  topic: string;
  body: string;
  note?: string;
  tags: string[];
  metric: string;
  gradient: string;
};

const jumpTargets = [3, 16, 29, 42];

function FeedCard({
  item,
  index,
  isTarget,
}: {
  item: FeedItem;
  index: number;
  isTarget: boolean;
}) {
  return (
    <article
      aria-label={`Item ${index + 1}: ${item.author}`}
      className={clsx(
        'overflow-hidden',
        'rounded-xl border',
        'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950',
        'transition-shadow',
        isTarget
          ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-zinc-950'
          : null,
      )}
    >
      <div className="p-4" style={{ background: item.gradient }}>
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-white/85 px-2 py-1 text-xs font-medium text-zinc-900">
            {item.topic}
          </span>
          <span className="text-xs font-medium text-white/80">
            {item.metric}
          </span>
        </div>
        <div className="mt-8 flex items-center justify-between gap-3">
          <p className="text-xs font-medium leading-5 text-white/80">
            {item.tags.join(' / ')}
          </p>
          <span className="rounded-full bg-black/25 px-2 py-1 text-xs font-semibold text-white">
            Item {index + 1}
          </span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
              {item.author}
            </h3>
            <p className="text-xs text-zinc-500">{item.handle}</p>
          </div>
          {isTarget ? (
            <span className="shrink-0 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-200">
              Jump target
            </span>
          ) : null}
        </div>
        <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          {item.body}
        </p>
        {item.note ? (
          <p className="mt-3 rounded-lg bg-zinc-100 p-3 text-xs leading-5 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
            {item.note}
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-zinc-200 px-2 py-1 text-xs text-zinc-500 dark:border-zinc-800"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

export function JumpableFeed({ items }: { items: FeedItem[] }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<MasonryVirtualHandle>(null);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);

  function scrollToItem(nextTargetIndex: number) {
    setTargetIndex(nextTargetIndex);
    scrollRef.current?.scrollToIndex(nextTargetIndex, {
      align: 'center',
      smooth: true,
    });
  }

  return (
    <>
      <div className="mb-3 flex flex-wrap gap-2">
        {jumpTargets
          .filter((jumpIndex) => jumpIndex < items.length)
          .map((jumpIndex) => {
            const targetItem = items[jumpIndex];

            return (
              <button
                key={jumpIndex}
                type="button"
                aria-pressed={jumpIndex === targetIndex}
                className={clsx(
                  'px-3 py-1.5',
                  'rounded-md border',
                  'text-xs font-medium',
                  'border-zinc-200 text-zinc-950 dark:border-zinc-800 dark:text-zinc-50',
                  'transition-colors',
                  'hover:bg-zinc-100 dark:hover:bg-zinc-900',
                  jumpIndex === targetIndex
                    ? 'bg-zinc-100 dark:bg-zinc-900'
                    : 'bg-transparent',
                )}
                onClick={() => scrollToItem(jumpIndex)}
              >
                Item {jumpIndex + 1} · {targetItem.topic}
              </button>
            );
          })}
      </div>
      <div
        ref={scrollContainerRef}
        className={clsx(
          'min-w-0 overflow-x-hidden overflow-y-auto overscroll-contain',
          'h-96 p-3',
          'rounded-lg border',
          'border-zinc-200 dark:border-zinc-800',
        )}
      >
        <MasonryVirtual
          scrollRef={scrollRef}
          scrollContainer={scrollContainerRef}
          items={items}
          columns={{ 0: 1, 600: 2 }}
          gap={12}
          estimatedItemHeight={280}
          itemKey={(item) => item.id}
          render={({ data, index }) => (
            <FeedCard
              item={data}
              index={index}
              isTarget={index === targetIndex}
            />
          )}
        />
      </div>
    </>
  );
}
// docs:end programmatic-scroll

export function ProgrammaticScrollDemo() {
  return (
    <DemoFrame>
      <JumpableFeed items={demoFeedItems} />
    </DemoFrame>
  );
}
