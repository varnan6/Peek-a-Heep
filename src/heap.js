// ─── Composite Pattern ────────────────────────────────────────────────────────
// HeapNode is the "Component" interface.
// All nodes (leaf or composite) share the same interface.

export class HeapNode {
  constructor(value, id) {
    this.value = value;
    this.id = id; // stable unique id for React keys / D3
    this.left = null;
    this.right = null;
    this.parent = null;
  }

  // Composite interface
  isLeaf() {
    return this.left === null && this.right === null;
  }

  // Recursively collect all nodes (composite traversal)
  getAll() {
    const result = [this];
    if (this.left) result.push(...this.left.getAll());
    if (this.right) result.push(...this.right.getAll());
    return result;
  }

  // Get depth of this node
  depth() {
    let d = 0;
    let cur = this.parent;
    while (cur) { d++; cur = cur.parent; }
    return d;
  }
}

// ─── Heap Data Structure ───────────────────────────────────────────────────────
let nodeIdCounter = 0;
const nextId = () => ++nodeIdCounter;

export class Heap {
  constructor(type = 'min') {
    this.type = type; // 'min' | 'max'
    this.array = []; // flat array representation
    this.steps = []; // operation log steps
  }

  // Compare helper
  shouldSwap(parentIdx, childIdx) {
    if (this.type === 'min') return this.array[childIdx] < this.array[parentIdx];
    return this.array[childIdx] > this.array[parentIdx];
  }

  // ─── INSERT ───────────────────────────────────────────────────────────────
  insert(value) {
    const steps = [];
    const newIdx = this.array.length;
    this.array.push(value);

    steps.push({
      type: 'insert',
      array: [...this.array],
      highlightIdx: [newIdx],
      message: `Inserted ${value} at index ${newIdx}`,
      logType: 'success',
    });

    let idx = newIdx;
    while (idx > 0) {
      const parentIdx = Math.floor((idx - 1) / 2);
      if (this.shouldSwap(parentIdx, idx)) {
        steps.push({
          type: 'compare',
          array: [...this.array],
          highlightIdx: [idx, parentIdx],
          message: `Comparing ${this.array[idx]} with parent ${this.array[parentIdx]} → swap needed`,
          logType: 'highlight',
        });

        // swap
        [this.array[idx], this.array[parentIdx]] = [this.array[parentIdx], this.array[idx]];

        steps.push({
          type: 'swap',
          array: [...this.array],
          swapIdx: [idx, parentIdx],
          highlightIdx: [idx, parentIdx],
          message: `Swapped ${this.array[parentIdx]} ↔ ${this.array[idx]}`,
          logType: 'warning',
        });

        idx = parentIdx;
      } else {
        steps.push({
          type: 'no-swap',
          array: [...this.array],
          highlightIdx: [idx, parentIdx],
          message: `${this.array[idx]} is in correct position`,
          logType: 'info',
        });
        break;
      }
    }

    steps.push({
      type: 'done',
      array: [...this.array],
      highlightIdx: [],
      message: `Insert complete. Heap size: ${this.array.length}`,
      logType: 'success',
    });

    return steps;
  }

  // ─── EXTRACT ROOT ─────────────────────────────────────────────────────────
  extractRoot() {
    if (this.array.length === 0) return [];

    const steps = [];
    const rootVal = this.array[0];
    const label = this.type === 'min' ? 'minimum' : 'maximum';

    steps.push({
      type: 'highlight',
      array: [...this.array],
      highlightIdx: [0],
      message: `Extracting ${label} (root): ${rootVal}`,
      logType: 'warning',
    });

    if (this.array.length === 1) {
      this.array.pop();
      steps.push({
        type: 'done',
        array: [],
        highlightIdx: [],
        message: `Extracted ${rootVal}. Heap is now empty.`,
        logType: 'success',
      });
      return steps;
    }

    // Move last element to root
    const last = this.array.pop();
    this.array[0] = last;

    steps.push({
      type: 'replace',
      array: [...this.array],
      highlightIdx: [0],
      message: `Moved last element (${last}) to root`,
      logType: 'highlight',
    });

    // Sift down
    let idx = 0;
    const n = this.array.length;

    while (true) {
      let target = idx;
      const left = 2 * idx + 1;
      const right = 2 * idx + 2;

      if (left < n && this.shouldSwap(target, left)) target = left;
      if (right < n && this.shouldSwap(target, right)) target = right;

      if (target !== idx) {
        const compareIdxs = [idx, left < n ? left : null, right < n ? right : null].filter(x => x !== null);
        steps.push({
          type: 'compare',
          array: [...this.array],
          highlightIdx: compareIdxs,
          message: `Comparing ${this.array[idx]} with children → swap with ${this.array[target]}`,
          logType: 'highlight',
        });

        [this.array[idx], this.array[target]] = [this.array[target], this.array[idx]];

        steps.push({
          type: 'swap',
          array: [...this.array],
          swapIdx: [idx, target],
          highlightIdx: [idx, target],
          message: `Swapped ${this.array[target]} ↔ ${this.array[idx]}`,
          logType: 'warning',
        });

        idx = target;
      } else {
        steps.push({
          type: 'no-swap',
          array: [...this.array],
          highlightIdx: [idx],
          message: `${this.array[idx]} is in correct position`,
          logType: 'info',
        });
        break;
      }
    }

    steps.push({
      type: 'done',
      array: [...this.array],
      highlightIdx: [],
      message: `Extracted ${rootVal}. Heap size: ${this.array.length}`,
      logType: 'success',
    });

    return steps;
  }

  // ─── PEEK ─────────────────────────────────────────────────────────────────
  peek() {
    if (this.array.length === 0) return [];
    const label = this.type === 'min' ? 'minimum' : 'maximum';
    return [
      {
        type: 'highlight',
        array: [...this.array],
        highlightIdx: [0],
        message: `${label.charAt(0).toUpperCase() + label.slice(1)} is at root: ${this.array[0]}`,
        logType: 'highlight',
      },
    ];
  }

  // ─── DELETE ───────────────────────────────────────────────────────────────
  deleteAt(index) {
    if (index < 0 || index >= this.array.length) return [];
    const steps = [];
    const val = this.array[index];

    steps.push({
      type: 'highlight',
      array: [...this.array],
      highlightIdx: [index],
      message: `Deleting value ${val} at index ${index}`,
      logType: 'warning',
    });

    // Replace with extreme value to bubble to root, then extract
    this.array[index] = this.type === 'min' ? -Infinity : Infinity;

    steps.push({
      type: 'replace',
      array: [...this.array],
      highlightIdx: [index],
      message: `Replaced with ${this.type === 'min' ? '-∞' : '+∞'} to bubble up`,
      logType: 'highlight',
    });

    // Bubble up
    let idx = index;
    while (idx > 0) {
      const parentIdx = Math.floor((idx - 1) / 2);
      if (this.shouldSwap(parentIdx, idx)) {
        [this.array[idx], this.array[parentIdx]] = [this.array[parentIdx], this.array[idx]];
        steps.push({
          type: 'swap',
          array: [...this.array],
          swapIdx: [idx, parentIdx],
          highlightIdx: [idx, parentIdx],
          message: `Bubbling up: swapped indices ${idx} ↔ ${parentIdx}`,
          logType: 'warning',
        });
        idx = parentIdx;
      } else break;
    }

    // Extract root
    const last = this.array.pop();
    if (this.array.length > 0) {
      this.array[0] = last;
      steps.push({
        type: 'replace',
        array: [...this.array],
        highlightIdx: [0],
        message: `Moved last element (${last}) to root`,
        logType: 'highlight',
      });

      // Sift down
      let cur = 0;
      const n = this.array.length;
      while (true) {
        let target = cur;
        const left = 2 * cur + 1;
        const right = 2 * cur + 2;
        if (left < n && this.shouldSwap(target, left)) target = left;
        if (right < n && this.shouldSwap(target, right)) target = right;
        if (target !== cur) {
          [this.array[cur], this.array[target]] = [this.array[target], this.array[cur]];
          steps.push({
            type: 'swap',
            array: [...this.array],
            swapIdx: [cur, target],
            highlightIdx: [cur, target],
            message: `Sifting down: swapped ${this.array[target]} ↔ ${this.array[cur]}`,
            logType: 'warning',
          });
          cur = target;
        } else break;
      }
    }

    steps.push({
      type: 'done',
      array: [...this.array],
      highlightIdx: [],
      message: `Deleted ${val}. Heap size: ${this.array.length}`,
      logType: 'success',
    });

    return steps;
  }

  // ─── HEAPIFY ──────────────────────────────────────────────────────────────
  heapify(inputArray) {
    const steps = [];
    this.array = [...inputArray];

    steps.push({
      type: 'info',
      array: [...this.array],
      highlightIdx: [],
      message: `Starting heapify on [${inputArray.join(', ')}]`,
      logType: 'info',
    });

    const n = this.array.length;
    const startIdx = Math.floor(n / 2) - 1;

    for (let i = startIdx; i >= 0; i--) {
      let cur = i;
      steps.push({
        type: 'highlight',
        array: [...this.array],
        highlightIdx: [cur],
        message: `Sifting down index ${cur} (value: ${this.array[cur]})`,
        logType: 'highlight',
      });

      while (true) {
        let target = cur;
        const left = 2 * cur + 1;
        const right = 2 * cur + 2;
        if (left < n && this.shouldSwap(target, left)) target = left;
        if (right < n && this.shouldSwap(target, right)) target = right;
        if (target !== cur) {
          [this.array[cur], this.array[target]] = [this.array[target], this.array[cur]];
          steps.push({
            type: 'swap',
            array: [...this.array],
            swapIdx: [cur, target],
            highlightIdx: [cur, target],
            message: `Swapped ${this.array[target]} ↔ ${this.array[cur]}`,
            logType: 'warning',
          });
          cur = target;
        } else break;
      }
    }

    steps.push({
      type: 'done',
      array: [...this.array],
      highlightIdx: [],
      message: `Heapify complete! ${this.type === 'min' ? 'Min' : 'Max'}-heap formed.`,
      logType: 'success',
    });

    return steps;
  }

  // ─── CLEAR ────────────────────────────────────────────────────────────────
  clear() {
    this.array = [];
    return [{
      type: 'done',
      array: [],
      highlightIdx: [],
      message: 'Heap cleared.',
      logType: 'info',
    }];
  }

  // ─── To Tree (for D3 rendering) ────────────────────────────────────────────
  toTree() {
    if (this.array.length === 0) return null;
    return arrayToTree(this.array);
  }
}

// Convert flat array to nested tree object for D3 hierarchy
export function arrayToTree(arr, i = 0) {
  if (i >= arr.length) return null;
  const node = { id: i, value: arr[i], children: [] };
  const left = arrayToTree(arr, 2 * i + 1);
  const right = arrayToTree(arr, 2 * i + 2);
  if (left) node.children.push(left);
  if (right) node.children.push(right);
  return node;
}
