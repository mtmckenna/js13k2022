// import { AttackState, CircleTargetState } from "./gull_flock_states";
import { DefaultState, SelectObstacleState, UI_INPUTS } from "./ui_states";
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
    // console.log(gullFlock.modeState);
    // if (gullFlock.flockState instanceof AttackState) {
    //   select(this.attackButton);
    //   unselect(this.moveButton);
    // } else if (gullFlock.flockState instanceof CircleTargetState) {
    //   unselect(this.attackButton);
    //   select(this.moveButton);
    // }
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
