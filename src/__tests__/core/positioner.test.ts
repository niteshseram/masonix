import { describe, it, expect } from 'vite-plus/test';

import { createPositioner } from '../../core/positioner';

describe('createPositioner', () => {
  describe('basic placement', () => {
    it('places first item in column 0 at top=0', () => {
      const p = createPositioner({ columnCount: 3, columnWidth: 100 });
      const item = p.set(0, 200);
      expect(item.column).toBe(0);
      expect(item.top).toBe(0);
      expect(item.left).toBe(0);
      expect(item.height).toBe(200);
    });

    it('distributes first N items across columns in order', () => {
      const p = createPositioner({ columnCount: 3, columnWidth: 100 });
      // All columns start at height 0, so shortest-first picks 0, then 1, then 2
      expect(p.set(0, 100).column).toBe(0);
      expect(p.set(1, 200).column).toBe(1);
      expect(p.set(2, 150).column).toBe(2);
    });

    it('places next item in the shortest column', () => {
      const p = createPositioner({ columnCount: 3, columnWidth: 100 });
      p.set(0, 300); // col 0 → height 300
      p.set(1, 100); // col 1 → height 100
      p.set(2, 200); // col 2 → height 200
      // col 1 is shortest (100), item 3 should land there
      const item = p.set(3, 50);
      expect(item.column).toBe(1);
      expect(item.top).toBe(100);
    });

    it('computes left as column * (columnWidth + columnGap)', () => {
      const p = createPositioner({
        columnCount: 3,
        columnWidth: 100,
        columnGap: 10,
      });
      p.set(0, 50);
      p.set(1, 150);
      p.set(2, 200);
      expect(p.get(0)!.left).toBe(0);
      expect(p.get(1)!.left).toBe(110);
      expect(p.get(2)!.left).toBe(220);
    });

    it('stacks items in a column with rowGap', () => {
      const p = createPositioner({
        columnCount: 1,
        columnWidth: 100,
        rowGap: 16,
      });
      p.set(0, 100); // top=0, bottom=100
      const item = p.set(1, 50);
      expect(item.top).toBe(116); // 100 + 16
    });

    it('sets width to columnWidth', () => {
      const p = createPositioner({ columnCount: 3, columnWidth: 120 });
      const item = p.set(0, 100);
      expect(item.width).toBe(120);
    });
  });

  describe('column heights', () => {
    it('getColumnHeights returns all heights', () => {
      const p = createPositioner({ columnCount: 3, columnWidth: 100 });
      p.set(0, 100);
      p.set(1, 200);
      p.set(2, 150);
      expect(p.getColumnHeights()).toEqual([100, 200, 150]);
    });

    it('shortestColumn returns index of column with min height', () => {
      const p = createPositioner({ columnCount: 3, columnWidth: 100 });
      p.set(0, 300);
      p.set(1, 100);
      p.set(2, 200);
      expect(p.shortestColumn()).toBe(1);
    });

    it('tallestColumnHeight returns max column height', () => {
      const p = createPositioner({ columnCount: 3, columnWidth: 100 });
      p.set(0, 300);
      p.set(1, 100);
      p.set(2, 200);
      expect(p.tallestColumnHeight()).toBe(300);
    });

    it('returns 0 for all heights when empty', () => {
      const p = createPositioner({ columnCount: 3, columnWidth: 100 });
      expect(p.getColumnHeights()).toEqual([0, 0, 0]);
      expect(p.tallestColumnHeight()).toBe(0);
    });
  });

  describe('update', () => {
    it('recomputes subsequent item tops when a height changes', () => {
      const p = createPositioner({ columnCount: 1, columnWidth: 100 });
      p.set(0, 100);
      p.set(1, 50);
      expect(p.get(1)!.top).toBe(100);

      p.update([[0, 200]]);
      expect(p.get(1)!.top).toBe(200);
    });

    it('returns the list of items whose positions changed', () => {
      const p = createPositioner({ columnCount: 1, columnWidth: 100 });
      p.set(0, 100);
      p.set(1, 50);
      const updated = p.update([[0, 200]]);
      const indices = updated.map((i) => i.index);
      expect(indices).toContain(0);
    });

    it('does not affect unrelated columns', () => {
      const p = createPositioner({ columnCount: 3, columnWidth: 100 });
      p.set(0, 100);
      p.set(1, 100);
      p.set(2, 100);
      const topBefore = p.get(1)!.top;
      p.update([[0, 300]]);
      expect(p.get(1)!.top).toBe(topBefore);
    });
  });

  describe('size and all', () => {
    it('size returns count of placed items', () => {
      const p = createPositioner({ columnCount: 3, columnWidth: 100 });
      expect(p.size()).toBe(0);
      p.set(0, 100);
      p.set(1, 100);
      expect(p.size()).toBe(2);
    });

    it('all returns every placed item', () => {
      const p = createPositioner({ columnCount: 3, columnWidth: 100 });
      p.set(0, 100);
      p.set(1, 200);
      expect(p.all()).toHaveLength(2);
    });

    it('get returns undefined for unplaced index', () => {
      const p = createPositioner({ columnCount: 3, columnWidth: 100 });
      expect(p.get(42)).toBeUndefined();
    });
  });

  describe('clear', () => {
    it('resets all items and column heights to 0', () => {
      const p = createPositioner({ columnCount: 3, columnWidth: 100 });
      p.set(0, 100);
      p.set(1, 200);
      p.clear();
      expect(p.size()).toBe(0);
      expect(p.getColumnHeights()).toEqual([0, 0, 0]);
    });

    it('allows placement after clear', () => {
      const p = createPositioner({ columnCount: 2, columnWidth: 100 });
      p.set(0, 100);
      p.clear();
      const item = p.set(0, 50);
      expect(item.top).toBe(0);
    });
  });

  describe('estimateHeight', () => {
    it('estimates from rows when no items are placed', () => {
      const p = createPositioner({ columnCount: 3, columnWidth: 100 });
      // 9 items, 3 cols → 3 rows of 200 = 600
      expect(p.estimateHeight(9, 200)).toBe(600);
    });

    it('returns at least tallestColumnHeight when all items placed', () => {
      const p = createPositioner({ columnCount: 3, columnWidth: 100 });
      p.set(0, 200);
      p.set(1, 200);
      p.set(2, 200);
      expect(p.estimateHeight(3, 200)).toBeGreaterThanOrEqual(200);
    });
  });

  describe('edge cases', () => {
    it('single column: all items stack sequentially', () => {
      const p = createPositioner({ columnCount: 1, columnWidth: 200 });
      p.set(0, 100);
      p.set(1, 150);
      expect(p.get(0)!.top).toBe(0);
      expect(p.get(1)!.top).toBe(100);
    });

    it('single item', () => {
      const p = createPositioner({ columnCount: 5, columnWidth: 100 });
      const item = p.set(0, 80);
      expect(item.index).toBe(0);
      expect(item.column).toBe(0);
    });

    it('fewer items than columns leaves remaining columns empty', () => {
      const p = createPositioner({ columnCount: 4, columnWidth: 100 });
      p.set(0, 100);
      p.set(1, 100);
      const heights = p.getColumnHeights();
      expect(heights[2]).toBe(0);
      expect(heights[3]).toBe(0);
    });

    it('handles zero-gap configuration', () => {
      const p = createPositioner({
        columnCount: 3,
        columnWidth: 100,
        columnGap: 0,
        rowGap: 0,
      });
      p.set(0, 100);
      p.set(1, 100);
      p.set(2, 100);
      expect(p.getColumnHeights()).toEqual([100, 100, 100]);
    });
  });
});
