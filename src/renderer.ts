import Sprite from "./sprite";
import Debug from "./debug";
import Camera from "./camera";

export default class Renderer {
  private static instance: Renderer;

  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  debug: boolean;
  previousRenderNumber: number;
  currentRenderNumber: number;
  camera: Camera;

  private constructor() {
    this.canvas = document.getElementById("game") as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d");
    this.debug = Debug.getInstance().gullSpritesEnabled;
    this.previousRenderNumber = 0;
    this.currentRenderNumber = 0;
    this.camera = new Camera();
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

    const scale = this.camera.pos.z;

    this.ctx.drawImage(
      sprite.image,
      sprite.currentFrame * sprite.originalSize.x,
      0,
      sprite.originalSize.x,
      sprite.originalSize.y,
      Math.floor(sprite.pos.x * scale),
      Math.floor(sprite.pos.y * scale),
      Math.floor(sprite.size.x * scale),
      Math.floor(sprite.size.y * scale)
    );
  }

  private drawDebug(sprite: Sprite) {
    this.ctx.fillStyle = sprite.debugColor;
    this.ctx.fillRect(sprite.pos.x, sprite.pos.y, sprite.size.x, sprite.size.y);
  }
}
