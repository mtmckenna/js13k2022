import { Vector, clamp } from "./math";
import Renderer from "./renderer";
import Box from "./box";
import Sprite from "./sprite";
import { ICell } from "./interfaces";
import Person from "./person";
import Gull from "./gull";
import PersonFlock from "./person_flock";
import GullFlock from "./gull_flock";

const DEFAULT_COST = 1;

export default class Stage {
  public bumpables: Sprite[];

  public size: Vector;
  public cells: ICell[][] = [];
  public numCellsTall: number;
  public numCellsWide: number;
  public cellSize = 16;
  public people: Person[];
  public gulls: Gull[];
  public personFlocks: PersonFlock[];
  public gullFlocks: GullFlock[];

  private renderer: Renderer;

  private sky: Box;
  private beach: Box;
  private sun: Box;
  private lot: Box;

  static BREAKABLE_COST = 2;
  static WALKABLE_COST = 1;

  constructor(size: Vector) {
    this.size = size;
    this.renderer = Renderer.getInstance();

    this.numCellsWide = Math.ceil(this.size.x / this.cellSize);
    this.numCellsTall = Math.ceil(this.size.y / this.cellSize);
    this.createCells();
    this.createBackground();
  }

  createBackground() {
    const width = this.size.x;
    const height = this.size.y;
    const skyPos: Vector = new Vector(0, 0, 0);
    const skySize: Vector = new Vector(width, 50, 0);
    this.sky = new Box(skyPos, skySize);

    const beachPos: Vector = new Vector(0, skyPos.y + skySize.y, 0);
    const beachSize: Vector = new Vector(width, 100, 0);
    this.beach = new Box(beachPos, beachSize);

    const sunPos: Vector = new Vector(width / 2, skyPos.y + skySize.y, 0);
    const sunSize: Vector = new Vector(beachSize.y / 2.5, beachSize.y / 2.5, 0);
    this.sun = new Box(sunPos, sunSize);

    const lotPos: Vector = new Vector(0, beachPos.y + beachSize.y, 0);
    const lotSize: Vector = new Vector(
      width,
      height - beachSize.y - skySize.y,
      0
    );

    this.lot = new Box(lotPos, lotSize);
  }

  createCells() {
    for (let i = 0; i < this.numCellsTall; i++) {
      this.cells[i] = [];
      for (let j = 0; j < this.numCellsWide; j++) {
        const cell: ICell = {
          x: j,
          y: i,
          neighbors: [],
          walkable: true,
          breakable: false,
          cost: DEFAULT_COST,
          sprite: null,
        };
        this.cells[i].push(cell);
      }
    }
  }

  strokeCell(cell, color) {
    const y = (this.numCellsTall - 1) * this.cellSize;
    const scale = this.renderer.offset.z;

    this.renderer.ctx.strokeStyle = color;
    this.renderer.ctx.strokeRect(
      (cell.x * this.cellSize - this.renderer.offset.x) * scale,
      (y - cell.y * this.cellSize - this.renderer.offset.y) * scale,
      this.cellSize * scale,
      this.cellSize * scale
    );
  }

  draw() {
    const ctx = this.renderer.ctx;

    const scale = this.renderer.offset.z;
    ctx.fillStyle = "#42bfe8";
    ctx.fillRect(
      (this.sky.pos.x - this.renderer.offset.x) * scale,
      (this.sky.pos.y - this.renderer.offset.y) * scale,
      this.sky.size.x * scale,
      this.sky.size.y * scale
    );

    ctx.beginPath();
    ctx.fillStyle = "#f8f644";
    ctx.arc(
      (this.sun.pos.x - this.renderer.offset.x) * scale,
      (this.sun.pos.y - this.renderer.offset.y) * scale,
      this.sun.size.x * scale,
      0,
      2 * Math.PI
    );
    ctx.fill();

    ctx.fillStyle = "#e3d6b1";
    ctx.fillRect(
      (this.beach.pos.x - this.renderer.offset.x) * scale,
      (this.beach.pos.y - this.renderer.offset.y) * scale,
      this.beach.size.x * scale,
      this.beach.size.y * scale
    );

    ctx.fillStyle = "#bdbdbd";
    ctx.fillRect(
      (this.lot.pos.x - this.renderer.offset.x) * scale,
      (this.lot.pos.y - this.renderer.offset.y) * scale,
      this.lot.size.x * scale,
      this.lot.size.y * scale
    );
  }

  getCell(x, y) {
    return this.cells[y][x];
  }

  getCellForPos(pos: Vector) {
    const x = clamp(
      Math.round(pos.x / this.cellSize),
      0,
      this.numCellsWide - 1
    );
    const y = clamp(
      Math.round(pos.y / this.cellSize),
      0,
      this.numCellsTall - 1
    );

    return this.getCell(x, y);
  }

  selectObstacle(pos: Vector): Sprite {
    const cell = this.getCellForPos(pos);
    console.log(pos, cell);
    if (!cell.breakable) return null;
    return cell.sprite;
  }

  posForCell(cell: ICell) {
    const x = cell.x * this.cellSize;
    const y = cell.y * this.cellSize;
    return new Vector(x, y, 0);
  }

  neighbors(cell) {
    const result = [];
    if (cell.x > 0) {
      const left = this.cells[cell.y][cell.x - 1];
      result.push(left);
    }

    if (cell.x < this.numCellsWide - 1) {
      const right = this.cells[cell.y][cell.x + 1];
      result.push(right);
    }

    if (cell.y < this.numCellsTall - 1) {
      const above = this.cells[cell.y + 1][cell.x];
      result.push(above);
    }

    if (cell.y > 0) {
      const below = this.cells[cell.y - 1][cell.x];
      result.push(below);
    }

    return result;
  }
}
