import { useCallback, useRef } from 'react';

import { getScrollOffset, getScrollTop, scrollTo } from '../core/scroll';
import type { MasonryVirtualHandle, Positioner } from '../types';

export interface UseScrollToIndexOptions {
  positioner: Positioner;
  containerRef: React.RefObject<HTMLElement | null>;
  getScrollContainer: () => HTMLElement | Window | null;
  viewportHeight: number;
}

function prefersReducedMotion(): boolean {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Provides the imperative `MasonryVirtualHandle` scrolling methods.
 *
 * Respects `prefers-reduced-motion` — if the user prefers reduced motion,
 * smooth scrolling is disabled regardless of the `smooth` option.
 */
export function useScrollToIndex({
  positioner,
  containerRef,
  getScrollContainer,
  viewportHeight,
}: UseScrollToIndexOptions): MasonryVirtualHandle {
  const positionerRef = useRef(positioner);
  positionerRef.current = positioner;

  const getScrollContainerRef = useRef(getScrollContainer);
  getScrollContainerRef.current = getScrollContainer;

  const viewportHeightRef = useRef(viewportHeight);
  viewportHeightRef.current = viewportHeight;

  const getContainerOffset = useCallback((): number => {
    const el = containerRef.current;
    const container = getScrollContainerRef.current();
    if (!el || !container) {
      return 0;
    }
    return getScrollOffset(el, container);
  }, [containerRef]);

  const scrollToIndex: MasonryVirtualHandle['scrollToIndex'] = useCallback(
    (index, options) => {
      const item = positionerRef.current.get(index);
      if (!item) {
        return;
      }

      const container = getScrollContainerRef.current();
      if (!container) {
        return;
      }

      const containerOffset = getContainerOffset();
      const align = options?.align ?? 'start';
      const smooth = options?.smooth ?? false;
      const vh = viewportHeightRef.current;
      const currentScrollTop = getScrollTop(container);
      const itemTop = containerOffset + item.top;
      const itemBottom = itemTop + item.height;

      let targetTop: number;
      switch (align) {
        case 'auto':
          if (
            itemTop >= currentScrollTop &&
            itemBottom <= currentScrollTop + vh
          ) {
            return;
          }
          targetTop =
            item.height > vh || itemTop < currentScrollTop
              ? itemTop
              : itemBottom - vh;
          break;
        case 'center':
          targetTop = containerOffset + item.top - (vh - item.height) / 2;
          break;
        case 'end':
          targetTop = containerOffset + item.top - vh + item.height;
          break;
        default: // "start"
          targetTop = containerOffset + item.top;
          break;
      }

      const useSmooth = smooth && !prefersReducedMotion();
      scrollTo(container, Math.max(0, targetTop), useSmooth);
    },
    [getContainerOffset],
  );

  const scrollToOffset: MasonryVirtualHandle['scrollToOffset'] = useCallback(
    (offset, options) => {
      const container = getScrollContainerRef.current();
      if (!container || !Number.isFinite(offset)) {
        return;
      }
      const useSmooth = options?.smooth === true && !prefersReducedMotion();
      scrollTo(container, Math.max(0, offset), useSmooth);
    },
    [],
  );

  const scrollBy: MasonryVirtualHandle['scrollBy'] = useCallback(
    (delta, options) => {
      const container = getScrollContainerRef.current();
      if (!container || !Number.isFinite(delta)) {
        return;
      }
      const useSmooth = options?.smooth === true && !prefersReducedMotion();
      const targetTop = getScrollTop(container) + delta;
      scrollTo(container, Math.max(0, targetTop), useSmooth);
    },
    [],
  );

  return { scrollToIndex, scrollToOffset, scrollBy };
}
