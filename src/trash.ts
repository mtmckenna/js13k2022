import { Drawable, IBox } from "./interfaces";
import { Vector } from "./math";
import Sprite, { ISpriteProps } from "./sprite";
import Stage from "./stage";

import houseImageDataUrl from "../assets/spritesheet.png";
import SpriteAnimation from "./sprite_animation";

export default class Trash extends Sprite implements Drawable, IBox {
  canBump = true;
  canBreak = true;
  startOffset = 264;

  constructor(pos: Vector, stage: Stage) {
    const scale = 3;
    const idle = new SpriteAnimation("idle", 1, 0, 0);

    const props: ISpriteProps = {
      name: "trash",
      pos,
      imageDataUrl: houseImageDataUrl,
      numFrames: 1,
      originalSize: new Vector(12, 16, 1),
      size: new Vector(scale * 12, scale * 16, 1),
      debugColor: "blue",
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
