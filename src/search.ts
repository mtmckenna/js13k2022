// https://www.redblobgames.com/pathfinding/grids/graphs.html
// https://www.redblobgames.com/pathfinding/a-star/introduction.html
// https://adrianmejia.com/priority-queue-data-structure-and-heaps-time-complexity-javascript-implementation/
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort

import Stage from "./stage";
import { ICell, ICellIdHash } from "./interfaces";
import { PriorityQueue } from "./queue";

const MAX_STEPS = 50;

export default class Search {
  stage: Stage;

  constructor(stage) {
    this.stage = stage;
  }

  cell4Id(id: string) {
    return this.stage.cellHash[id];
  }

  search(start: ICell, end: ICell): ICell[] {
    const frontier: PriorityQueue = new PriorityQueue();

    // const cameFrom: Map<ICell, ICell> = new Map();
    // const costs: Map<ICell, number> = new Map();
    const cameFrom: ICellIdHash = {};
    const costs: { [key: string]: number } = {};
    frontier.enqueue(start, 0);
    cameFrom[start.id] = null;
    costs[start.id] = 0;
    // cameFrom.set(start, null);
    // costs.set(start, 0);

    let current: ICell = null;
    while (frontier.size > 0) {
      current = frontier.dequeue();

      if (current === end) break;

      const neighbors = this.stage.neighbors(current);
      for (let i = 0; i < neighbors.length; i++) {
        const neighbor = neighbors[i];
        // const cost = costs.get(current) + neighbor.cost;
        const cost = costs[current.id] + neighbor.cost;

        if (costs[neighbor.id] === undefined || cost < costs[neighbor.id]) {
          if (!neighbor.walkable && !neighbor.breakable) continue;
          costs[neighbor.id] = cost;
          cameFrom[neighbor.id] = current.id;
          frontier.enqueue(neighbor, cost);
        }
      }
    }

    const path = [];
    current = end;

    let i = 0;

    while (current !== start && i < MAX_STEPS) {
      path.push(current);
      const currentId = cameFrom[current.id];
      current = this.stage.cellHash[currentId];
      if (current === undefined) break;
      i++;
    }
    path.reverse();
    path.pop();

    return path;
  }
}
