import React, {
  type CSSProperties,
  type ReactElement,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { MasonryBalancedProps, MasonryRenderProps } from "../types";
import { useColumns } from "../hooks/use-columns";
import { useContainerWidth } from "../hooks/use-container-width";
import { useItemHeights } from "../hooks/use-item-heights";
import { createPositioner } from "../core/positioner";

const DEFAULT_ESTIMATED_HEIGHT = 150;

// Visually hidden — present in DOM for screen readers but invisible to sighted users
const VISUALLY_HIDDEN_STYLE: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

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
  setItemRef?: (node: HTMLElement | null, index: number) => void;
  itemRole: "listitem" | undefined;
  ariaSetSize: number;
  ariaPosInSet: number;
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
  itemRole,
  ariaSetSize,
  ariaPosInSet,
}: BalancedItemProps): ReactElement {
  const refCallback = useCallback(
    (node: HTMLElement | null) => {
      setItemRef?.(node, index);
    },
    [setItemRef, index],
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
    getItemHeight,
    estimatedItemHeight = DEFAULT_ESTIMATED_HEIGHT,
    minItemHeight,
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
  const { positionedItems, containerHeight } = useMemo(() => {
    if (columnCount === 0) return { positionedItems: [], containerHeight: 0 };

    const positioner = createPositioner({
      columnCount,
      columnWidth,
      columnGap: resolvedGap,
      rowGap: resolvedGap,
    });

    let maxBottom = 0;

    const positioned = items.map((data, index) => {
      let height: number;
      let measured: boolean;

      if (getItemHeight) {
        height = Math.max(0, getItemHeight(data, index, columnWidth));
        measured = true;
      } else {
        const measuredHeight = measuredHeights.get(index);
        measured = measuredHeight !== undefined;
        height = measuredHeight ?? estimatedItemHeight;
      }

      const item = positioner.set(index, height);
      const bottom = item.top + item.height;
      if (bottom > maxBottom) maxBottom = bottom;

      return { ...item, measured };
    });

    return { positionedItems: positioned, containerHeight: maxBottom };
  }, [
    items,
    columnCount,
    columnWidth,
    resolvedGap,
    getItemHeight,
    measuredHeights,
    estimatedItemHeight,
  ]);

  // aria-live announcement on item count changes (filter/add/remove)
  const [announcement, setAnnouncement] = useState("");
  const prevItemCountRef = useRef<number | null>(null);
  useEffect(() => {
    if (prevItemCountRef.current !== null && prevItemCountRef.current !== items.length) {
      setAnnouncement(`${items.length} ${items.length === 1 ? "item" : "items"}`);
    }
    prevItemCountRef.current = items.length;
  }, [items.length]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Container: any = as ?? "div";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ItemWrapper: any = itemAs ?? "div";

  const containerRole = role === "none" ? undefined : (role ?? "list");
  const itemRole: "listitem" | undefined = containerRole !== undefined ? "listitem" : undefined;
  const ariaSetSize = items.length;

  const containerStyle: CSSProperties = {
    position: "relative",
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

export const MasonryBalanced = React.forwardRef(MasonryBalancedInner) as <T = unknown>(
  props: MasonryBalancedProps<T>,
) => ReactElement | null;
