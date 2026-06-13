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

import { createIntervalTree } from '../core/interval-tree';
import { createPositioner } from '../core/positioner';
import { getScrollOffset, getScrollTop } from '../core/scroll';
import { useColumns } from '../hooks/use-columns';
import { useContainerWidth } from '../hooks/use-container-width';
import { useItemHeights } from '../hooks/use-item-heights';
import { useMeasurementIndexes } from '../hooks/use-measurement-indexes';
import { useScrollToIndex } from '../hooks/use-scroll-to-index';
import { useScroller } from '../hooks/use-scroller';
import type {
  MasonryRenderProps,
  MasonryVirtualHandle,
  MasonryVirtualProps,
  PositionedItem,
} from '../types';

const DEFAULT_ESTIMATED_HEIGHT = 150;
const DEFAULT_OVERSCAN = 2;
const SCROLL_ALIGNMENT_TOLERANCE = 2;

// Visually hidden — present in DOM for screen readers but invisible to sighted users
const VISUALLY_HIDDEN_STYLE: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

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
  align: NonNullable<
    Parameters<MasonryVirtualHandle['scrollToIndex']>[1]
  >['align'],
): number {
  switch (align) {
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
  width: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Render: React.ComponentType<any>;
  style: CSSProperties;
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
  width,
  Render,
  style,
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
      style={style}
      role={itemRole}
      aria-setsize={itemRole ? ariaSetSize : undefined}
      aria-posinset={itemRole ? ariaPosInSet : undefined}
    >
      <Render index={index} data={data} width={width} />
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
    defaultColumns = 3,
    defaultWidth,
    getItemHeight,
    estimatedItemHeight = DEFAULT_ESTIMATED_HEIGHT,
    minItemHeight,
    role,
    'aria-label': ariaLabel,
    className,
    style,
    itemClassName,
    as,
    itemAs,
    itemKey,
    // Virtual-specific props
    overscanBy = DEFAULT_OVERSCAN,
    scrollContainer,
    totalItems,
    scrollRef,
    onRangeChange,
  } = props;

  const containerElRef = useRef<HTMLElement | null>(null);
  const { ref: widthRef, width: containerWidth } =
    useContainerWidth(defaultWidth);

  const mergedRef = useCallback(
    (node: HTMLElement | null) => {
      containerElRef.current = node;
      widthRef(node);
      if (!externalRef) return;
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
  } = useColumns({
    containerWidth,
    columns,
    columnWidth: columnWidthProp,
    maxColumns,
    defaultColumns,
    gap,
    itemCount: items.length,
  });

  const { measuredHeights, setItemRef } = useItemHeights(minItemHeight);
  const measurementIndexes = useMeasurementIndexes(items, itemKey);

  // Scroll tracking
  const { scrollTop, viewportHeight } = useScroller(scrollContainer);

  // Build positioner + interval tree from current layout inputs
  const { positionedItems, positioner, intervalTree, containerHeight } =
    useMemo(() => {
      if (columnCount === 0) {
        return {
          positionedItems: [] as Array<PositionedItem & { measured: boolean }>,
          positioner: createPositioner({
            columnCount: 1,
            columnWidth: 0,
            columnGap: 0,
            rowGap: 0,
          }),
          intervalTree: createIntervalTree(),
          containerHeight: 0,
        };
      }

      const pos = createPositioner({
        columnCount,
        columnWidth,
        columnGap: resolvedGap,
        rowGap: resolvedGap,
      });

      const tree = createIntervalTree();
      let maxBottom = 0;

      const positioned = items.map((data, index) => {
        let height: number;
        let measured: boolean;

        if (getItemHeight) {
          height = Math.max(0, getItemHeight(data, index, columnWidth));
          measured = true;
        } else {
          const measuredHeight = measuredHeights.get(measurementIndexes[index]);
          measured = measuredHeight !== undefined;
          height = measuredHeight ?? estimatedItemHeight;
        }

        const item = pos.set(index, height);
        tree.insert(index, item.top, item.top + item.height);

        const bottom = item.top + item.height;
        if (bottom > maxBottom) maxBottom = bottom;

        return { ...item, measured };
      });

      return {
        positionedItems: positioned,
        positioner: pos,
        intervalTree: tree,
        containerHeight: maxBottom,
      };
    }, [
      items,
      columnCount,
      columnWidth,
      resolvedGap,
      getItemHeight,
      measuredHeights,
      measurementIndexes,
      estimatedItemHeight,
    ]);

  const getContainerOffset = useCallback(() => {
    const el = containerElRef.current;
    if (!el || typeof window === 'undefined') return 0;
    const container = scrollContainer?.current ?? window;
    return getScrollOffset(el, container);
  }, [scrollContainer]); // Re-read on scroll for accurate values

  const getScrollContainer = useCallback((): HTMLElement | Window | null => {
    if (typeof window === 'undefined') return null;
    return scrollContainer?.current ?? window;
  }, [scrollContainer]);

  // Determine visible range using interval tree
  const { visibleItems, startIndex, stopIndex } = useMemo(() => {
    if (positionedItems.length === 0 || viewportHeight === 0) {
      return {
        visibleItems: [] as Array<PositionedItem & { measured: boolean }>,
        startIndex: 0,
        stopIndex: 0,
      };
    }

    const containerOffset = getContainerOffset();
    const overscanPx = viewportHeight * overscanBy;
    const viewTop = Math.max(0, scrollTop - containerOffset - overscanPx);
    const viewBottom =
      scrollTop - containerOffset + viewportHeight + overscanPx;

    const indices: number[] = [];
    let start = Number.POSITIVE_INFINITY;
    let stop = 0;

    intervalTree.search(viewTop, viewBottom, (index) => {
      indices.push(index);
      if (index < start) start = index;
      if (index > stop) stop = index;
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
    intervalTree,
    scrollTop,
    getContainerOffset,
    viewportHeight,
    overscanBy,
  ]);

  // Notify range changes
  const prevRangeRef = useRef<[number, number]>([0, 0]);
  useEffect(() => {
    if (
      onRangeChange &&
      (prevRangeRef.current[0] !== startIndex ||
        prevRangeRef.current[1] !== stopIndex)
    ) {
      prevRangeRef.current = [startIndex, stopIndex];
      onRangeChange(startIndex, stopIndex);
    }
  }, [onRangeChange, startIndex, stopIndex]);

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
      if (!container || viewportHeight === 0) return false;

      const currentScrollTop = getScrollTop(container);
      const containerOffset = getContainerOffset();
      const align = options?.align ?? 'start';
      const unclampedTarget = getTargetScrollTop(
        item,
        containerOffset,
        viewportHeight,
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
  } | null>(null);
  const handleRef = useRef(handle);
  handleRef.current = handle;

  useEffect(() => {
    const pending = pendingReScrollRef.current;
    if (!pending) return;
    const item = positioner.get(pending.index);
    if (!item) {
      pendingReScrollRef.current = null;
      return;
    }

    if (
      item.top === pending.prevTop &&
      isItemAtScrollTarget(item, pending.options)
    ) {
      pendingReScrollRef.current = null;
      return;
    }

    pending.prevTop = item.top;
    handleRef.current.scrollToIndex(pending.index, {
      ...pending.options,
      smooth: false,
    });
  }, [
    isItemAtScrollTarget,
    positionedItems,
    positioner,
    scrollTop,
    viewportHeight,
  ]);

  useImperativeHandle(
    scrollRef,
    () => ({
      ...handle,
      scrollToIndex: (index, options) => {
        const item = positioner.get(index);
        pendingReScrollRef.current = {
          index,
          options,
          prevTop: item?.top ?? -1,
        };
        handle.scrollToIndex(index, options);
      },
    }),
    [handle, positioner],
  );

  // aria-live announcement on item count changes (filter/add/remove)
  const [announcement, setAnnouncement] = useState('');
  const prevItemCountRef = useRef<number | null>(null);
  useEffect(() => {
    if (
      prevItemCountRef.current !== null &&
      prevItemCountRef.current !== items.length
    ) {
      setAnnouncement(
        `${items.length} ${items.length === 1 ? 'item' : 'items'}`,
      );
    }
    prevItemCountRef.current = items.length;
  }, [items.length]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Container: any = as ?? 'div';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ItemWrapper: any = itemAs ?? 'div';

  const containerRole = role === 'none' ? undefined : (role ?? 'list');
  const itemRole: 'listitem' | undefined =
    containerRole !== undefined ? 'listitem' : undefined;
  const ariaSetSize = totalItems ?? items.length;

  const containerStyle: CSSProperties = {
    position: 'relative',
    height: containerHeight,
    ...style,
  };

  return (
    <>
      <Container
        ref={mergedRef}
        className={className}
        style={containerStyle}
        role={containerRole}
        aria-label={ariaLabel}
      >
        {visibleItems.map(({ index, top, left, width, measured }) => {
          const data = items[index];
          const key = itemKey ? itemKey(data as T, index) : index;

          const itemStyle: CSSProperties = {
            position: 'absolute',
            top,
            insetInlineStart: left,
            width,
            ...(getItemHeight
              ? {}
              : { visibility: measured ? 'visible' : ('hidden' as const) }),
          };

          return (
            <VirtualItem
              key={key}
              ItemWrapper={ItemWrapper}
              itemClassName={itemClassName}
              data={data}
              index={index}
              measureIndex={measurementIndexes[index]}
              width={width}
              Render={
                Render as React.ComponentType<MasonryRenderProps<unknown>>
              }
              style={itemStyle}
              setItemRef={getItemHeight ? undefined : setItemRef}
              itemRole={itemRole}
              ariaSetSize={ariaSetSize}
              ariaPosInSet={index + 1}
            />
          );
        })}
      </Container>
      <div aria-live="polite" aria-atomic="true" style={VISUALLY_HIDDEN_STYLE}>
        {announcement}
      </div>
    </>
  );
}

export const MasonryVirtual = React.forwardRef(MasonryVirtualInner) as <
  T = unknown,
>(
  props: MasonryVirtualProps<T>,
) => ReactElement | null;
