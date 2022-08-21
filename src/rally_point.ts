import { Vector } from "./math";
import { Drawable } from "./interfaces";
import Renderer from "./renderer";

export default class RallyPoint implements Drawable {
  pos: Vector;
  size: Vector;
  renderer: Renderer;
  ctx: CanvasRenderingContext2D;
  color: string;

  constructor(pos: Vector) {
    this.pos = pos;
    this.size = new Vector(20, 20, 0);
    this.renderer = Renderer.getInstance();
    this.ctx = this.renderer.ctx;
    this.color = "pink";
  }

  draw() {
    // ctx.beginPath();
    // ctx.moveTo(75, 50);
    // ctx.lineTo(100, 75);
    // ctx.lineTo(100, 25);
    // ctx.fill();
    const offset = this.renderer.offset;

    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(
      (this.pos.x + offset.x - this.size.x / 2) * offset.z,
      (this.pos.y + offset.y - this.size.y / 2) * offset.z,
      this.size.x,
      this.size.y
    );
  }
}
