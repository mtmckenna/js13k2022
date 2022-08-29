import Person from "./person";
import Flock from "./flock";
import { Vector } from "./math";
import SafeHouse from "./safe_house";

export default class PersonFlock extends Flock {
  afraid: boolean;
  fearDistance: number;
  safeHouse: SafeHouse;

  constructor(people: Person[], safeHouse: SafeHouse) {
    super(people);
    this.fearDistance = 120;
    this.safeHouse = safeHouse;
  }

  flipOut(pos: Vector) {
    this.afraid = true;
    this.sprites.forEach((sprite: Person) => {
      sprite.scare(pos);
      sprite.thingToCohere = this.safeHouse.pos;
    });
  }
}
