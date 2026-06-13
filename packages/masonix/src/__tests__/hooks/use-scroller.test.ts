import { renderHook, act } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';

import { useScroller } from '../../hooks/use-scroller';

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('useScroller', () => {
  it('returns initial state with scrollTop 0', () => {
    const { result } = renderHook(() => useScroller());
    expect(result.current.scrollTop).toBe(0);
    expect(typeof result.current.viewportHeight).toBe('number');
    expect(result.current.scrollVelocity).toBe(0);
  });

  it('updates scrollTop on scroll events', () => {
    let scrollY = 0;
    Object.defineProperty(window, 'scrollY', {
      get: () => scrollY,
      configurable: true,
    });

    const { result } = renderHook(() => useScroller());

    act(() => {
      scrollY = 200;
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current.scrollTop).toBe(200);
  });

  it('tracks viewport height changes on resize', () => {
    let innerH = window.innerHeight;
    Object.defineProperty(window, 'innerHeight', {
      get: () => innerH,
      configurable: true,
    });

    const { result } = renderHook(() => useScroller());
    const initial = result.current.viewportHeight;

    act(() => {
      innerH = 600;
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.viewportHeight).toBe(600);
    expect(result.current.viewportHeight).not.toBe(initial);
  });

  it('cleans up listeners on unmount (no errors after unmount)', () => {
    const { unmount } = renderHook(() => useScroller());
    unmount();
    expect(() => window.dispatchEvent(new Event('scroll'))).not.toThrow();
  });

  it('reports correct scrollTop after single scroll event', () => {
    let scrollY = 0;
    Object.defineProperty(window, 'scrollY', {
      get: () => scrollY,
      configurable: true,
    });

    const { result } = renderHook(() => useScroller());

    act(() => {
      scrollY = 350;
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current.scrollTop).toBe(350);
  });

  it('reports scroll velocity and settles after scrolling stops', () => {
    vi.useFakeTimers();

    let now = 1000;
    vi.spyOn(performance, 'now').mockImplementation(() => now);

    let scrollY = 0;
    Object.defineProperty(window, 'scrollY', {
      get: () => scrollY,
      configurable: true,
    });

    const { result } = renderHook(() => useScroller(undefined, 60));

    act(() => {
      now = 1100;
      scrollY = 300;
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current.scrollVelocity).toBeGreaterThan(0);

    act(() => {
      vi.advanceTimersByTime(121);
    });

    expect(result.current.scrollVelocity).toBe(0);
  });
});
