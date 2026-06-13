import { type RefCallback, useCallback, useRef, useState } from 'react';

import { isServer } from '../utils/ssr';

/**
 * Tracks the inline size of a DOM element via ResizeObserver.
 *
 * Returns a stable ref callback (attach to your container element) and the
 * current measured width in pixels. Width 0 is ignored — this handles tabs,
 * modals, and collapsed panels that temporarily report 0 dimensions.
 */
export function useContainerWidth(defaultWidth?: number): {
  ref: RefCallback<HTMLElement>;
  width: number;
} {
  const [width, setWidth] = useState<number>(defaultWidth ?? 0);
  const observerRef = useRef<ResizeObserver | null>(null);

  const ref = useCallback<RefCallback<HTMLElement>>(
    (node) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      if (!node || isServer) return;

      // Measure immediately to avoid a blank-to-layout flash
      const immediate = node.getBoundingClientRect().width;
      if (immediate > 0) setWidth(immediate);

      const ro = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (!entry) return;
        const measuredWidth = entry.contentBoxSize
          ? entry.contentBoxSize[0].inlineSize
          : entry.contentRect.width;
        // Ignore 0-width: element is hidden or detached
        if (measuredWidth > 0) setWidth(measuredWidth);
      });

      ro.observe(node);
      observerRef.current = ro;
    },
    [], // stable: no captured variables that change
  );

  return { ref, width };
}
