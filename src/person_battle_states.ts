import { IState } from "./interfaces";
import Person from "./person";

export class FightState implements IState<Person, PERSON_FIGHT_INPUTS> {
  handleInput(person: Person, input: PERSON_FIGHT_INPUTS) {
    let state = null;

    switch (input) {
      case PERSON_FIGHT_INPUTS.FIGHT:
        fight(person);
        state = this; // eslint-disable-line
        break;
      case PERSON_FIGHT_INPUTS.PEACE:
        state = new PeaceState();
        break;
      default:
        state = this; // eslint-disable-line
    }

    return state;
  }
}

export class PeaceState implements IState<Person, PERSON_FIGHT_INPUTS> {
  handleInput(person: Person, input: PERSON_FIGHT_INPUTS) {
    let state = null;

    switch (input) {
      case PERSON_FIGHT_INPUTS.FIGHT:
        fight(person);
        state = new FightState();
        break;
      case PERSON_FIGHT_INPUTS.PEACE:
        state = this; // eslint-disable-line
        break;
      default:
        state = this; // eslint-disable-line
    }

    return state;
  }
}

function fight(person: Person) {
  if (person.direction === "left") {
    person.changeAnimation(person.spriteAnimations["punch_left"]);
  } else if (person.direction === "right") {
    person.changeAnimation(person.spriteAnimations["punch_right"]);
  }
}

export enum PERSON_FIGHT_INPUTS {
  FIGHT = "FIGHT",
  PEACE = "PEACE",
}
