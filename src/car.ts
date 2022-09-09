import { Drawable, IBox } from "./interfaces";
import { Vector } from "./math";
import Sprite, { ISpriteProps } from "./sprite";
import Stage from "./stage";
import { COLOR_MAP } from "./blood";

import houseImageDataUrl from "../assets/spritesheet.png";
import SpriteAnimation from "./sprite_animation";

export default class Car extends Sprite implements Drawable, IBox {
  canBump = true;
  canBreak = true;
  startOffset = 0;
  damageProtectionTimeDelta = 50;
  health = 200;
  bloodColor = COLOR_MAP.blue;

  constructor(pos: Vector, stage: Stage) {
    const scale = 6;
    const idle = new SpriteAnimation("idle", 1, 0, 0);

    const props: ISpriteProps = {
      name: "car",
      pos,
      imageDataUrl: houseImageDataUrl,
      numFrames: 1,
      originalSize: new Vector(16, 8, 1),
      size: new Vector(scale * 16, scale * 8, 1),
      stage,
      spriteAnimations: {
        idle,
        default: idle,
      },
    };

    super(props);

    this.setOverlappingCellsWalkability(false, true);
  }
}
