import { Vector } from "./math";
import { Drawable } from "./interfaces";
import Renderer from "./renderer";

export default class RallyPoint implements Drawable {
  pos: Vector;
  size: Vector;
  ctx: CanvasRenderingContext2D;
  color: string;

  constructor(pos: Vector) {
    this.pos = pos;
    this.size = new Vector(20, 20, 0);
    this.ctx = Renderer.getInstance().ctx;
    this.color = "pink";
  }

  draw() {
    // ctx.beginPath();
    // ctx.moveTo(75, 50);
    // ctx.lineTo(100, 75);
    // ctx.lineTo(100, 25);
    // ctx.fill();

    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
  }
}
