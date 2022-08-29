import { Vector } from "./math";
import Blood from "./blood";
import Renderer from "./renderer";

export interface Drawable {
  pos: Vector;
  draw: (t: number) => void;
  renderer: Renderer;
}

export interface Damagable {
  lastDamagedAt: number;
  health: number;
  damageProtectionTimeDelta: number;
  dead: boolean;
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
  bloods: Blood[];
  maxBleedBloods: number;
  maxDeathBloods: number;
  bloodTimeDelta: number;
  bleed: () => void;
  die: () => void;
}
