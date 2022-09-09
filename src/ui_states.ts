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

  handleInput(ui: Ui, input: UI_INPUTS) {
    let state = null;

    switch (input) {
      case UI_INPUTS.DEFAULT:
        state = new DefaultState();
        break;
      case UI_INPUTS.ATTACK:
        state = this; // eslint-disable-line
        break;
      case UI_INPUTS.SELECT_OBSTACLE:
        state = new SelectObstacleState();
        break;
      default:
        state = this; // eslint-disable-line
    }

    ui.state = state;
    return state;
  }
}

export class SelectObstacleState implements IState<Ui, UI_INPUTS> {
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
}
