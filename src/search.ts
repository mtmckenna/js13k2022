import Stage from "./stage";
import { ICell } from "./interfaces";

export default class Search {
  start: ICell;
  end: ICell;
  stage: Stage;
  frontier: ICell[];
  cameFrom: Map<ICell, ICell>;

  constructor(stage, start, end) {
    this.start = start;
    this.end = end;
    this.stage = stage;
    this.frontier = [];
    this.frontier.push(start);

    this.cameFrom = new Map();
    this.cameFrom.set(start, null);
  }

  search(): ICell[] {
    let current = null;
    while (this.frontier.length > 0) {
      current = this.frontier.shift();

      if (current === this.end) break;

      const neighbors = this.stage.neighbors(current);
      for (let i = 0; i < neighbors.length; i++) {
        const neighbor = neighbors[i];
        if (!neighbor.walkable) continue;
        if (!this.cameFrom.has(neighbor)) {
          this.cameFrom.set(neighbor, current);
          this.frontier.push(neighbor);
        }
      }
    }

    const path = [];
    current = this.end;

    let i = 0;

    while (current !== this.start && i < 30) {
      path.push(current);
      current = this.cameFrom.get(current);
      i++;
    }
    path.reverse();
    path.pop();

    return path;
  }
}
