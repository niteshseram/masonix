import { useCallback, useEffect, useRef, useState } from 'react';

import { normalizeNonNegativeFinite } from '../core/utils';

function getObservedBorderBoxHeight(entry: ResizeObserverEntry): number {
  const borderBoxHeight = entry.borderBoxSize?.[0]?.blockSize;
  if (borderBoxHeight !== undefined) {
    return borderBoxHeight;
  }

  const boundingHeight = entry.target.getBoundingClientRect().height;
  if (boundingHeight > 0) {
    return boundingHeight;
  }

  return entry.contentRect.height;
}

export interface UseItemHeightsResult {
  /** Map of item index → measured height in px */
  measuredHeights: Map<number, number>;
  /**
   * Stable ref callback. Call as `ref={(node) => setItemRef(node, index)}`.
   * Attaches/detaches the element from the shared ResizeObserver.
   */
  setItemRef: (node: HTMLElement | null, index: number) => void;
}

/**
 * Tracks the rendered heights of masonry items using a single shared
 * ResizeObserver. Uses WeakMap<Element, index> for O(1) reverse lookup.
 *
 * @param minItemHeight - Optional lower bound; heights below this are clamped.
 * @param activeMeasurementIndexes - Optional identities to retain in the cache.
 */
export function useItemHeights(
  minItemHeight?: number,
  activeMeasurementIndexes?: number[],
): UseItemHeightsResult {
  const [measuredHeights, setMeasuredHeights] = useState<Map<number, number>>(
    () => new Map(),
  );

  const observerRef = useRef<ResizeObserver | null>(null);
  const elementToIndex = useRef(new WeakMap<Element, number>());
  const indexToElement = useRef(new Map<number, Element>());
  // Kept in a ref so the RO callback always reads the current value without
  // being recreated when minItemHeight changes.
  const minItemHeightRef = useRef(minItemHeight);
  minItemHeightRef.current = minItemHeight;

  // Disconnect on unmount
  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!activeMeasurementIndexes) {
      return;
    }

    const activeIndexes = new Set(activeMeasurementIndexes);
    setMeasuredHeights((previousHeights) => {
      let nextHeights: Map<number, number> | undefined;
      for (const measurementIndex of previousHeights.keys()) {
        if (!activeIndexes.has(measurementIndex)) {
          nextHeights ??= new Map(previousHeights);
          nextHeights.delete(measurementIndex);
        }
      }
      return nextHeights ?? previousHeights;
    });
  }, [activeMeasurementIndexes]);

  const setItemRef = useCallback((node: HTMLElement | null, index: number) => {
    const prev = indexToElement.current.get(index);
    if (prev) {
      observerRef.current?.unobserve(prev);
      elementToIndex.current.delete(prev);
      indexToElement.current.delete(index);
    }

    if (!node) {
      return;
    }

    // Create the observer on first use (lazy — avoids SSR issues)
    if (!observerRef.current) {
      observerRef.current = new ResizeObserver((entries) => {
        const updates: Array<[number, number]> = [];

        for (const entry of entries) {
          const itemIndex = elementToIndex.current.get(entry.target);
          if (itemIndex === undefined) {
            continue;
          }

          const rawHeight = getObservedBorderBoxHeight(entry);

          const minHeight = minItemHeightRef.current;
          const clamped =
            minHeight !== undefined && Number.isFinite(minHeight)
              ? Math.max(normalizeNonNegativeFinite(minHeight), rawHeight)
              : rawHeight;
          if (Number.isFinite(clamped) && clamped > 0) {
            updates.push([itemIndex, clamped]);
          }
        }

        if (updates.length === 0) {
          return;
        }

        setMeasuredHeights((prev) => {
          let next: Map<number, number> | undefined;
          for (const [itemIndex, height] of updates) {
            if (prev.get(itemIndex) !== height) {
              next ??= new Map(prev);
              next.set(itemIndex, height);
            }
          }
          return next ?? prev;
        });
      });
    }

    elementToIndex.current.set(node, index);
    indexToElement.current.set(index, node);
    observerRef.current.observe(node);
  }, []);

  return { measuredHeights, setItemRef };
}
