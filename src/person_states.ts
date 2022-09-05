import { IState } from "./interfaces";
import Person from "./person";

export class PanicState implements IState<Person, PERSON_INPUTS> {
  handleInput(person: Person, input: PERSON_INPUTS) {
    let state = null;

    switch (input) {
      case PERSON_INPUTS.PANIC:
        state = this; // eslint-disable-line
        break;
      case PERSON_INPUTS.CALM:
        state = new CalmState();
        break;
      default:
        state = this; // eslint-disable-line
    }

    person.modeState = state;

    return state;
  }
}

export class CalmState implements IState<Person, PERSON_INPUTS> {
  handleInput(person: Person, input: PERSON_INPUTS) {
    let state = null;

    switch (input) {
      case PERSON_INPUTS.PANIC:
        state = new CalmState();
        state = this; // eslint-disable-line
        break;
      case PERSON_INPUTS.CALM:
        state = this; // eslint-disable-line
        break;
      default:
        state = this; // eslint-disable-line
    }

    person.modeState = state;

    return state;
  }
}

export enum PERSON_INPUTS {
  CALM = "CALM",
  PANIC = "PANIC",
}
