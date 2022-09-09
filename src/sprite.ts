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
import Blood, { COLOR_MAP } from "./blood";
import BloodSystem from "./blood_system";

const bloodSystem = BloodSystem.getInstance();

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
  bloods: Blood[] = [];
  bloodColor = COLOR_MAP.red;
  name: string;
  imageDataUrl: string;
  numFrames: number;
  timeOffset: number;
  zoom: Vector;
  health = Sprite.MAX_HEALTH;
  lastDamagedAt = 0;
  damageProtectionTimeDelta = 50;
  maxDeathBloods = 50;
  id: string;
  stage: Stage;
  spriteAnimations: { [key: string]: SpriteAnimation };
  currentAnimation: SpriteAnimation;
  dead = false;
  canBump = false;
  canBreak = false;
  canMove = false;
  numCellsAcross = 1;
  numCellsDown = 1;
  unwalkable: ICell[] = [];
  breakable: ICell[] = [];
  startOffset = 0;
  direction: "left" | "right" = "right";

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

  get clampedNumCellsAcross() {
    return clamp(
      Math.floor(this.size.x / this.stage.cellSize),
      1,
      this.stage.numCellsWide
    );
  }

  get clampedNumCellsDown() {
    return clamp(
      Math.floor(this.size.y / this.stage.cellSize),
      1,
      this.stage.numCellsWide
    );
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

  damage(amount: number, t: number) {
    if (t < this.lastDamagedAt + this.damageProtectionTimeDelta) return;
    this.health = Math.max(0, this.health - amount);

    for (let i = 0; i < Math.floor(amount); i++) {
      this.bloods.push(bloodSystem.regenBlood(this, this.bloodColor));
    }

    this.lastDamagedAt = t;
  }

  update(t: number) {
    if (!this.canMove) return;

    for (let i = 0; i < this.stage.bumpables.length; i++) {
      const bumpable = this.stage.bumpables[i];

      if (this.canBump && overlaps(this, bumpable)) {
        this.vel.mult(-1);
        this.vel.add(this.center).sub(bumpable.center).normalize();
        this.acc.set(0, 0, 0);
      }
    }

    this.pos.add(this.vel);
    this.vel.add(this.acc);
    this.acc.set(0, 0, 0);

    if (this.vel.x > 0) {
      this.direction = "right";
    } else if (this.vel.x < 0) {
      this.direction = "left";
    }
  }

  die() {
    if (this.dead) return;
    this.dead = true;
    for (let i = 0; i < this.maxDeathBloods; i++) {
      this.bloods.push(bloodSystem.regenBlood(this, this.bloodColor));
    }
  }

  draw(t: number) {
    if (t < this.lastDamagedAt + this.damageProtectionTimeDelta) return;
    this.renderer.draw(this);
  }

  setOverlappingCellsWalkability(walkable = false, breakable = false) {
    this.unwalkable = [];
    this.breakable = [];
    const mainCell = this.stage.getCellForPos(this.pos);
    this.setCell(mainCell, walkable, breakable);
  }

  setCell(mainCell: ICell, walkable = false, breakable = false) {
    for (let i = 0; i < this.clampedNumCellsAcross; i++) {
      for (let j = 0; j < this.clampedNumCellsDown; j++) {
        const cell = this.stage.getCell(mainCell.x + i, mainCell.y - j);

        cell.cost = Stage.WALKABLE_COST;
        cell.walkable = walkable;
        cell.breakable = breakable;
        cell.sprite = this;
      }
    }
  }

  edgesMirror() {
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
  stage: Stage;
  spriteAnimations: {
    [key: string]: SpriteAnimation;
    default: SpriteAnimation;
  };
}
