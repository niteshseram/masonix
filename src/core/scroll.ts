// ---------------------------------------------------------------------------
// RAF-throttled callback
// ---------------------------------------------------------------------------

/**
 * Returns a function that, when called, schedules `fn` on the next animation
 * frame — but only once per frame regardless of how many times it is called.
 */
export function rafThrottle<T extends unknown[]>(fn: (...args: T) => void): (...args: T) => void {
  let rafId: number | null = null;
  let latestArgs: T;

  return function throttled(...args: T) {
    latestArgs = args;
    if (rafId !== null) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      fn(...latestArgs);
    });
  };
}

/**
 * Returns a function that cancels the pending RAF and the original throttled
 * function.
 */
export function cancelRafThrottle(throttled: () => void): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const id = (throttled as any).__rafId as number | undefined;
  if (id !== undefined) cancelAnimationFrame(id);
}

// ---------------------------------------------------------------------------
// Scroll offset helpers
// ---------------------------------------------------------------------------

/**
 * Get the scroll offset of an element relative to the scroll container.
 */
export function getScrollOffset(
  element: HTMLElement,
  scrollContainer: HTMLElement | Window,
): number {
  if (scrollContainer instanceof Window) {
    return element.getBoundingClientRect().top + window.scrollY;
  }
  return (
    element.getBoundingClientRect().top -
    (scrollContainer as HTMLElement).getBoundingClientRect().top +
    (scrollContainer as HTMLElement).scrollTop
  );
}

/**
 * Get the current scroll top of a scroll container.
 */
export function getScrollTop(container: HTMLElement | Window): number {
  if (container instanceof Window) return window.scrollY;
  return (container as HTMLElement).scrollTop;
}

/**
 * Get the viewport height of a scroll container.
 */
export function getViewportHeight(container: HTMLElement | Window): number {
  if (container instanceof Window) return window.innerHeight;
  return (container as HTMLElement).clientHeight;
}

/**
 * Smoothly or instantly scroll a container to a given offset.
 */
export function scrollTo(container: HTMLElement | Window, top: number, smooth: boolean): void {
  const behavior = smooth ? "smooth" : "instant";
  if (container instanceof Window) {
    window.scrollTo({ top, behavior });
  } else {
    (container as HTMLElement).scrollTo({ top, behavior });
  }
}
