import Stage from "./stage";
import { Drawable, ImageCache } from "./interfaces";
import { Vector, randomIntBetween } from "./math";
import Renderer from "./renderer";
import SpriteAnimation from "./sprite_animation";

export default class Sprite implements Drawable {
  public static imageCache: ImageCache = {};
  public renderer: Renderer;

  pos: Vector;
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
  id: string;
  stage: Stage;
  spriteAnimations: { [key: string]: SpriteAnimation };
  currentAnimation: SpriteAnimation;

  private _currentFrame: number;

  constructor(props: ISpriteProps) {
    this.name = props.name;
    this.pos = props.pos;
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

  private cacheImage() {
    const image = new Image();
    image.src = this.imageDataUrl;
    Sprite.imageCache[this.name] = image;
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);

    this.acc.set(0, 0, 0);
  }

  draw() {
    this.renderer.draw(this);
  }

  edgesMirror() {
    if (this.pos.x > this.stage.size.x) this.pos.x = 0;
    if (this.pos.x < 0) this.pos.x = this.stage.size.x;
    if (this.pos.y > this.stage.size.y) this.pos.y = 0;
    if (this.pos.y < 0) this.pos.y = this.stage.size.y;
  }

  edgesMirror2() {
    if (this.pos.x > this.stage.size.x) {
      this.pos.x = this.stage.size.x - 1;
      this.acc.x = -1 * Math.abs(this.acc.x);
      this.vel.x = -1 * Math.abs(this.vel.x);
    }
    if (this.pos.x < 0) {
      this.pos.x = 1;
      this.acc.x = Math.abs(this.acc.x);
      this.vel.x = Math.abs(this.vel.x);
    }

    if (this.pos.y > this.stage.size.y) {
      this.pos.y = this.stage.size.y - 1;
      this.acc.y = -1 * Math.abs(this.acc.y);
      this.vel.y = -1 * Math.abs(this.vel.y);
    }

    if (this.pos.y < 0) {
      this.pos.y = 1;
      this.acc.y = Math.abs(this.acc.y);
      this.vel.y = Math.abs(this.vel.y);
    }
  }
}

export interface ISpriteProps {
  name: string;
  pos: Vector;
  size: Vector;
  originalSize: Vector;
  imageDataUrl: string;
  numFrames: number;
  debugColor: string;
  stage: Stage;
  spriteAnimations: {
    [key: string]: SpriteAnimation;
    default: SpriteAnimation;
  };
}
