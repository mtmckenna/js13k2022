import { Drawable, IBox, ICell } from "./interfaces";
import { Vector } from "./math";
import Sprite, { ISpriteProps } from "./sprite";
import Stage from "./stage";

import houseImageDataUrl from "../assets/spritesheet.png";
import SpriteAnimation from "./sprite_animation";

export default class SafeHouse extends Sprite implements Drawable, IBox {
  public static ORIGINAL_SIZE = new Vector(32, 32, 1);
  public static DEFAULT_SCALE = 3;

  canBump = false;
  startOffset = 80;
  doorCell: ICell;
  door: IBox;

  constructor(pos: Vector, stage: Stage) {
    const scale = SafeHouse.DEFAULT_SCALE;
    const idle = new SpriteAnimation("idle", 1, 0, 0);

    const props: ISpriteProps = {
      name: "safe_house",
      pos,
      imageDataUrl: houseImageDataUrl,
      numFrames: 1,
      originalSize: new Vector(32, 32, 1),
      size: new Vector(
        scale * SafeHouse.ORIGINAL_SIZE.x,
        scale * SafeHouse.ORIGINAL_SIZE.y,
        1
      ),
      stage,
      spriteAnimations: {
        idle,
        default: idle,
      },
    };

    super(props);

    const bottomMiddle = this.pos.copy();
    bottomMiddle.set(
      bottomMiddle.x + this.size.x / 2,
      bottomMiddle.y - this.size.y,
      0
    );

    this.doorCell = this.stage.getCellForPos(bottomMiddle);
    const size = new Vector(
      this.stage.cellSize * 2,
      this.stage.cellSize * 2,
      0
    );
    this.door = { pos: bottomMiddle, size };

    this.setOverlappingCellsWalkability();
  }
}
