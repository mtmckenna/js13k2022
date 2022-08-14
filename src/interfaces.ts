import { Vector } from "./math";

export interface Drawable {
  pos: Vector;
  draw();
}

export interface ImageCache {
  [key: string]: HTMLImageElement;
}

export interface IBox {
  pos: Vector;
  size: Vector;
}
