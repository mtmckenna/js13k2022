import Person from "./person";
import Flock from "./flock";
import { Vector } from "./math";

export default class PersonFlock extends Flock {
  afraid: boolean;
  fearDistance: number;

  constructor(people: Person[]) {
    super(people);
    this.fearDistance = 120;
  }

  flipOut(pos: Vector) {
    this.afraid = true;
    this.sprites.forEach((sprite: Person) => {
      const scareAmount = 100;
      sprite.scare(pos, scareAmount);
    });
  }
}
