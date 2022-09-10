import {
  AttackState,
  CreateFlockState,
  DefaultState,
  UI_INPUTS,
} from "./ui_states";
import { IState } from "./interfaces";
import Stage from "./stage";

export default class Ui {
  private static instance: Ui;

  attackButton: HTMLButtonElement;
  createFlockButton: HTMLButtonElement;
  addBirdButton: HTMLButtonElement;
  removeBirdButton: HTMLButtonElement;
  doneWithFlock: HTMLButtonElement;
  disperseFlockButton: HTMLButtonElement;

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
    const createFlock = createButton("Create flock", uiWrapper, []);
    const addBird = createButton("Add bird", uiWrapper, []);
    const removeBird = createButton("Remove bird", uiWrapper, []);
    const disperse = createButton("Disperse flock", uiWrapper, []);
    const done = createButton("Done", uiWrapper, []);

    attack.addEventListener("click", () =>
      this.state.handleInput(this, UI_INPUTS.ATTACK)
    );

    createFlock.addEventListener("click", () =>
      this.state.handleInput(this, UI_INPUTS.CREATE_FLOCK)
    );

    done.addEventListener("click", () =>
      this.state.handleInput(this, UI_INPUTS.DEFAULT)
    );

    this.attackButton = attack;
    this.createFlockButton = createFlock;
    this.addBirdButton = addBird;
    this.removeBirdButton = removeBird;
    this.doneWithFlock = done;
    this.disperseFlockButton = disperse;
  }

  update() {
    if (this.state instanceof DefaultState) {
      show(this.attackButton);
      show(this.createFlockButton);
      enable(this.attackButton);

      if (this.stage.availableBirds.length > 0) {
        enable(this.createFlockButton);
      } else {
        disable(this.createFlockButton);
      }

      hide(this.addBirdButton);
      hide(this.removeBirdButton);
      hide(this.doneWithFlock);
      hide(this.disperseFlockButton);
    } else if (this.state instanceof AttackState) {
      show(this.attackButton);
      show(this.createFlockButton);
      disable(this.attackButton);
      disable(this.createFlockButton);
      hide(this.addBirdButton);
      hide(this.removeBirdButton);
      hide(this.doneWithFlock);
      hide(this.disperseFlockButton);
    } else if (this.state instanceof CreateFlockState) {
      hide(this.attackButton);
      hide(this.createFlockButton);
      show(this.addBirdButton);
      show(this.removeBirdButton);
      show(this.doneWithFlock);
      show(this.disperseFlockButton);

      if (this.stage.availableBirds.length > 0) {
        enable(this.addBirdButton);
      } else {
        disable(this.addBirdButton);
      }

      if (this.stage.gullsInFlocks.length > 0) {
        enable(this.removeBirdButton);
        enable(this.disperseFlockButton);
      } else {
        disable(this.removeBirdButton);
        disable(this.disperseFlockButton);
      }
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
