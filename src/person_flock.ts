import Person from "./person";
import Flock from "./flock";
import { Vector } from "./math";
import { PERSON_FLOCK_INPUTS, CalmState } from "./person_flock_states";
import { IState } from "./interfaces";

export default class PersonFlock extends Flock {
  fearDistance: number;
  modeState: IState<PersonFlock, PERSON_FLOCK_INPUTS>;

  constructor(people: Person[]) {
    super(people);
    this.fearDistance = 120;
    this.modeState = new CalmState();
  }

  panic(pos: Vector) {
    this.modeState.handleInput(this, PERSON_FLOCK_INPUTS.PANIC);
    this.sprites.forEach((sprite: Person) => {
      sprite.scare(pos);
    });
    this.sprites = [];
  }

  calm() {
    this.modeState.handleInput(this, PERSON_FLOCK_INPUTS.CALM);
    this.sprites.forEach((sprite: Person) => {
      sprite.afraid = false;
    });
  }
}
