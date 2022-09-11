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
  killDiv: HTMLDivElement;
  escapeDiv: HTMLDivElement;
  percentDiv: HTMLDivElement;
  bottomWrapper: HTMLElement;
  topWrapper: HTMLElement;
  titleDiv: HTMLElement;
  resultsDiv: HTMLElement;

  state: IState<Ui, UI_INPUTS>;
  public stage: Stage;

  public static getInstance(): Ui {
    if (!Ui.instance) Ui.instance = new Ui();
    return Ui.instance;
  }

  createUi(stage: Stage) {
    this.state = new DefaultState();
    this.stage = stage;

    const title = document.getElementById("title-screen");
    const results = document.getElementById("results");

    const uiWrapperBottom = document.getElementById("ui-wrapper-bottom");
    const uiWrapperTop = document.getElementById("ui-wrapper-top");
    const attack = createButton("Attack", uiWrapperBottom);
    const createFlock = createButton("Create flock", uiWrapperBottom);
    const addBird = createButton("Add bird", uiWrapperBottom);
    const removeBird = createButton("Remove bird", uiWrapperBottom);
    const done = createButton("Done", uiWrapperBottom);

    const kill = createDiv("Killed: 0", uiWrapperTop, ["inline"]);
    const escape = createDiv("Escaped: 0", uiWrapperTop, ["inline"]);
    const percent = createDiv("0%", uiWrapperTop, ["inline"]);

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

    this.attackButton = attack;
    this.createFlockButton = createFlock;
    this.addBirdButton = addBird;
    this.removeBirdButton = removeBird;
    this.doneWithFlock = done;
    this.killDiv = kill;
    this.escapeDiv = escape;
    this.percentDiv = percent;
    this.topWrapper = uiWrapperTop;
    this.bottomWrapper = uiWrapperBottom;
    this.titleDiv = title;
    this.resultsDiv = results;
  }

  hideUi() {
    hide(this.topWrapper);
    hide(this.bottomWrapper);
  }

  showUi() {
    show(this.topWrapper);
    show(this.bottomWrapper);
  }

  hideTitle() {
    hide(this.titleDiv);
  }

  showRetryResults() {
    const text = `You only eliminated ${formatPercent(
      this.stage.percentKilled
    )}. Try again.`;
    if (this.resultsDiv.innerText !== text) {
      this.resultsDiv.innerText = text;
    }
    show(this.resultsDiv);
  }

  showWinResults(currentNum, finalNum) {
    let text = `You eliminated enough targets to proceed to stage ${currentNum} of ${finalNum}. Proceed!`;

    if (currentNum === finalNum) {
      text = `Congratulations, Commander Bird. We will all sleep easier tonight knowing you have eliminated so many targets. \n\nChirp chirp,\n\n\ General Bird.`;
    }

    if (this.resultsDiv.innerText !== text) {
      this.resultsDiv.innerText = text;
    }
    show(this.resultsDiv);
  }

  hideResults() {
    console.log("HIDE");
    hide(this.resultsDiv);
  }

  update() {
    const killText = `Eliminated: ${this.stage.numPeopleKilled}`;
    const escapeText = `Escaped: ${this.stage.numPeopleSafe}`;
    const percentText = formatPercent(this.stage.percentKilled);
    if (this.killDiv.innerText !== killText) {
      this.killDiv.innerText = killText;
    }

    if (this.escapeDiv.innerText !== escapeText) {
      this.escapeDiv.innerText = escapeText;
    }

    if (this.percentDiv.innerText !== percentText) {
      this.percentDiv.innerText = percentText;
    }

    if (this.state instanceof DefaultState) {
      show(this.attackButton);
      show(this.createFlockButton);

      if (this.stage.gullFlocks.length > 0) {
        enable(this.attackButton);
      } else {
        disable(this.attackButton);
      }

      if (this.stage.availableGulls.length > 0) {
        enable(this.createFlockButton);
      } else {
        disable(this.createFlockButton);
      }

      hide(this.addBirdButton);
      hide(this.removeBirdButton);
      hide(this.doneWithFlock);
    } else if (this.state instanceof AttackState) {
      show(this.attackButton);
      show(this.createFlockButton);
      disable(this.attackButton);
      disable(this.createFlockButton);
      hide(this.addBirdButton);
      hide(this.removeBirdButton);
      hide(this.doneWithFlock);
    } else if (this.state instanceof CreateFlockState) {
      hide(this.attackButton);
      hide(this.createFlockButton);
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

function formatPercent(pct) {
  return `${(pct * 100).toFixed(0)}%`;
}

function hide(node) {
  node.classList.add("hide");
}

function show(node) {
  node.classList.remove("hide");
}

function disable(node) {
  if (node.disabled == true) return;
  node.disabled = true;
}

function enable(node) {
  if (node.disabled == false) return;
  node.disabled = false;
}

function createButton(text, node) {
  const elt = document.createElement("button");
  elt.innerText = text;
  node.appendChild(elt);
  return elt;
}

function createDiv(text, node, classes = []) {
  const elt = document.createElement("div");
  elt.innerText = text;
  node.appendChild(elt);
  elt.classList.add(...classes);
  return elt;
}
