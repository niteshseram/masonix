import React from "react";
import { render, screen, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { MasonryVirtual } from "../../components/masonry-virtual";
import type { MasonryRenderProps } from "../../types";

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

const originalScrollTo = window.scrollTo;

beforeEach(() => {
  roCallbacks = [];
  mockObserve = vi.fn();
  mockDisconnect = vi.fn();

  globalThis.ResizeObserver = vi.fn().mockImplementation(function (cb: RoCallback) {
    roCallbacks.push(cb);
    return {
      observe: mockObserve,
      unobserve: vi.fn(),
      disconnect: mockDisconnect,
    };
  });

  // Mock scrollTo
  Object.defineProperty(window, "scrollTo", {
    value: vi.fn(),
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

type Item = { id: number; label: string };

function makeItems(count: number): Item[] {
  return Array.from({ length: count }, (_, i) => ({ id: i, label: `Item ${i}` }));
}

function ItemRender({ data }: MasonryRenderProps<Item>) {
  return <div data-testid={`item-${data.id}`}>{data.label}</div>;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("MasonryVirtual", () => {
  describe("rendering", () => {
    it("renders items with getItemHeight (no measurement phase)", () => {
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
      expect(screen.getByTestId("item-0")).toBeTruthy();
    });

    it("renders empty state when items is empty", () => {
      render(
        <MasonryVirtual
          items={[]}
          render={ItemRender}
          columns={3}
          gap={0}
          empty={<span data-testid="empty">No items</span>}
        />,
      );
      expect(screen.getByTestId("empty")).toBeTruthy();
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
      expect(container.querySelector("section")).toBeTruthy();
    });
  });

  describe("virtualization", () => {
    it("only renders items visible in the viewport", () => {
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

      const renderedItems = container.querySelectorAll("[data-testid^='item-']");
      expect(renderedItems.length).toBeLessThan(50);
      expect(renderedItems.length).toBeGreaterThan(0);
    });

    it("sets container height to accommodate all items", () => {
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
      expect(containerEl.style.height).toBe("100px");
    });
  });

  describe("accessibility", () => {
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
      expect(screen.getByRole("list")).toBeTruthy();
    });

    it("applies aria-label when provided", () => {
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
      expect(screen.getByRole("list", { name: "Virtual gallery" })).toBeTruthy();
    });

    it("sets aria-setsize on items to total items count", () => {
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
        expect(item.getAttribute("aria-setsize")).toBe("100");
      }
    });

    it("sets aria-posinset on items to 1-based position", () => {
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
        Number(item.getAttribute("aria-posinset")),
      );
      expect(positions).toContain(1);
      expect(positions).toContain(2);
      expect(positions).toContain(3);
    });

    it("uses items.length as aria-setsize when totalItems is not provided", () => {
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
        expect(item.getAttribute("aria-setsize")).toBe("5");
      }
    });
  });

  describe("measurement path", () => {
    it("hides items before they are measured (no getItemHeight)", () => {
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
        expect((item as HTMLElement).style.visibility).toBe("hidden");
      }
    });

    it("reveals items and updates after measurement", () => {
      const { container } = render(
        <MasonryVirtual
          items={makeItems(1)}
          render={ItemRender}
          columns={1}
          gap={0}
          defaultWidth={200}
        />,
      );

      const wrapper = container.querySelector("[role='listitem']") as HTMLElement;
      expect(wrapper.style.visibility).toBe("hidden");

      act(() => {
        fireResize(wrapper, 250);
      });

      const updatedWrapper = container.querySelector("[role='listitem']") as HTMLElement;
      expect(updatedWrapper.style.visibility).toBe("visible");
    });
  });

  describe("observer cleanup", () => {
    it("disconnects ResizeObserver on unmount", () => {
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

  describe("positioning", () => {
    it("positions items absolutely", () => {
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
        expect((item as HTMLElement).style.position).toBe("absolute");
      }
    });

    it("uses insetInlineStart for RTL support", () => {
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
