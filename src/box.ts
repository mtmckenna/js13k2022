import { IBox } from "./interfaces";
import { Vector } from "./math";

export default class Box implements IBox {
  size: Vector;
  pos: Vector;

  constructor(pos: Vector, size: Vector) {
    this.pos = pos;
    this.size = size;
  }
}
