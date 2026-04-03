import { useCallback, useRef } from "react";
import { getScrollOffset, getScrollTop, scrollTo } from "../core/scroll";
import type { MasonryVirtualHandle, Positioner } from "../types";

interface UseScrollToIndexOptions {
  positioner: Positioner;
  containerRef: React.RefObject<HTMLElement | null>;
  scrollContainer: HTMLElement | Window;
  viewportHeight: number;
}

/**
 * Provides the imperative `MasonryVirtualHandle` methods:
 * scrollToIndex, scrollToOffset, getVisibleRange.
 *
 * Respects `prefers-reduced-motion` — if the user prefers reduced motion,
 * smooth scrolling is disabled regardless of the `smooth` option.
 */
export function useScrollToIndex({
  positioner,
  containerRef,
  scrollContainer,
  viewportHeight,
}: UseScrollToIndexOptions): MasonryVirtualHandle {
  const positionerRef = useRef(positioner);
  positionerRef.current = positioner;

  const scrollContainerRef = useRef(scrollContainer);
  scrollContainerRef.current = scrollContainer;

  const viewportHeightRef = useRef(viewportHeight);
  viewportHeightRef.current = viewportHeight;

  const prefersReducedMotion = useCallback((): boolean => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const getContainerOffset = useCallback((): number => {
    const el = containerRef.current;
    if (!el) return 0;
    return getScrollOffset(el, scrollContainerRef.current);
  }, [containerRef]);

  const scrollToIndex: MasonryVirtualHandle["scrollToIndex"] = useCallback(
    (index, options) => {
      const item = positionerRef.current.get(index);
      if (!item) return;

      const containerOffset = getContainerOffset();
      const align = options?.align ?? "start";
      const smooth = options?.smooth ?? false;
      const vh = viewportHeightRef.current;

      let targetTop: number;
      switch (align) {
        case "center":
          targetTop = containerOffset + item.top - (vh - item.height) / 2;
          break;
        case "end":
          targetTop = containerOffset + item.top - vh + item.height;
          break;
        default: // "start"
          targetTop = containerOffset + item.top;
          break;
      }

      const useSmooth = smooth && !prefersReducedMotion();
      scrollTo(scrollContainerRef.current, Math.max(0, targetTop), useSmooth);
    },
    [getContainerOffset, prefersReducedMotion],
  );

  const scrollToOffset: MasonryVirtualHandle["scrollToOffset"] = useCallback(
    (offset, options) => {
      const smooth = options?.smooth ?? false;
      const useSmooth = smooth && !prefersReducedMotion();
      scrollTo(scrollContainerRef.current, offset, useSmooth);
    },
    [prefersReducedMotion],
  );

  const getVisibleRange: MasonryVirtualHandle["getVisibleRange"] = useCallback(() => {
    const items = positionerRef.current.all();
    if (items.length === 0) return [0, 0];

    const containerOffset = getContainerOffset();
    const scrollTop = getScrollTop(scrollContainerRef.current);
    const vh = viewportHeightRef.current;

    const viewTop = scrollTop - containerOffset;
    const viewBottom = viewTop + vh;

    let startIndex = items.length;
    let stopIndex = 0;

    for (const item of items) {
      const itemBottom = item.top + item.height;
      if (itemBottom > viewTop && item.top < viewBottom) {
        if (item.index < startIndex) startIndex = item.index;
        if (item.index > stopIndex) stopIndex = item.index;
      }
    }

    return startIndex <= stopIndex ? [startIndex, stopIndex] : [0, 0];
  }, [getContainerOffset]);

  return {
    scrollToIndex,
    scrollToOffset,
    getVisibleRange,
  };
}
