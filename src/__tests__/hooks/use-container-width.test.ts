import { act, renderHook } from '@testing-library/react';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vite-plus/test';

import { useContainerWidth } from '../../hooks/use-container-width';

describe('useContainerWidth', () => {
  type RoCallback = (entries: ResizeObserverEntry[]) => void;
  let notifyResize: RoCallback | null = null;

  beforeEach(() => {
    notifyResize = null;
    // Must use a regular function (not arrow) so `new ResizeObserver(cb)` works
    globalThis.ResizeObserver = vi.fn().mockImplementation(function (
      cb: RoCallback,
    ) {
      notifyResize = cb;
      return {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      };
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 0 as initial width when no defaultWidth provided', () => {
    const { result } = renderHook(() => useContainerWidth());
    expect(result.current.width).toBe(0);
  });

  it('initializes with defaultWidth', () => {
    const { result } = renderHook(() => useContainerWidth(800));
    expect(result.current.width).toBe(800);
  });

  it('returns a stable ref callback', () => {
    const { result, rerender } = renderHook(() => useContainerWidth());
    const first = result.current.ref;
    rerender();
    expect(result.current.ref).toBe(first);
  });

  it('updates width when ResizeObserver fires with non-zero entry', () => {
    const { result } = renderHook(() => useContainerWidth());

    act(() => {
      result.current.ref(document.createElement('div'));
    });

    act(() => {
      notifyResize!([
        {
          contentBoxSize: [{ inlineSize: 600, blockSize: 0 }],
          contentRect: { width: 600 } as DOMRectReadOnly,
          target: document.createElement('div'),
          borderBoxSize: [],
          devicePixelContentBoxSize: [],
        } as unknown as ResizeObserverEntry,
      ]);
    });

    expect(result.current.width).toBe(600);
  });

  it('falls back to contentRect.width when contentBoxSize is absent', () => {
    const { result } = renderHook(() => useContainerWidth());

    act(() => {
      result.current.ref(document.createElement('div'));
    });

    act(() => {
      notifyResize!([
        {
          contentBoxSize: undefined,
          contentRect: { width: 480 } as DOMRectReadOnly,
          target: document.createElement('div'),
          borderBoxSize: [],
          devicePixelContentBoxSize: [],
        } as unknown as ResizeObserverEntry,
      ]);
    });

    expect(result.current.width).toBe(480);
  });

  it('ignores ResizeObserver entries with width 0 (hidden element)', () => {
    const { result } = renderHook(() => useContainerWidth(400));

    act(() => {
      result.current.ref(document.createElement('div'));
    });

    act(() => {
      notifyResize!([
        {
          contentBoxSize: [{ inlineSize: 0, blockSize: 0 }],
          contentRect: { width: 0 } as DOMRectReadOnly,
          target: document.createElement('div'),
          borderBoxSize: [],
          devicePixelContentBoxSize: [],
        } as unknown as ResizeObserverEntry,
      ]);
    });

    expect(result.current.width).toBe(400); // unchanged
  });

  it('disconnects observer when ref is called with null', () => {
    const mockDisconnect = vi.fn();
    globalThis.ResizeObserver = vi.fn().mockImplementation(function () {
      return {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: mockDisconnect,
      };
    });

    const { result } = renderHook(() => useContainerWidth());

    act(() => {
      result.current.ref(document.createElement('div'));
    });
    act(() => {
      result.current.ref(null);
    });

    expect(mockDisconnect).toHaveBeenCalledTimes(1);
  });

  it('reconnects observer when ref is called with a new element', () => {
    const mockObserve = vi.fn();
    globalThis.ResizeObserver = vi.fn().mockImplementation(function () {
      return { observe: mockObserve, unobserve: vi.fn(), disconnect: vi.fn() };
    });

    const { result } = renderHook(() => useContainerWidth());

    act(() => {
      result.current.ref(document.createElement('div'));
    });
    act(() => {
      result.current.ref(document.createElement('div'));
    });

    expect(mockObserve).toHaveBeenCalledTimes(2);
  });
});
