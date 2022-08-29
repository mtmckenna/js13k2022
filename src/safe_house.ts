import { Drawable, IBox } from "./interfaces";
import { Vector } from "./math";
import Renderer from "./renderer";

export default class SafeHouse implements Drawable, IBox {
  pos: Vector;
  size: Vector;
  renderer = Renderer.getInstance();
  ctx: CanvasRenderingContext2D;

  constructor(pos: Vector) {
    this.pos = pos;
    this.ctx = this.renderer.ctx;
    this.size = new Vector(10, 10, 0);
  }

  draw(t: number) {
    this.ctx.fillStyle = "blue";
    const { offset } = this.renderer;
    const scale = this.renderer.offset.z;
    const h = this.renderer.stage.size.y;

    this.ctx.fillRect(
      Math.round((this.pos.x - offset.x) * scale),
      Math.round((h - this.pos.y - offset.y) * scale),
      Math.round(this.size.x * scale),
      Math.round(this.size.y * scale)
    );
  }
}
