import { describe, it, expect } from 'vite-plus/test';

import { createIntervalTree } from '../../core/interval-tree';

describe('createIntervalTree', () => {
  describe('empty tree', () => {
    it('starts with size 0', () => {
      const tree = createIntervalTree();
      expect(tree.size).toBe(0);
    });

    it('search on empty tree returns nothing', () => {
      const tree = createIntervalTree();
      const results: number[] = [];
      tree.search(0, 1000, (i) => results.push(i));
      expect(results).toHaveLength(0);
    });
  });

  describe('insert and search', () => {
    it('finds a single interval that overlaps the query', () => {
      const tree = createIntervalTree();
      tree.insert(0, 100, 300);
      const results: number[] = [];
      tree.search(200, 400, (i) => results.push(i));
      expect(results).toContain(0);
    });

    it('does not return an interval outside the query range', () => {
      const tree = createIntervalTree();
      tree.insert(0, 100, 200);
      const results: number[] = [];
      tree.search(300, 400, (i) => results.push(i));
      expect(results).toHaveLength(0);
    });

    it('finds all overlapping intervals in a mixed set', () => {
      const tree = createIntervalTree();
      tree.insert(0, 0, 100);
      tree.insert(1, 50, 150);
      tree.insert(2, 200, 300);
      tree.insert(3, 400, 500);
      const results: number[] = [];
      tree.search(80, 220, (i) => results.push(i));
      expect(results).toContain(0); // [0,100] overlaps [80,220]
      expect(results).toContain(1); // [50,150] overlaps [80,220]
      expect(results).toContain(2); // [200,300] overlaps [80,220]
      expect(results).not.toContain(3); // [400,500] does not overlap
    });

    it('handles touching boundary (inclusive overlap)', () => {
      const tree = createIntervalTree();
      tree.insert(0, 0, 100);
      const results: number[] = [];
      // [0,100] and [100,200] share the point 100 → overlap
      tree.search(100, 200, (i) => results.push(i));
      expect(results).toContain(0);
    });

    it('passes correct low and high to callback', () => {
      const tree = createIntervalTree();
      tree.insert(5, 300, 450);
      let gotLow = -1;
      let gotHigh = -1;
      tree.search(350, 500, (idx, low, high) => {
        gotLow = low;
        gotHigh = high;
      });
      expect(gotLow).toBe(300);
      expect(gotHigh).toBe(450);
    });

    it('does not find a single-point interval outside query', () => {
      const tree = createIntervalTree();
      tree.insert(0, 200, 200); // zero-length interval at 200
      const results: number[] = [];
      tree.search(201, 300, (i) => results.push(i));
      expect(results).toHaveLength(0);
    });
  });

  describe('remove', () => {
    it('removes an item so it is not found in subsequent searches', () => {
      const tree = createIntervalTree();
      tree.insert(0, 100, 300);
      tree.insert(1, 200, 400);
      tree.remove(0);
      const results: number[] = [];
      tree.search(150, 250, (i) => results.push(i));
      expect(results).not.toContain(0);
      expect(results).toContain(1);
    });

    it('decrements size after removal', () => {
      const tree = createIntervalTree();
      tree.insert(0, 0, 100);
      tree.insert(1, 100, 200);
      expect(tree.size).toBe(2);
      tree.remove(0);
      expect(tree.size).toBe(1);
    });

    it('silently ignores removal of non-existent index', () => {
      const tree = createIntervalTree();
      expect(() => tree.remove(999)).not.toThrow();
      expect(tree.size).toBe(0);
    });

    it('allows tree to remain searchable after multiple removals', () => {
      const tree = createIntervalTree();
      for (let i = 0; i < 5; i++) tree.insert(i, i * 100, i * 100 + 80);
      tree.remove(1);
      tree.remove(3);
      const results: number[] = [];
      tree.search(0, 500, (i) => results.push(i));
      expect(results).not.toContain(1);
      expect(results).not.toContain(3);
      expect(results).toContain(0);
      expect(results).toContain(2);
      expect(results).toContain(4);
    });
  });

  describe('clear', () => {
    it('resets size to 0', () => {
      const tree = createIntervalTree();
      tree.insert(0, 0, 100);
      tree.insert(1, 100, 200);
      tree.clear();
      expect(tree.size).toBe(0);
    });

    it('returns no results after clear', () => {
      const tree = createIntervalTree();
      tree.insert(0, 0, 100);
      tree.insert(1, 100, 200);
      tree.clear();
      const results: number[] = [];
      tree.search(0, 200, (i) => results.push(i));
      expect(results).toHaveLength(0);
    });

    it('allows inserts after clear', () => {
      const tree = createIntervalTree();
      tree.insert(0, 0, 100);
      tree.clear();
      tree.insert(0, 0, 100);
      expect(tree.size).toBe(1);
    });
  });

  describe('size tracking', () => {
    it('increments on insert and decrements on remove', () => {
      const tree = createIntervalTree();
      tree.insert(0, 0, 100);
      expect(tree.size).toBe(1);
      tree.insert(1, 100, 200);
      expect(tree.size).toBe(2);
      tree.remove(0);
      expect(tree.size).toBe(1);
      tree.clear();
      expect(tree.size).toBe(0);
    });
  });

  describe('correctness at scale', () => {
    it('stress: all returned intervals actually overlap query', () => {
      const tree = createIntervalTree();
      const N = 200;
      for (let i = 0; i < N; i++) {
        tree.insert(i, i * 50, i * 50 + 100);
      }
      expect(tree.size).toBe(N);

      const queryLow = 1200;
      const queryHigh = 1500;
      const results: Array<{ i: number; low: number; high: number }> = [];
      tree.search(queryLow, queryHigh, (i, low, high) =>
        results.push({ i, low, high }),
      );

      expect(results.length).toBeGreaterThan(0);
      for (const { low, high } of results) {
        expect(low <= queryHigh && high >= queryLow).toBe(true);
      }
    });

    it('stress: no false negatives — all overlapping intervals are returned', () => {
      const tree = createIntervalTree();
      // Items with non-overlapping intervals placed sequentially
      const intervals: Array<[number, number]> = [];
      for (let i = 0; i < 50; i++) {
        const low = i * 100;
        const high = low + 80;
        intervals.push([low, high]);
        tree.insert(i, low, high);
      }

      const queryLow = 250;
      const queryHigh = 450;
      const results = new Set<number>();
      tree.search(queryLow, queryHigh, (i) => results.add(i));

      // Manually find which intervals should overlap
      for (let i = 0; i < intervals.length; i++) {
        const [low, high] = intervals[i];
        const shouldOverlap = low <= queryHigh && high >= queryLow;
        if (shouldOverlap) {
          expect(results.has(i)).toBe(true);
        }
      }
    });
  });
});
