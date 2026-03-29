import { describe, it, expect } from "vite-plus/test";
import { createRowPositioner } from "../../core/row-positioner";

describe("createRowPositioner", () => {
  describe("row-wise ordering", () => {
    it("assigns item i to column i % columnCount", () => {
      const p = createRowPositioner({ columnCount: 3, columnWidth: 100 });
      for (let i = 0; i < 6; i++) p.set(i, 100);
      for (let i = 0; i < 6; i++) {
        expect(p.get(i)!.column).toBe(i % 3);
      }
    });

    it("preserves source order even when columns are imbalanced", () => {
      const p = createRowPositioner({ columnCount: 3, columnWidth: 100 });
      const heights = [300, 50, 50, 50, 50, 50];
      heights.forEach((h, i) => p.set(i, h));
      // Col 0 is much taller, but items 3/4/5 still go to cols 0/1/2 by index
      expect(p.get(3)!.column).toBe(0);
      expect(p.get(4)!.column).toBe(1);
      expect(p.get(5)!.column).toBe(2);
    });
  });

  describe("positioning", () => {
    it("stacks items vertically within their column", () => {
      const p = createRowPositioner({ columnCount: 2, columnWidth: 100, rowGap: 10 });
      p.set(0, 100); // col 0, top=0
      p.set(1, 50); // col 1, top=0
      p.set(2, 80); // col 0, top=100+10=110
      p.set(3, 60); // col 1, top=50+10=60
      expect(p.get(2)!.top).toBe(110);
      expect(p.get(3)!.top).toBe(60);
    });

    it("computes left as column * (columnWidth + columnGap)", () => {
      const p = createRowPositioner({ columnCount: 3, columnWidth: 100, columnGap: 20 });
      p.set(0, 50);
      p.set(1, 50);
      p.set(2, 50);
      expect(p.get(0)!.left).toBe(0);
      expect(p.get(1)!.left).toBe(120);
      expect(p.get(2)!.left).toBe(240);
    });

    it("sets width to columnWidth for every item", () => {
      const p = createRowPositioner({ columnCount: 3, columnWidth: 120 });
      p.set(0, 50);
      expect(p.get(0)!.width).toBe(120);
    });

    it("sets span to 1 for every item", () => {
      const p = createRowPositioner({ columnCount: 3, columnWidth: 100 });
      p.set(0, 50);
      expect(p.get(0)!.span).toBe(1);
    });
  });

  describe("column heights", () => {
    it("tracks heights correctly", () => {
      const p = createRowPositioner({ columnCount: 3, columnWidth: 100 });
      p.set(0, 100); // col 0
      p.set(1, 200); // col 1
      p.set(2, 150); // col 2
      expect(p.getColumnHeights()).toEqual([100, 200, 150]);
    });

    it("leaves empty columns at 0 when fewer items than columns", () => {
      const p = createRowPositioner({ columnCount: 4, columnWidth: 100 });
      p.set(0, 100);
      p.set(1, 200);
      expect(p.getColumnHeights()).toEqual([100, 200, 0, 0]);
    });

    it("shortestColumn returns index of min-height column", () => {
      const p = createRowPositioner({ columnCount: 3, columnWidth: 100 });
      p.set(0, 300);
      p.set(1, 100);
      p.set(2, 200);
      expect(p.shortestColumn()).toBe(1);
    });

    it("tallestColumnHeight returns max", () => {
      const p = createRowPositioner({ columnCount: 3, columnWidth: 100 });
      p.set(0, 300);
      p.set(1, 100);
      p.set(2, 200);
      expect(p.tallestColumnHeight()).toBe(300);
    });
  });

  describe("update", () => {
    it("recomputes subsequent tops in a column after height change", () => {
      const p = createRowPositioner({ columnCount: 2, columnWidth: 100 });
      p.set(0, 100); // col 0, top=0
      p.set(1, 50); // col 1, top=0
      p.set(2, 80); // col 0, top=100
      p.update([[0, 200]]);
      expect(p.get(2)!.top).toBe(200);
    });

    it("does not affect other columns", () => {
      const p = createRowPositioner({ columnCount: 2, columnWidth: 100 });
      p.set(0, 100); // col 0
      p.set(1, 50); // col 1
      p.set(2, 80); // col 0
      const topBefore = p.get(1)!.top;
      p.update([[0, 300]]);
      expect(p.get(1)!.top).toBe(topBefore);
    });

    it("returns updated items list", () => {
      const p = createRowPositioner({ columnCount: 1, columnWidth: 100 });
      p.set(0, 100);
      p.set(1, 50);
      const updated = p.update([[0, 200]]);
      expect(updated.map((i) => i.index)).toContain(0);
    });
  });

  describe("size and all", () => {
    it("size returns placed item count", () => {
      const p = createRowPositioner({ columnCount: 3, columnWidth: 100 });
      expect(p.size()).toBe(0);
      p.set(0, 100);
      p.set(1, 100);
      expect(p.size()).toBe(2);
    });

    it("all returns all placed items", () => {
      const p = createRowPositioner({ columnCount: 3, columnWidth: 100 });
      p.set(0, 100);
      p.set(1, 200);
      expect(p.all()).toHaveLength(2);
    });

    it("get returns undefined for unplaced index", () => {
      const p = createRowPositioner({ columnCount: 3, columnWidth: 100 });
      expect(p.get(99)).toBeUndefined();
    });
  });

  describe("clear", () => {
    it("resets all items and column heights", () => {
      const p = createRowPositioner({ columnCount: 3, columnWidth: 100 });
      p.set(0, 100);
      p.set(1, 200);
      p.clear();
      expect(p.size()).toBe(0);
      expect(p.getColumnHeights()).toEqual([0, 0, 0]);
    });

    it("allows re-placement after clear", () => {
      const p = createRowPositioner({ columnCount: 2, columnWidth: 100 });
      p.set(0, 100);
      p.clear();
      const item = p.set(0, 50);
      expect(item.top).toBe(0);
    });
  });

  describe("edge cases", () => {
    it("single column: all items stack sequentially", () => {
      const p = createRowPositioner({ columnCount: 1, columnWidth: 300 });
      p.set(0, 100);
      p.set(1, 150);
      p.set(2, 75);
      expect(p.get(0)!.top).toBe(0);
      expect(p.get(1)!.top).toBe(100);
      expect(p.get(2)!.top).toBe(250);
    });

    it("single item placed in col 0", () => {
      const p = createRowPositioner({ columnCount: 5, columnWidth: 100 });
      const item = p.set(0, 80);
      expect(item.column).toBe(0);
      expect(item.top).toBe(0);
    });

    it("estimateHeight with no placed items", () => {
      const p = createRowPositioner({ columnCount: 3, columnWidth: 100 });
      expect(p.estimateHeight(9, 200)).toBe(600);
    });
  });
});
