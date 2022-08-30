import { IState } from "./interfaces";
import PersonFlock from "./person_flock";

export class PanicState implements IState<PersonFlock, PERSON_FLOCK_INPUTS> {
  handleInput(personFlock: PersonFlock, input: PERSON_FLOCK_INPUTS) {
    let state = null;

    switch (input) {
      case PERSON_FLOCK_INPUTS.PANIC:
        state = this; // eslint-disable-line
        break;
      case PERSON_FLOCK_INPUTS.CALM:
        state = new CalmState();
        break;
      default:
        state = this; // eslint-disable-line
    }

    personFlock.modeState = state;

    return state;
  }
}

export class CalmState implements IState<PersonFlock, PERSON_FLOCK_INPUTS> {
  handleInput(personFlock: PersonFlock, input: PERSON_FLOCK_INPUTS) {
    let state = null;

    switch (input) {
      case PERSON_FLOCK_INPUTS.PANIC:
        state = new CalmState();
        state = this; // eslint-disable-line
        break;
      case PERSON_FLOCK_INPUTS.CALM:
        state = this; // eslint-disable-line
        break;
      default:
        state = this; // eslint-disable-line
    }

    personFlock.modeState = state;

    return state;
  }
}

export enum PERSON_FLOCK_INPUTS {
  CALM = "CALM",
  PANIC = "PANIC",
}
