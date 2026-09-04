import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useMeasurementIndexes } from '../../hooks/use-measurement-indexes';

interface Item {
  id: string;
}

function getItemKey(item: Item): string {
  return item.id;
}

describe('useMeasurementIndexes', () => {
  it('uses array indexes when itemKey is omitted', () => {
    const items = [{ id: 'alpha' }, { id: 'beta' }];
    const { result } = renderHook(() =>
      useMeasurementIndexes(items, undefined),
    );

    expect(result.current).toEqual([0, 1]);
  });

  it('keeps measurement identities stable across reorders', () => {
    const alpha = { id: 'alpha' };
    const beta = { id: 'beta' };
    const { result, rerender } = renderHook(
      ({ items }: { items: Item[] }) =>
        useMeasurementIndexes(items, getItemKey),
      { initialProps: { items: [alpha, beta] } },
    );

    expect(result.current).toEqual([0, 1]);

    rerender({ items: [beta, alpha] });

    expect(result.current).toEqual([1, 0]);
  });

  it('releases removed keys instead of retaining their measurement identity', () => {
    const alpha = { id: 'alpha' };
    const beta = { id: 'beta' };
    const { result, rerender } = renderHook(
      ({ items }: { items: Item[] }) =>
        useMeasurementIndexes(items, getItemKey),
      { initialProps: { items: [alpha, beta] } },
    );

    rerender({ items: [beta] });
    expect(result.current).toEqual([1]);

    rerender({ items: [alpha, beta] });
    expect(result.current).toEqual([2, 1]);
  });
});
