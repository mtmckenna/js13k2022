import { IState } from "./interfaces";
import Ui from "./ui";

export class DefaultState implements IState<Ui, UI_INPUTS> {
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
      case UI_INPUTS.SELECT_OBSTACLE:
        state = new SelectObstacleState();
        state.enter(ui);
        break;
      case UI_INPUTS.CREATE_FLOCK:
        state = new CreateFlockState();
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
    const { people, gulls } = ui.stage;
    people.forEach((person) => person.scare());
    gulls.forEach((gull) => gull.attack());
  }

  // once in the attack state, no going back
  handleInput(ui: Ui, input: UI_INPUTS) {
    return this;
  }
}

export class SelectObstacleState implements IState<Ui, UI_INPUTS> {
  enter(ui: Ui) {
    console.log("select");
  }

  handleInput(ui: Ui, input: UI_INPUTS) {
    let state = null;

    switch (input) {
      case UI_INPUTS.DEFAULT:
        state = new DefaultState();
        break;
      case UI_INPUTS.ATTACK:
        state = new AttackState();
        break;
      case UI_INPUTS.SELECT_OBSTACLE:
        state = this; // eslint-disable-line
        break;
      case UI_INPUTS.CREATE_FLOCK:
        state = new CreateFlockState();
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
    console.log("create flock");
  }

  handleInput(ui: Ui, input: UI_INPUTS) {
    let state = null;

    switch (input) {
      case UI_INPUTS.DEFAULT:
        state = new DefaultState();
        break;
      case UI_INPUTS.ATTACK:
        state = new AttackState();
        break;
      case UI_INPUTS.SELECT_OBSTACLE:
        state = new SelectObstacleState(); // eslint-disable-line
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
  SELECT_OBSTACLE = "SELECT_OBSTACLE",
  MOVE_OBSTACLE = "MOVE_OBSTACLE",
  CREATE_FLOCK = "CREATE_FLOCK",
}
