import { act, renderHook } from '@testing-library/react';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vite-plus/test';

import { useItemHeights } from '../../hooks/use-item-heights';

describe('useItemHeights', () => {
  type RoCallback = (entries: ResizeObserverEntry[]) => void;
  let notifyResize: RoCallback | null = null;
  let mockObserve: ReturnType<typeof vi.fn>;
  let mockUnobserve: ReturnType<typeof vi.fn>;
  let mockDisconnect: ReturnType<typeof vi.fn>;

  function makeEntry(target: Element, blockSize: number): ResizeObserverEntry {
    return {
      target,
      contentBoxSize: [{ blockSize, inlineSize: 100 }],
      contentRect: { height: blockSize, width: 100 } as DOMRectReadOnly,
      borderBoxSize: [],
      devicePixelContentBoxSize: [],
    } as unknown as ResizeObserverEntry;
  }

  beforeEach(() => {
    notifyResize = null;
    mockObserve = vi.fn();
    mockUnobserve = vi.fn();
    mockDisconnect = vi.fn();

    globalThis.ResizeObserver = vi.fn().mockImplementation(function (
      cb: RoCallback,
    ) {
      notifyResize = cb;
      return {
        observe: mockObserve,
        unobserve: mockUnobserve,
        disconnect: mockDisconnect,
      };
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts with no measured heights', () => {
    const { result } = renderHook(() => useItemHeights());
    expect(result.current.measuredHeights.size).toBe(0);
  });

  it('returns a stable setItemRef callback', () => {
    const { result, rerender } = renderHook(() => useItemHeights());
    const first = result.current.setItemRef;
    rerender();
    expect(result.current.setItemRef).toBe(first);
  });

  it('records height when a node is observed and resizes', () => {
    const { result } = renderHook(() => useItemHeights());
    const node = document.createElement('div');

    act(() => {
      result.current.setItemRef(node, 0);
    });

    act(() => {
      notifyResize!([makeEntry(node, 200)]);
    });

    expect(result.current.measuredHeights.get(0)).toBe(200);
  });

  it('batches multiple entries from a single ResizeObserver callback', () => {
    const { result } = renderHook(() => useItemHeights());
    const n0 = document.createElement('div');
    const n1 = document.createElement('div');
    const n2 = document.createElement('div');

    act(() => {
      result.current.setItemRef(n0, 0);
      result.current.setItemRef(n1, 1);
      result.current.setItemRef(n2, 2);
    });

    act(() => {
      notifyResize!([
        makeEntry(n0, 100),
        makeEntry(n1, 200),
        makeEntry(n2, 150),
      ]);
    });

    expect(result.current.measuredHeights.get(0)).toBe(100);
    expect(result.current.measuredHeights.get(1)).toBe(200);
    expect(result.current.measuredHeights.get(2)).toBe(150);
  });

  it('ignores entries with height 0', () => {
    const { result } = renderHook(() => useItemHeights());
    const node = document.createElement('div');

    act(() => result.current.setItemRef(node, 0));
    act(() => notifyResize!([makeEntry(node, 0)]));

    expect(result.current.measuredHeights.has(0)).toBe(false);
  });

  it('clamps heights below minItemHeight', () => {
    const { result } = renderHook(() => useItemHeights(80));
    const node = document.createElement('div');

    act(() => result.current.setItemRef(node, 0));
    act(() => notifyResize!([makeEntry(node, 20)]));

    expect(result.current.measuredHeights.get(0)).toBe(80);
  });

  it('does not clamp heights above minItemHeight', () => {
    const { result } = renderHook(() => useItemHeights(80));
    const node = document.createElement('div');

    act(() => result.current.setItemRef(node, 0));
    act(() => notifyResize!([makeEntry(node, 150)]));

    expect(result.current.measuredHeights.get(0)).toBe(150);
  });

  it('unobserves previous element when index is reused', () => {
    const { result } = renderHook(() => useItemHeights());
    const first = document.createElement('div');
    const second = document.createElement('div');

    act(() => result.current.setItemRef(first, 0));
    act(() => result.current.setItemRef(second, 0));

    expect(mockUnobserve).toHaveBeenCalledWith(first);
    expect(mockObserve).toHaveBeenCalledWith(second);
  });

  it('unobserves element when ref is called with null', () => {
    const { result } = renderHook(() => useItemHeights());
    const node = document.createElement('div');

    act(() => result.current.setItemRef(node, 0));
    act(() => result.current.setItemRef(null, 0));

    expect(mockUnobserve).toHaveBeenCalledWith(node);
  });

  it('disconnects observer on unmount', () => {
    const { unmount, result } = renderHook(() => useItemHeights());
    const node = document.createElement('div');

    act(() => result.current.setItemRef(node, 0));
    unmount();

    expect(mockDisconnect).toHaveBeenCalledTimes(1);
  });
});
