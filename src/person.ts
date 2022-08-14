import { Vector } from "./math";
import Sprite, { ISpriteProps } from "./sprite";
import Stage from "./stage";
import Debug from "./debug";

import personImageDataUrl from "../assets/person2.png";

import { align, cohere, separate } from "./flock";
import SpriteAnimation from "./sprite_animation";

const MAX_WALKING_SPEED = 1;
const MAX_RUNNING_SPEED = 3;

const WALKING_ANIMATION_SPEED = 10;
const RUNNING_ANIMATION_SPEED = 2;

export default class Person extends Sprite {
  public pos: Vector;

  afraid: boolean;
  fearTimer: number;

  constructor(pos: Vector, stage: Stage) {
    const scale = 6;
    const size = new Vector(8 * scale, 16 * scale, 1);
    const originalSize = new Vector(8, 16, 1);
    const walk_right = new SpriteAnimation("walk_left", 2, 4);
    const walk_left = new SpriteAnimation("walk_left", 2, 6);
    const run_right = new SpriteAnimation("run_right", 2, 0);
    const run_left = new SpriteAnimation("run_left", 2, 2);
    const props: ISpriteProps = {
      name: "person",
      pos,
      imageDataUrl: personImageDataUrl,
      numFrames: 2,
      animationSpeed: WALKING_ANIMATION_SPEED,
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

  scare(scareAmount: number) {
    this.fearTimer = Math.max(scareAmount, this.fearTimer);
    this.afraid = true;
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
}
