import { Drawable, IBox } from "./interfaces";
import { Vector } from "./math";
import Sprite, { ISpriteProps } from "./sprite";
import SpriteAnimation from "./sprite_animation";
import Stage from "./stage";

export default class SafeHouseDoor extends Sprite implements Drawable, IBox {
  canBump = false;
  constructor(pos: Vector, stage: Stage) {
    const scale = 3;
    const idle = new SpriteAnimation("idle", 1, 0, 0);

    const props: ISpriteProps = {
      name: "safe_house_door",
      pos,
      numFrames: 1,
      originalSize: new Vector(8, 16, 1),
      size: new Vector(scale * 8, scale * 16, 1),
      debugColor: "blue",
      stage,
      spriteAnimations: {
        idle,
        default: idle,
      },
    };

    super(props);
  }

  draw() {
    const h = this.stage.size.y;
    const offset = this.renderer.offset;

    const { ctx } = this.renderer;

    ctx.fillStyle = "black";

    // Flip canvas coordinates upsideown
    const y = (-1 * (this.pos.y - h) - offset.y) * offset.z;
    ctx.fillRect(
      (this.pos.x - offset.x) * offset.z,
      y,
      this.size.x * offset.z,
      this.size.y * offset.z
    );
  }
}
