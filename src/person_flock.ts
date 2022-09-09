import Person from "./person";
import Flock from "./flock";

export default class PersonFlock extends Flock {
  sprites: Person[];

  constructor(people: Person[]) {
    super(people);
  }
}
