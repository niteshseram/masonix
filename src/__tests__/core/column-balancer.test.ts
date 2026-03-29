import { describe, it, expect } from "vite-plus/test";
import { createBalancedPositioner, measureBalance } from "../../core/column-balancer";

describe("createBalancedPositioner", () => {
  it("defaults to shortest-first strategy", () => {
    const p = createBalancedPositioner({ columnCount: 3, columnWidth: 100 });
    p.set(0, 300); // col 0 → 300
    p.set(1, 100); // col 1 → 100
    p.set(2, 200); // col 2 → 200
    // Shortest-first: item 3 goes to col 1 (height 100)
    const item = p.set(3, 50);
    expect(item.column).toBe(1);
  });

  it('uses row-wise placement when strategy is "row-wise"', () => {
    const p = createBalancedPositioner({
      columnCount: 3,
      columnWidth: 100,
      strategy: "row-wise",
    });
    p.set(0, 300); // col 0
    p.set(1, 100); // col 1
    p.set(2, 200); // col 2
    // Row-wise: item 3 goes to col 3 % 3 = 0, ignoring heights
    const item = p.set(3, 50);
    expect(item.column).toBe(0);
  });

  it("exposes correct columnCount and columnWidth", () => {
    const p = createBalancedPositioner({ columnCount: 4, columnWidth: 150, columnGap: 10 });
    expect(p.columnCount).toBe(4);
    expect(p.columnWidth).toBe(150);
  });

  it("passes columnGap and rowGap through to the positioner", () => {
    const p = createBalancedPositioner({
      columnCount: 1,
      columnWidth: 100,
      rowGap: 20,
    });
    p.set(0, 100);
    const item = p.set(1, 50);
    // With rowGap=20: item 1 top = 100 + 20 = 120
    expect(item.top).toBe(120);
  });

  it("forwards RTL option", () => {
    // Both RTL and LTR should produce valid (non-negative) positions
    const p = createBalancedPositioner({
      columnCount: 3,
      columnWidth: 100,
      columnGap: 10,
      rtl: true,
    });
    for (let i = 0; i < 3; i++) p.set(i, 100);
    for (let i = 0; i < 3; i++) {
      expect(p.get(i)!.left).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("measureBalance", () => {
  it("returns 0 when all columns have equal height", () => {
    const p = createBalancedPositioner({ columnCount: 3, columnWidth: 100 });
    p.set(0, 100);
    p.set(1, 100);
    p.set(2, 100);
    expect(measureBalance(p)).toBe(0);
  });

  it("returns the height difference between tallest and shortest column", () => {
    const p = createBalancedPositioner({ columnCount: 3, columnWidth: 100 });
    p.set(0, 300);
    p.set(1, 100);
    p.set(2, 200);
    // tallest=300, shortest=100 → diff=200
    expect(measureBalance(p)).toBe(200);
  });

  it("returns 0 for an empty positioner", () => {
    const p = createBalancedPositioner({ columnCount: 3, columnWidth: 100 });
    expect(measureBalance(p)).toBe(0);
  });

  it("returns 0 for a single-column positioner (always balanced)", () => {
    const p = createBalancedPositioner({ columnCount: 1, columnWidth: 200 });
    p.set(0, 100);
    p.set(1, 200);
    // Only one column → max and min are the same
    expect(measureBalance(p)).toBe(0);
  });

  it("reflects improved balance after shortest-first fills columns", () => {
    const p = createBalancedPositioner({ columnCount: 2, columnWidth: 100 });
    p.set(0, 300); // col 0 = 300
    p.set(1, 100); // col 1 = 100
    const before = measureBalance(p);
    p.set(2, 180); // goes to col 1 (shortest), col 1 = 280
    const after = measureBalance(p);
    expect(after).toBeLessThan(before);
  });

  it("works with row-wise strategy", () => {
    const p = createBalancedPositioner({
      columnCount: 2,
      columnWidth: 100,
      strategy: "row-wise",
    });
    p.set(0, 500); // col 0 = 500
    p.set(1, 50); // col 1 = 50
    expect(measureBalance(p)).toBe(450);
  });
});
