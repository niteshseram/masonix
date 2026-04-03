import React, {
  type CSSProperties,
  type ReactElement,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import type {
  MasonryRenderProps,
  MasonryVirtualHandle,
  MasonryVirtualProps,
  PositionedItem,
} from "../types";
import { useColumns } from "../hooks/use-columns";
import { useContainerWidth } from "../hooks/use-container-width";
import { useItemHeights } from "../hooks/use-item-heights";
import { useScroller } from "../hooks/use-scroller";
import { useInfiniteLoader } from "../hooks/use-infinite-loader";
import { useScrollToIndex } from "../hooks/use-scroll-to-index";
import { createBalancedPositioner } from "../core/column-balancer";
import { createIntervalTree } from "../core/interval-tree";
import { getScrollOffset } from "../core/scroll";

const DEFAULT_ESTIMATED_HEIGHT = 150;
const DEFAULT_OVERSCAN = 2;

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
  width: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Render: React.ComponentType<any>;
  style: CSSProperties;
  setItemRef?: (node: HTMLElement | null) => void;
  ariaSetSize: number;
  ariaPosInSet: number;
}

const VirtualItem = memo(function VirtualItem({
  ItemWrapper,
  itemClassName,
  data,
  index,
  width,
  Render,
  style,
  setItemRef,
  ariaSetSize,
  ariaPosInSet,
}: VirtualItemProps): ReactElement {
  return (
    <ItemWrapper
      ref={setItemRef}
      className={itemClassName}
      style={style}
      role="listitem"
      aria-setsize={ariaSetSize}
      aria-posinset={ariaPosInSet}
    >
      <Render index={index} data={data} width={width} />
    </ItemWrapper>
  );
});

// ---------------------------------------------------------------------------
// MasonryVirtual
// ---------------------------------------------------------------------------

function MasonryVirtualInner<T = unknown>(
  props: Omit<MasonryVirtualProps<T>, "ref">,
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
    dir,
    getItemHeight,
    getColumnSpan,
    estimatedItemHeight = DEFAULT_ESTIMATED_HEIGHT,
    minItemHeight,
    empty,
    role,
    "aria-label": ariaLabel,
    className,
    style,
    itemClassName,
    as,
    itemAs,
    itemKey,
    // Virtual-specific props
    overscanBy = DEFAULT_OVERSCAN,
    scrollContainer,
    onLoadMore,
    isItemLoaded,
    totalItems,
    loadMoreThreshold,
    scrollRef,
    onRangeChange,
  } = props;

  const containerElRef = useRef<HTMLElement | null>(null);
  const { ref: widthRef, width: containerWidth } = useContainerWidth(defaultWidth);

  const mergedRef = useCallback(
    (node: HTMLElement | null) => {
      containerElRef.current = node;
      widthRef(node);
      if (!externalRef) return;
      if (typeof externalRef === "function") {
        externalRef(node);
      } else {
        (externalRef as React.MutableRefObject<HTMLElement | null>).current = node;
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

  // Scroll tracking
  const { scrollTop, viewportHeight } = useScroller(scrollContainer);

  // Build positioner + interval tree from current layout inputs
  const { positionedItems, positioner, intervalTree, containerHeight } = useMemo(() => {
    if (columnCount === 0) {
      return {
        positionedItems: [] as Array<PositionedItem & { measured: boolean }>,
        positioner: createBalancedPositioner({
          columnCount: 1,
          columnWidth: 0,
          columnGap: 0,
          rowGap: 0,
        }),
        intervalTree: createIntervalTree(),
        containerHeight: 0,
      };
    }

    const pos = createBalancedPositioner({
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
        const h = measuredHeights.get(index);
        measured = h !== undefined;
        height = h ?? estimatedItemHeight;
      }

      const span = getColumnSpan ? getColumnSpan(data, index) : undefined;
      const item = pos.set(index, height, span);
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
    getColumnSpan,
    measuredHeights,
    estimatedItemHeight,
  ]);

  // Compute the container's scroll offset (distance from scroll container top to masonry top)
  const containerOffset = useMemo(() => {
    const el = containerElRef.current;
    if (!el) return 0;
    const container = scrollContainer?.current ?? window;
    return getScrollOffset(el, container);
  }, [scrollContainer, scrollTop]); // Re-read on scroll for accurate values

  // Determine visible range using interval tree
  const { visibleIndices, startIndex, stopIndex } = useMemo(() => {
    if (positionedItems.length === 0 || viewportHeight === 0) {
      return { visibleIndices: new Set<number>(), startIndex: 0, stopIndex: 0 };
    }

    const overscanPx = viewportHeight * overscanBy;
    const viewTop = Math.max(0, scrollTop - containerOffset - overscanPx);
    const viewBottom = scrollTop - containerOffset + viewportHeight + overscanPx;

    const indices = new Set<number>();
    let start = Number.POSITIVE_INFINITY;
    let stop = 0;

    intervalTree.search(viewTop, viewBottom, (index) => {
      indices.add(index);
      if (index < start) start = index;
      if (index > stop) stop = index;
    });

    return {
      visibleIndices: indices,
      startIndex: indices.size > 0 ? start : 0,
      stopIndex: indices.size > 0 ? stop : 0,
    };
  }, [positionedItems, intervalTree, scrollTop, containerOffset, viewportHeight, overscanBy]);

  // Notify range changes
  const prevRangeRef = useRef<[number, number]>([0, 0]);
  useEffect(() => {
    if (
      onRangeChange &&
      (prevRangeRef.current[0] !== startIndex || prevRangeRef.current[1] !== stopIndex)
    ) {
      prevRangeRef.current = [startIndex, stopIndex];
      onRangeChange(startIndex, stopIndex);
    }
  }, [onRangeChange, startIndex, stopIndex]);

  // Infinite loading — use a no-op fallback so the hook is always called
  const noopLoadMore = useCallback(() => {}, []);
  const { checkLoad } = useInfiniteLoader({
    onLoadMore: onLoadMore ?? noopLoadMore,
    isItemLoaded,
    totalItems,
    threshold: loadMoreThreshold,
  });

  useEffect(() => {
    if (onLoadMore && positioner) {
      checkLoad(startIndex, stopIndex, positioner);
    }
  }, [onLoadMore, checkLoad, startIndex, stopIndex, positioner]);

  // Scroll-to-index imperative handle
  const scrollContainerResolved = scrollContainer?.current ?? (typeof window !== "undefined" ? window : null);

  const handle = useScrollToIndex({
    positioner,
    containerRef: containerElRef,
    scrollContainer: scrollContainerResolved ?? window,
    viewportHeight,
  });

  // Re-scroll after measurement-driven layout shifts
  const pendingReScrollRef = useRef<{
    index: number;
    options?: Parameters<MasonryVirtualHandle["scrollToIndex"]>[1];
    prevTop: number;
  } | null>(null);
  const handleRef = useRef(handle);
  handleRef.current = handle;

  useEffect(() => {
    const pending = pendingReScrollRef.current;
    if (!pending) return;
    const item = positioner.get(pending.index);
    if (!item || item.top === pending.prevTop) {
      pendingReScrollRef.current = null;
      return;
    }
    pending.prevTop = item.top;
    handleRef.current.scrollToIndex(pending.index, { ...pending.options, smooth: false });
  }, [positionedItems, positioner]);

  useImperativeHandle(
    scrollRef,
    () => ({
      ...handle,
      scrollToIndex: (index, options) => {
        const item = positioner.get(index);
        pendingReScrollRef.current = { index, options, prevTop: item?.top ?? -1 };
        handle.scrollToIndex(index, options);
      },
    }),
    [handle, positioner],
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Container: any = as ?? "div";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ItemWrapper: any = itemAs ?? "div";

  const containerRole = role === "none" ? undefined : (role ?? "list");
  const dirAttr = dir === "auto" ? undefined : dir;
  const ariaSetSize = totalItems ?? items.length;

  if (items.length === 0) {
    return (
      <Container
        ref={mergedRef}
        className={className}
        style={style}
        role={containerRole}
        aria-label={ariaLabel}
        dir={dirAttr}
      >
        {empty ?? null}
      </Container>
    );
  }

  const containerStyle: CSSProperties = {
    position: "relative",
    height: containerHeight,
    ...style,
  };

  return (
    <Container
      ref={mergedRef}
      className={className}
      style={containerStyle}
      role={containerRole}
      aria-label={ariaLabel}
      dir={dirAttr}
    >
      {positionedItems.map(({ index, top, left, width, measured }) => {
        // Only render items in the visible range (virtualization)
        if (!visibleIndices.has(index)) return null;

        const data = items[index];
        const key = itemKey ? itemKey(data as T, index) : index;

        const itemStyle: CSSProperties = {
          position: "absolute",
          top,
          insetInlineStart: left,
          width,
          ...(getItemHeight ? {} : { visibility: measured ? "visible" : ("hidden" as const) }),
        };

        return (
          <VirtualItem
            key={key}
            ItemWrapper={ItemWrapper}
            itemClassName={itemClassName}
            data={data}
            index={index}
            width={width}
            Render={Render as React.ComponentType<MasonryRenderProps<unknown>>}
            style={itemStyle}
            setItemRef={
              getItemHeight ? undefined : (node: HTMLElement | null) => setItemRef(node, index)
            }
            ariaSetSize={ariaSetSize}
            ariaPosInSet={index + 1}
          />
        );
      })}
    </Container>
  );
}

export const MasonryVirtual = React.forwardRef(MasonryVirtualInner) as <T = unknown>(
  props: MasonryVirtualProps<T>,
) => ReactElement | null;
