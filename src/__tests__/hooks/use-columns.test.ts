import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vite-plus/test';

import { useColumns } from '../../hooks/use-columns';

describe('useColumns', () => {
  describe('default behavior', () => {
    it('returns 3 columns and correct width for a 900px container', () => {
      const { result } = renderHook(() =>
        useColumns({ containerWidth: 900, itemCount: 10 }),
      );
      expect(result.current.columnCount).toBe(3);
      expect(result.current.columnWidth).toBe(300);
      expect(result.current.gap).toBe(0);
    });

    it('uses defaultColumns fallback when columns is not specified', () => {
      const { result } = renderHook(() =>
        useColumns({ containerWidth: 900, defaultColumns: 4, itemCount: 10 }),
      );
      expect(result.current.columnCount).toBe(4);
    });
  });

  describe('fixed columns', () => {
    it('computes column width with gap', () => {
      // 4 cols, gap=16 → totalGap=48, width = floor((1000-48)/4) = 238
      const { result } = renderHook(() =>
        useColumns({
          containerWidth: 1000,
          columns: 4,
          gap: 16,
          itemCount: 10,
        }),
      );
      expect(result.current.columnCount).toBe(4);
      expect(result.current.columnWidth).toBe(238);
      expect(result.current.gap).toBe(16);
    });
  });

  describe('responsive columns', () => {
    it('resolves breakpoint columns below threshold', () => {
      const { result } = renderHook(() =>
        useColumns({
          containerWidth: 400,
          columns: { 0: 1, 768: 3 },
          itemCount: 10,
        }),
      );
      expect(result.current.columnCount).toBe(1);
    });

    it('resolves breakpoint columns at threshold', () => {
      const { result } = renderHook(() =>
        useColumns({
          containerWidth: 800,
          columns: { 0: 1, 768: 3 },
          itemCount: 10,
        }),
      );
      expect(result.current.columnCount).toBe(3);
    });

    it('resolves numeric breakpoint columns mid-range', () => {
      const { result } = renderHook(() =>
        useColumns({
          containerWidth: 700,
          columns: { 0: 1, 600: 2, 900: 3 },
          itemCount: 10,
        }),
      );
      expect(result.current.columnCount).toBe(2);
    });
  });

  describe('responsive gap', () => {
    it('resolves a plain number gap', () => {
      const { result } = renderHook(() =>
        useColumns({ containerWidth: 900, columns: 3, gap: 20, itemCount: 5 }),
      );
      expect(result.current.gap).toBe(20);
    });

    it('resolves a responsive gap object', () => {
      const { result } = renderHook(() =>
        useColumns({
          containerWidth: 1024,
          columns: 3,
          gap: { 0: 8, 1024: 24 },
          itemCount: 5,
        }),
      );
      expect(result.current.gap).toBe(24);
    });
  });

  describe('effectiveColumnCount', () => {
    it('clamps columnCount to itemCount when itemCount < columns', () => {
      const { result } = renderHook(() =>
        useColumns({ containerWidth: 1200, columns: 5, itemCount: 2 }),
      );
      expect(result.current.columnCount).toBe(2);
    });

    it('returns configured columnCount when itemCount >= columns', () => {
      const { result } = renderHook(() =>
        useColumns({ containerWidth: 900, columns: 3, itemCount: 10 }),
      );
      expect(result.current.columnCount).toBe(3);
    });

    it('returns full columnCount when itemCount is 0', () => {
      const { result } = renderHook(() =>
        useColumns({ containerWidth: 1200, columns: 4, itemCount: 0 }),
      );
      expect(result.current.columnCount).toBe(4);
    });
  });

  describe('reactivity', () => {
    it('recomputes when containerWidth changes', () => {
      let containerWidth = 400;
      const { result, rerender } = renderHook(() =>
        useColumns({
          containerWidth,
          columns: { 0: 1, 768: 3 },
          itemCount: 10,
        }),
      );
      expect(result.current.columnCount).toBe(1);

      containerWidth = 800;
      rerender();
      expect(result.current.columnCount).toBe(3);
    });

    it('recomputes when itemCount changes', () => {
      let itemCount = 10;
      const { result, rerender } = renderHook(() =>
        useColumns({ containerWidth: 900, columns: 5, itemCount }),
      );
      expect(result.current.columnCount).toBe(5);

      itemCount = 2;
      rerender();
      expect(result.current.columnCount).toBe(2);
    });
  });
});
