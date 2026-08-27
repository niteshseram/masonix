import { type RefCallback, useCallback, useRef, useState } from 'react';

import { normalizeNonNegativeFinite } from '../core/utils';
import { isServer } from '../utils/ssr';

function getObservedBorderBoxWidth(entry: ResizeObserverEntry): number {
  const borderBoxWidth = entry.borderBoxSize?.[0]?.inlineSize;
  if (borderBoxWidth !== undefined) {
    return borderBoxWidth;
  }

  const boundingWidth = entry.target.getBoundingClientRect().width;
  if (boundingWidth > 0) {
    return boundingWidth;
  }

  return entry.contentRect.width;
}

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
  const [width, setWidth] = useState<number>(() =>
    normalizeNonNegativeFinite(defaultWidth ?? 0),
  );
  const observerRef = useRef<ResizeObserver | null>(null);

  const ref = useCallback<RefCallback<HTMLElement>>(
    (node) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      if (!node || isServer) {
        return;
      }

      // Measure immediately to avoid a blank-to-layout flash
      const immediate = node.getBoundingClientRect().width;
      if (immediate > 0) {
        setWidth(immediate);
      }

      const ro = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (!entry) {
          return;
        }
        const measuredWidth = getObservedBorderBoxWidth(entry);
        if (measuredWidth > 0) {
          setWidth((previousWidth) =>
            previousWidth === measuredWidth ? previousWidth : measuredWidth,
          );
        }
      });

      ro.observe(node);
      observerRef.current = ro;
    },
    [], // stable: no captured variables that change
  );

  return { ref, width };
}
