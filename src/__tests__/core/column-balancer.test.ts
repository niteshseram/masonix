import { describe, it, expect } from "vite-plus/test";
import { createBalancedPositioner } from "../../core/column-balancer";

describe("createBalancedPositioner", () => {
  it("uses shortest-first placement", () => {
    const p = createBalancedPositioner({ columnCount: 3, columnWidth: 100 });
    p.set(0, 300); // col 0 → 300
    p.set(1, 100); // col 1 → 100
    p.set(2, 200); // col 2 → 200
    // Shortest-first: item 3 goes to col 1 (height 100)
    const item = p.set(3, 50);
    expect(item.column).toBe(1);
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
});
