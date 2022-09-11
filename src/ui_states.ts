import GullFlock from "./gull_flock";
import { IState } from "./interfaces";
import { randomIntBetween, Vector } from "./math";
import RallyPoint from "./rally_point";
import Ui from "./ui";

export class DefaultState implements IState<Ui, UI_INPUTS> {
  enter(ui: Ui) {
    ui.stage.gullFlocks = ui.stage.gullFlocks.filter(
      (flock) => flock.sprites.length > 0
    );
  }

  handleInput(ui: Ui, input: UI_INPUTS) {
    let state = null;

    switch (input) {
      case UI_INPUTS.DEFAULT:
        state = this; // eslint-disable-line

        break;
      case UI_INPUTS.ATTACK:
        state = new AttackState();
        state.enter(ui);
        break;
      case UI_INPUTS.CREATE_FLOCK:
        state = new CreateFlockState();
        state.enter(ui);
        break;
      default:
        state = this; // eslint-disable-line
    }

    ui.state = state;
    return state;
  }
}

export class AttackState implements IState<Ui, UI_INPUTS> {
  enter(ui: Ui) {
    const { people } = ui.stage;
    people.forEach((person) => (person.canBump = false));
  }

  // once in the attack state, no going back
  handleInput(ui: Ui, input: UI_INPUTS) {
    let state = null;

    switch (input) {
      // Only going to have the default state in here for resetting the game
      case UI_INPUTS.DEFAULT:
        state = new DefaultState(); // eslint-disable-line
        break;
      default:
        state = this; // eslint-disable-line
    }

    ui.state = state;
    return state;
  }
}

export class CreateFlockState implements IState<Ui, UI_INPUTS> {
  enter(ui: Ui) {
    const pos = new Vector(
      randomIntBetween(ui.stage.size.x / 4, (3 * ui.stage.size.x) / 4),
      randomIntBetween(ui.stage.size.y / 4, (3 * ui.stage.size.y) / 4),
      0
    );

    const rallyPoint = new RallyPoint(new Vector(pos.x, pos.y, 0), ui.stage);
    const flock = new GullFlock([], rallyPoint);
    ui.stage.gullFlocks.push(flock);
    ui.stage.selectFlock(flock);
    ui.stage.resetRallyPointCosts();
  }

  handleInput(ui: Ui, input: UI_INPUTS) {
    let state = null;

    switch (input) {
      case UI_INPUTS.DEFAULT:
        state = new DefaultState();
        state.enter(ui);

        break;
      case UI_INPUTS.ATTACK:
        state = new AttackState();
        state.enter(ui);

        break;
      case UI_INPUTS.CREATE_FLOCK:
        state = this; // eslint-disable-line
        break;
      default:
        state = this; // eslint-disable-line
    }

    ui.state = state;
    return state;
  }
}

export enum UI_INPUTS {
  DEFAULT = "DEFAULT",
  ATTACK = "ATTACK",
  CREATE_FLOCK = "CREATE_FLOCK",
}
