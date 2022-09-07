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
  canvasOffset: Vector;
  stage: Stage;

  private constructor() {
    this.canvas = document.getElementById("game") as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d");
    this.debug = Debug.getInstance().gullSpritesEnabled;
    this.previousRenderNumber = 0;
    this.currentRenderNumber = 0;
    const camera = new Camera();
    this.camera = camera;
    this.offset = new Vector(0, 0, 0);
    this.canvasOffset = new Vector(0, 0, 0);
  }

  public renderTick(stage: Stage) {
    this.stage = stage;
    this.previousRenderNumber = this.currentRenderNumber;
    this.currentRenderNumber++;
    this.offset.set(
      this.camera.pos.x - this.canvasOffset.x,
      this.camera.pos.y - this.canvasOffset.y,
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

  drawGrid() {
    const gridSize = this.stage.cellSize;
    this.ctx.lineWidth = 1;
    const scale = this.offset.z;
    const h = this.stage.size.y;

    this.ctx.strokeStyle = "red";
    // vertical
    for (let i = 0; i < this.stage.size.x / gridSize; i++) {
      this.ctx.beginPath();

      this.ctx.moveTo(
        (i * gridSize - this.offset.x) * scale,
        (h - 0 - this.offset.y) * scale
      );

      this.ctx.lineTo(
        (i * gridSize - this.offset.x) * scale,
        (h - this.stage.size.y - this.offset.y) * scale
      );

      this.ctx.stroke();
    }

    this.ctx.strokeStyle = "pink";
    // horizontal
    for (let j = 0; j < this.stage.size.y / gridSize; j++) {
      this.ctx.beginPath();
      this.ctx.moveTo(
        (0 - this.offset.x) * scale,
        (h - j * gridSize - this.offset.y) * scale
      );
      this.ctx.lineTo(
        (this.stage.size.x - this.offset.x) * scale,
        (h - j * gridSize - this.offset.y) * scale
      );
      this.ctx.stroke();
    }
    this.ctx.font = "10px sans serif";
    const fontSpacing = 50;
    this.ctx.textAlign = "center";

    // for (let i = 0; i < this.stage.size.x; i += fontSpacing) {
    //   for (let j = 0; j < this.stage.size.y; j += fontSpacing) {
    //     this.ctx.fillText(
    //       `${i},${j}`,
    //       (i - this.offset.x) * scale,
    //       (h - j - this.offset.y) * scale
    //     );
    //   }
    // }

    this.ctx.fillStyle = "purple";
    const unwalkable = [];
    for (let i = 0; i < this.stage.size.x / gridSize; i++) {
      for (let j = 0; j < this.stage.size.y / gridSize; j++) {
        const walkable = this.stage.cells[j][i].walkable;
        if (!walkable) {
          unwalkable.push(unwalkable);
          const y = (-1 * (gridSize * j - h) - this.offset.y) * scale;
          this.ctx.fillRect(
            (gridSize * i - this.offset.x) * scale,
            y,
            gridSize * scale,
            gridSize * scale
          );
        }
        this.ctx.fillText(
          `${i},${j}`,
          (gridSize / 2 + gridSize * i - this.offset.x) * scale,
          (h - j * gridSize - this.offset.y - gridSize / 2) * scale
        );
      }
    }

    // Draw box around stage
    this.ctx.strokeStyle = "yellow";
    this.ctx.strokeRect(
      -this.offset.x * scale,
      -this.offset.y * scale,
      this.stage.size.x * scale,
      this.stage.size.y * scale
    );
  }

  private drawSprite(sprite: Sprite) {
    const h = sprite.stage.size.y;

    sprite.updateCurrentFrame(this.previousRenderNumber);

    const scale = this.offset.z;

    const x = Math.round((sprite.pos.x - this.offset.x) * scale);
    const y = Math.round((h - sprite.pos.y - this.offset.y) * scale);
    const xSize = Math.round(sprite.size.x * scale);
    const ySize = Math.round(sprite.size.y * scale);

    this.ctx.drawImage(
      sprite.image,
      sprite.startOffset + sprite.currentFrame * sprite.originalSize.x,
      0,
      sprite.originalSize.x,
      sprite.originalSize.y,
      x,
      y,
      xSize,
      ySize
    );
  }

  private drawDebug(sprite: Sprite) {
    this.ctx.fillStyle = sprite.debugColor;
    const scale = this.offset.z;
    const h = sprite.stage.size.y;

    this.ctx.fillRect(
      Math.round((sprite.pos.x - this.offset.x) * scale),
      Math.round((h - sprite.pos.y - this.offset.y) * scale),
      Math.round(sprite.size.x * scale),
      Math.round(sprite.size.y * scale)
    );
  }
}
