import { useMemo, useRef } from 'react';

export function useMeasurementIndexes<T>(
  items: T[],
  itemKey: ((data: T, index: number) => string | number) | undefined,
): number[] {
  const nextMeasurementIndexRef = useRef(0);
  const keyToMeasurementIndexRef = useRef(new Map<string | number, number>());

  return useMemo(() => {
    if (!itemKey) return items.map((_, index) => index);

    return items.map((data, index) => {
      const key = itemKey(data, index);
      let measurementIndex = keyToMeasurementIndexRef.current.get(key);
      if (measurementIndex === undefined) {
        measurementIndex = nextMeasurementIndexRef.current;
        nextMeasurementIndexRef.current += 1;
        keyToMeasurementIndexRef.current.set(key, measurementIndex);
      }
      return measurementIndex;
    });
  }, [items, itemKey]);
}
