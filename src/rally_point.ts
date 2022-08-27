import { Vector } from "./math";
import { Bleedable, Drawable, Updatable } from "./interfaces";
import Renderer from "./renderer";
import BloodSystem from "./blood_system";
import Blood from "./blood";

const bloodSystem = BloodSystem.getInstance();

export default class RallyPoint implements Drawable, Bleedable, Updatable {
  pos: Vector;
  size: Vector;
  renderer: Renderer;
  ctx: CanvasRenderingContext2D;
  color: string;
  bloods: Blood[];
  bleeding: boolean;
  lastBleedAt: number;
  maxBleedBloods = 20;
  maxDeathBloods = 20;
  bloodTimeDelta = 1;
  dead: boolean;

  constructor(pos: Vector) {
    this.pos = pos;
    this.size = new Vector(10, 10, 0);
    this.renderer = Renderer.getInstance();
    this.ctx = this.renderer.ctx;
    this.color = "pink";
    this.lastBleedAt = 0;
    this.bloods = [];
    this.dead = false;
  }

  update(t: number) {
    if (
      this.bleeding &&
      this.bloods.length < this.maxBleedBloods &&
      t > this.lastBleedAt + this.bloodTimeDelta
    ) {
      this.bloods.push(bloodSystem.regenBlood(this));
      this.lastBleedAt = t;
    }
  }

  bleed() {
    this.bleeding = true;
  }

  die() {
    this.dead = true;
    for (let i = 0; i < this.maxDeathBloods; i++) {
      this.bloods.push(bloodSystem.regenBlood(this));
    }
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
      (this.pos.x - offset.x - this.size.x / 2) * offset.z,
      (this.pos.y - offset.y - this.size.y / 2) * offset.z,
      this.size.x * offset.z,
      this.size.y * offset.z
    );
  }
}
