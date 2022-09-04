import { Drawable, IBox } from "./interfaces";
import { Vector } from "./math";
import Sprite, { ISpriteProps } from "./sprite";
import Stage from "./stage";

import houseTopImageDataUrl from "../assets/house_top.png";
import SpriteAnimation from "./sprite_animation";

export default class SafeHouseTop extends Sprite implements Drawable, IBox {
  canBump = true;

  constructor(pos: Vector, stage: Stage) {
    const scale = 3;
    const idle = new SpriteAnimation("idle", 1, 0, 0);

    const props: ISpriteProps = {
      name: "safe_house_top",
      pos,
      imageDataUrl: houseTopImageDataUrl,
      numFrames: 1,
      originalSize: new Vector(32, 16, 1),
      size: new Vector(scale * 32, scale * 16, 1),
      debugColor: "blue",
      stage,
      spriteAnimations: {
        idle,
        default: idle,
      },
    };

    super(props);
  }
}
