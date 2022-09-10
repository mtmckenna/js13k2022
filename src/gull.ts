import { Vector } from "./math";
import Sprite, { ISpriteProps } from "./sprite";
import Stage from "./stage";
import { cohere, separate } from "./flock";

import gullImageDataUrl from "../assets/spritesheet.png";
import SpriteAnimation from "./sprite_animation";

const MAX_SPEED = 3;
const MIN_SPEED = 2;

export default class Gull extends Sprite {
  public pos: Vector;

  stage: Stage;

  canBump = false;
  canMove = true;
  startOffset = 16;

  constructor(pos: Vector, stage: Stage) {
    const scale = 2;
    const size = new Vector(16 * scale, 16 * scale, 1);
    const originalSize = new Vector(16, 16, 1);
    const fly_right = new SpriteAnimation("fly_right", 2, 0, 8);
    const fly_left = new SpriteAnimation("fly_left", 2, 2, 8);
    const props: ISpriteProps = {
      name: "gull",
      pos,
      imageDataUrl: gullImageDataUrl,
      numFrames: 2,
      originalSize,
      size,
      stage,
      spriteAnimations: {
        fly_right,
        fly_left,
        default: fly_right,
      },
    };

    super(props);
  }

  flock(gulls: Gull[], posToCircle?: Vector) {
    // const alignment = align(this, gulls);
    const cohesion = cohere(this, gulls, posToCircle, 1.6);
    const separation = separate(this, gulls, 150, 0.6);

    // this.acc.add(alignment);
    this.acc.add(cohesion);
    this.acc.add(separation);
  }

  update(t) {
    super.update(t);
    this.vel.limit(MAX_SPEED);

    if (this.vel.mag() < MIN_SPEED) {
      this.vel.setMag(MIN_SPEED);
    }

    if (this.vel.x <= 0) {
      this.changeAnimation(this.spriteAnimations["fly_left"]);
    } else if (this.vel.x > 0) {
      this.changeAnimation(this.spriteAnimations["fly_right"]);
    }
  }
}
