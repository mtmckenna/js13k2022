import {
  AttackState,
  CreateFlockState,
  DefaultState,
  UI_INPUTS,
} from "./ui_states";
import { IState } from "./interfaces";
import Stage from "./stage";
import Renderer from "./renderer";
import { GAME_STATES } from "./interfaces";

const renderer = Renderer.getInstance();

export default class Ui {
  private static instance: Ui;

  attackButton: HTMLButtonElement;
  createFlockButton: HTMLButtonElement;
  addBirdButton: HTMLButtonElement;
  removeBirdButton: HTMLButtonElement;
  doneWithFlock: HTMLButtonElement;
  retryButton: HTMLButtonElement;
  nextStage: HTMLButtonElement;
  topDiv: HTMLDivElement;
  bottomWrapper: HTMLElement;
  topWrapper: HTMLElement;
  titleDiv: HTMLElement;
  resultsDiv: HTMLElement;
  middleTextDiv: HTMLElement;
  regenCallback: (number) => void;
  nextCallback: () => void;

  state: IState<Ui, UI_INPUTS>;
  public stage: Stage;
  public stages: Stage[];

  numStages: number;

  public static getInstance(): Ui {
    if (!Ui.instance) Ui.instance = new Ui();
    return Ui.instance;
  }

  createUi(
    stage: Stage,
    stages: Stage[],
    regenCallback: (index: number) => void,
    nextCallback: () => void
  ) {
    this.state = new DefaultState();
    this.stage = stage;
    this.stages = stages;
    this.numStages = this.stages.length;
    this.regenCallback = regenCallback;
    this.nextCallback = nextCallback;

    const title = document.getElementById("title-screen");
    const results = document.getElementById("results");

    const uiWrapperBottom = document.getElementById("ui-wrapper-bottom");
    const uiWrapperTop = document.getElementById("ui-wrapper-top");
    const uiWrapperMiddle = document.getElementById("ui-wrapper-middle");
    const uiMiddleText = document.getElementById("ui-middle-text");
    const attack = createButton("Attack", uiWrapperBottom);
    const createFlock = createButton("Create flock", uiWrapperBottom);
    const addBird = createButton("Add bird", uiWrapperBottom);
    const removeBird = createButton("Remove bird", uiWrapperBottom);
    const done = createButton("Done", uiWrapperBottom);
    const retry = createButton("Retry", uiWrapperMiddle);
    const nextStage = createButton("Next Stage", uiWrapperMiddle);

    const top = createDiv("Killed: 0 Escaped 0% \n 1", uiWrapperTop, [
      "inline",
    ]);

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

    retry.addEventListener("click", () => {
      this.hideResults();
      // regenerateStage(currentStage.index);
      this.regenCallback(this.stage.index);
      renderer.gameState = GAME_STATES.PLAYING;
    });

    nextStage.addEventListener("click", () => {
      this.hideResults();
      // regenerateStage(currentStage.index);
      this.nextCallback();
      renderer.gameState = GAME_STATES.PLAYING;
    });

    this.attackButton = attack;
    this.createFlockButton = createFlock;
    this.addBirdButton = addBird;
    this.removeBirdButton = removeBird;
    this.doneWithFlock = done;
    this.topDiv = top;
    this.topWrapper = uiWrapperTop;
    this.bottomWrapper = uiWrapperBottom;
    this.titleDiv = title;
    this.resultsDiv = results;
    this.nextStage = nextStage;
    this.retryButton = retry;
    this.middleTextDiv = uiMiddleText;
    console.log(this.middleTextDiv);
  }

  hideUi() {
    hide(this.topWrapper);
    hide(this.bottomWrapper);
    hide(this.resultsDiv);
  }

  showUi() {
    show(this.topWrapper);
    show(this.bottomWrapper);
    show(this.resultsDiv);
  }

  hideTitle() {
    hide(this.titleDiv);
  }

  replaceResultsText(text: string) {
    // if (this.resultsDiv.childNodes[0].textContent !== text) {
    //   this.resultsDiv.childNodes[0].textContent = text;
    // }

    if (this.middleTextDiv.innerText !== text) {
      this.middleTextDiv.innerText = text;
    }
  }

  showRetryResults() {
    hide(this.nextStage);
    show(this.retryButton);

    const text = `You didn't eliminate enough targets. Try again, Commander.`;

    this.replaceResultsText(text);

    show(this.resultsDiv);
  }

  showWinResults(currentNum, finalNum, wonGame) {
    show(this.resultsDiv);
    show(this.nextStage);
    hide(this.retryButton);

    let text = `You eliminated enough targets to proceed to stage ${currentNum} of ${finalNum}. Proceed!`;

    if (wonGame) {
      text = `Congratulations, Commander Bird. We will all sleep easier tonight knowing you have eliminated so many targets. \n\nChirp chirp,\n\n General Bird`;
      hide(this.nextStage);
    }

    this.replaceResultsText(text);

    show(this.resultsDiv);
  }

  hideResults() {
    hide(this.resultsDiv);
  }

  update() {
    const killText = `Eliminated: ${this.stage.numPeopleKilled}`;
    const escapeText = `Escaped: ${this.stage.numPeopleSafe}`;
    const percentText = formatPercent(this.stage.percentKilled);
    const levelText = `Stage ${this.stage.index + 1} of ${this.numStages}`;
    const topText = `${killText} ${escapeText} ${percentText}\n${levelText}`;
    if (this.topDiv.innerText !== killText) {
      this.topDiv.innerText = topText;
    }

    if (this.state instanceof DefaultState) {
      show(this.attackButton);
      show(this.createFlockButton);
      hide(this.resultsDiv);

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
