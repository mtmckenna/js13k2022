import { Vector } from "./math";
import Renderer from "./renderer";

let inputPressedOnce = false;

const clickCallbacks: Array<(pos: Vector) => void> = [];

const renderer = Renderer.getInstance();
const canvas = renderer.canvas;

export function addEventListeners(element: HTMLElement) {
  element.addEventListener("mousedown", mousePressed);
  // element.addEventListener("mousemove", mouseMoved);
  element.addEventListener("mouseup", inputReleased);

  element.addEventListener("touchstart", touchPressed);
  element.addEventListener("touchend", inputReleased);
  // element.addEventListener("touchmove", touchMoved);
  element.addEventListener("touchcancel", preventDefault);
  window.addEventListener("keydown", keydown);
  // window.addEventListener("keyup", keyup);
}

export function userHasInteracted(): boolean {
  return inputPressedOnce;
}

export function resetInput() {}

function touchPressed(e: TouchEvent) {
  e.preventDefault();

  const rect = canvas.getBoundingClientRect();

  const x = e.changedTouches[0].clientX - rect.left;
  const y = e.changedTouches[0].clientY - rect.top;

  inputPressed(x, y);
}

function mousePressed(e: MouseEvent) {
  e.preventDefault();

  const rect = canvas.getBoundingClientRect();

  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  inputPressed(x, y);
}

function inputPressed(xInput: number, yInput: number) {
  handleInitialInput();
  clickCallbacks.forEach((callback) => callback(new Vector(xInput, yInput, 0)));
}

function handleInitialInput() {
  if (!inputPressedOnce) {
    inputPressedOnce = true;
    // createAudioContext();
    // setVolume(gameState.audio ? VOLUME : 0.0);
  }
}

function inputReleased(e: MouseEvent | TouchEvent) {
  e.preventDefault();
  e.stopPropagation();
}

function mouseMoved(e: MouseEvent) {
  // if (!anyInputPressed()) return;
  inputReleased(e);
  mousePressed(e);
}

function touchMoved(e: TouchEvent) {
  inputReleased(e);
  touchPressed(e);
}

function keydown(e: KeyboardEvent) {
  const pos = renderer.camera.pos;
  // console.log(pos);

  switch (e.key) {
    case "ArrowLeft":
      console.log("left");
      renderer.camera.pos.set(pos.x + 1, pos.y, pos.z);
      break;
    case "ArrowRight":
      console.log("right");
      renderer.camera.pos.set(pos.x - 1, pos.y, pos.z);
      break;
    case "ArrowUp":
      console.log("up");
      renderer.camera.pos.set(pos.x, pos.y - 1, pos.z);
      break;
    case "ArrowDown":
      console.log("down");
      renderer.camera.pos.set(pos.x, pos.y + 1, pos.z);
      break;
  }
}

function keyup(e: KeyboardEvent) {
  switch (e.key) {
    case "ArrowLeft":
      console.log("left");
      break;
    case "ArrowRight":
      console.log("right");
      break;
    case "ArrowUp":
      console.log("up");
      break;
    case "ArrowDown":
      console.log("down");
      break;
  }
}

function preventDefault(e: TouchEvent) {
  e.preventDefault();
  e.stopPropagation();
}

export class GameInputManager {
  constructor() {}

  register() {}
}

export function registerClickCallback(callback: (pos: Vector) => void) {
  clickCallbacks.push(callback);
}
