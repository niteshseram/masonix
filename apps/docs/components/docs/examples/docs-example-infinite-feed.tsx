"use client";

// docs:start infinite-feed
import { useCallback, useRef } from "react";
import { clsx } from "clsx";
import { MasonryVirtual } from "masonix/virtual";
// docs:end infinite-feed

import { DemoFrame } from "@/components/docs/examples/docs-example-frame";
import { demoFeedItems } from "@/components/docs/examples/docs-example-feed-data";
import { useState } from "react";

// docs:start infinite-feed
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
        "overflow-hidden",
        "rounded-xl border",
        "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950",
      )}
    >
      <div className="p-4" style={{ background: item.gradient }}>
        <div className="flex items-center justify-between gap-3">
          <span
            className={clsx(
              "px-2 py-1",
              "rounded-full",
              "text-xs font-medium",
              "bg-white/85 text-zinc-900",
            )}
          >
            {item.topic}
          </span>
          <span className="text-xs font-medium text-white/80">{item.metric}</span>
        </div>
        <p className="mt-8 text-xs font-medium leading-5 text-white/80">{item.tags.join(" / ")}</p>
      </div>
      <div className="p-4">
        <div>
          <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">{item.author}</h3>
          <p className="text-xs text-zinc-500">{item.handle}</p>
        </div>
        <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{item.body}</p>
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

export function InfiniteFeed({
  items,
  totalItems,
  loadMore,
}: {
  items: FeedItem[];
  totalItems: number;
  loadMore: () => void;
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleEndReached = useCallback(() => {
    if (items.length < totalItems) {
      loadMore();
    }
  }, [items.length, loadMore, totalItems]);

  return (
    <div
      ref={scrollContainerRef}
      className={clsx(
        "min-w-0 overflow-x-hidden overflow-y-auto overscroll-contain",
        "h-96 p-3",
        "rounded-lg border",
        "border-zinc-200 dark:border-zinc-800",
      )}
    >
      <MasonryVirtual
        items={items}
        totalItems={totalItems}
        columns={{ 0: 1, 600: 2 }}
        gap={12}
        estimatedItemHeight={280}
        overscanBy={1}
        endReachedThreshold={4}
        scrollContainer={scrollContainerRef}
        itemKey={(item) => item.id}
        onEndReached={handleEndReached}
        render={({ data }) => <FeedCard item={data} />}
      />
    </div>
  );
}
// docs:end infinite-feed

export function InfiniteFeedDemo() {
  const [loadedCount, setLoadedCount] = useState(18);
  const visibleItems = demoFeedItems.slice(0, loadedCount);

  function loadMore() {
    setLoadedCount((currentCount) => Math.min(demoFeedItems.length, currentCount + 6));
  }

  return (
    <DemoFrame>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-fd-foreground">Activity feed</p>
          <p className="text-xs text-fd-muted-foreground">
            Loaded {loadedCount} of {demoFeedItems.length}
          </p>
        </div>
        <button
          type="button"
          className={clsx(
            "px-3 py-1.5",
            "rounded-md border",
            "text-xs font-medium",
            "border-fd-border text-fd-foreground",
          )}
          onClick={loadMore}
        >
          Load batch
        </button>
      </div>
      <InfiniteFeed items={visibleItems} totalItems={demoFeedItems.length} loadMore={loadMore} />
    </DemoFrame>
  );
}
