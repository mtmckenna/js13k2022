import { Vector, clamp, pointInsideBox } from "./math";
import Renderer from "./renderer";
import Box from "./box";
import Sprite from "./sprite";
import { ICell } from "./interfaces";
import Person from "./person";
import Gull from "./gull";
import PersonFlock from "./person_flock";
import GullFlock from "./gull_flock";
import { COLOR_MAP } from "./blood";
import { IStageProps } from "./stages";
import SafeHouse from "./safe_house";
import Car from "./car";
import Trash from "./trash";
import RallyPoint from "./rally_point";

const DEFAULT_COST = 1;

export default class Stage {
  static BREAKABLE_COST = 3;
  static WALKABLE_COST = 1;
  static RALLY_POINT_COST = 2;
  static CELL_SIZE = 16;

  public bumpables: Sprite[];
  public size: Vector;
  public cells: ICell[][] = [];
  public numCellsTall: number;
  public numCellsWide: number;
  public cellSize = Stage.CELL_SIZE;
  public people: Person[];
  public gulls: Gull[];
  public personFlocks: PersonFlock[];
  public gullFlocks: GullFlock[];
  public availableGulls: Gull[];
  public center: Vector;
  public topLeft: Vector;
  public topCenter: Vector;
  public topRight: Vector;
  public bottomRight: Vector;
  public bottomCenter: Vector;
  public bottomLeft: Vector;
  public selectedFlock: GullFlock;
  public numPeopleSafe = 0;
  public numPeopleKilled = 0;
  public totalNumberOfPeople = 0;
  public cars: Car[];
  public trashCans: Trash[];
  public safeHouse: SafeHouse;
  public index: number;

  private renderer: Renderer;
  private sky: Box;
  private beach: Box;
  private sun: Box;
  private lot: Box;

  constructor(size: Vector) {
    const C = Stage.CELL_SIZE;

    this.size = size;
    this.center = new Vector(
      Math.round(this.size.x / 2),
      Math.round(this.size.y / 2),
      0
    );

    this.topLeft = new Vector(this.size.x / 4, this.size.y - C, 0);
    this.topCenter = new Vector(this.size.x / 2, this.size.y - C, 0);
    this.topRight = new Vector((this.size.x * 3) / 4, this.size.y - C, 0);
    this.bottomRight = new Vector((this.size.x * 3) / 4, 0 + C, 0);
    this.bottomCenter = new Vector(this.size.x / 2, 0 + 2 * C, 0);
    this.bottomLeft = new Vector(this.size.x / 4, 0 + C, 0);

    this.renderer = Renderer.getInstance();

    this.numCellsWide = Math.ceil(this.size.x / this.cellSize);
    this.numCellsTall = Math.ceil(this.size.y / this.cellSize);
    this.createCells();
    this.createBackground();
    this.selectedFlock = null;
  }

  processStageProps(stageProps: IStageProps) {
    this.bumpables = [
      ...stageProps.trashCans,
      ...stageProps.cars,
      stageProps.safeHouse,
    ];
    this.safeHouse = stageProps.safeHouse;
    this.trashCans = stageProps.trashCans;
    this.cars = stageProps.cars;
    this.personFlocks = stageProps.personFlocks;
    this.gulls = stageProps.gulls;
    this.gullFlocks = [];
    this.recalculateAvailableBirds();
    const people = this.personFlocks.flatMap(
      (personFlock) => personFlock.sprites
    );
    this.setPeople(people);
    this.people.forEach((person) => {
      person.safeHouse = this.safeHouse;
    });

    this.index = stageProps.index;
  }

  setPeople(people: Person[]) {
    this.people = people;
    this.totalNumberOfPeople = people.length;
    this.numPeopleKilled = 0;
    this.numPeopleSafe = 0;
  }

  selectFlock(flock: GullFlock) {
    this.gullFlocks.forEach(
      (gullFlock) => (gullFlock.rallyPoint.color = COLOR_MAP.dark_gray)
    );
    this.selectedFlock = flock;
    this.selectedFlock.rallyPoint.color = COLOR_MAP.pink;
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
          hasRallyPoint: false,
        };
        this.cells[i].push(cell);
      }
    }
  }

  get peopleLeft(): number {
    return this.totalNumberOfPeople - this.numPeopleKilled - this.numPeopleSafe;
  }

  recalculateAvailableBirds() {
    const { gulls: allGulls } = this;

    const gullsInFlocks = this.gullFlocks.flatMap(
      (gullFlock) => gullFlock.sprites
    );

    this.availableGulls = allGulls.filter((x) => !gullsInFlocks.includes(x));
  }

  resetRallyPointCosts() {
    this.cells.forEach((cellRow) => {
      cellRow.forEach((cell) => {
        cell.hasRallyPoint = false;
      });
    });

    this.gullFlocks.forEach((gullFlock) => {
      gullFlock.rallyPoint.addToCell();
    });
  }

  personSafe() {
    this.numPeopleSafe++;
  }

  personKilled() {
    this.numPeopleKilled++;
  }

  get percentKilled(): number {
    return this.numPeopleKilled / this.totalNumberOfPeople;
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

  getCellForPos(pos: Vector, floor = false) {
    const rawX = pos.x / this.cellSize;
    const rawY = pos.y / this.cellSize;
    let intX = Math.round(rawX);
    let intY = Math.round(rawY);

    if (floor) {
      intX = Math.floor(rawX);
      intY = Math.floor(rawY);
    }

    const x = clamp(intX, 0, this.numCellsWide - 1);
    const y = clamp(intY, 0, this.numCellsTall - 1);

    return this.getCell(x, y);
  }

  addBird(flock: GullFlock) {
    flock.sprites.push(this.availableGulls.pop());
    this.recalculateAvailableBirds();
  }

  removeBird(flock: GullFlock) {
    if (flock.sprites.length > 0) flock.sprites.pop();
    this.recalculateAvailableBirds();
  }

  posForCell(cell: ICell) {
    const x = cell.x * this.cellSize;
    const y = cell.y * this.cellSize;
    return new Vector(x, y, 0);
  }

  rallyPointForPos(pos: Vector): RallyPoint | null {
    let rallyPoint = null;
    for (let i = 0; i < this.gullFlocks.length; i++) {
      const gullFlock = this.gullFlocks[i];
      const rp = gullFlock.rallyPoint;
      const box = { size: rp.selectSize, pos: rp.selectPos };
      if (pointInsideBox(pos, box)) {
        rallyPoint = rp;
        break;
      }
    }

    return rallyPoint;
  }

  // fillCell(cell, color) {
  //   const y = (this.numCellsTall - 1) * this.cellSize;
  //   const scale = this.renderer.offset.z;

  //   this.renderer.ctx.fillStyle = color;
  //   this.renderer.ctx.fillRect(
  //     (cell.x * this.cellSize - this.renderer.offset.x) * scale,
  //     (y - cell.y * this.cellSize - this.renderer.offset.y) * scale,
  //     this.cellSize * scale,
  //     this.cellSize * scale
  //   );
  // }

  // strokeCell(cell, color) {
  //   const y = (this.numCellsTall - 1) * this.cellSize;
  //   const scale = this.renderer.offset.z;

  //   this.renderer.ctx.strokeStyle = color;
  //   this.renderer.ctx.strokeRect(
  //     (cell.x * this.cellSize - this.renderer.offset.x) * scale,
  //     (y - cell.y * this.cellSize - this.renderer.offset.y) * scale,
  //     this.cellSize * scale,
  //     this.cellSize * scale
  //   );
  // }

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
