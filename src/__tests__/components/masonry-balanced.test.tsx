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

import { MasonryBalanced } from '../../components/masonry-balanced';
import type { MasonryRenderProps } from '../../types';

// ---------------------------------------------------------------------------
// ResizeObserver mock
// ---------------------------------------------------------------------------

type RoCallback = (entries: ResizeObserverEntry[]) => void;

let roCallbacks: RoCallback[] = [];
let mockObserve: ReturnType<typeof vi.fn>;
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

beforeEach(() => {
  roCallbacks = [];
  mockObserve = vi.fn();
  mockDisconnect = vi.fn();

  globalThis.ResizeObserver = vi.fn().mockImplementation(function (
    cb: RoCallback,
  ) {
    roCallbacks.push(cb);
    return {
      observe: mockObserve,
      unobserve: vi.fn(),
      disconnect: mockDisconnect,
    };
  });
});

afterEach(() => {
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

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('MasonryBalanced', () => {
  describe('rendering', () => {
    it('renders all items', () => {
      render(
        <MasonryBalanced
          items={makeItems(5)}
          render={ItemRender}
          columns={3}
          gap={0}
          getItemHeight={() => 100}
        />,
      );
      for (let i = 0; i < 5; i++) {
        expect(screen.getByTestId(`item-${i}`)).toBeTruthy();
      }
    });

    it("uses custom container element via 'as' prop", () => {
      const { container } = render(
        <MasonryBalanced
          items={makeItems(2)}
          render={ItemRender}
          columns={2}
          gap={0}
          as="section"
          getItemHeight={() => 100}
        />,
      );
      expect(container.querySelector('section')).toBeTruthy();
    });
  });

  describe('getItemHeight fast path', () => {
    it('positions items without measuring (all items visible immediately)', () => {
      const { container } = render(
        <MasonryBalanced
          items={makeItems(3)}
          render={ItemRender}
          columns={3}
          gap={0}
          defaultWidth={300}
          getItemHeight={() => 100}
        />,
      );

      // All item wrappers should be visible (no hidden items)
      const wrappers = container.firstElementChild?.children;
      expect(wrappers).toBeTruthy();
      for (const wrapper of Array.from(wrappers!)) {
        const vis = (wrapper as HTMLElement).style.visibility;
        expect(vis).not.toBe('hidden');
      }
    });

    it('sets container height to tallest column', () => {
      // 3 items, 3 columns, each 100px tall → container height = 100
      const { container } = render(
        <MasonryBalanced
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

    it('distributes items to shortest columns', () => {
      // 2 columns, items with varying heights to verify shortest-first placement
      // col0: item0 (300) → height 300
      // col1: item1 (100) → height 100
      // item2 (50) → goes to col1 (shortest)
      const heights = [300, 100, 50];
      const { container } = render(
        <MasonryBalanced
          items={makeItems(3)}
          render={ItemRender}
          columns={2}
          gap={0}
          defaultWidth={200}
          getItemHeight={(_, index) => heights[index]}
        />,
      );
      const wrappers = Array.from(
        container.firstElementChild!.children,
      ) as HTMLElement[];
      // item2 (index=2) should have top=100 (placed after item1 in col1)
      expect(wrappers[2].style.top).toBe('100px');
    });

    it('applies gap between items in the same column', () => {
      // 1 column, gap=16, two items of 100px
      // item1.top = 100 + 16 = 116
      const { container } = render(
        <MasonryBalanced
          items={makeItems(2)}
          render={ItemRender}
          columns={1}
          gap={16}
          defaultWidth={100}
          getItemHeight={() => 100}
        />,
      );
      const wrappers = Array.from(
        container.firstElementChild!.children,
      ) as HTMLElement[];
      expect(wrappers[1].style.top).toBe('116px');
    });
  });

  describe('measurement path', () => {
    it('hides items before they are measured', () => {
      const { container } = render(
        <MasonryBalanced
          items={makeItems(2)}
          render={ItemRender}
          columns={2}
          gap={0}
          defaultWidth={200}
        />,
      );
      const wrappers = Array.from(
        container.firstElementChild!.children,
      ) as HTMLElement[];
      for (const w of wrappers) {
        expect(w.style.visibility).toBe('hidden');
      }
    });

    it('reveals items and updates height after measurement', () => {
      const { container } = render(
        <MasonryBalanced
          items={makeItems(1)}
          render={ItemRender}
          columns={1}
          gap={0}
          defaultWidth={100}
        />,
      );

      const wrapper = container.firstElementChild!.children[0] as HTMLElement;
      expect(wrapper.style.visibility).toBe('hidden');

      act(() => {
        fireResize(wrapper, 250);
      });

      const updatedWrapper = container.firstElementChild!
        .children[0] as HTMLElement;
      expect(updatedWrapper.style.visibility).toBe('visible');
    });
  });

  describe('accessibility', () => {
    it("applies role='list' by default", () => {
      render(
        <MasonryBalanced
          items={makeItems(2)}
          render={ItemRender}
          columns={2}
          gap={0}
          getItemHeight={() => 100}
        />,
      );
      expect(screen.getByRole('list')).toBeTruthy();
    });

    it('applies aria-label when provided', () => {
      render(
        <MasonryBalanced
          items={makeItems(2)}
          render={ItemRender}
          columns={2}
          gap={0}
          aria-label="Photo gallery"
          getItemHeight={() => 100}
        />,
      );
      expect(screen.getByRole('list', { name: 'Photo gallery' })).toBeTruthy();
    });

    it('assigns role=listitem, aria-setsize, and aria-posinset to each item', () => {
      const { container } = render(
        <MasonryBalanced
          items={makeItems(3)}
          render={ItemRender}
          columns={3}
          gap={0}
          defaultWidth={300}
          getItemHeight={() => 100}
        />,
      );
      const listItems = container.querySelectorAll('[role="listitem"]');
      expect(listItems).toHaveLength(3);
      expect(listItems[0].getAttribute('aria-setsize')).toBe('3');
      expect(listItems[0].getAttribute('aria-posinset')).toBe('1');
      expect(listItems[2].getAttribute('aria-posinset')).toBe('3');
    });

    it('includes an aria-live polite region', () => {
      const { container } = render(
        <MasonryBalanced
          items={makeItems(2)}
          render={ItemRender}
          columns={2}
          gap={0}
          getItemHeight={() => 100}
        />,
      );
      const liveRegion = container.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeTruthy();
      expect(liveRegion?.getAttribute('aria-atomic')).toBe('true');
    });
  });

  describe('shortest-first placement', () => {
    it('places item 4 in col0 when all columns equal height (shortest-first picks col0)', () => {
      // 3 cols, 4 items all 100px → item3 wraps to col0
      const { container } = render(
        <MasonryBalanced
          items={makeItems(4)}
          render={ItemRender}
          columns={3}
          gap={0}
          defaultWidth={300}
          getItemHeight={() => 100}
        />,
      );
      const wrappers = Array.from(
        container.firstElementChild!.children,
      ) as HTMLElement[];
      // item3 → col0 → insetInlineStart = 0 (JSDOM renders 0 without unit)
      expect(['0', '0px']).toContain(wrappers[3].style.insetInlineStart);
    });
  });
});
