import React, {
  type CSSProperties,
  type ReactElement,
  memo,
  useCallback,
  useEffect,
  useMemo,
} from 'react';

import { useColumns } from '../hooks/use-columns';
import { useContainerWidth } from '../hooks/use-container-width';
import { useMasonryItemCountAnnouncement } from '../hooks/use-masonry-item-count-announcement';
import { useNativeMasonry } from '../hooks/use-native-masonry';
import type { MasonryProps } from '../types';
import { VISUALLY_HIDDEN_STYLE } from '../utils/masonry-styles';
import { MasonryBalanced } from './masonry-balanced';

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
  itemRole: 'listitem' | undefined;
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
  props: Omit<MasonryProps<T>, 'ref'>,
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
    defaultColumns = 3,
    defaultWidth,
    enableNative,
    onLayoutModeChange,
    role,
    'aria-label': ariaLabel,
    announceItemCountChanges = false,
    className,
    style,
    columnClassName,
    itemClassName,
    as,
    itemAs,
    itemKey,
    ...containerProps
  } = props;

  const { ref: internalRef, width: containerWidth } =
    useContainerWidth(defaultWidth);

  // Merge the internal ResizeObserver ref with the user's forwarded ref
  const mergedRef = useCallback(
    (node: HTMLElement | null) => {
      internalRef(node);
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
    [internalRef, externalRef],
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

  const layoutMode = useNativeMasonry(enableNative);
  const isNative = layoutMode === 'native';

  useEffect(() => {
    onLayoutModeChange?.(layoutMode);
  }, [layoutMode, onLayoutModeChange]);

  // Round-robin distribution: item itemIndex → column itemIndex % columnCount
  const columnIndices = useMemo(() => {
    const cols: number[][] = Array.from({ length: columnCount }, () => []);
    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      cols[itemIndex % columnCount].push(itemIndex);
    }
    return cols;
  }, [items.length, columnCount]);

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
  const ariaSetSize = items.length;

  // Native CSS masonry path
  if (isNative) {
    const nativeStyle: CSSProperties = {
      display: 'grid-lanes',
      gridTemplateColumns: `repeat(${columnCount}, ${columnWidth}px)`,
      columnGap: resolvedGap || undefined,
      rowGap: resolvedRowGap || undefined,
      ...style,
    };

    return (
      <>
        <Container
          {...containerProps}
          ref={mergedRef}
          className={className}
          style={nativeStyle}
          data-masonix-layout={layoutMode}
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

  // Flexbox column path
  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    ...(resolvedGap > 0 ? { columnGap: resolvedGap } : {}),
    ...style,
  };

  return (
    <>
      <Container
        {...containerProps}
        ref={mergedRef}
        className={className}
        style={containerStyle}
        data-masonix-layout={layoutMode}
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
              display: 'flex',
              flexDirection: 'column',
              rowGap: resolvedRowGap || undefined,
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

const MasonryColumns = React.forwardRef(MasonryInner) as <T>(
  props: MasonryProps<T>,
) => ReactElement | null;

function MasonryDispatch<T>(
  props: Omit<MasonryProps<T>, 'ref'>,
  ref: React.ForwardedRef<HTMLElement>,
) {
  const {
    preserveItemState,
    enableNative,
    columnClassName,
    onLayoutModeChange,
    ...shared
  } = props;
  useEffect(() => {
    if (preserveItemState) {
      onLayoutModeChange?.('fallback');
    }
  }, [preserveItemState, onLayoutModeChange]);
  if (preserveItemState) {
    return (
      <MasonryBalanced {...shared} ref={ref} data-masonix-layout="fallback" />
    );
  }
  return (
    <MasonryColumns
      {...shared}
      enableNative={enableNative}
      columnClassName={columnClassName}
      onLayoutModeChange={onLayoutModeChange}
      ref={ref}
    />
  );
}

export const Masonry = React.forwardRef(MasonryDispatch) as <T = unknown>(
  props: MasonryProps<T>,
) => ReactElement | null;
