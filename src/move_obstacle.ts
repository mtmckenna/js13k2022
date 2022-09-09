import { ICell } from "./interfaces";
import { Vector } from "./math";
import Sprite from "./sprite";
import Stage from "./stage";

// to save space put this on stage
export default class MoveObstacle {
  sprite: Sprite;
  cell: ICell;
  constructor(sprite: Sprite, cell: ICell) {
    this.sprite = sprite;
    this.cell = cell;
  }
}

// TODO: to save space put this on Stage
export class SelectObstacle {
  stage: Stage;

  constructor(stage: Stage) {
    this.stage = stage;
  }

  find(pos: Vector): Sprite {
    const cell = this.stage.getCellForPos(pos);
    if (!cell.breakable) return null;
    return cell.sprite;
  }
}
