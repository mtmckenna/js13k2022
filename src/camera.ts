import { Vector } from "./math";

export default class Camera {
  pos: Vector;

  speed = 5;

  constructor(pos: Vector = new Vector(0, 0, 1)) {
    this.pos = pos;
  }

  moveBy(horizontal = 0, veritcal = 0, zoom = 0) {
    this.pos.set(
      this.pos.x + horizontal,
      this.pos.y + veritcal,
      this.pos.z + zoom
    );
  }

  moveTo(horizontal: number, veritcal: number, zoom: number) {
    this.pos.set(horizontal, veritcal, zoom);
  }
}
