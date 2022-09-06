// https://www.redblobgames.com/pathfinding/grids/graphs.html
// https://www.redblobgames.com/pathfinding/a-star/introduction.html
// https://adrianmejia.com/priority-queue-data-structure-and-heaps-time-complexity-javascript-implementation/
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort

import Stage from "./stage";
import { ICell } from "./interfaces";
import { PriorityQueue } from "./queue";

const MAX_STEPS = 50;

export default class Search {
  stage: Stage;

  constructor(stage) {
    this.stage = stage;
  }

  search(start: ICell, end: ICell): ICell[] {
    const frontier: PriorityQueue = new PriorityQueue();

    const cameFrom: Map<ICell, ICell> = new Map();
    const costs: Map<ICell, number> = new Map();
    frontier.enqueue(start, 0);
    cameFrom.set(start, null);
    costs.set(start, 0);

    let current = null;
    while (frontier.size > 0) {
      current = frontier.dequeue();

      if (current === end) break;

      const neighbors = this.stage.neighbors(current);
      for (let i = 0; i < neighbors.length; i++) {
        const neighbor = neighbors[i];
        const cost = costs.get(current) + neighbor.cost;

        if (!costs.has(neighbor) || cost < costs.get(neighbor)) {
          if (!neighbor.walkable && !neighbor.breakable) continue;
          costs.set(neighbor, cost);
          cameFrom.set(neighbor, current);
          frontier.enqueue(neighbor, cost);
        }
      }
    }

    const path = [];
    current = end;

    let i = 0;

    while (current !== start && i < MAX_STEPS) {
      path.push(current);
      current = cameFrom.get(current);
      if (current === undefined) break;
      i++;
    }
    path.reverse();
    path.pop();

    return path;
  }
}
