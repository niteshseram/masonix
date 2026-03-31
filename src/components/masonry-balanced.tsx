import React, { type CSSProperties, type ReactElement, memo, useCallback, useMemo } from "react";
import type { MasonryBalancedProps, MasonryRenderProps } from "../types";
import { useColumns } from "../hooks/use-columns";
import { useContainerWidth } from "../hooks/use-container-width";
import { useItemHeights } from "../hooks/use-item-heights";
import { createBalancedPositioner } from "../core/column-balancer";

const DEFAULT_ESTIMATED_HEIGHT = 150;

// ---------------------------------------------------------------------------
// Internal memoized item — prevents re-renders on unrelated layout updates
// ---------------------------------------------------------------------------

interface BalancedItemProps {
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
}

const BalancedItem = memo(function BalancedItem({
  ItemWrapper,
  itemClassName,
  data,
  index,
  width,
  Render,
  style,
  setItemRef,
}: BalancedItemProps): ReactElement {
  return (
    <ItemWrapper ref={setItemRef} className={itemClassName} style={style}>
      <Render index={index} data={data} width={width} />
    </ItemWrapper>
  );
});

// ---------------------------------------------------------------------------
// MasonryBalanced
// ---------------------------------------------------------------------------

function MasonryBalancedInner<T = unknown>(
  props: Omit<MasonryBalancedProps<T>, "ref">,
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
  } = props;

  const { ref: internalRef, width: containerWidth } = useContainerWidth(defaultWidth);

  const mergedRef = useCallback(
    (node: HTMLElement | null) => {
      internalRef(node);
      if (!externalRef) return;
      if (typeof externalRef === "function") {
        externalRef(node);
      } else {
        (externalRef as React.MutableRefObject<HTMLElement | null>).current = node;
      }
    },
    [internalRef, externalRef],
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

  // Build positioned items from a fresh positioner every time layout inputs change.
  // A fresh positioner is cheaper than incremental update because React's useMemo
  // already batches renders — we won't rebuild more often than truly necessary.
  const positionedItems = useMemo(() => {
    if (columnCount === 0) return [];

    const positioner = createBalancedPositioner({
      columnCount,
      columnWidth,
      columnGap: resolvedGap,
      rowGap: resolvedGap,
    });

    return items.map((data, index) => {
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
      const positioned = positioner.set(index, height, span);
      return { ...positioned, measured };
    });
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

  // Container height = bottom edge of the tallest item (no trailing gap)
  const containerHeight =
    positionedItems.length > 0 ? Math.max(...positionedItems.map((p) => p.top + p.height)) : 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Container: any = as ?? "div";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ItemWrapper: any = itemAs ?? "div";

  const containerRole = role === "none" ? undefined : (role ?? "list");
  const dirAttr = dir === "auto" ? undefined : dir;

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
        const data = items[index];
        const key = itemKey ? itemKey(data as T, index) : index;

        const itemStyle: CSSProperties = {
          position: "absolute",
          top,
          insetInlineStart: left,
          width,
          // Hide unmeasured items so they don't flash at the wrong size.
          // Once measured, they snap to their final position.
          ...(getItemHeight ? {} : { visibility: measured ? "visible" : ("hidden" as const) }),
        };

        return (
          <BalancedItem
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
          />
        );
      })}
    </Container>
  );
}

export const MasonryBalanced = React.forwardRef(MasonryBalancedInner) as <T = unknown>(
  props: MasonryBalancedProps<T>,
) => ReactElement | null;
