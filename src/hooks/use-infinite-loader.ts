import { useCallback, useEffect, useRef } from "react";
import type { Positioner } from "../types";

export interface UseInfiniteLoaderOptions {
  /** Called when more items need to be loaded. Receives the range of indices to load. */
  onLoadMore: (startIndex: number, stopIndex: number) => void | Promise<void>;
  /** Returns true if the item at `index` is already loaded. */
  isItemLoaded?: (index: number) => boolean;
  /** Total number of items (including not-yet-loaded). Defaults to Infinity. */
  totalItems?: number;
  /** Number of items before the end of the list that triggers a load. Defaults to 16. */
  threshold?: number;
}

/**
 * Infinite scroll loader with batch loading, duplicate prevention,
 * and concurrent load guard.
 *
 * Returns a `checkLoad` function that should be called whenever the
 * visible range changes (from the scroller / range-change callback).
 */
export function useInfiniteLoader({
  onLoadMore,
  isItemLoaded,
  totalItems = Number.POSITIVE_INFINITY,
  threshold = 16,
}: UseInfiniteLoaderOptions): {
  checkLoad: (visibleStartIndex: number, visibleStopIndex: number, positioner: Positioner) => void;
} {
  const loadingRef = useRef(false);
  const onLoadMoreRef = useRef(onLoadMore);
  const isItemLoadedRef = useRef(isItemLoaded);
  const totalItemsRef = useRef(totalItems);
  const thresholdRef = useRef(threshold);

  // Keep refs current without re-creating the callback
  onLoadMoreRef.current = onLoadMore;
  isItemLoadedRef.current = isItemLoaded;
  totalItemsRef.current = totalItems;
  thresholdRef.current = threshold;

  // Track whether component is still mounted
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const checkLoad = useCallback(
    (visibleStartIndex: number, visibleStopIndex: number, positioner: Positioner) => {
      // Guard: already loading
      if (loadingRef.current) return;

      const total = totalItemsRef.current;
      const placed = positioner.size();
      const thresh = thresholdRef.current;
      const checkLoaded = isItemLoadedRef.current;

      // Nothing more to load
      if (placed >= total) return;

      // Find the first unloaded item in the visible range + threshold
      const rangeEnd = Math.min(visibleStopIndex + thresh, total - 1);
      let needsLoad = false;
      let loadStart = placed;
      let loadStop = rangeEnd;

      if (checkLoaded) {
        // Scan for first unloaded item
        for (let i = visibleStartIndex; i <= rangeEnd; i++) {
          if (!checkLoaded(i)) {
            needsLoad = true;
            loadStart = i;
            break;
          }
        }
        if (needsLoad) {
          // Find last unloaded in range
          for (let i = rangeEnd; i >= loadStart; i--) {
            if (!checkLoaded(i)) {
              loadStop = i;
              break;
            }
          }
        }
      } else {
        // Without isItemLoaded, trigger when visible range approaches the end
        needsLoad = visibleStopIndex + thresh >= placed;
        loadStart = placed;
        loadStop = Math.min(placed + thresh, total - 1);
      }

      if (!needsLoad) return;

      loadingRef.current = true;
      const result = onLoadMoreRef.current(loadStart, loadStop);

      if (result && typeof result.then === "function") {
        result.then(
          () => {
            if (mountedRef.current) loadingRef.current = false;
          },
          () => {
            if (mountedRef.current) loadingRef.current = false;
          },
        );
      } else {
        loadingRef.current = false;
      }
    },
    [],
  );

  return { checkLoad };
}
