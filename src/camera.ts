import { Vector } from "./math";

export default class Camera {
  pos: Vector;

  speed = 5;

  constructor(pos: Vector = new Vector(0, 0, 1)) {
    this.pos = pos;
  }
}
