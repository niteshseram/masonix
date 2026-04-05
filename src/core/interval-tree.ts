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

function createNode(
  index: number,
  low: number,
  high: number,
  color: 0 | 1,
): Node {
  return {
    index,
    low,
    high,
    max: high,
    color,
    left: null,
    right: null,
    parent: null,
  };
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

  function rotateLeft(pivot: Node): void {
    const rightChild = pivot.right!;
    pivot.right = rightChild.left;
    if (rightChild.left) rightChild.left.parent = pivot;
    rightChild.parent = pivot.parent;
    if (!pivot.parent) {
      root = rightChild;
    } else if (pivot === pivot.parent.left) {
      pivot.parent.left = rightChild;
    } else {
      pivot.parent.right = rightChild;
    }
    rightChild.left = pivot;
    pivot.parent = rightChild;
    updateMax(pivot);
    updateMax(rightChild);
  }

  function rotateRight(pivot: Node): void {
    const leftChild = pivot.left!;
    pivot.left = leftChild.right;
    if (leftChild.right) leftChild.right.parent = pivot;
    leftChild.parent = pivot.parent;
    if (!pivot.parent) {
      root = leftChild;
    } else if (pivot === pivot.parent.left) {
      pivot.parent.left = leftChild;
    } else {
      pivot.parent.right = leftChild;
    }
    leftChild.right = pivot;
    pivot.parent = leftChild;
    updateMax(pivot);
    updateMax(leftChild);
  }

  // ---------------------------------------------------------------------------
  // Insert
  // ---------------------------------------------------------------------------

  function insertFixup(fixNode: Node): void {
    while (fixNode.parent && fixNode.parent.color === RED) {
      const parent = fixNode.parent;
      const grandparent = parent.parent!;

      if (parent === grandparent.left) {
        const uncle = grandparent.right;
        if (uncle && uncle.color === RED) {
          parent.color = BLACK;
          uncle.color = BLACK;
          grandparent.color = RED;
          fixNode = grandparent;
        } else {
          if (fixNode === parent.right) {
            fixNode = parent;
            rotateLeft(fixNode);
          }
          fixNode.parent!.color = BLACK;
          fixNode.parent!.parent!.color = RED;
          rotateRight(fixNode.parent!.parent!);
        }
      } else {
        const uncle = grandparent.left;
        if (uncle && uncle.color === RED) {
          parent.color = BLACK;
          uncle.color = BLACK;
          grandparent.color = RED;
          fixNode = grandparent;
        } else {
          if (fixNode === parent.left) {
            fixNode = parent;
            rotateRight(fixNode);
          }
          fixNode.parent!.color = BLACK;
          fixNode.parent!.parent!.color = RED;
          rotateLeft(fixNode.parent!.parent!);
        }
      }
    }
    root!.color = BLACK;
  }

  function insert(index: number, low: number, high: number): void {
    const newNode = createNode(index, low, high, RED);
    nodeMap.set(index, newNode);
    count++;

    let parentNode: Node | null = null;
    let currentNode: Node | null = root;

    while (currentNode !== null) {
      parentNode = currentNode;
      currentNode.max = Math.max(currentNode.max, high);
      currentNode =
        low < currentNode.low ? currentNode.left : currentNode.right;
    }

    newNode.parent = parentNode;
    if (!parentNode) {
      root = newNode;
    } else if (low < parentNode.low) {
      parentNode.left = newNode;
    } else {
      parentNode.right = newNode;
    }

    insertFixup(newNode);
  }

  // ---------------------------------------------------------------------------
  // Remove
  // ---------------------------------------------------------------------------

  function minimum(node: Node): Node {
    let current = node;
    while (current.left) current = current.left;
    return current;
  }

  function transplant(target: Node, replacement: Node | null): void {
    if (!target.parent) {
      root = replacement;
    } else if (target === target.parent.left) {
      target.parent.left = replacement;
    } else {
      target.parent.right = replacement;
    }
    if (replacement) replacement.parent = target.parent;
  }

  function propagateMax(node: Node | null): void {
    let current = node;
    while (current) {
      updateMax(current);
      current = current.parent;
    }
  }

  function deleteFixup(fixNode: Node | null, fixNodeParent: Node | null): void {
    while (fixNode !== root && (!fixNode || fixNode.color === BLACK)) {
      if (fixNode === fixNodeParent?.left) {
        let sibling = fixNodeParent!.right;
        if (sibling && sibling.color === RED) {
          sibling.color = BLACK;
          fixNodeParent!.color = RED;
          rotateLeft(fixNodeParent!);
          sibling = fixNodeParent!.right;
        }
        if (
          (!sibling?.left || sibling.left.color === BLACK) &&
          (!sibling?.right || sibling.right.color === BLACK)
        ) {
          if (sibling) sibling.color = RED;
          fixNode = fixNodeParent;
          fixNodeParent = fixNode?.parent ?? null;
        } else {
          if (!sibling?.right || sibling.right.color === BLACK) {
            if (sibling?.left) sibling.left.color = BLACK;
            if (sibling) sibling.color = RED;
            if (sibling) rotateRight(sibling);
            sibling = fixNodeParent!.right;
          }
          if (sibling) sibling.color = fixNodeParent!.color;
          fixNodeParent!.color = BLACK;
          if (sibling?.right) sibling.right.color = BLACK;
          rotateLeft(fixNodeParent!);
          fixNode = root;
          fixNodeParent = null;
        }
      } else {
        let sibling = fixNodeParent?.left ?? null;
        if (sibling && sibling.color === RED) {
          sibling.color = BLACK;
          fixNodeParent!.color = RED;
          rotateRight(fixNodeParent!);
          sibling = fixNodeParent!.left ?? null;
        }
        if (
          (!sibling?.right || sibling.right.color === BLACK) &&
          (!sibling?.left || sibling.left.color === BLACK)
        ) {
          if (sibling) sibling.color = RED;
          fixNode = fixNodeParent;
          fixNodeParent = fixNode?.parent ?? null;
        } else {
          if (!sibling?.left || sibling.left.color === BLACK) {
            if (sibling?.right) sibling.right.color = BLACK;
            if (sibling) sibling.color = RED;
            if (sibling) rotateLeft(sibling);
            sibling = fixNodeParent!.left ?? null;
          }
          if (sibling) sibling.color = fixNodeParent!.color;
          fixNodeParent!.color = BLACK;
          if (sibling?.left) sibling.left.color = BLACK;
          rotateRight(fixNodeParent!);
          fixNode = root;
          fixNodeParent = null;
        }
      }
    }
    if (fixNode) fixNode.color = BLACK;
  }

  function remove(index: number): void {
    const nodeToRemove = nodeMap.get(index);
    if (!nodeToRemove) return;
    nodeMap.delete(index);
    count--;

    let spliceTarget = nodeToRemove;
    let spliceTargetOriginalColor = spliceTarget.color;
    let replacementNode: Node | null;
    let replacementNodeParent: Node | null;

    if (!nodeToRemove.left) {
      replacementNode = nodeToRemove.right;
      replacementNodeParent = nodeToRemove.parent;
      transplant(nodeToRemove, nodeToRemove.right);
    } else if (!nodeToRemove.right) {
      replacementNode = nodeToRemove.left;
      replacementNodeParent = nodeToRemove.parent;
      transplant(nodeToRemove, nodeToRemove.left);
    } else {
      spliceTarget = minimum(nodeToRemove.right);
      spliceTargetOriginalColor = spliceTarget.color;
      replacementNode = spliceTarget.right;
      if (spliceTarget.parent === nodeToRemove) {
        replacementNodeParent = spliceTarget;
      } else {
        replacementNodeParent = spliceTarget.parent;
        transplant(spliceTarget, spliceTarget.right);
        spliceTarget.right = nodeToRemove.right;
        spliceTarget.right.parent = spliceTarget;
      }
      transplant(nodeToRemove, spliceTarget);
      spliceTarget.left = nodeToRemove.left;
      spliceTarget.left.parent = spliceTarget;
      spliceTarget.color = nodeToRemove.color;
      updateMax(spliceTarget);
    }

    propagateMax(replacementNodeParent);

    if (spliceTargetOriginalColor === BLACK) {
      deleteFixup(replacementNode, replacementNodeParent);
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
      if (node.right && node.right.max >= queryLow)
        searchStack.push(node.right);
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
