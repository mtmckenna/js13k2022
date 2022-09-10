import { Vector } from "./math";
import { Drawable } from "./interfaces";
import Renderer from "./renderer";
import Blood from "./blood";
import Stage from "./stage";

export default class RallyPoint implements Drawable {
  pos: Vector;
  size: Vector;
  renderer: Renderer;
  ctx: CanvasRenderingContext2D;
  color: string;
  bloods: Blood[];
  lastBleedAt: number;
  maxBleedBloods = 20;
  maxDeathBloods = 20;
  bloodTimeDelta = 1;
  dead: boolean;
  stage: Stage;

  constructor(pos: Vector, stage: Stage) {
    this.pos = pos;
    this.size = new Vector(10, 10, 0);
    this.renderer = Renderer.getInstance();
    this.ctx = this.renderer.ctx;
    this.color = "#f23fae";
    this.lastBleedAt = 0;
    this.dead = false;
    this.stage = stage;
  }

  draw() {
    const h = this.stage.size.y;
    const offset = this.renderer.offset;

    this.ctx.fillStyle = this.color;

    const x = (this.pos.x - offset.x - this.size.x / 2) * offset.z;
    // Flip canvas coordinates upsideown
    const y = (-1 * (this.pos.y - h) - offset.y - this.size.y / 2) * offset.z;
    // this.ctx.fillRect(x, y, this.size.x * offset.z, this.size.y * offset.z);

    this.ctx.beginPath();
    this.ctx.arc(x, y, this.size.x * offset.z, 0, 2 * Math.PI);
    this.ctx.fill();
  }
}
