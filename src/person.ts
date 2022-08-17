import { Vector } from "./math";
import Sprite, { ISpriteProps } from "./sprite";
import Stage from "./stage";
import Debug from "./debug";

import personImageDataUrl from "../assets/person2.png";

import { align, cohere, separate } from "./flock";
import SpriteAnimation from "./sprite_animation";

const MAX_WALKING_SPEED = 1;
const MAX_RUNNING_SPEED = 3;
const MAX_HEALTH_BAR_WIDTH = 50;
const HEALTH_BAR_Y_OFFSET = 5;
const MAX_HEALTH = 100;
const HEALTH_BAR_OUTSIDE_HEIGHT = 10;
const HEALTH_BAR_BORDER = 4;
const HEALTH_BAR_INSIDE_HEIGHT = HEALTH_BAR_OUTSIDE_HEIGHT - HEALTH_BAR_BORDER;
const HEALTH_BAR_INSIDE_OFFSET = HEALTH_BAR_BORDER / 2;

export default class Person extends Sprite {
  public pos: Vector;

  afraid: boolean;
  fearTimer: number;
  health: number;

  constructor(pos: Vector, stage: Stage) {
    const scale = 6;
    const size = new Vector(8 * scale, 16 * scale, 1);
    const originalSize = new Vector(8, 16, 1);
    const walk_right = new SpriteAnimation("walk_left", 2, 4, 10);
    const walk_left = new SpriteAnimation("walk_left", 2, 6, 10);
    const run_right = new SpriteAnimation("run_right", 2, 0, 5);
    const run_left = new SpriteAnimation("run_left", 2, 2, 5);
    const props: ISpriteProps = {
      name: "person",
      pos,
      imageDataUrl: personImageDataUrl,
      numFrames: 2,
      originalSize,
      size,
      debugColor: "#70c4db",
      stage,
      spriteAnimations: {
        run_right,
        run_left,
        walk_right,
        walk_left,
        default: walk_right,
      },
    };

    super(props);

    this.afraid = false;
    this.fearTimer = 0;
    this.health = MAX_HEALTH;
  }

  flock(people: Person[]) {
    const alignment = align(this, people);
    const cohesion = cohere(this, people);
    const separation = separate(this, people, 30);

    const debug = Debug.getInstance();
    if (debug.peopleSlidersEnabled) {
      this.acc.add(
        alignment.mult(parseFloat(debug.peopleAlignmentSlider.value))
      );
      this.acc.add(cohesion.mult(parseFloat(debug.peopleCohesionSlider.value)));
      this.acc.add(
        separation.mult(parseFloat(debug.peopleSeparationSlider.value))
      );
    } else {
      this.acc.add(alignment);
      this.acc.add(cohesion);
      this.acc.add(separation);
    }
  }

  scare(scareLocation: Vector, scareAmount: number) {
    const steering = scareLocation.copy().mult(-1).sub(this.vel);
    const SCARE_FORCE_MULTIPLIER = 2;
    this.acc.add(steering.mult(SCARE_FORCE_MULTIPLIER));
    this.fearTimer = Math.max(scareAmount, this.fearTimer);
    this.afraid = true;
  }

  damage(amount: number) {
    this.health = Math.max(0, this.health - amount);
  }

  updateFear() {
    if (this.fearTimer > 0) {
      this.afraid = true;
      this.fearTimer--;
    } else {
      this.fearTimer = 0;
      this.afraid = false;
    }
  }

  update() {
    super.update();
    this.updateFear();

    if (this.afraid) {
      this.vel.setMag(MAX_RUNNING_SPEED);
    } else {
      this.vel.setMag(MAX_WALKING_SPEED);
    }

    if (this.health === 0) {
      console.log("dead");
    }

    let animation = null;

    if (this.vel.x <= 0 && this.afraid) {
      animation = this.spriteAnimations["run_left"];
    } else if (this.vel.x <= 0 && !this.afraid) {
      animation = this.spriteAnimations["walk_left"];
    } else if (this.vel.x > 0 && this.afraid) {
      animation = this.spriteAnimations["run_right"];
    } else if (this.vel.x > 0 && !this.afraid) {
      animation = this.spriteAnimations["walk_right"];
    }

    this.changeAnimation(animation);
    this.edgesMirror2();
  }

  healthBarWidth(): number {
    return (MAX_HEALTH_BAR_WIDTH * this.health) / MAX_HEALTH;
  }

  drawHealthBar() {
    const ctx = this.renderer.ctx;
    const x = this.pos.x - (MAX_HEALTH_BAR_WIDTH - this.size.x) / 2;
    const y = this.pos.y + this.size.y + HEALTH_BAR_Y_OFFSET;
    ctx.fillStyle = "white";
    ctx.fillRect(x, y, MAX_HEALTH_BAR_WIDTH, HEALTH_BAR_OUTSIDE_HEIGHT);

    ctx.fillStyle = "red";
    ctx.fillRect(
      x + HEALTH_BAR_INSIDE_OFFSET,
      y + HEALTH_BAR_INSIDE_OFFSET,
      this.healthBarWidth(),
      HEALTH_BAR_INSIDE_HEIGHT
    );
  }

  draw() {
    super.draw();
    this.drawHealthBar();
  }
}
