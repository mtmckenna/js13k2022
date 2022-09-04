import Stage from "./stage";
import {
  Damagable,
  Drawable,
  ImageCache,
  Updatable,
  ICell,
} from "./interfaces";
import { Vector, randomIntBetween, overlaps, clamp } from "./math";
import Renderer from "./renderer";
import SpriteAnimation from "./sprite_animation";

export default class Sprite implements Drawable, Updatable, Damagable {
  public static imageCache: ImageCache = {};
  public static MAX_HEALTH = 100;
  public renderer: Renderer;

  pos: Vector;
  oldPos: Vector;
  vel: Vector;
  acc: Vector;
  originalSize: Vector;
  size: Vector;
  debugColor: string;
  name: string;
  imageDataUrl: string;
  numFrames: number;
  timeOffset: number;
  zoom: Vector;
  health = Sprite.MAX_HEALTH;
  lastDamagedAt = 0;
  damageProtectionTimeDelta = 50;
  id: string;
  stage: Stage;
  spriteAnimations: { [key: string]: SpriteAnimation };
  currentAnimation: SpriteAnimation;
  dead = false;
  canBump = false;
  numCellsAcross = 1;
  numCellsDown = 1;
  unwalkable: ICell[] = [];

  private _currentFrame: number;
  private _center: Vector = new Vector(0, 0, 0);

  constructor(props: ISpriteProps) {
    this.name = props.name;
    this.pos = props.pos;
    this.oldPos = props.pos;
    this.vel = new Vector(0, 0, 0);
    this.acc = new Vector(0, 0, 0);
    this.size = props.size;
    this.originalSize = props.originalSize;
    this.debugColor = props.debugColor;
    this.imageDataUrl = props.imageDataUrl;
    this.cacheImage();
    this._currentFrame = 0;
    this.numFrames = props.numFrames;
    this.renderer = Renderer.getInstance();
    this.timeOffset = randomIntBetween(0, 999999999);
    this.zoom = this.size.copy().mult(this.originalSize);
    this.id = crypto.randomUUID();
    this.stage = props.stage;
    this.spriteAnimations = props.spriteAnimations;
    this.changeAnimation(this.spriteAnimations.default);
  }

  get image() {
    return Sprite.imageCache[this.name];
  }

  changeAnimation(nextAnimation: SpriteAnimation) {
    this.currentAnimation = nextAnimation;
  }

  updateCurrentFrame(time: number) {
    const numFrames = this.currentAnimation.numFrames;
    const offset = this.currentAnimation.offset;
    const animationSpeed = this.currentAnimation.speed;
    if (!(time % animationSpeed)) {
      this._currentFrame = offset + ((this._currentFrame + 1) % numFrames);
    }
  }

  get currentFrame() {
    return this._currentFrame;
  }

  get center() {
    this._center.set(
      this.pos.x + this.size.x / 2,
      this.pos.y - this.size.y / 2,
      this.pos.z
    );
    return this._center;
  }

  private cacheImage() {
    if (!this.imageDataUrl) return;
    const image = new Image();
    image.src = this.imageDataUrl;
    Sprite.imageCache[this.name] = image;
  }

  update(t: number) {
    for (let i = 0; i < this.stage.bumpables.length; i++) {
      const bumpable = this.stage.bumpables[i];

      if (this.canBump && overlaps(this, bumpable)) {
        this.vel.add(this.pos).sub(bumpable.center).normalize();
        this.acc.set(0, 0, 0);
      }
    }

    this.pos.add(this.vel);
    this.vel.add(this.acc);
    this.acc.set(0, 0, 0);
  }

  draw(t: number) {
    if (t < this.lastDamagedAt + this.damageProtectionTimeDelta) return;
    this.renderer.draw(this);
  }

  setOverlappingCellsWalkability(walkable = false) {
    for (let i = 0; i < this.unwalkable.length; i++) {
      // this.unwalkable[i].walkable = true;
    }

    this.unwalkable = [];

    const mainCell = this.stage.getCellForPos(this.pos);
    // console.log("main", this.name, this.pos, mainCell);
    const numCellsAcross = clamp(
      Math.floor(this.size.x / this.stage.cellSize),
      1,
      this.stage.numCellsWide
    );
    const numCellsDown = clamp(
      Math.floor(this.size.y / this.stage.cellSize),
      1,
      this.stage.numCellsWide
    );

    for (let i = 0; i < numCellsAcross; i++) {
      for (let j = 0; j < numCellsDown; j++) {
        const cell = this.stage.getCell(mainCell.x + i, mainCell.y - j);
        cell.walkable = false;
        this.unwalkable.push(cell);
      }
    }

    // console.log(this.name, this.unwalkable.length, this.unwalkable);
    // console.log(
    //   "unwalkable",
    //   this.name,
    //   this.unwalkable,
    //   numCellsAcross,
    //   numCellsDown
    // );
  }

  edgesMirror() {
    if (this.pos.x > this.stage.size.x) this.pos.x = 0;
    if (this.pos.x < 0) this.pos.x = this.stage.size.x;
    if (this.pos.y > this.stage.size.y) this.pos.y = 0;
    if (this.pos.y < 0) {
      this.pos.y = this.stage.size.y;
    }
  }

  edgesMirror2() {
    if (this.pos.x + this.size.x >= this.stage.size.x) {
      this.pos.x = this.stage.size.x - this.size.x - 1;
      this.acc.x = -1 * Math.abs(this.acc.x);
      this.vel.x = -1 * Math.abs(this.vel.x);
    }
    if (this.pos.x < 0) {
      this.pos.x = 1;
      this.acc.x = Math.abs(this.acc.x);
      this.vel.x = Math.abs(this.vel.x);
    }

    if (this.pos.y + this.size.y >= this.stage.size.y) {
      this.pos.y = this.stage.size.y - this.size.y - 1;
      this.acc.y = Math.abs(this.acc.y);
      this.vel.y = Math.abs(this.vel.y);
    }

    if (this.pos.y - this.size.y <= 0) {
      this.pos.y = this.size.y + 1;
      this.acc.y = -Math.abs(this.acc.y);
      this.vel.y = -Math.abs(this.vel.y);
    }
  }
}

export interface ISpriteProps {
  name: string;
  pos: Vector;
  size: Vector;
  originalSize: Vector;
  imageDataUrl?: string;
  numFrames: number;
  debugColor: string;
  stage: Stage;
  spriteAnimations: {
    [key: string]: SpriteAnimation;
    default: SpriteAnimation;
  };
}
