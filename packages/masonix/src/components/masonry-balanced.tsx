import React, {
  type CSSProperties,
  type ReactElement,
  memo,
  useCallback,
  useRef,
  type RefCallback,
} from 'react';

import { useColumns } from '../hooks/use-columns';
import { useContainerWidth } from '../hooks/use-container-width';
import { useItemHeights } from '../hooks/use-item-heights';
import { useMasonryItemCountAnnouncement } from '../hooks/use-masonry-item-count-announcement';
import { useMasonryLayout } from '../hooks/use-masonry-layout';
import { useMasonryScrollAnchor } from '../hooks/use-masonry-scroll-anchor';
import { useMeasurementIndexes } from '../hooks/use-measurement-indexes';
import type { MasonryBalancedProps, MasonryRenderProps } from '../types';
import { VISUALLY_HIDDEN_STYLE } from '../utils/masonry-styles';

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
  measureIndex: number;
  top: number;
  left: number;
  width: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Render: React.ComponentType<any>;
  visibility: CSSProperties['visibility'];
  setItemRef?: (node: HTMLElement | null, index: number) => void;
  itemRole: 'listitem' | undefined;
  ariaSetSize: number;
  ariaPosInSet: number;
}

const BalancedItem = memo(function BalancedItem({
  ItemWrapper,
  itemClassName,
  data,
  index,
  measureIndex,
  top,
  left,
  width,
  Render,
  visibility,
  setItemRef,
  itemRole,
  ariaSetSize,
  ariaPosInSet,
}: BalancedItemProps): ReactElement {
  // Keep measurement identity in a ref so the callback below never needs it as a dep.
  // setItemRef is permanently stable (useCallback([]) in useItemHeights),
  // so refCallback is created once on mount and never recreated.
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
  props: Omit<MasonryBalancedProps<T>, 'ref'>,
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
    scrollContainer,
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
    ...containerProps
  } = props;

  const containerElRef = useRef<HTMLElement | null>(null);
  const { ref: internalRef, width: containerWidth } =
    useContainerWidth(defaultWidth);

  const mergedRef = useCallback(
    (node: HTMLElement | null) => {
      containerElRef.current = node;
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

  const measurementIndexes = useMeasurementIndexes(items, itemKey);
  const { measuredHeights, setItemRef } = useItemHeights(
    minItemHeight,
    measurementIndexes,
    columnWidth,
  );

  const { positionedItems, containerHeight, positioner } = useMasonryLayout({
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

  useMasonryScrollAnchor({
    enabled: preserveScrollPosition,
    search: positioner.search,
    items,
    positionedItems,
    itemKey,
    containerRef: containerElRef,
    scrollContainer,
  });

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

  const containerStyle: CSSProperties = {
    position: 'relative',
    height: containerHeight,
    overflowAnchor: preserveScrollPosition ? 'none' : undefined,
    ...style,
  };

  return (
    <>
      <Container
        {...containerProps}
        ref={mergedRef}
        className={className}
        style={containerStyle}
        role={containerRole}
        aria-label={ariaLabel}
      >
        {positionedItems.map(({ index, top, left, width, measured }) => {
          const data = items[index];
          const key = itemKey ? itemKey(data as T, index) : index;

          return (
            <BalancedItem
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
              visibility={
                getItemHeight ? undefined : measured ? 'visible' : 'hidden'
              }
              setItemRef={getItemHeight ? undefined : setItemRef}
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

export const MasonryBalanced = React.forwardRef(MasonryBalancedInner) as <
  T = unknown,
>(
  props: MasonryBalancedProps<T>,
) => ReactElement | null;
