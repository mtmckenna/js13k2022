import { Vector } from "./math";
import Renderer from "./renderer";
import Sprite from "./sprite";

// TODO: make this generic for diff types of states?
export interface IState<BThing, BInputEnum> {
  enter?: (thing: BThing) => void;
  exit?: (thing: BThing) => void;
  handleInput: (
    thing: BThing,
    inputs: BInputEnum
  ) => IState<BThing, BInputEnum>;
}

export enum GAME_STATES {
  TITLE = "TITLE",
  PLAYING = "PLAYING",
  WAITING_FOR_RETRY = "WAITING_FOR_RETRY",
  WAITING_FOR_NEXT = "WAITING_FOR_NEXT",
  WON = "WON",
}

export interface Drawable {
  pos: Vector;
  draw: (t: number) => void;
  renderer: Renderer;
}

export interface ICell {
  x: number;
  y: number;
  neighbors: ICell[];
  walkable: boolean;
  breakable: boolean;
  cost: number;
  sprite: Sprite;
  hasRallyPoint: boolean;
  id: string;
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

export interface Flockable {
  flock: (sprites: Sprite[]) => void;
}

export interface ICellHash {
  [key: string]: ICell;
}

export interface ICellIdHash {
  [key: string]: string;
}
