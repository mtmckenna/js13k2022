import { Vector } from "./math";
import Sprite, { ISpriteProps } from "./sprite";
import Stage from "./stage";
import Debug from "./debug";
import { align, cohere, separate } from "./flock";

import gullImageDataUrl from "../assets/gull.png";
import SpriteAnimation from "./sprite_animation";

const MAX_STEERING_FORCE = 0.1;
const MAX_SPEED = 3;
const MIN_SPEED = 2;

export default class Gull extends Sprite {
  public pos: Vector;

  stage: Stage;

  constructor(pos: Vector, stage: Stage) {
    const scale = 4;
    const size = new Vector(16 * scale, 16 * scale, 1);
    const originalSize = new Vector(16, 16, 1);
    const fly_right = new SpriteAnimation("fly_right", 2, 0, 7);
    const fly_left = new SpriteAnimation("fly_left", 2, 2, 7);
    const attack_right = new SpriteAnimation("attack_right", 2, 4, 5);
    const attack_left = new SpriteAnimation("attack_left", 2, 6, 5);
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

  update() {
    super.update();
    this.vel.limit(MAX_SPEED);

    if (this.vel.mag() < MIN_SPEED) {
      this.vel.setMag(MIN_SPEED);
    }

    // const left_anim = "attack_left";
    // const right_anim = "attack_right";
    const left_anim = "fly_left";
    const right_anim = "fly_right";

    if (this.vel.x <= 0 && this.currentAnimation.name !== left_anim) {
      this.changeAnimation(this.spriteAnimations[left_anim]);
    } else if (this.vel.x > 0 && this.currentAnimation.name !== right_anim) {
      this.changeAnimation(this.spriteAnimations[right_anim]);
    }
  }
}
