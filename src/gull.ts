import { Vector } from "./math";
import Sprite, { ISpriteProps } from "./sprite";
import Stage from "./stage";
import Debug from "./debug";
import { align, cohere, separate } from "./flock";

import gullImageDataUrl from "../assets/gull.png";
import SpriteAnimation from "./sprite_animation";

const MAX_SPEED = 3;
const MIN_SPEED = 2;

export default class Gull extends Sprite {
  public pos: Vector;

  stage: Stage;

  private attacking: boolean;
  canBump = false;

  constructor(pos: Vector, stage: Stage) {
    const scale = 1;
    const size = new Vector(16 * scale, 16 * scale, 1);
    const originalSize = new Vector(16, 16, 1);
    const fly_right = new SpriteAnimation("fly_right", 2, 0, 8);
    const fly_left = new SpriteAnimation("fly_left", 2, 2, 8);
    const attack_right = new SpriteAnimation("attack_right", 2, 4, 4);
    const attack_left = new SpriteAnimation("attack_left", 2, 6, 4);
    const props: ISpriteProps = {
      name: "gull",
      pos,
      imageDataUrl: gullImageDataUrl,
      numFrames: 2,
      originalSize,
      size,
      debugColor: "#70c4db",
      stage,
      spriteAnimations: {
        fly_right,
        fly_left,
        attack_right,
        attack_left,
        default: fly_right,
      },
    };

    super(props);
    this.attacking = false;
  }

  flock(gulls: Gull[], posToCircle?: Vector) {
    const alignment = align(this, gulls);
    const cohesion = cohere(this, gulls, posToCircle, 1.4);
    const separation = separate(this, gulls, 100, 0.5);

    const debug = Debug.getInstance();
    if (debug.gullSlidersEnabled) {
      this.acc.add(alignment.mult(parseFloat(debug.gullAlignmentSlider.value)));
      this.acc.add(cohesion.mult(parseFloat(debug.gullCohesionSlider.value)));
      this.acc.add(
        separation.mult(parseFloat(debug.gullSeparationSlider.value))
      );
    } else {
      // this.acc.add(alignment);
      this.acc.add(cohesion);
      this.acc.add(separation);
    }
  }

  attack() {
    this.attacking = true;
  }

  circleTarget() {
    this.attacking = false;
  }

  update(t) {
    super.update(t);
    this.vel.limit(MAX_SPEED);

    if (this.vel.mag() < MIN_SPEED) {
      this.vel.setMag(MIN_SPEED);
    }

    let left_anim = "fly_left";
    let right_anim = "fly_right";

    if (this.attacking) {
      left_anim = "attack_left";
      right_anim = "attack_right";
    }

    if (this.vel.x <= 0 && this.currentAnimation.name !== left_anim) {
      this.changeAnimation(this.spriteAnimations[left_anim]);
    } else if (this.vel.x > 0 && this.currentAnimation.name !== right_anim) {
      this.changeAnimation(this.spriteAnimations[right_anim]);
    }
  }
}
