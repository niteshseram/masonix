import React, {
  type CSSProperties,
  type ReactElement,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type RefCallback,
} from 'react';

import { getScrollOffset, getScrollTop } from '../core/scroll';
import { normalizeNonNegativeFinite } from '../core/utils';
import { useColumns } from '../hooks/use-columns';
import { useContainerWidth } from '../hooks/use-container-width';
import { useItemHeights } from '../hooks/use-item-heights';
import { useMasonryItemCountAnnouncement } from '../hooks/use-masonry-item-count-announcement';
import { useMasonryLayout } from '../hooks/use-masonry-layout';
import { useMasonryScrollAnchor } from '../hooks/use-masonry-scroll-anchor';
import { useMeasurementIndexes } from '../hooks/use-measurement-indexes';
import { useScrollToIndex } from '../hooks/use-scroll-to-index';
import { useScroller } from '../hooks/use-scroller';
import type {
  MasonryRenderProps,
  MasonryVirtualHandle,
  MasonryVirtualProps,
  MasonryVirtualRange,
  PositionedItem,
} from '../types';
import { VISUALLY_HIDDEN_STYLE } from '../utils/masonry-styles';

const DEFAULT_ESTIMATED_HEIGHT = 150;
const DEFAULT_OVERSCAN = 2;
const DEFAULT_SCROLL_SEEK_VELOCITY = 1200;
const SCROLL_ALIGNMENT_TOLERANCE = 2;

function isWindow(container: HTMLElement | Window): container is Window {
  return container === window || 'scrollY' in container;
}

function getMaxScrollTop(container: HTMLElement | Window): number {
  if (isWindow(container)) {
    const doc = window.document.documentElement;
    const body = window.document.body;
    return Math.max(
      0,
      Math.max(doc.scrollHeight, body?.scrollHeight ?? 0) - window.innerHeight,
    );
  }
  return Math.max(0, container.scrollHeight - container.clientHeight);
}

function getTargetScrollTop(
  item: PositionedItem,
  containerOffset: number,
  viewportHeight: number,
  currentScrollTop: number,
  align: NonNullable<
    Parameters<MasonryVirtualHandle['scrollToIndex']>[1]
  >['align'],
): number {
  const itemTop = containerOffset + item.top;
  const itemBottom = itemTop + item.height;

  switch (align) {
    case 'auto':
      if (
        itemTop >= currentScrollTop &&
        itemBottom <= currentScrollTop + viewportHeight
      ) {
        return currentScrollTop;
      }
      return item.height > viewportHeight || itemTop < currentScrollTop
        ? itemTop
        : itemBottom - viewportHeight;
    case 'center':
      return containerOffset + item.top - (viewportHeight - item.height) / 2;
    case 'end':
      return containerOffset + item.top - viewportHeight + item.height;
    default:
      return containerOffset + item.top;
  }
}

// ---------------------------------------------------------------------------
// Internal memoized item
// ---------------------------------------------------------------------------

interface VirtualItemProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ItemWrapper: any;
  itemClassName: string | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  index: number;
  measureIndex: number;
  top: number;
  left: number;
  width: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Render: React.ComponentType<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Placeholder?: React.ComponentType<any>;
  height: number;
  visibility: CSSProperties['visibility'];
  isPlaceholder: boolean;
  setItemRef?: (node: HTMLElement | null, index: number) => void;
  itemRole: 'listitem' | undefined;
  ariaSetSize: number;
  ariaPosInSet: number;
}

const VirtualItem = memo(function VirtualItem({
  ItemWrapper,
  itemClassName,
  data,
  index,
  measureIndex,
  top,
  left,
  width,
  Render,
  Placeholder,
  height,
  visibility,
  isPlaceholder,
  setItemRef,
  itemRole,
  ariaSetSize,
  ariaPosInSet,
}: VirtualItemProps): ReactElement {
  const measureIndexRef = useRef(measureIndex);
  measureIndexRef.current = measureIndex;

  const refCallback = useCallback<RefCallback<HTMLElement>>(
    (node) => {
      setItemRef?.(node, measureIndexRef.current);
    },
    [setItemRef],
  );

  return (
    <ItemWrapper
      ref={setItemRef ? refCallback : undefined}
      className={itemClassName}
      style={{
        position: 'absolute',
        top,
        insetInlineStart: left,
        width,
        visibility,
      }}
      data-masonix-index={index}
      role={itemRole}
      aria-setsize={itemRole ? ariaSetSize : undefined}
      aria-posinset={itemRole ? ariaPosInSet : undefined}
    >
      {isPlaceholder ? (
        Placeholder ? (
          <Placeholder
            index={index}
            data={data}
            width={width}
            height={height}
          />
        ) : (
          <div aria-hidden="true" style={{ height }} />
        )
      ) : (
        <Render index={index} data={data} width={width} />
      )}
    </ItemWrapper>
  );
});

// ---------------------------------------------------------------------------
// MasonryVirtual
// ---------------------------------------------------------------------------

function MasonryVirtualInner<T = unknown>(
  props: Omit<MasonryVirtualProps<T>, 'ref'>,
  externalRef: React.ForwardedRef<HTMLElement>,
): ReactElement | null {
  const {
    items,
    render: Render,
    columns,
    columnWidth: columnWidthProp,
    maxColumns,
    gap,
    rowGap,
    columnGap,
    layoutUpdates,
    preserveScrollPosition = false,
    defaultColumns = 3,
    defaultWidth,
    getItemHeight,
    estimatedItemHeight = DEFAULT_ESTIMATED_HEIGHT,
    minItemHeight,
    role,
    'aria-label': ariaLabel,
    announceItemCountChanges = false,
    className,
    style,
    itemClassName,
    as,
    itemAs,
    itemKey,
    // Virtual-specific props
    overscanBy = DEFAULT_OVERSCAN,
    initialItemCount = 0,
    initialSnapshot,
    pinnedIndices,
    rangeExtractor,
    scrollContainer,
    totalItems,
    initialScrollIndex,
    scrollRef,
    onRangeChange,
    onEndReached,
    endReachedThreshold = 0,
    scrollSeek,
    ...containerProps
  } = props;

  const [focusedKey, setFocusedKey] = useState<string | number | null>(null);
  const containerElRef = useRef<HTMLElement | null>(null);
  const { ref: widthRef, width: containerWidth } =
    useContainerWidth(defaultWidth);

  const mergedRef = useCallback(
    (node: HTMLElement | null) => {
      containerElRef.current = node;
      widthRef(node);
      if (!externalRef) {
        return;
      }
      if (typeof externalRef === 'function') {
        externalRef(node);
      } else {
        (externalRef as React.MutableRefObject<HTMLElement | null>).current =
          node;
      }
    },
    [widthRef, externalRef],
  );

  const {
    columnCount,
    columnWidth,
    gap: resolvedGap,
    rowGap: resolvedRowGap,
  } = useColumns({
    containerWidth,
    columns,
    columnWidth: columnWidthProp,
    maxColumns,
    defaultColumns,
    gap,
    rowGap,
    columnGap,
    itemCount: items.length,
  });

  const measurementIndexes = useMeasurementIndexes(items, itemKey);
  const snapshotRef = useRef(initialSnapshot);
  const restoringSnapshotRef = useRef(initialSnapshot?.anchor != null);
  const initialMeasurements = useMemo(() => {
    const snapshot = snapshotRef.current;
    if (!snapshot || snapshot.version !== 1) {
      return undefined;
    }
    const keyedHeights = new Map(
      snapshot.measurements
        .filter((entry) => Number.isFinite(entry.height) && entry.height > 0)
        .map((entry) => [entry.key, entry.height]),
    );
    const heights = new Map<number, number>();
    items.forEach((data, index) => {
      const height = keyedHeights.get(itemKey ? itemKey(data, index) : index);
      if (height !== undefined) {
        heights.set(measurementIndexes[index], height);
      }
    });
    return { width: snapshot.columnWidth, heights };
  }, [items, itemKey, measurementIndexes]);
  const { measuredHeights, setItemRef } = useItemHeights(
    minItemHeight,
    measurementIndexes,
    columnWidth,
    initialMeasurements,
  );

  const normalizedOverscan = normalizeNonNegativeFinite(
    overscanBy,
    DEFAULT_OVERSCAN,
  );
  const normalizedEndReachedThreshold = Math.floor(
    normalizeNonNegativeFinite(endReachedThreshold),
  );
  const normalizedScrollSeekVelocity = normalizeNonNegativeFinite(
    scrollSeek?.velocityThreshold ?? DEFAULT_SCROLL_SEEK_VELOCITY,
    DEFAULT_SCROLL_SEEK_VELOCITY,
  );

  // Scroll tracking
  const { scrollTop, viewportHeight, scrollVelocity } = useScroller(
    scrollContainer,
    12,
    scrollSeek !== undefined,
  );

  const { positionedItems, positioner, rangeIndex, containerHeight } =
    useMasonryLayout({
      items,
      measurementIndexes,
      measuredHeights,
      columnCount,
      columnWidth,
      columnGap: resolvedGap,
      rowGap: resolvedRowGap,
      estimatedItemHeight,
      getItemHeight,
      layoutUpdates,
    });

  const getContainerOffset = useCallback(() => {
    const el = containerElRef.current;
    if (!el || typeof window === 'undefined') {
      return 0;
    }
    const container = scrollContainer?.current ?? window;
    return getScrollOffset(el, container);
  }, [scrollContainer]); // Re-read on scroll for accurate values

  const getScrollContainer = useCallback((): HTMLElement | Window | null => {
    if (typeof window === 'undefined') {
      return null;
    }
    return scrollContainer?.current ?? window;
  }, [scrollContainer]);

  // Determine visible range using interval tree
  const { visibleItems, startIndex, stopIndex } = useMemo(() => {
    if (viewportHeight === 0 && initialItemCount > 0) {
      const count = Math.min(
        items.length,
        Math.floor(normalizeNonNegativeFinite(initialItemCount)),
      );
      return {
        visibleItems: positionedItems.slice(0, count),
        startIndex: 0,
        stopIndex: Math.max(0, count - 1),
      };
    }
    if (positionedItems.length === 0 || viewportHeight === 0) {
      return {
        visibleItems: [] as Array<PositionedItem & { measured: boolean }>,
        startIndex: 0,
        stopIndex: 0,
      };
    }

    const containerOffset = getContainerOffset();
    const overscanPx = viewportHeight * normalizedOverscan;
    const viewTop = Math.max(0, scrollTop - containerOffset - overscanPx);
    const viewBottom =
      scrollTop - containerOffset + viewportHeight + overscanPx;

    const indices: number[] = [];
    let start = Number.POSITIVE_INFINITY;
    let stop = 0;

    rangeIndex.search(viewTop, viewBottom, (index) => {
      indices.push(index);
      if (index < start) {
        start = index;
      }
      if (index > stop) {
        stop = index;
      }
    });

    indices.sort((indexA, indexB) => indexA - indexB);

    return {
      visibleItems: indices
        .map((index) => positionedItems[index])
        .filter(
          (item): item is PositionedItem & { measured: boolean } =>
            item !== undefined,
        ),
      startIndex: indices.length > 0 ? start : 0,
      stopIndex: indices.length > 0 ? stop : 0,
    };
  }, [
    positionedItems,
    rangeIndex,
    scrollTop,
    getContainerOffset,
    viewportHeight,
    normalizedOverscan,
    initialItemCount,
    items.length,
  ]);

  const focusedIndex =
    focusedKey === null
      ? -1
      : items.findIndex(
          (data, index) =>
            (itemKey ? itemKey(data, index) : index) === focusedKey,
        );
  const renderedItems = useMemo(() => {
    const visibleIndices = visibleItems.map((item) => item.index);
    const indices = new Set(
      rangeExtractor
        ? rangeExtractor(visibleIndices, items.length)
        : visibleIndices,
    );
    for (const index of pinnedIndices ?? []) {
      indices.add(index);
    }
    if (focusedIndex >= 0) {
      indices.add(focusedIndex);
    }
    const validIndices = [...indices].filter(
      (index) => Number.isInteger(index) && index >= 0 && index < items.length,
    );
    validIndices.sort((first, second) => first - second);
    return validIndices.map((index) => positionedItems[index]);
  }, [
    visibleItems,
    rangeExtractor,
    items.length,
    pinnedIndices,
    focusedIndex,
    positionedItems,
  ]);

  function handleFocus(event: React.FocusEvent<HTMLElement>) {
    let wrapper = event.target as HTMLElement;
    while (
      wrapper.parentElement &&
      wrapper.parentElement !== event.currentTarget
    ) {
      wrapper = wrapper.parentElement;
    }
    const index = Number(wrapper.dataset.masonixIndex);
    if (Number.isInteger(index) && index >= 0 && index < items.length) {
      setFocusedKey(itemKey ? itemKey(items[index], index) : index);
    }
    containerProps.onFocusCapture?.(event);
  }

  function handleBlur(event: React.FocusEvent<HTMLElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setFocusedKey(null);
    }
    containerProps.onBlurCapture?.(event);
  }

  // Notify range changes
  const prevRangeRef = useRef<[number, number] | null>(null);
  useEffect(() => {
    if (
      visibleItems.length > 0 &&
      onRangeChange &&
      (prevRangeRef.current === null ||
        prevRangeRef.current[0] !== startIndex ||
        prevRangeRef.current[1] !== stopIndex)
    ) {
      prevRangeRef.current = [startIndex, stopIndex];
      onRangeChange(startIndex, stopIndex);
    }
  }, [onRangeChange, startIndex, stopIndex, visibleItems.length]);

  const totalItemCount =
    totalItems === undefined || !Number.isFinite(totalItems)
      ? items.length
      : Math.max(items.length, Math.floor(Math.max(0, totalItems)));
  const rangeInfo = useMemo<MasonryVirtualRange>(
    () => ({
      startIndex,
      stopIndex,
      itemCount: items.length,
      totalItems: totalItemCount,
    }),
    [items.length, startIndex, stopIndex, totalItemCount],
  );

  const endReachedItemCountRef = useRef<number | null>(null);
  useEffect(() => {
    if (!onEndReached || items.length === 0 || visibleItems.length === 0) {
      return;
    }

    const endIndex = items.length - 1 - normalizedEndReachedThreshold;
    if (
      stopIndex >= endIndex &&
      endReachedItemCountRef.current !== items.length
    ) {
      endReachedItemCountRef.current = items.length;
      onEndReached(rangeInfo);
    }
  }, [
    items.length,
    normalizedEndReachedThreshold,
    onEndReached,
    rangeInfo,
    stopIndex,
    visibleItems.length,
  ]);

  const handle = useScrollToIndex({
    positioner,
    containerRef: containerElRef,
    getScrollContainer,
    viewportHeight,
  });

  const isItemAtScrollTarget = useCallback(
    (
      item: PositionedItem,
      options: Parameters<MasonryVirtualHandle['scrollToIndex']>[1],
    ): boolean => {
      const container = getScrollContainer();
      if (!container || viewportHeight === 0) {
        return false;
      }

      const currentScrollTop = getScrollTop(container);
      const containerOffset = getContainerOffset();
      const align = options?.align ?? 'start';
      const unclampedTarget = getTargetScrollTop(
        item,
        containerOffset,
        viewportHeight,
        currentScrollTop,
        align,
      );
      const maxScrollTop = getMaxScrollTop(container);
      const targetScrollTop = Math.max(
        0,
        maxScrollTop > 0
          ? Math.min(unclampedTarget, maxScrollTop)
          : unclampedTarget,
      );

      return (
        Math.abs(currentScrollTop - targetScrollTop) <=
        SCROLL_ALIGNMENT_TOLERANCE
      );
    },
    [getContainerOffset, getScrollContainer, viewportHeight],
  );

  // Re-scroll after measurement-driven layout shifts
  const pendingReScrollRef = useRef<{
    index: number;
    options?: Parameters<MasonryVirtualHandle['scrollToIndex']>[1];
    prevTop: number;
    prevHeight: number;
  } | null>(null);
  const handleRef = useRef(handle);
  handleRef.current = handle;
  const { captureAnchor } = useMasonryScrollAnchor({
    enabled: preserveScrollPosition || snapshotRef.current !== undefined,
    initialAnchor: snapshotRef.current?.anchor,
    restoring: restoringSnapshotRef,
    search: positioner.search,
    items,
    positionedItems,
    itemKey,
    containerRef: containerElRef,
    scrollContainer,
    suspended: pendingReScrollRef,
  });

  useEffect(() => {
    const pending = pendingReScrollRef.current;
    if (!pending) {
      return;
    }
    const item = positioner.get(pending.index);
    if (!item) {
      pendingReScrollRef.current = null;
      return;
    }

    if (item.top !== pending.prevTop || item.height !== pending.prevHeight) {
      pending.prevTop = item.top;
      pending.prevHeight = item.height;
      handleRef.current.scrollToIndex(pending.index, {
        ...pending.options,
        smooth: false,
      });
    }

    if (
      scrollVelocity === 0 &&
      visibleItems.some((visibleItem) => visibleItem.index === pending.index) &&
      visibleItems.every((visibleItem) => visibleItem.measured) &&
      isItemAtScrollTarget(item, pending.options)
    ) {
      const timeout = setTimeout(() => {
        if (pendingReScrollRef.current === pending) {
          pendingReScrollRef.current = null;
        }
      }, 250);
      return () => clearTimeout(timeout);
    }
  }, [
    isItemAtScrollTarget,
    positionedItems,
    positioner,
    visibleItems,
    scrollVelocity,
  ]);

  useEffect(() => {
    const container = getScrollContainer();
    if (!container) {
      return;
    }
    function cancelPendingScroll() {
      restoringSnapshotRef.current = false;
      pendingReScrollRef.current = null;
    }
    const events = ['wheel', 'touchstart', 'pointerdown', 'keydown'];
    for (const event of events) {
      container.addEventListener(event, cancelPendingScroll, { passive: true });
    }
    return () => {
      for (const event of events) {
        container.removeEventListener(event, cancelPendingScroll);
      }
    };
  }, [getScrollContainer]);

  useEffect(() => {
    if (
      !restoringSnapshotRef.current ||
      viewportHeight === 0 ||
      visibleItems.length === 0 ||
      !visibleItems.every((item) => item.measured)
    ) {
      return;
    }
    const timeout = setTimeout(() => {
      restoringSnapshotRef.current = false;
    }, 250);
    return () => clearTimeout(timeout);
  }, [positionedItems, visibleItems, viewportHeight]);

  const scrollToIndex = useCallback(
    (
      index: number,
      options?: Parameters<MasonryVirtualHandle['scrollToIndex']>[1],
    ) => {
      restoringSnapshotRef.current = false;
      const item = positioner.get(index);
      pendingReScrollRef.current = {
        index,
        options,
        prevTop: item?.top ?? -1,
        prevHeight: item?.height ?? -1,
      };
      handle.scrollToIndex(index, options);
    },
    [handle, positioner],
  );

  useImperativeHandle(
    scrollRef,
    () => ({
      getSnapshot() {
        return {
          version: 1,
          columnWidth,
          measurements: items.flatMap((data, index) => {
            const height = measuredHeights.get(measurementIndexes[index]);
            return height === undefined
              ? []
              : [{ key: itemKey ? itemKey(data, index) : index, height }];
          }),
          anchor: captureAnchor(),
        };
      },
      scrollToIndex,
      scrollToOffset(offset, options) {
        restoringSnapshotRef.current = false;
        pendingReScrollRef.current = null;
        handle.scrollToOffset(offset, options);
      },
      scrollBy(delta, options) {
        restoringSnapshotRef.current = false;
        pendingReScrollRef.current = null;
        handle.scrollBy(delta, options);
      },
    }),
    [
      handle,
      scrollToIndex,
      columnWidth,
      items,
      itemKey,
      measuredHeights,
      measurementIndexes,
      captureAnchor,
    ],
  );

  const initialScrollIndexRef = useRef(initialScrollIndex);
  const hasAppliedInitialScrollRef = useRef(false);
  useEffect(() => {
    if (
      hasAppliedInitialScrollRef.current ||
      initialScrollIndexRef.current === undefined ||
      viewportHeight === 0
    ) {
      return;
    }

    const initialPosition = initialScrollIndexRef.current;
    const rawIndex =
      typeof initialPosition === 'number'
        ? initialPosition
        : initialPosition.index;
    if (!Number.isFinite(rawIndex) || rawIndex < 0) {
      hasAppliedInitialScrollRef.current = true;
      return;
    }

    const index = Math.floor(rawIndex);
    if (!positioner.get(index)) {
      return;
    }

    const align =
      typeof initialPosition === 'number' ? undefined : initialPosition.align;
    hasAppliedInitialScrollRef.current = true;
    scrollToIndex(index, { align });
  }, [positioner, scrollToIndex, viewportHeight]);

  const announcement = useMasonryItemCountAnnouncement(
    items.length,
    announceItemCountChanges,
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Container: any = as ?? 'div';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ItemWrapper: any = itemAs ?? 'div';

  const containerRole = role === 'none' ? undefined : 'list';
  const itemRole: 'listitem' | undefined =
    containerRole !== undefined ? 'listitem' : undefined;
  const ariaSetSize = totalItemCount;
  const isScrollSeekActive =
    scrollSeek !== undefined &&
    pendingReScrollRef.current === null &&
    Math.abs(scrollVelocity) >= normalizedScrollSeekVelocity;

  const containerStyle: CSSProperties = {
    position: 'relative',
    height: containerHeight,
    overflowAnchor:
      preserveScrollPosition || snapshotRef.current ? 'none' : undefined,
    contain: 'layout',
    ...style,
  };

  return (
    <>
      <Container
        {...containerProps}
        ref={mergedRef}
        onFocusCapture={handleFocus}
        onBlurCapture={handleBlur}
        className={className}
        style={containerStyle}
        role={containerRole}
        aria-label={ariaLabel}
      >
        {renderedItems.map(({ index, top, left, width, height, measured }) => {
          const isPlaceholder =
            isScrollSeekActive &&
            index !== focusedIndex &&
            !pinnedIndices?.includes(index);
          const data = items[index];
          const key = itemKey ? itemKey(data as T, index) : index;

          return (
            <VirtualItem
              key={key}
              ItemWrapper={ItemWrapper}
              itemClassName={itemClassName}
              data={data}
              index={index}
              measureIndex={measurementIndexes[index]}
              top={top}
              left={left}
              width={width}
              Render={
                Render as React.ComponentType<MasonryRenderProps<unknown>>
              }
              Placeholder={scrollSeek?.placeholder}
              height={height}
              visibility={
                getItemHeight || isPlaceholder
                  ? undefined
                  : measured
                    ? 'visible'
                    : 'hidden'
              }
              isPlaceholder={isPlaceholder}
              setItemRef={
                getItemHeight || isPlaceholder ? undefined : setItemRef
              }
              itemRole={itemRole}
              ariaSetSize={ariaSetSize}
              ariaPosInSet={index + 1}
            />
          );
        })}
      </Container>
      {announceItemCountChanges && (
        <div
          aria-live="polite"
          aria-atomic="true"
          style={VISUALLY_HIDDEN_STYLE}
        >
          {announcement}
        </div>
      )}
    </>
  );
}

export const MasonryVirtual = React.forwardRef(MasonryVirtualInner) as <
  T = unknown,
>(
  props: MasonryVirtualProps<T>,
) => ReactElement | null;
