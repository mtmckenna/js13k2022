import Sprite from "./sprite";
import { Vector } from "./math";
import Stage from "./stage";

export default class Renderer {
  private static instance: Renderer;

  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  previousRenderNumber: number;
  currentRenderNumber: number;
  offset: Vector;
  canvasOffset: Vector;
  stage: Stage;

  private constructor() {
    this.canvas = document.getElementById("game") as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d");
    this.previousRenderNumber = 0;
    this.currentRenderNumber = 0;
    this.offset = new Vector(0, 0, 0);
    this.canvasOffset = new Vector(0, 0, 0);
  }

  public renderTick(stage: Stage) {
    this.stage = stage;
    this.offset.set(-this.canvasOffset.x, -this.canvasOffset.y, 1);

    this.previousRenderNumber = this.currentRenderNumber;
    this.currentRenderNumber++;
  }

  public static getInstance(): Renderer {
    if (!Renderer.instance) Renderer.instance = new Renderer();
    return Renderer.instance;
  }

  public draw(sprite: Sprite) {
    if (sprite.dead) return;
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

  // drawGrid() {
  //   const gridSize = this.stage.cellSize;
  //   this.ctx.lineWidth = 1;
  //   const scale = this.offset.z;
  //   const h = this.stage.size.y;

  //   this.ctx.strokeStyle = "red";
  //   // vertical
  //   for (let i = 0; i < this.stage.size.x / gridSize; i++) {
  //     this.ctx.beginPath();

  //     this.ctx.moveTo(
  //       (i * gridSize - this.offset.x) * scale,
  //       (h - 0 - this.offset.y) * scale
  //     );

  //     this.ctx.lineTo(
  //       (i * gridSize - this.offset.x) * scale,
  //       (h - this.stage.size.y - this.offset.y) * scale
  //     );

  //     this.ctx.stroke();
  //   }

  //   this.ctx.strokeStyle = "pink";
  //   // horizontal
  //   for (let j = 0; j < this.stage.size.y / gridSize; j++) {
  //     this.ctx.beginPath();
  //     this.ctx.moveTo(
  //       (0 - this.offset.x) * scale,
  //       (h - j * gridSize - this.offset.y) * scale
  //     );
  //     this.ctx.lineTo(
  //       (this.stage.size.x - this.offset.x) * scale,
  //       (h - j * gridSize - this.offset.y) * scale
  //     );
  //     this.ctx.stroke();
  //   }
  //   this.ctx.font = "10px sans serif";
  //   this.ctx.textAlign = "center";

  //   const unwalkable = [];
  //   for (let i = 0; i < this.stage.size.x / gridSize; i++) {
  //     for (let j = 0; j < this.stage.size.y / gridSize; j++) {
  //       const cell = this.stage.cells[j][i];
  //       const walkable = cell.walkable;
  //       const hasRallyPoint = cell.hasRallyPoint;
  //       if (!walkable || hasRallyPoint) {
  //         unwalkable.push(unwalkable);
  //         const y = (-1 * (gridSize * j - h) - this.offset.y) * scale;

  //         this.ctx.fillStyle = "purple";

  //         this.ctx.fillRect(
  //           (gridSize * i - this.offset.x) * scale,
  //           y,
  //           gridSize * scale,
  //           gridSize * scale
  //         );
  //       }

  //       if ((i + j) % 2 == 0) {
  //         this.ctx.fillText(
  //           `${i},${j}`,
  //           (gridSize / 2 + gridSize * i - this.offset.x) * scale,
  //           (h - j * gridSize - this.offset.y - gridSize / 2) * scale
  //         );
  //       }
  //     }
  //   }

  //   // Draw box around stage
  //   this.ctx.strokeStyle = "yellow";
  //   this.ctx.strokeRect(
  //     -this.offset.x * scale,
  //     -this.offset.y * scale,
  //     this.stage.size.x * scale,
  //     this.stage.size.y * scale
  //   );
  // }
}
