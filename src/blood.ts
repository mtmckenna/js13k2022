import { Drawable, IBox } from "./interfaces";
import { Vector, randomFloatBetween } from "./math";
import Renderer from "./renderer";

const LIFE_SPAN = 200;
const GRAVITY = 10;
const START_VEL = 4;

export default class Blood implements Drawable, IBox {
  pos: Vector;
  vel: Vector;
  acc: Vector;
  size: Vector;
  renderer: Renderer;
  timeLeft: number;
  groundLevel: number;

  constructor(pos: Vector, renderer: Renderer) {
    this.pos = pos;
    this.vel = new Vector(0, 0, 0);
    this.acc = new Vector(0, GRAVITY, 0);
    this.size = new Vector(3, 3, 0);
    this.renderer = renderer;
    this.timeLeft = LIFE_SPAN;
  }

  inUse() {
    return this.timeLeft > 0;
  }

  kill() {
    this.timeLeft = 0;
  }

  regen(box: IBox) {
    const { pos, size } = box;
    this.timeLeft = LIFE_SPAN;
    this.pos.set(pos.x, pos.y, pos.z);
    this.vel.set(
      randomFloatBetween(-1 * START_VEL, START_VEL),
      0.5 * START_VEL,
      0
    );
    this.groundLevel = pos.y + size.y;
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
  }

  draw(): void {
    const { ctx, offset } = this.renderer;

    ctx.fillStyle = "#a12f18";
    ctx.fillRect(
      (this.pos.x - offset.x) * offset.z,
      (this.pos.y - offset.y) * offset.z,
      this.size.x,
      this.size.y
    );
  }
}
