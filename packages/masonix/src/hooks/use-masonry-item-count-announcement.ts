import { useEffect, useRef, useState } from 'react';

export function useMasonryItemCountAnnouncement(
  itemCount: number,
  enabled: boolean | undefined,
): string {
  const [announcement, setAnnouncement] = useState('');
  const previousItemCountRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      previousItemCountRef.current = itemCount;
      setAnnouncement('');
      return;
    }

    if (
      previousItemCountRef.current !== null &&
      previousItemCountRef.current !== itemCount
    ) {
      setAnnouncement(`${itemCount} ${itemCount === 1 ? 'item' : 'items'}`);
    }
    previousItemCountRef.current = itemCount;
  }, [enabled, itemCount]);

  return announcement;
}
