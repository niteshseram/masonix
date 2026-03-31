import { useCallback, useEffect, useRef, useState } from "react";

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
 */
export function useItemHeights(minItemHeight?: number): UseItemHeightsResult {
  const [measuredHeights, setMeasuredHeights] = useState<Map<number, number>>(() => new Map());

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

  const setItemRef = useCallback((node: HTMLElement | null, index: number) => {
    // Detach any previous element registered for this index
    const prev = indexToElement.current.get(index);
    if (prev) {
      observerRef.current?.unobserve(prev);
      elementToIndex.current.delete(prev);
      indexToElement.current.delete(index);
    }

    if (!node) return;

    // Create the observer on first use (lazy — avoids SSR issues)
    if (!observerRef.current) {
      observerRef.current = new ResizeObserver((entries) => {
        const updates: Array<[number, number]> = [];

        for (const entry of entries) {
          const idx = elementToIndex.current.get(entry.target);
          if (idx === undefined) continue;

          const h = entry.contentBoxSize
            ? entry.contentBoxSize[0].blockSize
            : entry.contentRect.height;

          const min = minItemHeightRef.current;
          const clamped = min !== undefined ? Math.max(min, h) : h;
          if (clamped > 0) updates.push([idx, clamped]);
        }

        if (updates.length === 0) return;

        setMeasuredHeights((prev) => {
          const next = new Map(prev);
          for (const [i, h] of updates) next.set(i, h);
          return next;
        });
      });
    }

    elementToIndex.current.set(node, index);
    indexToElement.current.set(index, node);
    observerRef.current.observe(node);
  }, []); // stable: all mutable state accessed via refs

  return { measuredHeights, setItemRef };
}
