import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';

import { getScrollTop, getViewportHeight } from '../core/scroll';
import { isServer } from '../utils/ssr';

export interface ScrollerState {
  scrollTop: number;
  viewportHeight: number;
  scrollVelocity: number;
}

interface ScrollStore {
  subscribe: (onStoreChange: () => void) => () => void;
  getSnapshot: () => ScrollerState;
  getServerSnapshot: () => ScrollerState;
}

const SERVER_SNAPSHOT: ScrollerState = {
  scrollTop: 0,
  viewportHeight: 0,
  scrollVelocity: 0,
};

/**
 * Tear-free scroll tracking via `useSyncExternalStore`.
 *
 * Uses a passive scroll listener throttled to `fps` frames per second
 * (default 12 — ~83ms between reads, sufficient for windowing decisions).
 */
export function useScroller(
  scrollContainer?: React.RefObject<HTMLElement | null>,
  fps = 12,
): ScrollerState {
  const storeRef = useRef<ScrollStore | null>(null);
  const stateRef = useRef<ScrollerState>(SERVER_SNAPSHOT);
  const listenersRef = useRef<Set<() => void>>(new Set());
  const rafIdRef = useRef<number | null>(null);
  const scrollEndTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const lastTickRef = useRef(0);

  const getContainer = useCallback((): HTMLElement | Window => {
    return scrollContainer?.current ?? window;
  }, [scrollContainer]);

  // Build a stable store — the identity must not change between renders
  if (!storeRef.current) {
    const subscribe = (onStoreChange: () => void): (() => void) => {
      listenersRef.current.add(onStoreChange);
      return () => {
        listenersRef.current.delete(onStoreChange);
      };
    };

    const getSnapshot = (): ScrollerState => stateRef.current;
    const getServerSnapshot = (): ScrollerState => SERVER_SNAPSHOT;

    storeRef.current = { subscribe, getSnapshot, getServerSnapshot };
  }

  const notify = useCallback(() => {
    for (const listener of listenersRef.current) {
      listener();
    }
  }, []);

  // Attach / detach scroll listener
  useEffect(() => {
    if (isServer) return;

    const container = getContainer();
    const interval = 1000 / fps;
    const settleDelay = Math.max(120, interval * 2);

    const clearScrollEndTimeout = (): void => {
      if (scrollEndTimeoutRef.current !== null) {
        clearTimeout(scrollEndTimeoutRef.current);
        scrollEndTimeoutRef.current = null;
      }
    };

    const scheduleScrollEnd = (): void => {
      clearScrollEndTimeout();
      scrollEndTimeoutRef.current = setTimeout(() => {
        scrollEndTimeoutRef.current = null;
        if (stateRef.current.scrollVelocity === 0) return;
        stateRef.current = {
          ...stateRef.current,
          scrollVelocity: 0,
        };
        notify();
      }, settleDelay);
    };

    // Read initial state
    lastTickRef.current = performance.now() - interval;
    stateRef.current = {
      scrollTop: getScrollTop(container),
      viewportHeight: getViewportHeight(container),
      scrollVelocity: 0,
    };
    notify();

    const handleScroll = (): void => {
      const now = performance.now();
      if (now - lastTickRef.current < interval) {
        // Schedule a trailing tick if we haven't already
        if (rafIdRef.current === null) {
          rafIdRef.current = requestAnimationFrame(() => {
            rafIdRef.current = null;
            handleScroll();
          });
        }
        return;
      }
      const nextScrollTop = getScrollTop(container);
      const elapsed = Math.max(1, now - lastTickRef.current);
      lastTickRef.current = now;
      stateRef.current = {
        scrollTop: nextScrollTop,
        viewportHeight: getViewportHeight(container),
        scrollVelocity:
          ((nextScrollTop - stateRef.current.scrollTop) / elapsed) * 1000,
      };
      scheduleScrollEnd();
      notify();
    };

    // Also track viewport resize (e.g. browser resize changes viewport height)
    const handleResize = (): void => {
      const viewportHeight = getViewportHeight(container);
      if (viewportHeight !== stateRef.current.viewportHeight) {
        stateRef.current = {
          ...stateRef.current,
          viewportHeight,
          scrollVelocity: 0,
        };
        notify();
      }
    };

    const target = container instanceof Window ? window : container;
    target.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      target.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      clearScrollEndTimeout();
    };
  }, [getContainer, fps, notify]);

  return useSyncExternalStore(
    storeRef.current.subscribe,
    storeRef.current.getSnapshot,
    storeRef.current.getServerSnapshot,
  );
}
