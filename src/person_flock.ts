import Person from "./person";
import Flock from "./flock";
import { Vector } from "./math";
import SafeHouse from "./safe_house";
import { PERSON_FLOCK_INPUTS, CalmState } from "./person_flock_states";
import { IState } from "./interfaces";

export default class PersonFlock extends Flock {
  fearDistance: number;
  safeHouse: SafeHouse;
  modeState: IState<PersonFlock, PERSON_FLOCK_INPUTS>;

  constructor(people: Person[], safeHouse: SafeHouse) {
    super(people);
    this.fearDistance = 120;
    this.safeHouse = safeHouse;
    this.modeState = new CalmState();
  }

  panic(pos: Vector) {
    this.modeState.handleInput(this, PERSON_FLOCK_INPUTS.PANIC);
    this.sprites.forEach((sprite: Person) => {
      sprite.scare(pos);
    });
  }

  calm() {
    this.modeState.handleInput(this, PERSON_FLOCK_INPUTS.CALM);
    this.sprites.forEach((sprite: Person) => {
      sprite.afraid = false;
    });
  }
}
