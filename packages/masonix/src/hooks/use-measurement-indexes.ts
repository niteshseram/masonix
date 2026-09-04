import { useMemo, useRef } from 'react';

export function useMeasurementIndexes<T>(
  items: T[],
  itemKey: ((data: T, index: number) => string | number) | undefined,
): number[] {
  const nextMeasurementIndexRef = useRef(0);
  const keyToMeasurementIndexRef = useRef(new Map<string | number, number>());

  return useMemo(() => {
    if (!itemKey) {
      return items.map((_, index) => index);
    }

    const activeKeys = new Set<string | number>();
    const measurementIndexes = items.map((data, index) => {
      const key = itemKey(data, index);
      activeKeys.add(key);
      let measurementIndex = keyToMeasurementIndexRef.current.get(key);
      if (measurementIndex === undefined) {
        measurementIndex = nextMeasurementIndexRef.current;
        nextMeasurementIndexRef.current += 1;
        keyToMeasurementIndexRef.current.set(key, measurementIndex);
      }
      return measurementIndex;
    });

    for (const cachedKey of keyToMeasurementIndexRef.current.keys()) {
      if (!activeKeys.has(cachedKey)) {
        keyToMeasurementIndexRef.current.delete(cachedKey);
      }
    }

    return measurementIndexes;
  }, [items, itemKey]);
}
