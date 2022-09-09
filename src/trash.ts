import { Drawable, IBox } from "./interfaces";
import { Vector } from "./math";
import Sprite, { ISpriteProps } from "./sprite";
import Stage from "./stage";
import { COLOR_MAP } from "./blood";

import houseImageDataUrl from "../assets/spritesheet.png";
import SpriteAnimation from "./sprite_animation";

export default class Trash extends Sprite implements Drawable, IBox {
  canBump = true;
  canBreak = true;
  startOffset = 296;
  bloodColor = COLOR_MAP.gray;
  health = 50;

  constructor(pos: Vector, stage: Stage) {
    const scale = 2;
    const idle = new SpriteAnimation("idle", 1, 0, 0);

    const props: ISpriteProps = {
      name: "trash",
      pos,
      imageDataUrl: houseImageDataUrl,
      numFrames: 1,
      originalSize: new Vector(8, 8, 1),
      size: new Vector(scale * 8, scale * 8, 1),
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
