import { Drawable, IBox } from "./interfaces";
import { Vector } from "./math";
import Sprite, { ISpriteProps } from "./sprite";
import Stage from "./stage";

import houseImageDataUrl from "../assets/spritesheet.png";
import SpriteAnimation from "./sprite_animation";
import SafeHouseLeft from "./safe_house_left";

export default class SafeHouseRight extends Sprite implements Drawable, IBox {
  canBump = false;
  startOffset = 92;

  constructor(pos: Vector, stage: Stage) {
    const scale = SafeHouseLeft.DEFAULT_SCALE;
    const idle = new SpriteAnimation("idle", 1, 0, 0);

    const props: ISpriteProps = {
      name: "safe_house_right",
      pos,
      imageDataUrl: houseImageDataUrl,
      numFrames: 1,
      originalSize: new Vector(12, 16, 1),
      size: new Vector(scale * 12, scale * 16, 1),
      stage,
      spriteAnimations: {
        idle,
        default: idle,
      },
    };

    super(props);

    this.setOverlappingCellsWalkability();
  }
}
