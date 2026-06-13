import { describe, it, expect } from 'vite-plus/test';

import {
  resolveResponsiveValue,
  computeColumns,
  effectiveColumnCount,
} from '../../core/utils';

describe('resolveResponsiveValue', () => {
  it('returns a plain number unchanged', () => {
    expect(resolveResponsiveValue(3, 1000)).toBe(3);
    expect(resolveResponsiveValue(0, 500)).toBe(0);
  });

  it('returns 0-key value when containerWidth is below all other breakpoints', () => {
    expect(resolveResponsiveValue({ 0: 1, 600: 2, 1024: 4 }, 0)).toBe(1);
    expect(resolveResponsiveValue({ 0: 1, 600: 2, 1024: 4 }, 400)).toBe(1);
  });

  it('activates at the exact breakpoint threshold', () => {
    expect(resolveResponsiveValue({ 0: 1, 600: 2, 1024: 4 }, 600)).toBe(2);
    expect(resolveResponsiveValue({ 0: 1, 600: 2, 1024: 4 }, 1024)).toBe(4);
  });

  it('uses largest matching breakpoint when multiple match', () => {
    // width=900: matches 0 and 600 — NOT 1024
    expect(resolveResponsiveValue({ 0: 1, 600: 2, 768: 3, 1024: 4 }, 900)).toBe(
      3,
    );
  });

  it('resolves numeric breakpoint keys', () => {
    const val: Record<number, number> = { 0: 1, 500: 2, 900: 3 };
    expect(resolveResponsiveValue(val, 400)).toBe(1);
    expect(resolveResponsiveValue(val, 500)).toBe(2);
    expect(resolveResponsiveValue(val, 1000)).toBe(3);
  });

  it('returns 1 when the responsive object has no valid entries', () => {
    expect(resolveResponsiveValue({}, 600)).toBe(1);
  });

  it('uses the first breakpoint value as fallback when width is below all thresholds', () => {
    // { 600: 2 } → entries = [[600, 2]], initial result = 2
    // containerWidth=300 never satisfies >= 600 → result stays 2
    expect(resolveResponsiveValue({ 600: 2 }, 300)).toBe(2);
  });
});

describe('computeColumns', () => {
  it('uses an explicit numeric column count', () => {
    const result = computeColumns(1200, { columns: 4 });
    expect(result.columnCount).toBe(4);
  });

  it('computes column width from count and gap', () => {
    // 4 cols, gap=10 → totalGap=30, colWidth = floor((1200-30)/4) = 292
    const result = computeColumns(1200, { columns: 4, gap: 10 });
    expect(result.columnCount).toBe(4);
    expect(result.columnWidth).toBe(292);
  });

  it('computes column width with no gap', () => {
    // 3 cols, no gap → colWidth = floor(900/3) = 300
    const result = computeColumns(900, { columns: 3 });
    expect(result.columnWidth).toBe(300);
  });

  it('auto-calculates column count from minimum columnWidth', () => {
    // floor((1000 + 0) / (200 + 0)) = 5
    const result = computeColumns(1000, { columnWidth: 200 });
    expect(result.columnCount).toBe(5);
  });

  it('auto-calculates column count from columnWidth with gap', () => {
    // floor((1000 + 10) / (200 + 10)) = floor(1010/210) = 4
    const result = computeColumns(1000, { columnWidth: 200, gap: 10 });
    expect(result.columnCount).toBe(4);
  });

  it('clamps column count to maxColumns', () => {
    // Would compute 5 without cap
    const result = computeColumns(1000, { columnWidth: 200, maxColumns: 3 });
    expect(result.columnCount).toBe(3);
  });

  it('uses defaultColumns when neither columns nor columnWidth is provided', () => {
    const result = computeColumns(1200, { defaultColumns: 5 });
    expect(result.columnCount).toBe(5);
  });

  it('falls back to 3 columns when no config provided', () => {
    const result = computeColumns(1200, {});
    expect(result.columnCount).toBe(3);
  });

  it('always returns at least 1 column', () => {
    // Very narrow container with large columnWidth
    const result = computeColumns(10, { columnWidth: 500 });
    expect(result.columnCount).toBeGreaterThanOrEqual(1);
  });

  it('returns columnWidth >= 0 for any valid input', () => {
    const result = computeColumns(100, { columns: 10, gap: 20 });
    expect(result.columnWidth).toBeGreaterThanOrEqual(0);
  });

  it('returns columnWidth >= 0 when containerWidth is 0 (hidden / unmounted)', () => {
    // gap math can produce negative intermediate value — must be clamped
    const result = computeColumns(0, { columns: 4, gap: 10 });
    expect(result.columnWidth).toBeGreaterThanOrEqual(0);
    expect(result.columnCount).toBe(4);
  });

  it('clamps columns: 0 to at least 1 column', () => {
    const result = computeColumns(900, { columns: 0 });
    expect(result.columnCount).toBe(1);
  });

  it('resolves responsive column count at runtime', () => {
    const result = computeColumns(1024, { columns: { 0: 1, 640: 2, 1024: 4 } });
    expect(result.columnCount).toBe(4);
  });

  it('resolves responsive column count for small viewport', () => {
    const result = computeColumns(400, { columns: { 0: 1, 640: 2, 1024: 4 } });
    expect(result.columnCount).toBe(1);
  });
});

describe('effectiveColumnCount', () => {
  it('returns columnCount when itemCount >= columnCount', () => {
    expect(effectiveColumnCount(4, 10)).toBe(4);
    expect(effectiveColumnCount(4, 4)).toBe(4);
  });

  it('returns itemCount when itemCount < columnCount', () => {
    expect(effectiveColumnCount(4, 2)).toBe(2);
    expect(effectiveColumnCount(4, 1)).toBe(1);
  });

  it('returns columnCount when itemCount is 0 (no empty column clamp)', () => {
    expect(effectiveColumnCount(4, 0)).toBe(4);
  });

  it('handles single-column layout', () => {
    expect(effectiveColumnCount(1, 100)).toBe(1);
    expect(effectiveColumnCount(1, 0)).toBe(1);
  });
});
