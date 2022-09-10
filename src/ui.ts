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
  // nextFlockButton: HTMLButtonElement;
  // prevFlockButton: HTMLButtonElement;

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
    const attack = createButton("Attack", uiWrapper);
    const createFlock = createButton("Create flock", uiWrapper);
    const addBird = createButton("Add bird", uiWrapper);
    const removeBird = createButton("Remove bird", uiWrapper);
    const done = createButton("Done", uiWrapper);
    // const prev = createButton("Prev flock", uiWrapper);
    // const next = createButton("Next flock", uiWrapper);

    attack.addEventListener("click", () =>
      this.state.handleInput(this, UI_INPUTS.ATTACK)
    );

    createFlock.addEventListener("click", () =>
      this.state.handleInput(this, UI_INPUTS.CREATE_FLOCK)
    );

    done.addEventListener("click", () =>
      this.state.handleInput(this, UI_INPUTS.DEFAULT)
    );

    addBird.addEventListener("click", () =>
      this.stage.addBird(this.stage.selectedFlock)
    );

    removeBird.addEventListener("click", () =>
      this.stage.removeBird(this.stage.selectedFlock)
    );

    // next.addEventListener("click", () => {
    //   let index = this.stage.gullFlocks.indexOf(this.stage.selectedFlock);
    //   if (index === this.stage.gullFlocks.length - 1) {
    //     index = 0;
    //   } else {
    //     index++;
    //   }
    //   const newFlock = this.stage.gullFlocks[index];
    //   this.stage.selectFlock(newFlock);
    // });

    // prev.addEventListener("click", () => {
    //   let index = this.stage.gullFlocks.indexOf(this.stage.selectedFlock);
    //   if (index === 0) {
    //     index = this.stage.gullFlocks.length - 1;
    //   } else {
    //     index--;
    //   }
    //   const newFlock = this.stage.gullFlocks[index];
    //   this.stage.selectFlock(newFlock);
    // });

    this.attackButton = attack;
    this.createFlockButton = createFlock;
    this.addBirdButton = addBird;
    this.removeBirdButton = removeBird;
    this.doneWithFlock = done;
    // this.nextFlockButton = next;
    // this.prevFlockButton = prev;
  }

  update() {
    if (this.state instanceof DefaultState) {
      show(this.attackButton);
      show(this.createFlockButton);
      // show(this.nextFlockButton);
      // show(this.prevFlockButton);
      enable(this.attackButton);

      if (this.stage.availableGulls.length > 0) {
        enable(this.createFlockButton);
      } else {
        disable(this.createFlockButton);
      }

      // if (this.stage.gullFlocks.length > 1) {
      //   enable(this.nextFlockButton);
      //   enable(this.prevFlockButton);
      // } else {
      //   disable(this.nextFlockButton);
      //   disable(this.prevFlockButton);
      // }

      hide(this.addBirdButton);
      hide(this.removeBirdButton);
      hide(this.doneWithFlock);
    } else if (this.state instanceof AttackState) {
      show(this.attackButton);
      show(this.createFlockButton);
      // show(this.nextFlockButton);
      // show(this.prevFlockButton);
      disable(this.attackButton);
      disable(this.createFlockButton);
      // disable(this.nextFlockButton);
      // disable(this.prevFlockButton);
      hide(this.addBirdButton);
      hide(this.removeBirdButton);
      hide(this.doneWithFlock);
    } else if (this.state instanceof CreateFlockState) {
      hide(this.attackButton);
      hide(this.createFlockButton);
      // hide(this.nextFlockButton);
      // hide(this.prevFlockButton);
      show(this.addBirdButton);
      show(this.removeBirdButton);
      show(this.doneWithFlock);

      if (this.stage.availableGulls.length > 0) {
        enable(this.addBirdButton);
      } else {
        disable(this.addBirdButton);
      }

      if (this.stage.selectedFlock.sprites.length > 0) {
        enable(this.removeBirdButton);
      } else {
        disable(this.removeBirdButton);
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

export function disable(node) {
  if (node.disabled == true) return;
  node.disabled = true;
}

export function enable(node) {
  if (node.disabled == false) return;
  node.disabled = false;
}

export function createButton(text, node) {
  const elt = document.createElement("button");
  elt.innerText = text;
  node.appendChild(elt);
  return elt;
}
