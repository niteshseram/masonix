'use client';

import { clsx } from 'clsx';
import { MasonryVirtual } from 'masonix/virtual';
// docs:start custom-scroll-container
import { useRef } from 'react';
// docs:end custom-scroll-container

import { demoFeedItems } from '@/components/docs/examples/docs-example-feed-data';
import { DemoFrame } from '@/components/docs/examples/docs-example-frame';

// docs:start custom-scroll-container
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

function FeedCard({ item }: { item: FeedItem }) {
  return (
    <article
      className={clsx(
        'overflow-hidden',
        'rounded-xl border',
        'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950',
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
        <p className="mt-8 text-xs font-medium leading-5 text-white/80">
          {item.tags.join(' / ')}
        </p>
      </div>
      <div className="p-4">
        <div>
          <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
            {item.author}
          </h3>
          <p className="text-xs text-zinc-500">{item.handle}</p>
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

export function PanelFeed({ items }: { items: FeedItem[] }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  return (
    <section className="grid min-w-0 gap-4 md:grid-cols-4">
      <aside className="hidden rounded-lg border border-zinc-200 bg-white p-4 text-sm dark:border-zinc-800 dark:bg-zinc-950 md:col-span-1 md:block">
        <p className="font-semibold text-zinc-950 dark:text-zinc-50">
          Workspace
        </p>
        <p className="mt-2 text-xs leading-5 text-zinc-500">
          The feed scrolls inside the panel instead of the window.
        </p>
      </aside>
      <div
        ref={scrollContainerRef}
        className={clsx(
          'min-w-0 overflow-x-hidden overflow-y-auto overscroll-contain',
          'h-96 p-3',
          'rounded-lg border',
          'border-zinc-200 dark:border-zinc-800',
          'md:col-span-3',
        )}
      >
        <MasonryVirtual
          items={items}
          scrollContainer={scrollContainerRef}
          columns={{ 0: 1, 620: 2 }}
          gap={12}
          estimatedItemHeight={280}
          itemKey={(item) => item.id}
          render={({ data }) => <FeedCard item={data} />}
        />
      </div>
    </section>
  );
}
// docs:end custom-scroll-container

export function CustomScrollContainerDemo() {
  return (
    <DemoFrame>
      <PanelFeed items={demoFeedItems.slice(0, 30)} />
    </DemoFrame>
  );
}

export function VirtualMasonryDemo() {
  return <CustomScrollContainerDemo />;
}
