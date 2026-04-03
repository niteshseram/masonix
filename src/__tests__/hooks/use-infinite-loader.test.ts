import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi } from "vite-plus/test";
import { useInfiniteLoader } from "../../hooks/use-infinite-loader";
import { createBalancedPositioner } from "../../core/column-balancer";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makePositioner(itemCount: number) {
  const p = createBalancedPositioner({
    columnCount: 3,
    columnWidth: 200,
    columnGap: 16,
    rowGap: 16,
  });
  for (let i = 0; i < itemCount; i++) {
    p.set(i, 100);
  }
  return p;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("useInfiniteLoader", () => {
  it("triggers onLoadMore when visible range approaches end of loaded items", () => {
    const onLoadMore = vi.fn();
    const positioner = makePositioner(20);

    const { result } = renderHook(() =>
      useInfiniteLoader({
        onLoadMore,
        totalItems: 100,
        threshold: 16,
      }),
    );

    act(() => {
      result.current.checkLoad(5, 15, positioner);
    });

    // visibleStop (15) + threshold (16) = 31, which >= placed (20)
    expect(onLoadMore).toHaveBeenCalledTimes(1);
    expect(onLoadMore).toHaveBeenCalledWith(20, 36);
  });

  it("does not trigger when all items are loaded", () => {
    const onLoadMore = vi.fn();
    const positioner = makePositioner(50);

    const { result } = renderHook(() =>
      useInfiniteLoader({
        onLoadMore,
        totalItems: 50,
        threshold: 16,
      }),
    );

    act(() => {
      result.current.checkLoad(0, 10, positioner);
    });

    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it("prevents duplicate concurrent loads (async)", async () => {
    let resolveLoad: () => void;
    const loadPromise = new Promise<void>((r) => {
      resolveLoad = r;
    });
    const onLoadMore = vi.fn().mockReturnValue(loadPromise);
    const positioner = makePositioner(10);

    const { result } = renderHook(() =>
      useInfiniteLoader({
        onLoadMore,
        totalItems: 100,
        threshold: 16,
      }),
    );

    act(() => {
      result.current.checkLoad(0, 5, positioner);
    });
    expect(onLoadMore).toHaveBeenCalledTimes(1);

    // Second call while first is pending — should be skipped
    act(() => {
      result.current.checkLoad(0, 5, positioner);
    });
    expect(onLoadMore).toHaveBeenCalledTimes(1);

    // Resolve the first load
    await act(async () => {
      resolveLoad!();
      await loadPromise;
    });

    // Now a third call should go through
    act(() => {
      result.current.checkLoad(0, 5, positioner);
    });
    expect(onLoadMore).toHaveBeenCalledTimes(2);
  });

  it("resets loading flag on promise rejection", async () => {
    let rejectLoad: (e: Error) => void;
    const loadPromise = new Promise<void>((_, reject) => {
      rejectLoad = reject;
    });
    const onLoadMore = vi.fn().mockReturnValueOnce(loadPromise).mockReturnValue(undefined);
    const positioner = makePositioner(10);

    const { result } = renderHook(() =>
      useInfiniteLoader({
        onLoadMore,
        totalItems: 100,
        threshold: 16,
      }),
    );

    act(() => {
      result.current.checkLoad(0, 5, positioner);
    });
    expect(onLoadMore).toHaveBeenCalledTimes(1);

    await act(async () => {
      rejectLoad!(new Error("fail"));
      try {
        await loadPromise;
      } catch {
        // expected
      }
    });

    // Should be able to load again after rejection
    act(() => {
      result.current.checkLoad(0, 5, positioner);
    });
    expect(onLoadMore).toHaveBeenCalledTimes(2);
  });

  it("uses isItemLoaded to find unloaded items", () => {
    const onLoadMore = vi.fn();
    const positioner = makePositioner(20);
    const loaded = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

    const { result } = renderHook(() =>
      useInfiniteLoader({
        onLoadMore,
        isItemLoaded: (index: number) => loaded.has(index),
        totalItems: 100,
        threshold: 5,
      }),
    );

    act(() => {
      result.current.checkLoad(5, 15, positioner);
    });

    // Items 10-15 are not loaded, should trigger
    expect(onLoadMore).toHaveBeenCalledTimes(1);
    expect(onLoadMore.mock.calls[0][0]).toBe(10); // first unloaded
  });

  it("does not trigger when visible range is far from threshold", () => {
    const onLoadMore = vi.fn();
    const positioner = makePositioner(100);

    const { result } = renderHook(() =>
      useInfiniteLoader({
        onLoadMore,
        totalItems: 200,
        threshold: 5,
      }),
    );

    act(() => {
      result.current.checkLoad(0, 10, positioner);
    });

    // visibleStop (10) + threshold (5) = 15, which < placed (100)
    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it("handles synchronous onLoadMore without getting stuck", () => {
    const onLoadMore = vi.fn();
    const positioner = makePositioner(10);

    const { result } = renderHook(() =>
      useInfiniteLoader({
        onLoadMore,
        totalItems: 100,
        threshold: 16,
      }),
    );

    act(() => {
      result.current.checkLoad(0, 5, positioner);
    });
    expect(onLoadMore).toHaveBeenCalledTimes(1);

    // Should allow another call immediately since sync load completes
    act(() => {
      result.current.checkLoad(0, 5, positioner);
    });
    expect(onLoadMore).toHaveBeenCalledTimes(2);
  });
});
