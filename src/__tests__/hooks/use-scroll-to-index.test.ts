import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { useScrollToIndex } from "../../hooks/use-scroll-to-index";
import { createBalancedPositioner } from "../../core/column-balancer";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

let lastScrollToArgs: { top: number; behavior: string } | null = null;
const originalScrollTo = window.scrollTo;

beforeEach(() => {
  lastScrollToArgs = null;

  Object.defineProperty(window, "scrollTo", {
    value: (options?: ScrollToOptions | number) => {
      if (options && typeof options === "object") {
        lastScrollToArgs = {
          top: (options as ScrollToOptions).top ?? 0,
          behavior: ((options as ScrollToOptions).behavior ?? "instant") as string,
        };
      }
    },
    writable: true,
    configurable: true,
  });

  // matchMedia may not exist in jsdom — define it
  Object.defineProperty(window, "matchMedia", {
    value: (query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }),
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  Object.defineProperty(window, "scrollTo", {
    value: originalScrollTo,
    writable: true,
    configurable: true,
  });
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makePositionerWithItems() {
  const p = createBalancedPositioner({
    columnCount: 3,
    columnWidth: 200,
    columnGap: 16,
    rowGap: 16,
  });
  p.set(0, 100);
  p.set(1, 200);
  p.set(2, 150);
  p.set(3, 100);
  p.set(4, 80);
  return p;
}

function createContainerRef() {
  const el = document.createElement("div");
  el.getBoundingClientRect = vi.fn().mockReturnValue({
    top: 50,
    left: 0,
    right: 600,
    bottom: 850,
    width: 600,
    height: 800,
  });
  return { current: el };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("useScrollToIndex", () => {
  it("scrollToIndex with align='start' scrolls to item top", () => {
    const positioner = makePositionerWithItems();
    const containerRef = createContainerRef();

    const { result } = renderHook(() =>
      useScrollToIndex({
        positioner,
        containerRef,
        scrollContainer: window,
        viewportHeight: 800,
      }),
    );

    const item = positioner.get(3)!;
    result.current.scrollToIndex(3);

    expect(lastScrollToArgs).toBeTruthy();
    expect(lastScrollToArgs!.top).toBe(50 + item.top);
    expect(lastScrollToArgs!.behavior).toBe("instant");
  });

  it("scrollToIndex with align='center' centers item in viewport", () => {
    const positioner = makePositionerWithItems();
    const containerRef = createContainerRef();

    const { result } = renderHook(() =>
      useScrollToIndex({
        positioner,
        containerRef,
        scrollContainer: window,
        viewportHeight: 800,
      }),
    );

    const item = positioner.get(1)!;
    result.current.scrollToIndex(1, { align: "center" });

    const expected = 50 + item.top - (800 - item.height) / 2;
    expect(lastScrollToArgs!.top).toBe(Math.max(0, expected));
  });

  it("scrollToIndex with align='end' aligns item bottom with viewport bottom", () => {
    const positioner = makePositionerWithItems();
    const containerRef = createContainerRef();

    const { result } = renderHook(() =>
      useScrollToIndex({
        positioner,
        containerRef,
        scrollContainer: window,
        viewportHeight: 800,
      }),
    );

    const item = positioner.get(2)!;
    result.current.scrollToIndex(2, { align: "end" });

    const expected = 50 + item.top - 800 + item.height;
    expect(lastScrollToArgs!.top).toBe(Math.max(0, expected));
  });

  it("scrollToIndex with smooth=true uses smooth scrolling", () => {
    const positioner = makePositionerWithItems();
    const containerRef = createContainerRef();

    const { result } = renderHook(() =>
      useScrollToIndex({
        positioner,
        containerRef,
        scrollContainer: window,
        viewportHeight: 800,
      }),
    );

    result.current.scrollToIndex(0, { smooth: true });
    expect(lastScrollToArgs!.behavior).toBe("smooth");
  });

  it("respects prefers-reduced-motion: disables smooth scrolling", () => {
    // Override matchMedia to report reduced motion
    Object.defineProperty(window, "matchMedia", {
      value: (query: string) => ({
        matches: query === "(prefers-reduced-motion: reduce)",
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      }),
      writable: true,
      configurable: true,
    });

    const positioner = makePositionerWithItems();
    const containerRef = createContainerRef();

    const { result } = renderHook(() =>
      useScrollToIndex({
        positioner,
        containerRef,
        scrollContainer: window,
        viewportHeight: 800,
      }),
    );

    result.current.scrollToIndex(0, { smooth: true });
    expect(lastScrollToArgs!.behavior).toBe("instant");
  });

  it("scrollToOffset scrolls to an absolute offset", () => {
    const positioner = makePositionerWithItems();
    const containerRef = createContainerRef();

    const { result } = renderHook(() =>
      useScrollToIndex({
        positioner,
        containerRef,
        scrollContainer: window,
        viewportHeight: 800,
      }),
    );

    result.current.scrollToOffset(500);
    expect(lastScrollToArgs!.top).toBe(500);
  });

  it("does nothing if item index not found", () => {
    const positioner = makePositionerWithItems();
    const containerRef = createContainerRef();

    const { result } = renderHook(() =>
      useScrollToIndex({
        positioner,
        containerRef,
        scrollContainer: window,
        viewportHeight: 800,
      }),
    );

    result.current.scrollToIndex(999);
    expect(lastScrollToArgs).toBeNull();
  });

  it("getVisibleRange returns correct range", () => {
    const positioner = makePositionerWithItems();
    const containerRef = createContainerRef();

    const { result } = renderHook(() =>
      useScrollToIndex({
        positioner,
        containerRef,
        scrollContainer: window,
        viewportHeight: 800,
      }),
    );

    const [start, stop] = result.current.getVisibleRange();
    expect(start).toBe(0);
    expect(stop).toBeGreaterThanOrEqual(0);
  });

  it("getScrollState returns serializable state", () => {
    const positioner = makePositionerWithItems();
    const containerRef = createContainerRef();

    const { result } = renderHook(() =>
      useScrollToIndex({
        positioner,
        containerRef,
        scrollContainer: window,
        viewportHeight: 800,
      }),
    );

    const state = result.current.getScrollState();
    expect(state.scrollTop).toBe(0);
    expect(state.positions).toBeInstanceOf(Array);
    expect(state.positions.length).toBe(5);
    expect(state.positions[0]).toHaveProperty("index");
    expect(state.positions[0]).toHaveProperty("top");
    expect(state.positions[0]).toHaveProperty("left");
    expect(state.positions[0]).toHaveProperty("height");
  });

  it("scroll state round-trip (save → restore)", () => {
    const positioner = makePositionerWithItems();
    const containerRef = createContainerRef();

    const { result } = renderHook(() =>
      useScrollToIndex({
        positioner,
        containerRef,
        scrollContainer: window,
        viewportHeight: 800,
      }),
    );

    const state = result.current.getScrollState();
    const restored = JSON.parse(JSON.stringify(state));
    result.current.restoreScrollState(restored);
    expect(lastScrollToArgs!.top).toBe(state.scrollTop);
  });
});
