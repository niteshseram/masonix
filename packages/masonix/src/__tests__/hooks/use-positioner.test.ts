import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vite-plus/test';

import { usePositioner } from '../../hooks/use-positioner';

describe('usePositioner', () => {
  it('returns a positioner with correct columnCount and columnWidth', () => {
    const { result } = renderHook(() =>
      usePositioner({ columnCount: 3, columnWidth: 200, gap: 16 }),
    );
    expect(result.current.columnCount).toBe(3);
    expect(result.current.columnWidth).toBe(200);
  });

  it('places items using shortest-first', () => {
    const { result } = renderHook(() =>
      usePositioner({ columnCount: 3, columnWidth: 100, gap: 0 }),
    );
    const p = result.current;
    p.set(0, 300); // col 0
    p.set(1, 100); // col 1
    p.set(2, 200); // col 2
    const item = p.set(3, 50);
    // col 1 is shortest (100)
    expect(item.column).toBe(1);
  });

  it('returns a new positioner when columnCount changes', () => {
    const { result, rerender } = renderHook(
      ({ columnCount }) =>
        usePositioner({ columnCount, columnWidth: 100, gap: 0 }),
      { initialProps: { columnCount: 2 } },
    );
    const first = result.current;
    rerender({ columnCount: 3 });
    expect(result.current).not.toBe(first);
    expect(result.current.columnCount).toBe(3);
  });

  it('returns a new positioner when columnWidth changes', () => {
    const { result, rerender } = renderHook(
      ({ columnWidth }) =>
        usePositioner({ columnCount: 2, columnWidth, gap: 0 }),
      { initialProps: { columnWidth: 100 } },
    );
    const first = result.current;
    rerender({ columnWidth: 200 });
    expect(result.current).not.toBe(first);
    expect(result.current.columnWidth).toBe(200);
  });

  it('returns the same positioner when props are unchanged', () => {
    const { result, rerender } = renderHook(() =>
      usePositioner({ columnCount: 2, columnWidth: 100, gap: 16 }),
    );
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });

  it('starts with zero items placed', () => {
    const { result } = renderHook(() =>
      usePositioner({ columnCount: 3, columnWidth: 100, gap: 0 }),
    );
    expect(result.current.size()).toBe(0);
  });
});
