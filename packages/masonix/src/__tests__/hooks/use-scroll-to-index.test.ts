import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createPositioner } from '../../core/positioner';
import { useScrollToIndex } from '../../hooks/use-scroll-to-index';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

let lastScrollToArgs: { top: number; behavior: string } | null = null;
const originalScrollTo = window.scrollTo;
const originalScrollYDescriptor = Object.getOwnPropertyDescriptor(
  window,
  'scrollY',
);

beforeEach(() => {
  lastScrollToArgs = null;

  Object.defineProperty(window, 'scrollTo', {
    value: (options?: ScrollToOptions | number) => {
      if (options && typeof options === 'object') {
        lastScrollToArgs = {
          top: (options as ScrollToOptions).top ?? 0,
          behavior: ((options as ScrollToOptions).behavior ??
            'instant') as string,
        };
      }
    },
    writable: true,
    configurable: true,
  });

  // matchMedia may not exist in jsdom — define it
  Object.defineProperty(window, 'matchMedia', {
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
  Object.defineProperty(window, 'scrollTo', {
    value: originalScrollTo,
    writable: true,
    configurable: true,
  });
  if (originalScrollYDescriptor) {
    Object.defineProperty(window, 'scrollY', originalScrollYDescriptor);
  }
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makePositionerWithItems() {
  const p = createPositioner({
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
  const el = document.createElement('div');
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

describe('useScrollToIndex', () => {
  it("scrollToIndex with align='start' scrolls to item top", () => {
    const positioner = makePositionerWithItems();
    const containerRef = createContainerRef();

    const { result } = renderHook(() =>
      useScrollToIndex({
        positioner,
        containerRef,
        getScrollContainer: () => window,
        viewportHeight: 800,
      }),
    );

    const item = positioner.get(3)!;
    result.current.scrollToIndex(3);

    expect(lastScrollToArgs).toBeTruthy();
    expect(lastScrollToArgs!.top).toBe(50 + item.top);
    expect(lastScrollToArgs!.behavior).toBe('instant');
  });

  it("scrollToIndex with align='center' centers item in viewport", () => {
    const positioner = makePositionerWithItems();
    const containerRef = createContainerRef();

    const { result } = renderHook(() =>
      useScrollToIndex({
        positioner,
        containerRef,
        getScrollContainer: () => window,
        viewportHeight: 800,
      }),
    );

    const item = positioner.get(1)!;
    result.current.scrollToIndex(1, { align: 'center' });

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
        getScrollContainer: () => window,
        viewportHeight: 800,
      }),
    );

    const item = positioner.get(2)!;
    result.current.scrollToIndex(2, { align: 'end' });

    const expected = 50 + item.top - 800 + item.height;
    expect(lastScrollToArgs!.top).toBe(Math.max(0, expected));
  });

  it("scrollToIndex with align='auto' does not move a fully visible item", () => {
    const positioner = makePositionerWithItems();
    const containerRef = createContainerRef();

    const { result } = renderHook(() =>
      useScrollToIndex({
        positioner,
        containerRef,
        getScrollContainer: () => window,
        viewportHeight: 800,
      }),
    );

    result.current.scrollToIndex(0, { align: 'auto' });

    expect(lastScrollToArgs).toBeNull();
  });

  it("scrollToIndex with align='auto' reveals an item below the viewport", () => {
    const positioner = makePositionerWithItems();
    const containerRef = createContainerRef();

    const { result } = renderHook(() =>
      useScrollToIndex({
        positioner,
        containerRef,
        getScrollContainer: () => window,
        viewportHeight: 100,
      }),
    );

    const item = positioner.get(3)!;
    result.current.scrollToIndex(3, { align: 'auto' });

    expect(lastScrollToArgs!.top).toBe(50 + item.top + item.height - 100);
  });

  it('scrollToIndex with smooth=true uses smooth scrolling', () => {
    const positioner = makePositionerWithItems();
    const containerRef = createContainerRef();

    const { result } = renderHook(() =>
      useScrollToIndex({
        positioner,
        containerRef,
        getScrollContainer: () => window,
        viewportHeight: 800,
      }),
    );

    result.current.scrollToIndex(0, { smooth: true });
    expect(lastScrollToArgs!.behavior).toBe('smooth');
  });

  it('respects prefers-reduced-motion: disables smooth scrolling', () => {
    // Override matchMedia to report reduced motion
    Object.defineProperty(window, 'matchMedia', {
      value: (query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
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
        getScrollContainer: () => window,
        viewportHeight: 800,
      }),
    );

    result.current.scrollToIndex(0, { smooth: true });
    expect(lastScrollToArgs!.behavior).toBe('instant');
  });

  it('does nothing if item index not found', () => {
    const positioner = makePositionerWithItems();
    const containerRef = createContainerRef();

    const { result } = renderHook(() =>
      useScrollToIndex({
        positioner,
        containerRef,
        getScrollContainer: () => window,
        viewportHeight: 800,
      }),
    );

    result.current.scrollToIndex(999);
    expect(lastScrollToArgs).toBeNull();
  });

  it('scrollToOffset scrolls to an absolute container offset', () => {
    const positioner = makePositionerWithItems();
    const containerRef = createContainerRef();

    const { result } = renderHook(() =>
      useScrollToIndex({
        positioner,
        containerRef,
        getScrollContainer: () => window,
        viewportHeight: 800,
      }),
    );

    result.current.scrollToOffset(420, { smooth: true });

    expect(lastScrollToArgs).toEqual({ top: 420, behavior: 'smooth' });
  });

  it('scrollBy scrolls relative to the current container offset', () => {
    Object.defineProperty(window, 'scrollY', {
      value: 300,
      configurable: true,
    });
    const positioner = makePositionerWithItems();
    const containerRef = createContainerRef();

    const { result } = renderHook(() =>
      useScrollToIndex({
        positioner,
        containerRef,
        getScrollContainer: () => window,
        viewportHeight: 800,
      }),
    );

    result.current.scrollBy(-125);

    expect(lastScrollToArgs).toEqual({ top: 175, behavior: 'instant' });
  });

  it('ignores non-finite offsets', () => {
    const positioner = makePositionerWithItems();
    const containerRef = createContainerRef();

    const { result } = renderHook(() =>
      useScrollToIndex({
        positioner,
        containerRef,
        getScrollContainer: () => window,
        viewportHeight: 800,
      }),
    );

    result.current.scrollToOffset(Number.NaN);
    result.current.scrollBy(Number.POSITIVE_INFINITY);

    expect(lastScrollToArgs).toBeNull();
  });

  it('resolves a custom scroll container when scrollToIndex is called', () => {
    const positioner = makePositionerWithItems();
    const containerRef = createContainerRef();
    const customScrollContainer = document.createElement('div');
    customScrollContainer.scrollTop = 400;
    customScrollContainer.getBoundingClientRect = vi.fn().mockReturnValue({
      top: 20,
      left: 0,
      right: 600,
      bottom: 820,
      width: 600,
      height: 800,
    });

    let scrollTop: number | undefined;
    customScrollContainer.scrollTo = vi.fn(
      (options?: ScrollToOptions | number) => {
        if (typeof options === 'object') scrollTop = options.top;
      },
    ) as typeof customScrollContainer.scrollTo;

    let resolvedContainer: HTMLElement | null = null;
    const { result } = renderHook(() =>
      useScrollToIndex({
        positioner,
        containerRef,
        getScrollContainer: () => resolvedContainer,
        viewportHeight: 800,
      }),
    );

    resolvedContainer = customScrollContainer;
    result.current.scrollToIndex(3);

    const item = positioner.get(3)!;
    expect(customScrollContainer.scrollTo).toHaveBeenCalled();
    expect(scrollTop).toBe(430 + item.top);
  });
});
