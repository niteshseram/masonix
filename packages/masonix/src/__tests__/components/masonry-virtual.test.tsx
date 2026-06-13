import { render, screen, act } from '@testing-library/react';
import React from 'react';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vite-plus/test';

import { MasonryVirtual } from '../../components/masonry-virtual';
import type { MasonryRenderProps } from '../../types';

// ---------------------------------------------------------------------------
// ResizeObserver mock
// ---------------------------------------------------------------------------

type RoCallback = (entries: ResizeObserverEntry[]) => void;

let roCallbacks: RoCallback[] = [];
let mockObserve: ReturnType<typeof vi.fn>;
let mockUnobserve: ReturnType<typeof vi.fn>;
let mockDisconnect: ReturnType<typeof vi.fn>;

function makeEntry(target: Element, height: number): ResizeObserverEntry {
  return {
    target,
    contentBoxSize: [{ blockSize: height, inlineSize: 100 }],
    contentRect: { height, width: 100 } as DOMRectReadOnly,
    borderBoxSize: [],
    devicePixelContentBoxSize: [],
  } as unknown as ResizeObserverEntry;
}

function fireResize(target: Element, height: number) {
  roCallbacks.forEach((cb) => cb([makeEntry(target, height)]));
}

const originalScrollTo = window.scrollTo;
const originalScrollYDescriptor = Object.getOwnPropertyDescriptor(
  window,
  'scrollY',
);
const originalInnerHeightDescriptor = Object.getOwnPropertyDescriptor(
  window,
  'innerHeight',
);

beforeEach(() => {
  roCallbacks = [];
  mockObserve = vi.fn();
  mockUnobserve = vi.fn();
  mockDisconnect = vi.fn();

  globalThis.ResizeObserver = vi.fn().mockImplementation(function (
    cb: RoCallback,
  ) {
    roCallbacks.push(cb);
    return {
      observe: mockObserve,
      unobserve: mockUnobserve,
      disconnect: mockDisconnect,
    };
  });

  // Mock scrollTo
  Object.defineProperty(window, 'scrollTo', {
    value: vi.fn(),
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
  if (originalInnerHeightDescriptor) {
    Object.defineProperty(window, 'innerHeight', originalInnerHeightDescriptor);
  }
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type Item = { id: number; label: string };

function makeItems(count: number): Item[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    label: `Item ${i}`,
  }));
}

function ItemRender({ data }: MasonryRenderProps<Item>) {
  return <div data-testid={`item-${data.id}`}>{data.label}</div>;
}

function PlaceholderRender({
  index,
  height,
}: MasonryRenderProps<Item> & { height: number }) {
  return (
    <div data-testid={`placeholder-${index}`} style={{ height }}>
      Loading {index}
    </div>
  );
}

function rect(top: number, height = 800): DOMRect {
  return {
    top,
    left: 0,
    right: 600,
    bottom: top + height,
    width: 600,
    height,
    x: 0,
    y: top,
    toJSON: () => ({}),
  } as DOMRect;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('MasonryVirtual', () => {
  describe('rendering', () => {
    it('renders items with getItemHeight (no measurement phase)', () => {
      render(
        <MasonryVirtual
          items={makeItems(5)}
          render={ItemRender}
          columns={3}
          gap={0}
          defaultWidth={600}
          getItemHeight={() => 100}
        />,
      );
      expect(screen.getByTestId('item-0')).toBeTruthy();
    });

    it("uses custom container element via 'as' prop", () => {
      const { container } = render(
        <MasonryVirtual
          items={makeItems(2)}
          render={ItemRender}
          columns={2}
          gap={0}
          as="section"
          defaultWidth={400}
          getItemHeight={() => 100}
        />,
      );
      expect(container.querySelector('section')).toBeTruthy();
    });
  });

  describe('virtualization', () => {
    it('only renders items visible in the viewport', () => {
      const items = makeItems(50);

      const { container } = render(
        <MasonryVirtual
          items={items}
          render={ItemRender}
          columns={1}
          gap={0}
          defaultWidth={200}
          getItemHeight={() => 200}
          overscanBy={2}
        />,
      );

      const renderedItems = container.querySelectorAll(
        "[data-testid^='item-']",
      );
      expect(renderedItems.length).toBeLessThan(50);
      expect(renderedItems.length).toBeGreaterThan(0);
    });

    it('sets container height to accommodate all items', () => {
      const { container } = render(
        <MasonryVirtual
          items={makeItems(3)}
          render={ItemRender}
          columns={3}
          gap={0}
          defaultWidth={300}
          getItemHeight={() => 100}
        />,
      );
      const containerEl = container.firstElementChild as HTMLElement;
      expect(containerEl.style.height).toBe('100px');
    });

    it('renders directly from the visible interval-tree hits', () => {
      const items = makeItems(1000);
      const renderSpy = vi.fn(ItemRender);

      render(
        <MasonryVirtual
          items={items}
          render={renderSpy}
          columns={1}
          gap={0}
          defaultWidth={200}
          getItemHeight={() => 100}
          overscanBy={0}
        />,
      );

      expect(renderSpy).toHaveBeenCalled();
      expect(renderSpy.mock.calls.length).toBeLessThan(items.length);
    });

    it('respects window container offset when computing the visible range', () => {
      Object.defineProperty(window, 'scrollY', {
        get: () => 550,
        configurable: true,
      });
      Object.defineProperty(window, 'innerHeight', {
        get: () => 200,
        configurable: true,
      });

      render(
        <MasonryVirtual
          ref={(node) => {
            if (node) node.getBoundingClientRect = vi.fn(() => rect(-50));
          }}
          items={makeItems(20)}
          render={ItemRender}
          columns={1}
          gap={0}
          defaultWidth={200}
          getItemHeight={() => 100}
          overscanBy={0}
        />,
      );

      expect(screen.getByTestId('item-0')).toBeTruthy();
      expect(screen.queryByTestId('item-5')).toBeNull();
    });

    it('respects custom scroll container offset when computing the visible range', () => {
      const scrollEl = document.createElement('div');
      scrollEl.scrollTop = 550;
      Object.defineProperty(scrollEl, 'clientHeight', {
        value: 200,
        configurable: true,
      });
      scrollEl.getBoundingClientRect = vi.fn(() => rect(100));

      render(
        <MasonryVirtual
          ref={(node) => {
            if (node) node.getBoundingClientRect = vi.fn(() => rect(50));
          }}
          items={makeItems(20)}
          render={ItemRender}
          columns={1}
          gap={0}
          defaultWidth={200}
          getItemHeight={() => 100}
          overscanBy={0}
          scrollContainer={{ current: scrollEl }}
        />,
      );

      expect(screen.getByTestId('item-0')).toBeTruthy();
      expect(screen.queryByTestId('item-5')).toBeNull();
    });

    it('calls onEndReached when the visible range reaches the threshold', () => {
      const onEndReached = vi.fn();
      Object.defineProperty(window, 'innerHeight', {
        get: () => 750,
        configurable: true,
      });

      render(
        <MasonryVirtual
          items={makeItems(10)}
          render={ItemRender}
          columns={1}
          gap={0}
          defaultWidth={200}
          getItemHeight={() => 100}
          overscanBy={0}
          endReachedThreshold={2}
          onEndReached={onEndReached}
        />,
      );

      expect(onEndReached).toHaveBeenCalledTimes(1);
      expect(onEndReached).toHaveBeenCalledWith({
        startIndex: 0,
        stopIndex: 7,
        itemCount: 10,
        totalItems: 10,
      });
    });

    it('does not repeatedly call onEndReached for the same item count', () => {
      const onEndReached = vi.fn();
      const items = makeItems(10);
      Object.defineProperty(window, 'innerHeight', {
        get: () => 750,
        configurable: true,
      });

      const { rerender } = render(
        <MasonryVirtual
          items={items}
          render={ItemRender}
          columns={1}
          gap={0}
          defaultWidth={200}
          getItemHeight={() => 100}
          overscanBy={0}
          endReachedThreshold={2}
          onEndReached={onEndReached}
        />,
      );

      rerender(
        <MasonryVirtual
          items={items}
          render={ItemRender}
          columns={1}
          gap={0}
          defaultWidth={200}
          getItemHeight={() => 100}
          overscanBy={0}
          endReachedThreshold={2}
          onEndReached={onEndReached}
        />,
      );

      expect(onEndReached).toHaveBeenCalledTimes(1);
    });

    it('keeps onRangeChange callback arguments unchanged', () => {
      const onRangeChange = vi.fn();
      Object.defineProperty(window, 'innerHeight', {
        get: () => 750,
        configurable: true,
      });

      render(
        <MasonryVirtual
          items={makeItems(10)}
          render={ItemRender}
          columns={1}
          gap={0}
          defaultWidth={200}
          getItemHeight={() => 100}
          overscanBy={0}
          onRangeChange={onRangeChange}
        />,
      );

      expect(onRangeChange).toHaveBeenCalledWith(0, 7);
    });

    it('renders scroll-seek placeholders when velocity is above threshold', () => {
      const renderSpy = vi.fn(ItemRender);

      render(
        <MasonryVirtual
          items={makeItems(5)}
          render={renderSpy}
          columns={1}
          gap={0}
          defaultWidth={200}
          getItemHeight={() => 120}
          scrollSeek={{
            velocityThreshold: 0,
            placeholder: PlaceholderRender,
          }}
        />,
      );

      expect(screen.getByTestId('placeholder-0')).toBeTruthy();
      expect(screen.queryByTestId('item-0')).toBeNull();
      expect(renderSpy).not.toHaveBeenCalled();
    });

    it('restores real items when scroll-seek velocity is below threshold', () => {
      const { rerender } = render(
        <MasonryVirtual
          items={makeItems(5)}
          render={ItemRender}
          columns={1}
          gap={0}
          defaultWidth={200}
          getItemHeight={() => 120}
          scrollSeek={{
            velocityThreshold: 0,
            placeholder: PlaceholderRender,
          }}
        />,
      );

      expect(screen.getByTestId('placeholder-0')).toBeTruthy();

      rerender(
        <MasonryVirtual
          items={makeItems(5)}
          render={ItemRender}
          columns={1}
          gap={0}
          defaultWidth={200}
          getItemHeight={() => 120}
          scrollSeek={{
            velocityThreshold: 1,
            placeholder: PlaceholderRender,
          }}
        />,
      );

      expect(screen.getByTestId('item-0')).toBeTruthy();
      expect(screen.queryByTestId('placeholder-0')).toBeNull();
    });
  });

  describe('accessibility', () => {
    it("applies role='list' by default", () => {
      render(
        <MasonryVirtual
          items={makeItems(2)}
          render={ItemRender}
          columns={2}
          gap={0}
          defaultWidth={400}
          getItemHeight={() => 100}
        />,
      );
      expect(screen.getByRole('list')).toBeTruthy();
    });

    it('applies aria-label when provided', () => {
      render(
        <MasonryVirtual
          items={makeItems(2)}
          render={ItemRender}
          columns={2}
          gap={0}
          defaultWidth={400}
          aria-label="Virtual gallery"
          getItemHeight={() => 100}
        />,
      );
      expect(
        screen.getByRole('list', { name: 'Virtual gallery' }),
      ).toBeTruthy();
    });

    it('sets aria-setsize on items to total items count', () => {
      const { container } = render(
        <MasonryVirtual
          items={makeItems(3)}
          render={ItemRender}
          columns={3}
          gap={0}
          defaultWidth={300}
          getItemHeight={() => 100}
          totalItems={100}
        />,
      );
      const listItems = container.querySelectorAll("[role='listitem']");
      expect(listItems.length).toBeGreaterThan(0);
      for (const item of Array.from(listItems)) {
        expect(item.getAttribute('aria-setsize')).toBe('100');
      }
    });

    it('sets aria-posinset on items to 1-based position', () => {
      const { container } = render(
        <MasonryVirtual
          items={makeItems(3)}
          render={ItemRender}
          columns={3}
          gap={0}
          defaultWidth={300}
          getItemHeight={() => 100}
        />,
      );
      const listItems = container.querySelectorAll("[role='listitem']");
      const positions = Array.from(listItems).map((item) =>
        Number(item.getAttribute('aria-posinset')),
      );
      expect(positions).toContain(1);
      expect(positions).toContain(2);
      expect(positions).toContain(3);
    });

    it('uses items.length as aria-setsize when totalItems is not provided', () => {
      const { container } = render(
        <MasonryVirtual
          items={makeItems(5)}
          render={ItemRender}
          columns={3}
          gap={0}
          defaultWidth={300}
          getItemHeight={() => 100}
        />,
      );
      const listItems = container.querySelectorAll("[role='listitem']");
      for (const item of Array.from(listItems)) {
        expect(item.getAttribute('aria-setsize')).toBe('5');
      }
    });

    it('omits item roles and aria metadata when role="none"', () => {
      const { container } = render(
        <MasonryVirtual
          items={makeItems(3)}
          render={ItemRender}
          columns={3}
          gap={0}
          defaultWidth={300}
          getItemHeight={() => 100}
          role="none"
        />,
      );

      expect(container.firstElementChild?.hasAttribute('role')).toBe(false);
      expect(container.querySelectorAll("[role='listitem']")).toHaveLength(0);
      expect(container.querySelectorAll('[aria-setsize]')).toHaveLength(0);
      expect(container.querySelectorAll('[aria-posinset]')).toHaveLength(0);
      expect(screen.getByTestId('item-0')).toBeTruthy();
    });
  });

  describe('measurement path', () => {
    it('hides items before they are measured (no getItemHeight)', () => {
      const { container } = render(
        <MasonryVirtual
          items={makeItems(2)}
          render={ItemRender}
          columns={2}
          gap={0}
          defaultWidth={400}
        />,
      );
      const listItems = container.querySelectorAll("[role='listitem']");
      for (const item of Array.from(listItems)) {
        expect((item as HTMLElement).style.visibility).toBe('hidden');
      }
    });

    it('reveals items and updates after measurement', () => {
      const { container } = render(
        <MasonryVirtual
          items={makeItems(1)}
          render={ItemRender}
          columns={1}
          gap={0}
          defaultWidth={200}
        />,
      );

      const wrapper = container.querySelector(
        "[role='listitem']",
      ) as HTMLElement;
      expect(wrapper.style.visibility).toBe('hidden');

      act(() => {
        fireResize(wrapper, 250);
      });

      const updatedWrapper = container.querySelector(
        "[role='listitem']",
      ) as HTMLElement;
      expect(updatedWrapper.style.visibility).toBe('visible');
    });

    it('keeps measured heights attached to itemKey identity after reorder', () => {
      const items = makeItems(3);
      const { container, rerender } = render(
        <MasonryVirtual
          items={items}
          render={ItemRender}
          columns={1}
          gap={0}
          defaultWidth={100}
          itemKey={(item) => item.id}
        />,
      );

      const wrappers = Array.from(
        container.querySelectorAll("[role='listitem']"),
      ) as HTMLElement[];

      act(() => {
        fireResize(wrappers[0], 300);
        fireResize(wrappers[1], 100);
        fireResize(wrappers[2], 100);
      });

      rerender(
        <MasonryVirtual
          items={[items[1], items[0], items[2]]}
          render={ItemRender}
          columns={1}
          gap={0}
          defaultWidth={100}
          itemKey={(item) => item.id}
        />,
      );

      const item0Wrapper = screen.getByTestId('item-0')
        .parentElement as HTMLElement;
      expect(item0Wrapper.style.top).toBe('100px');
    });

    it('keeps item refs stable across same-item rerenders', () => {
      const items = makeItems(2);
      const { rerender } = render(
        <MasonryVirtual
          items={items}
          render={ItemRender}
          columns={1}
          gap={0}
          defaultWidth={100}
          itemKey={(item) => item.id}
        />,
      );

      mockUnobserve.mockClear();

      rerender(
        <MasonryVirtual
          items={items}
          render={ItemRender}
          columns={1}
          gap={0}
          defaultWidth={100}
          itemKey={(item) => item.id}
        />,
      );

      expect(mockUnobserve).not.toHaveBeenCalled();
    });

    it('does not observe placeholder items during scroll seek', () => {
      render(
        <MasonryVirtual
          items={makeItems(3)}
          render={ItemRender}
          columns={1}
          gap={0}
          defaultWidth={100}
          scrollSeek={{
            velocityThreshold: 0,
            placeholder: PlaceholderRender,
          }}
        />,
      );

      expect(screen.getByTestId('placeholder-0')).toBeTruthy();
      const observedElements = mockObserve.mock.calls.map(
        ([element]) => element as HTMLElement,
      );
      expect(
        observedElements.some(
          (element) => element.getAttribute('role') === 'listitem',
        ),
      ).toBe(false);
    });
  });

  describe('observer cleanup', () => {
    it('disconnects ResizeObserver on unmount', () => {
      const { unmount } = render(
        <MasonryVirtual
          items={makeItems(3)}
          render={ItemRender}
          columns={3}
          gap={0}
          defaultWidth={300}
          getItemHeight={() => 100}
        />,
      );

      unmount();
      expect(mockDisconnect).toHaveBeenCalled();
    });
  });

  describe('positioning', () => {
    it('positions items absolutely', () => {
      const { container } = render(
        <MasonryVirtual
          items={makeItems(3)}
          render={ItemRender}
          columns={3}
          gap={0}
          defaultWidth={300}
          getItemHeight={() => 100}
        />,
      );
      const listItems = container.querySelectorAll("[role='listitem']");
      for (const item of Array.from(listItems)) {
        expect((item as HTMLElement).style.position).toBe('absolute');
      }
    });

    it('uses insetInlineStart for RTL support', () => {
      const { container } = render(
        <MasonryVirtual
          items={makeItems(3)}
          render={ItemRender}
          columns={3}
          gap={0}
          defaultWidth={300}
          getItemHeight={() => 100}
        />,
      );
      const listItems = container.querySelectorAll("[role='listitem']");
      for (const item of Array.from(listItems)) {
        expect((item as HTMLElement).style.insetInlineStart).toBeDefined();
      }
    });
  });
});
