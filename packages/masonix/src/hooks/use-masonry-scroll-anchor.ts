import { useEffect, useLayoutEffect, useRef } from 'react';

import {
  getScrollOffset,
  getScrollTop,
  getViewportHeight,
  scrollTo,
} from '../core/scroll';
import type { MasonryScrollAnchor, PositionedItem } from '../types';

const useBrowserLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

interface AnchorOptions<T> {
  enabled: boolean;
  items: T[];
  positionedItems: PositionedItem[];
  search: (
    low: number,
    high: number,
    callback: (index: number) => void,
  ) => void;
  itemKey?: (data: T, index: number) => string | number;
  containerRef: React.RefObject<HTMLElement | null>;
  scrollContainer?: React.RefObject<HTMLElement | null>;
  suspended?: React.RefObject<unknown>;
  initialAnchor?: MasonryScrollAnchor | null;
  restoring?: React.RefObject<boolean>;
}

export function useMasonryScrollAnchor<T>(options: AnchorOptions<T>) {
  const latestRef = useRef(options);
  const restoringRef = options.restoring;
  const lastScrollTopRef = useRef<number | null>(null);
  const anchorRef = useRef<MasonryScrollAnchor | null>(
    options.initialAnchor ?? null,
  );

  function captureAnchor(): MasonryScrollAnchor | null {
    const latest = latestRef.current;
    const element = latest.containerRef.current;
    if (!element || typeof window === 'undefined') {
      return null;
    }
    const container = latest.scrollContainer?.current ?? window;
    const offset = getScrollOffset(element, container);
    const top = getScrollTop(container) - offset;
    const bottom = top + getViewportHeight(container);
    let candidate: PositionedItem | undefined;
    latest.search(top, bottom, (index) => {
      const item = latest.positionedItems[index];
      if (
        item.top + item.height > top &&
        item.top < bottom &&
        (!candidate ||
          (item.top >= top && candidate.top < top) ||
          (item.top >= top === candidate.top >= top &&
            item.top < candidate.top) ||
          (item.top === candidate.top && item.index < candidate.index))
      ) {
        candidate = item;
      }
    });
    if (!candidate) {
      return null;
    }
    return {
      key: latest.itemKey
        ? latest.itemKey(latest.items[candidate.index], candidate.index)
        : candidate.index,
      offset: candidate.top - top,
    };
  }

  useBrowserLayoutEffect(() => {
    const element = options.containerRef.current;
    if (!options.enabled || !element || typeof window === 'undefined') {
      latestRef.current = options;
      return;
    }
    const container = options.scrollContainer?.current ?? window;
    const currentScrollTop = getScrollTop(container);
    if (
      !restoringRef?.current &&
      lastScrollTopRef.current !== null &&
      currentScrollTop !== lastScrollTopRef.current
    ) {
      anchorRef.current = captureAnchor();
    }
    latestRef.current = options;
    const anchor = anchorRef.current;
    if (anchor && !options.suspended?.current) {
      const index = options.items.findIndex(
        (data, itemIndex) =>
          (options.itemKey ? options.itemKey(data, itemIndex) : itemIndex) ===
          anchor.key,
      );
      const item = options.positionedItems[index];
      if (item) {
        const target =
          getScrollOffset(element, container) + item.top - anchor.offset;
        if (Math.abs(getScrollTop(container) - target) > 0.5) {
          scrollTo(container, Math.max(0, target), false);
        }
      }
    }
    if (!restoringRef?.current) {
      anchorRef.current = captureAnchor();
    }
    lastScrollTopRef.current = getScrollTop(container);
  });

  useEffect(() => {
    if (!options.enabled || typeof window === 'undefined') {
      return;
    }
    const container = options.scrollContainer?.current ?? window;
    function onScroll() {
      if (!restoringRef?.current) {
        anchorRef.current = captureAnchor();
      }
      lastScrollTopRef.current = getScrollTop(container);
    }
    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, [options.scrollContainer, options.enabled, restoringRef]);

  return { captureAnchor };
}
