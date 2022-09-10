import { Vector } from "./math";
import { Drawable } from "./interfaces";
import Renderer from "./renderer";
import Stage from "./stage";
import { COLOR_MAP } from "./blood";

export default class RallyPoint implements Drawable {
  pos: Vector;
  size: Vector;
  renderer: Renderer;
  ctx: CanvasRenderingContext2D;
  color: string;
  stage: Stage;

  private _center: Vector = new Vector(0, 0, 0);

  constructor(pos: Vector, stage: Stage) {
    this.pos = pos;
    this.size = new Vector(10, 10, 0);
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

  draw() {
    const h = this.stage.size.y;
    const offset = this.renderer.offset;

    this.ctx.fillStyle = this.color;

    const x = (this.pos.x - offset.x - this.size.x / 2) * offset.z;
    // Flip canvas coordinates upsideown
    const y = (-1 * (this.pos.y - h) - offset.y - this.size.y / 2) * offset.z;

    this.ctx.beginPath();
    this.ctx.arc(x, y, this.size.x * offset.z, 0, 2 * Math.PI);
    this.ctx.fill();
  }
}
