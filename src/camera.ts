import { Vector } from "./math";

export default class Camera {
  pos: Vector;
  speed = 3;

  constructor(pos: Vector = new Vector(0, 0, 1)) {
    this.pos = pos;
  }

  moveBy(horizontal = 0, veritcal = 0, zoom = 0) {
    this.pos.set(
      this.pos.x + horizontal * this.speed,
      this.pos.y + veritcal * this.speed,
      this.pos.z + zoom
    );
  }
}
