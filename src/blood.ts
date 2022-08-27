import { Drawable, IBox } from "./interfaces";
import { Vector, randomFloatBetween } from "./math";
import Renderer from "./renderer";

const LIFE_SPAN = 200;
const GRAVITY = -0.75;
const START_X_VEL = 3;
const START_Y_VEL = 3;

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
    this.size = new Vector(5, 5, 0);
    this.renderer = renderer;
    this.timeLeft = 0;
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
    const x = randomFloatBetween(
      pos.x + size.x / 2 + 2,
      pos.x + size.x / 2 - 2
    );
    const y = randomFloatBetween(pos.y + 2, pos.y - 2);
    this.pos.set(x, y, pos.z);
    this.acc.set(0, GRAVITY, 0);
    this.vel.set(
      randomFloatBetween(-1 * START_X_VEL, START_X_VEL),
      randomFloatBetween(0.5 * START_Y_VEL, START_Y_VEL),
      0
    );
    this.groundLevel = pos.y - size.y;
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    // console.log(this.vel);

    if (this.pos.y <= this.groundLevel) {
      // console.log("ground", this.pos.y, this.groundLevel);
      this.vel.set(0, 0, 0);
      this.acc.set(0, 0, 0);
    }
  }

  draw(): void {
    const { ctx, offset } = this.renderer;
    const h = this.renderer.stage.size.y;
    ctx.fillStyle = "#a12f18";
    ctx.fillRect(
      (this.pos.x - offset.x) * offset.z,
      (h - this.pos.y - offset.y) * offset.z,
      this.size.x * offset.z,
      this.size.y * offset.z
    );
  }
}
