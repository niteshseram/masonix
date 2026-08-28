import { useEffect, useState } from 'react';

import type { MasonryLayoutMode } from '../types';

/**
 * Detects native CSS Grid Lanes support after hydration.
 */
export function useNativeMasonry(
  enabled: boolean | undefined,
): MasonryLayoutMode {
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (
      !enabled ||
      typeof CSS === 'undefined' ||
      typeof CSS.supports !== 'function'
    ) {
      setIsSupported(false);
      return;
    }

    setIsSupported(CSS.supports('display', 'grid-lanes'));
  }, [enabled]);

  return enabled && isSupported ? 'native' : 'fallback';
}
