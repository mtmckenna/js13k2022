import { Vector } from "./math";
import { Drawable } from "./interfaces";
import Renderer from "./renderer";
import Stage from "./stage";
import { COLOR_MAP } from "./blood";
import Gull from "./gull";

export default class RallyPoint implements Drawable {
  pos: Vector;
  size: Vector;
  renderer: Renderer;
  ctx: CanvasRenderingContext2D;
  color: string;
  stage: Stage;
  sizeForSearch: Vector;

  private _center: Vector = new Vector(0, 0, 0);

  constructor(pos: Vector, stage: Stage) {
    this.pos = pos;
    this.size = new Vector(10, 10, 0);
    this.sizeForSearch = new Vector(20, 20, 0);
    this.renderer = Renderer.getInstance();
    this.ctx = this.renderer.ctx;
    this.color = COLOR_MAP.pink;
    this.stage = stage;
  }

  get center() {
    this._center.set(
      this.pos.x + this.size.x / 2,
      this.pos.y - this.size.y / 2,
      this.pos.z
    );
    return this._center;
  }

  addToCell() {
    const mainCell = this.stage.getCellForPos(this.pos);
    const neighbors = this.stage.neighbors(mainCell);
    const neighbors2 = neighbors.map((neighbor) =>
      this.stage.neighbors(neighbor)
    );

    mainCell.hasRallyPoint = true;
    mainCell.cost += Stage.RALLY_POINT_COST;

    neighbors.forEach((neighbor) => {
      neighbor.hasRallyPoint = true;
      neighbor.cost += Stage.RALLY_POINT_COST;
    });

    neighbors2.forEach((neighborsArray) => {
      neighborsArray.forEach((neighbor) => {
        neighbor.hasRallyPoint = true;
        neighbor.cost += Stage.RALLY_POINT_COST;
      });
    });

    // This was too costly
    // const cells = [mainCell, ...neighbors, ...neighbors2.flat()];

    // Add to neighboring cells
    // cells.forEach((cell) => {
    //   if (cell.hasRallyPoint) return;
    //   cell.hasRallyPoint = true;
    //   cell.cost += Stage.RALLY_POINT_COST;
    // });
  }

  draw() {
    const h = this.stage.size.y;
    const offset = this.renderer.offset;

    this.ctx.fillStyle = this.color;

    const x = (this.pos.x - offset.x) * offset.z;
    // Flip canvas coordinates upsideown
    const y = (-1 * (this.pos.y - h) - offset.y) * offset.z;

    this.ctx.beginPath();
    this.ctx.arc(x, y, this.size.x * offset.z, 0, 2 * Math.PI);
    this.ctx.fill();
  }

  drawLineToGull(gull: Gull) {
    const h = this.stage.size.y;
    const offset = this.renderer.offset;

    this.ctx.strokeStyle = COLOR_MAP.pink;

    const fromX = (this.pos.x - offset.x - this.size.x / 2) * offset.z;
    const fromY =
      (-1 * (this.pos.y - h) - offset.y - this.size.y / 2) * offset.z;

    const toX = (gull.center.x - offset.x) * offset.z;
    const toY = (-1 * (gull.center.y - h) - offset.y) * offset.z;

    // this.ctx.beginPath();
    // this.ctx.arc(x, y, this.size.x * offset.z, 0, 2 * Math.PI);
    // this.ctx.fill();

    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(fromX, fromY);
    this.ctx.lineTo(toX, toY);
    this.ctx.stroke();
  }
}
