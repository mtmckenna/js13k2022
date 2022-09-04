import Person from "./person";
import Flock from "./flock";
import { Vector } from "./math";
import { PERSON_FLOCK_INPUTS, CalmState } from "./person_flock_states";
import { Flockable, IState } from "./interfaces";

export default class PersonFlock extends Flock implements Flockable {
  fearDistance: number;
  modeState: IState<PersonFlock, PERSON_FLOCK_INPUTS>;
  sprites: Person[];

  constructor(people: Person[]) {
    super(people);
    this.fearDistance = 120;
    this.modeState = new CalmState();
  }

  flock() {
    for (let i = 0; i < this.sprites.length; i++) {
      const sprite = this.sprites[i];
      sprite.flock(this.sprites);
    }
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
