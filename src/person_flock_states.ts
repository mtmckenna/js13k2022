import { IState } from "./interfaces";
import Person from "./person";
import PersonFlock from "./person_flock";

export class PanicState implements IState<PersonFlock, PERSON_FLOCK_INPUTS> {
  enter(personFlock: PersonFlock) {
    personFlock.sprites.forEach((person: Person) => {
      person.flockState = this;
    });
  }

  handleInput(personFlock: PersonFlock, input: PERSON_FLOCK_INPUTS) {
    let state = null;

    switch (input) {
      case PERSON_FLOCK_INPUTS.PANIC:
        state = this; // eslint-disable-line
        state.enter(personFlock);
        break;
      case PERSON_FLOCK_INPUTS.CALM:
        state = new CalmState();
        state.enter(personFlock);
        break;
      default:
        state = this; // eslint-disable-line
    }

    personFlock.flockState = state;

    return state;
  }
}

export class CalmState implements IState<PersonFlock, PERSON_FLOCK_INPUTS> {
  enter(personFlock: PersonFlock) {
    personFlock.sprites.forEach((person: Person) => {
      person.flockState = this;
    });
  }

  handleInput(personFlock: PersonFlock, input: PERSON_FLOCK_INPUTS) {
    let state = null;

    switch (input) {
      case PERSON_FLOCK_INPUTS.PANIC:
        state = new PanicState();
        state.enter(personFlock);
        break;
      case PERSON_FLOCK_INPUTS.CALM:
        state = this; // eslint-disable-line
        state.enter(personFlock);

        break;
      default:
        state = this; // eslint-disable-line
    }

    personFlock.flockState = state;

    return state;
  }
}

export enum PERSON_FLOCK_INPUTS {
  CALM = "CALM",
  PANIC = "PANIC",
}
