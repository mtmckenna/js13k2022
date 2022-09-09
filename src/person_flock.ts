import Person from "./person";
import Flock from "./flock";

export default class PersonFlock extends Flock {
  sprites: Person[];

  constructor(people: Person[]) {
    super(people);
  }

  // flock() {
  //   for (let i = 0; i < this.sprites.length; i++) {
  //     const sprite = this.sprites[i];
  //     sprite.flock(this.sprites);
  //   }
  // }
}
