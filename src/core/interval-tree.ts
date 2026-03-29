// ---------------------------------------------------------------------------
// Red-black interval tree
//
// Each node stores a [low, high] interval (item top → top+height) keyed by
// item index. Supports:
//   insert(index, low, high)
//   remove(index)
//   search(low, high, callback) — O(log n + k) range query
//
// Used by MasonryVirtual to determine which items intersect the viewport.
// ---------------------------------------------------------------------------

const RED = 0;
const BLACK = 1;

interface Node {
  index: number;
  low: number;
  high: number;
  /** Maximum `high` value in this subtree — the core interval tree augmentation */
  max: number;
  color: 0 | 1;
  left: Node | null;
  right: Node | null;
  parent: Node | null;
}

function createNode(index: number, low: number, high: number, color: 0 | 1): Node {
  return { index, low, high, max: high, color, left: null, right: null, parent: null };
}

export interface IntervalTree {
  insert(index: number, low: number, high: number): void;
  remove(index: number): void;
  search(
    low: number,
    high: number,
    callback: (index: number, low: number, high: number) => void,
  ): void;
  readonly size: number;
  clear(): void;
}

export function createIntervalTree(): IntervalTree {
  let root: Node | null = null;
  let count = 0;

  // Map from item index → node for O(1) removal
  const nodeMap = new Map<number, Node>();

  // ---------------------------------------------------------------------------
  // Red-black tree rotations
  // ---------------------------------------------------------------------------

  function updateMax(node: Node): void {
    node.max = node.high;
    if (node.left) node.max = Math.max(node.max, node.left.max);
    if (node.right) node.max = Math.max(node.max, node.right.max);
  }

  function rotateLeft(x: Node): void {
    const y = x.right!;
    x.right = y.left;
    if (y.left) y.left.parent = x;
    y.parent = x.parent;
    if (!x.parent) {
      root = y;
    } else if (x === x.parent.left) {
      x.parent.left = y;
    } else {
      x.parent.right = y;
    }
    y.left = x;
    x.parent = y;
    updateMax(x);
    updateMax(y);
  }

  function rotateRight(y: Node): void {
    const x = y.left!;
    y.left = x.right;
    if (x.right) x.right.parent = y;
    x.parent = y.parent;
    if (!y.parent) {
      root = x;
    } else if (y === y.parent.left) {
      y.parent.left = x;
    } else {
      y.parent.right = x;
    }
    x.right = y;
    y.parent = x;
    updateMax(y);
    updateMax(x);
  }

  // ---------------------------------------------------------------------------
  // Insert
  // ---------------------------------------------------------------------------

  function insertFixup(z: Node): void {
    while (z.parent && z.parent.color === RED) {
      const parent = z.parent;
      const grandparent = parent.parent!;

      if (parent === grandparent.left) {
        const uncle = grandparent.right;
        if (uncle && uncle.color === RED) {
          parent.color = BLACK;
          uncle.color = BLACK;
          grandparent.color = RED;
          z = grandparent;
        } else {
          if (z === parent.right) {
            z = parent;
            rotateLeft(z);
          }
          z.parent!.color = BLACK;
          z.parent!.parent!.color = RED;
          rotateRight(z.parent!.parent!);
        }
      } else {
        const uncle = grandparent.left;
        if (uncle && uncle.color === RED) {
          parent.color = BLACK;
          uncle.color = BLACK;
          grandparent.color = RED;
          z = grandparent;
        } else {
          if (z === parent.left) {
            z = parent;
            rotateRight(z);
          }
          z.parent!.color = BLACK;
          z.parent!.parent!.color = RED;
          rotateLeft(z.parent!.parent!);
        }
      }
    }
    root!.color = BLACK;
  }

  function insert(index: number, low: number, high: number): void {
    const z = createNode(index, low, high, RED);
    nodeMap.set(index, z);
    count++;

    let y: Node | null = null;
    let x: Node | null = root;

    while (x !== null) {
      y = x;
      x.max = Math.max(x.max, high);
      x = low < x.low ? x.left : x.right;
    }

    z.parent = y;
    if (!y) {
      root = z;
    } else if (low < y.low) {
      y.left = z;
    } else {
      y.right = z;
    }

    insertFixup(z);
  }

  // ---------------------------------------------------------------------------
  // Remove
  // ---------------------------------------------------------------------------

  function minimum(node: Node): Node {
    let x = node;
    while (x.left) x = x.left;
    return x;
  }

  function transplant(u: Node, v: Node | null): void {
    if (!u.parent) {
      root = v;
    } else if (u === u.parent.left) {
      u.parent.left = v;
    } else {
      u.parent.right = v;
    }
    if (v) v.parent = u.parent;
  }

  function propagateMax(node: Node | null): void {
    let cur = node;
    while (cur) {
      updateMax(cur);
      cur = cur.parent;
    }
  }

  function deleteFixup(x: Node | null, xParent: Node | null): void {
    while (x !== root && (!x || x.color === BLACK)) {
      if (x === xParent?.left) {
        let w = xParent!.right;
        if (w && w.color === RED) {
          w.color = BLACK;
          xParent!.color = RED;
          rotateLeft(xParent!);
          w = xParent!.right;
        }
        if ((!w?.left || w.left.color === BLACK) && (!w?.right || w.right.color === BLACK)) {
          if (w) w.color = RED;
          x = xParent;
          xParent = x?.parent ?? null;
        } else {
          if (!w?.right || w.right.color === BLACK) {
            if (w?.left) w.left.color = BLACK;
            if (w) w.color = RED;
            if (w) rotateRight(w);
            w = xParent!.right;
          }
          if (w) w.color = xParent!.color;
          xParent!.color = BLACK;
          if (w?.right) w.right.color = BLACK;
          rotateLeft(xParent!);
          x = root;
          xParent = null;
        }
      } else {
        let w = xParent?.left ?? null;
        if (w && w.color === RED) {
          w.color = BLACK;
          xParent!.color = RED;
          rotateRight(xParent!);
          w = xParent!.left ?? null;
        }
        if ((!w?.right || w.right.color === BLACK) && (!w?.left || w.left.color === BLACK)) {
          if (w) w.color = RED;
          x = xParent;
          xParent = x?.parent ?? null;
        } else {
          if (!w?.left || w.left.color === BLACK) {
            if (w?.right) w.right.color = BLACK;
            if (w) w.color = RED;
            if (w) rotateLeft(w);
            w = xParent!.left ?? null;
          }
          if (w) w.color = xParent!.color;
          xParent!.color = BLACK;
          if (w?.left) w.left.color = BLACK;
          rotateRight(xParent!);
          x = root;
          xParent = null;
        }
      }
    }
    if (x) x.color = BLACK;
  }

  function remove(index: number): void {
    const z = nodeMap.get(index);
    if (!z) return;
    nodeMap.delete(index);
    count--;

    let y = z;
    let yOriginalColor = y.color;
    let x: Node | null;
    let xParent: Node | null;

    if (!z.left) {
      x = z.right;
      xParent = z.parent;
      transplant(z, z.right);
    } else if (!z.right) {
      x = z.left;
      xParent = z.parent;
      transplant(z, z.left);
    } else {
      y = minimum(z.right);
      yOriginalColor = y.color;
      x = y.right;
      if (y.parent === z) {
        xParent = y;
      } else {
        xParent = y.parent;
        transplant(y, y.right);
        y.right = z.right;
        y.right.parent = y;
      }
      transplant(z, y);
      y.left = z.left;
      y.left.parent = y;
      y.color = z.color;
      updateMax(y);
    }

    propagateMax(xParent);

    if (yOriginalColor === BLACK) {
      deleteFixup(x, xParent);
    }
  }

  // ---------------------------------------------------------------------------
  // Search — iterative stack-based (no allocation per query)
  // ---------------------------------------------------------------------------

  const searchStack: Array<Node | null> = [];

  function search(
    queryLow: number,
    queryHigh: number,
    callback: (index: number, low: number, high: number) => void,
  ): void {
    if (!root) return;

    searchStack.length = 0;
    searchStack.push(root);

    while (searchStack.length > 0) {
      const node = searchStack.pop();
      if (!node) continue;

      // Prune: if subtree max < queryLow, no intervals in here overlap
      if (node.max < queryLow) continue;

      // Check this node
      if (node.low <= queryHigh && node.high >= queryLow) {
        callback(node.index, node.low, node.high);
      }

      // Push children (right first so left is processed first)
      if (node.right && node.right.max >= queryLow) searchStack.push(node.right);
      if (node.left && node.left.max >= queryLow) searchStack.push(node.left);
    }
  }

  function clear(): void {
    root = null;
    count = 0;
    nodeMap.clear();
  }

  return {
    insert,
    remove,
    search,
    get size() {
      return count;
    },
    clear,
  };
}
