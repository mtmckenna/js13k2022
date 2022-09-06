import { ICell } from "./interfaces";
export class PriorityQueue {
  cells: ICell[] = [];
  priorities: number[] = [];
  comparator: (x, y) => number;
  constructor() {
    this.comparator = (a: number, b: number): number => {
      return this.priorities[a] - this.priorities[b];
    };
  }

  get size(): number {
    return this.cells.length;
  }

  enqueue(cell: ICell, priority: number) {
    this.cells.push(cell);
    this.priorities.push(priority);
    // this.array.sort(this.comparator);
    this.bubbleUp();
  }

  dequeue(index = 0): number {
    if (!this.size) return null;
    // this.array.sort();
    // const value = this.array.shift();
    let cell = null;
    if (this.size > 0) {
      this.swap(index, this.size - 1);
      cell = this.cells.pop();
      this.priorities.pop();
      this.bubbleDown(index);
    }
    return cell;
  }

  bubbleUp() {
    let index = this.size - 1;
    const parent = (i) => Math.ceil(i / 2 - 1);
    while (parent(index) >= 0 && this.comparator(parent(index), index) > 0) {
      this.swap(parent(index), index);
      index = parent(index);
    }
  }

  bubbleDown(index = 0) {
    let curr = index;
    const left = (i) => 2 * i + 1;
    const right = (i) => 2 * i + 2;
    const getTopChild = (i) =>
      right(i) < this.size && this.comparator(left(i), right(i)) > 0
        ? right(i)
        : left(i);

    while (
      left(curr) < this.size &&
      this.comparator(curr, getTopChild(curr)) > 0
    ) {
      const next = getTopChild(curr);
      this.swap(curr, next);
      curr = next;
    }
  }

  swap(i1, i2) {
    const tempCell = this.cells[i1];
    const tempPriority = this.priorities[i1];

    this.cells[i1] = this.cells[i2];
    this.cells[i2] = tempCell;

    this.priorities[i1] = this.priorities[i2];
    this.priorities[i2] = tempPriority;
    // [this.array[i1], this.array[i2]] = [this.array[i2], this.array[i1]];
  }
}
