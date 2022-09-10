import {
  AttackState,
  DefaultState,
  SelectObstacleState,
  UI_INPUTS,
} from "./ui_states";
import { IState } from "./interfaces";
import Stage from "./stage";

export default class Ui {
  private static instance: Ui;

  attackButton: HTMLButtonElement;
  moveButton: HTMLButtonElement;
  state: IState<Ui, UI_INPUTS>;
  public stage: Stage;

  public static getInstance(): Ui {
    if (!Ui.instance) Ui.instance = new Ui();
    return Ui.instance;
  }

  createUi(stage: Stage) {
    this.state = new DefaultState();
    this.stage = stage;

    const uiWrapper = document.getElementById("ui-wrapper");
    const attack = createButton("Attack", uiWrapper, []);
    const move = createButton("Move obstacle", uiWrapper, []);

    // attack.addEventListener("click", gullFlock.attack.bind(gullFlock));
    attack.addEventListener("click", () =>
      this.state.handleInput(this, UI_INPUTS.ATTACK)
    );
    move.addEventListener("click", () =>
      this.state.handleInput(this, UI_INPUTS.SELECT_OBSTACLE)
    );

    this.attackButton = attack;
    this.moveButton = move;
  }

  update() {
    this.updateCursor();
    this.updateAttackButton();
    this.updateMoveObstacleButton();
  }

  updateAttackButton() {
    if (this.state instanceof DefaultState) {
      enable(this.attackButton);
    } else {
      disable(this.attackButton);
    }
  }

  updateMoveObstacleButton() {
    if (this.state instanceof AttackState) {
      disable(this.moveButton);
    } else {
      enable(this.moveButton);
    }
  }

  updateCursor() {
    if (this.state instanceof DefaultState) {
      document.body.style.cursor = "default";
    } else if (this.state instanceof SelectObstacleState) {
      document.body.style.cursor = "grab";
    } else {
      document.body.style.cursor = "default";
    }
  }
}

export function hide(node) {
  node.classList.add("hide");
}

export function show(node) {
  node.classList.remove("hide");
}

export function select(node) {
  node.classList.add("selected");
}

export function disable(node) {
  if (node.disabled == true) return;
  node.disabled = true;
}

export function enable(node) {
  if (node.disabled == false) return;
  node.disable = false;
}

export function unselect(node) {
  node.classList.remove("selected");
}

export function createButton(text, node, classes = []) {
  const elt = document.createElement("button");
  elt.innerText = text;
  elt.classList.add(...classes);
  node.appendChild(elt);
  return elt;
}
