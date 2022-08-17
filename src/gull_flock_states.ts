import GullFlock from "./gull_flock";
import Gull from "./Gull";

export class AttackState implements IState<GullFlock, GULL_FLOCK_INPUTS> {
  enter(gullFock: GullFlock) {
    gullFock.sprites.forEach((gull: Gull) => gull.attack());
  }

  exit() {
    return;
  }

  handleInput(gullFlock: GullFlock, input: GULL_FLOCK_INPUTS) {
    let state = null;

    switch (input) {
      case GULL_FLOCK_INPUTS.ATTACK:
        state = this; // eslint-disable-line
        break;
      case GULL_FLOCK_INPUTS.CIRCLE_TARGET:
        state = new CircleTargetState();
        state.enter(gullFlock);
        break;
      default:
        state = this; // eslint-disable-line
    }

    gullFlock.modeState = state;

    return state;
  }
}

export class CircleTargetState implements IState<GullFlock, GULL_FLOCK_INPUTS> {
  enter(gullFock: GullFlock) {
    gullFock.sprites.forEach((gull: Gull) => gull.circleTarget());
  }

  exit() {
    return;
  }

  handleInput(gullFlock: GullFlock, input: GULL_FLOCK_INPUTS) {
    let state = null;

    switch (input) {
      case GULL_FLOCK_INPUTS.ATTACK:
        state = new AttackState();
        state.enter(gullFlock);
        break;
      case GULL_FLOCK_INPUTS.CIRCLE_TARGET:
        state = this; // eslint-disable-line
        break;
      default:
        state = this; // eslint-disable-line
    }

    // don't love setting modeState here
    gullFlock.modeState = state;
    // console.log("HI", st);

    return state;
  }
}

// TODO: make this generic for diff types of states?
export interface IState<BThing, BInputEnum> {
  enter: (thing: BThing) => void;
  exit: (thing: BThing) => void;
  handleInput: (
    thing: BThing,
    inputs: BInputEnum
  ) => IState<BThing, BInputEnum>;
}

export enum GULL_FLOCK_INPUTS {
  ATTACK = "ATTACK",
  CIRCLE_TARGET = "CIRCLE_TARGET",
}

// ModeState
// SelectState
