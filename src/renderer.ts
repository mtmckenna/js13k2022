import Sprite from "./sprite";
import Debug from "./debug";
import Camera from "./camera";
import { Vector } from "./math";

export default class Renderer {
  private static instance: Renderer;

  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  debug: boolean;
  previousRenderNumber: number;
  currentRenderNumber: number;
  camera: Camera;
  offset: Vector;

  private constructor() {
    this.canvas = document.getElementById("game") as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d");
    this.debug = Debug.getInstance().gullSpritesEnabled;
    this.previousRenderNumber = 0;
    this.currentRenderNumber = 0;
    this.camera = new Camera();
    this.offset = new Vector(0, 0, 0);
  }

  public renderTick() {
    this.previousRenderNumber = this.currentRenderNumber;
    this.currentRenderNumber++;
    this.offset.set(
      this.camera.pos.x * this.camera.speed,
      this.camera.pos.y * this.camera.speed,
      this.camera.pos.z
    );
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

    const scale = this.offset.z;

    this.ctx.drawImage(
      sprite.image,
      sprite.currentFrame * sprite.originalSize.x,
      0,
      sprite.originalSize.x,
      sprite.originalSize.y,
      Math.round((sprite.pos.x - this.offset.x) * scale),
      Math.round((sprite.pos.y - this.offset.y) * scale),
      Math.round(sprite.size.x * scale),
      Math.round(sprite.size.y * scale)
    );
  }

  private drawDebug(sprite: Sprite) {
    this.ctx.fillStyle = sprite.debugColor;
    this.ctx.fillRect(sprite.pos.x, sprite.pos.y, sprite.size.x, sprite.size.y);
  }
}
