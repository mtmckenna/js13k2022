// https://www.redblobgames.com/pathfinding/grids/graphs.html
// https://www.redblobgames.com/pathfinding/a-star/introduction.html

import Stage from "./stage";
import { ICell } from "./interfaces";

const MAX_STEPS = 50;

export default class Search {
  stage: Stage;

  constructor(stage) {
    this.stage = stage;
  }

  search(start: ICell, end: ICell): ICell[] {
    const frontier: ICell[] = [];
    const cameFrom: Map<ICell, ICell> = new Map();
    frontier.push(start);
    cameFrom.set(start, null);

    let current = null;
    while (frontier.length > 0) {
      current = frontier.shift();

      if (current === end) break;

      const neighbors = this.stage.neighbors(current);
      for (let i = 0; i < neighbors.length; i++) {
        const neighbor = neighbors[i];
        if (!neighbor.walkable) continue;
        if (!cameFrom.has(neighbor)) {
          cameFrom.set(neighbor, current);
          frontier.push(neighbor);
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
