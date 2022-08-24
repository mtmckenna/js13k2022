import Sprite from "./sprite";
import Debug from "./debug";
import Camera from "./camera";
import { Vector } from "./math";
import Stage from "./stage";

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
    this.offset.set(this.camera.pos.x, this.camera.pos.y, this.camera.pos.z);
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

  drawGrid(stage: Stage) {
    const gridSize = 10;
    this.ctx.strokeStyle = "red";
    this.ctx.lineWidth = 2;
    this.ctx.font = "12px serif";
    const scale = this.offset.z;
    const fontSpacing = 50;

    for (let i = 0; i < stage.size.x / gridSize; i += gridSize) {
      this.ctx.beginPath();

      this.ctx.moveTo(
        (i * gridSize - this.offset.x) * scale,
        (0 - this.offset.y) * scale
      );

      this.ctx.lineTo(
        (i * gridSize - this.offset.x) * scale,
        (stage.size.y - this.offset.y) * scale
      );

      this.ctx.stroke();
    }

    for (let j = 0; j < stage.size.y / gridSize; j += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(
        (0 - this.offset.x) * scale,
        (j * gridSize - this.offset.y) * scale
      );
      this.ctx.lineTo(
        (stage.size.x - this.offset.x) * scale,
        (j * gridSize - this.offset.y) * scale
      );
      this.ctx.stroke();
    }

    for (let i = 0; i < stage.size.x; i += fontSpacing) {
      for (let j = 0; j < stage.size.y; j += fontSpacing) {
        this.ctx.fillText(
          `${i},${j}`,
          (i - this.offset.x) * scale,
          (j - this.offset.y) * scale
        );
      }
    }

    this.ctx.strokeStyle = "yellow";
    this.ctx.strokeRect(
      0,
      0,
      (stage.size.x - this.offset.x) * scale,
      (stage.size.y - this.offset.y) * scale
    );
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
