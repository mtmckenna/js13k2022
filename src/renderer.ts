import Sprite from "./sprite";
import Debug from "./debug";

export default class Renderer {
  private static instance: Renderer;

  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  debug: boolean;
  previousRenderNumber: number;
  currentRenderNumber: number;

  private constructor() {
    this.canvas = document.getElementById("game") as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d");
    this.debug = Debug.getInstance().gullSpritesEnabled;
    this.previousRenderNumber = 0;
    this.currentRenderNumber = 0;
  }

  public renderTick() {
    this.previousRenderNumber = this.currentRenderNumber;
    this.currentRenderNumber++;
  }

  public static getInstance(): Renderer {
    if (!Renderer.instance) Renderer.instance = new Renderer();
    return Renderer.instance;
  }

  public draw(sprite: Sprite) {
    if (this.debug) {
      this.drawDebug(sprite);
    } else {
      this.drawSprite(sprite);
    }
  }

  private drawSprite(sprite: Sprite) {
    sprite.updateCurrentFrame(this.previousRenderNumber);

    this.ctx.drawImage(
      sprite.image,
      sprite.currentFrame * sprite.originalSize.x,
      0,
      sprite.originalSize.x,
      sprite.originalSize.y,
      sprite.pos.x,
      sprite.pos.y,
      sprite.size.x,
      sprite.size.y
    );
  }

  private drawDebug(sprite: Sprite) {
    this.ctx.fillStyle = sprite.debugColor;
    this.ctx.fillRect(sprite.pos.x, sprite.pos.y, sprite.size.x, sprite.size.y);
  }
}
