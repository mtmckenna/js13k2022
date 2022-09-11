import { Drawable, IBox, ICell } from "./interfaces";
import { Vector } from "./math";
import Sprite, { ISpriteProps } from "./sprite";
import Stage from "./stage";

import houseImageDataUrl from "../assets/spritesheet.png";
import SpriteAnimation from "./sprite_animation";

export default class SafeHouse extends Sprite implements Drawable, IBox {
  public static ORIGINAL_SIZE = new Vector(32, 32, 1);
  public static DEFAULT_SCALE = 3;
  public static SIZE = new Vector(
    SafeHouse.DEFAULT_SCALE * SafeHouse.ORIGINAL_SIZE.x,
    SafeHouse.DEFAULT_SCALE * SafeHouse.ORIGINAL_SIZE.y,
    1
  );

  canBump = false;
  startOffset = 80;
  doorCell: ICell;
  door: IBox;
  panicSize: Vector;

  constructor(pos: Vector, stage: Stage) {
    const idle = new SpriteAnimation("idle", 1, 0, 0);

    const props: ISpriteProps = {
      name: "safe_house",
      pos,
      imageDataUrl: houseImageDataUrl,
      numFrames: 1,
      originalSize: new Vector(32, 32, 1),
      size: SafeHouse.SIZE,
      stage,
      spriteAnimations: {
        idle,
        default: idle,
      },
    };

    super(props);

    const panicSize = this.size.copy();
    this.panicSize = new Vector(
      panicSize.x,
      Math.floor(panicSize.y / 2),
      panicSize.z
    );

    const size = new Vector(
      this.stage.cellSize * 2,
      this.stage.cellSize * 2,
      0
    );

    const bottomMiddle = this.pos.copy();
    bottomMiddle.set(
      bottomMiddle.x + size.x,
      bottomMiddle.y - (3 * this.size.y) / 4,
      0
    );

    this.doorCell = this.stage.getCellForPos(bottomMiddle);

    this.door = { pos: bottomMiddle, size };

    this.setOverlappingCellsWalkability(
      false,
      false,
      this.panicSize.x,
      this.panicSize.y
    );
  }
}
