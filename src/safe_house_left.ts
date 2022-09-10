import { Drawable, IBox } from "./interfaces";
import { Vector } from "./math";
import Sprite, { ISpriteProps } from "./sprite";
import Stage from "./stage";

import houseImageDataUrl from "../assets/spritesheet.png";
import SpriteAnimation from "./sprite_animation";

export default class SafeHouseLeft extends Sprite implements Drawable, IBox {
  public static ORIGINAL_SIZE = new Vector(12, 16, 1);
  public static DEFAULT_SCALE = 3;

  canBump = false;
  startOffset = 80;

  constructor(pos: Vector, stage: Stage) {
    const scale = SafeHouseLeft.DEFAULT_SCALE;
    const idle = new SpriteAnimation("idle", 1, 0, 0);

    const props: ISpriteProps = {
      name: "safe_house_left",
      pos,
      imageDataUrl: houseImageDataUrl,
      numFrames: 1,
      originalSize: new Vector(12, 16, 1),
      size: new Vector(
        scale * SafeHouseLeft.ORIGINAL_SIZE.x,
        scale * SafeHouseLeft.ORIGINAL_SIZE.y,
        1
      ),
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
