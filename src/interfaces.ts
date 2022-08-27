import { Vector } from "./math";
import Blood from "./blood";

export interface Drawable {
  pos: Vector;
  draw: () => void;
}

export interface Updatable {
  update: (t: number) => void;
}

export interface ImageCache {
  [key: string]: HTMLImageElement;
}

export interface IBox {
  pos: Vector;
  size: Vector;
}

export interface Bleedable {
  lastBleedAt: number;
  bleeding: boolean;
  dead: boolean;
  bloods: Blood[];
  maxBleedBloods: number;
  maxDeathBloods: number;
  bloodTimeDelta: number;
  bleed: () => void;
  die: () => void;
}
