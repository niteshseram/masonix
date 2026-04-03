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
import type { MasonryProps } from "../types";
import { useColumns } from "../hooks/use-columns";
import { useContainerWidth } from "../hooks/use-container-width";
import { useNativeMasonry } from "../hooks/use-native-masonry";

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
// Internal memoized item wrapper — prevents re-renders when only the parent
// layout state changes (e.g. scroll position) but item data hasn't.
// ---------------------------------------------------------------------------

interface ItemProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ItemWrapper: any;
  itemClassName: string | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  index: number;
  width: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Render: React.ComponentType<any>;
  itemRole: "listitem" | undefined;
  ariaSetSize: number;
  ariaPosInSet: number;
}

const MasonryItem = memo(function MasonryItem({
  ItemWrapper,
  itemClassName,
  data,
  index,
  width,
  Render,
  itemRole,
  ariaSetSize,
  ariaPosInSet,
}: ItemProps): ReactElement {
  return (
    <ItemWrapper
      className={itemClassName}
      role={itemRole}
      aria-setsize={itemRole ? ariaSetSize : undefined}
      aria-posinset={itemRole ? ariaPosInSet : undefined}
    >
      <Render index={index} data={data} width={width} />
    </ItemWrapper>
  );
});

// ---------------------------------------------------------------------------
// Masonry
// ---------------------------------------------------------------------------

function MasonryInner<T = unknown>(
  props: Omit<MasonryProps<T>, "ref">,
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
    enableNative,
    role,
    "aria-label": ariaLabel,
    className,
    style,
    columnClassName,
    itemClassName,
    as,
    itemAs,
    itemKey,
  } = props;

  const { ref: internalRef, width: containerWidth } = useContainerWidth(defaultWidth);

  // Merge the internal ResizeObserver ref with the user's forwarded ref
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

  const isNative = useNativeMasonry(enableNative);

  // Round-robin distribution: item itemIndex → column itemIndex % columnCount
  const columnIndices = useMemo(() => {
    const cols: number[][] = Array.from({ length: columnCount }, () => []);
    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      cols[itemIndex % columnCount].push(itemIndex);
    }
    return cols;
  }, [items.length, columnCount]);

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

  // Native CSS masonry path
  if (isNative) {
    const nativeStyle: CSSProperties = {
      display: "grid",
      gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
      gridTemplateRows: "masonry",
      ...(resolvedGap > 0 ? { gap: resolvedGap } : {}),
      ...style,
    };

    return (
      <>
        <Container
          ref={mergedRef}
          className={className}
          style={nativeStyle}
          role={containerRole}
          aria-label={ariaLabel}
        >
          {items.map((data, index) => {
            const key = itemKey ? itemKey(data, index) : index;
            return (
              <MasonryItem
                key={key}
                ItemWrapper={ItemWrapper}
                itemClassName={itemClassName}
                data={data}
                index={index}
                width={columnWidth}
                Render={Render}
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

  // Flexbox column path
  const containerStyle: CSSProperties = {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    ...(resolvedGap > 0 ? { columnGap: resolvedGap } : {}),
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
        {columnIndices.map((indices, colIndex) => (
          <div
            key={colIndex}
            className={columnClassName}
            role="presentation"
            style={{
              width: columnWidth,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              ...(resolvedGap > 0 ? { rowGap: resolvedGap } : {}),
            }}
          >
            {indices.map((itemIndex) => {
              const data = items[itemIndex];
              const key = itemKey ? itemKey(data, itemIndex) : itemIndex;
              return (
                <MasonryItem
                  key={key}
                  ItemWrapper={ItemWrapper}
                  itemClassName={itemClassName}
                  data={data}
                  index={itemIndex}
                  width={columnWidth}
                  Render={Render}
                  itemRole={itemRole}
                  ariaSetSize={ariaSetSize}
                  ariaPosInSet={itemIndex + 1}
                />
              );
            })}
          </div>
        ))}
      </Container>
      <div aria-live="polite" aria-atomic="true" style={VISUALLY_HIDDEN_STYLE}>
        {announcement}
      </div>
    </>
  );
}

export const Masonry = React.forwardRef(MasonryInner) as <T = unknown>(
  props: MasonryProps<T>,
) => ReactElement | null;
