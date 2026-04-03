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

/** Check if container is the window (works in jsdom where instanceof Window can fail) */
function isWindow(container: HTMLElement | Window): container is Window {
  return container === window || "scrollY" in container;
}

/**
 * Get the scroll offset of an element relative to the scroll container.
 */
export function getScrollOffset(
  element: HTMLElement,
  scrollContainer: HTMLElement | Window,
): number {
  if (isWindow(scrollContainer)) {
    return element.getBoundingClientRect().top + window.scrollY;
  }
  return (
    element.getBoundingClientRect().top -
    scrollContainer.getBoundingClientRect().top +
    scrollContainer.scrollTop
  );
}

/**
 * Get the current scroll top of a scroll container.
 */
export function getScrollTop(container: HTMLElement | Window): number {
  if (isWindow(container)) return window.scrollY;
  return container.scrollTop;
}

/**
 * Get the viewport height of a scroll container.
 */
export function getViewportHeight(container: HTMLElement | Window): number {
  if (isWindow(container)) return window.innerHeight;
  return container.clientHeight;
}

/**
 * Smoothly or instantly scroll a container to a given offset.
 */
export function scrollTo(container: HTMLElement | Window, top: number, smooth: boolean): void {
  const behavior = smooth ? "smooth" : "instant";
  if (isWindow(container)) {
    window.scrollTo({ top, behavior });
  } else {
    container.scrollTo({ top, behavior });
  }
}
