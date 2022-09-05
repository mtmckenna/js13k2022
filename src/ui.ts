import { AttackState, CircleTargetState } from "./gull_flock_states";
import GullFlock from "./gull_flock";

export default class Ui {
  attackButton: HTMLButtonElement;
  circleTargetButton: HTMLButtonElement;

  createUi(gullFlock: GullFlock) {
    const uiWrapper = document.getElementById("ui-wrapper");
    const attack = createButton("Attack", uiWrapper, []);
    const circle = createButton("Circle target", uiWrapper, []);

    attack.addEventListener("click", gullFlock.attack.bind(gullFlock));
    circle.addEventListener("click", gullFlock.circleTarget.bind(gullFlock));

    this.attackButton = attack;
    this.circleTargetButton = circle;
  }

  update(gullFlock: GullFlock) {
    // console.log(gullFlock.modeState);
    if (gullFlock.flockState instanceof AttackState) {
      select(this.attackButton);
      unselect(this.circleTargetButton);
    } else if (gullFlock.flockState instanceof CircleTargetState) {
      unselect(this.attackButton);
      select(this.circleTargetButton);
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
