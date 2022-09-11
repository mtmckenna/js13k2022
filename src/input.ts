import { Vector } from "./math";
import Renderer from "./renderer";
import RallyPoint from "./rally_point";

export default class Input {
  private static instance: Input;

  inputPressedOnce = false;
  canvas: HTMLCanvasElement;
  renderer: Renderer;

  selectedRallyPoint: null | RallyPoint;

  clickCallbacks: Array<(pos: Vector) => void> = [];
  keydownCallbacks: Array<(keyCode: string) => void> = [];
  moveCallbacks: Array<(pos: Vector) => void> = [];
  releaseCallbacks: Array<(pos: Vector) => void> = [];

  public static getInstance(): Input {
    if (!Input.instance) Input.instance = new Input();
    return Input.instance;
  }

  constructor() {
    this.renderer = Renderer.getInstance();
    this.canvas = this.renderer.canvas;
  }

  addEventListeners(element: HTMLElement) {
    element.addEventListener("mousedown", this.mousePressed.bind(this));
    element.addEventListener("mousemove", this.mouseMoved.bind(this));
    element.addEventListener("mouseup", this.inputReleased.bind(this));

    element.addEventListener("touchstart", this.touchPressed.bind(this), {
      passive: true,
    });
    element.addEventListener("touchend", this.inputReleased.bind(this));

    element.addEventListener("touchmove", this.touchMoved.bind(this), {
      passive: true,
    });
    element.addEventListener("touchcancel", this.inputReleased.bind(this));
  }

  registerClickCallback(callback: (pos: Vector) => void) {
    this.clickCallbacks.push(callback);
  }

  registerMoveCallback(callback: (pos: Vector) => void) {
    this.moveCallbacks.push(callback);
  }

  registerReleaseCallback(callback: (pos: Vector) => void) {
    this.releaseCallbacks.push(callback);
  }

  inputPressed(x: number, y: number) {
    this.clickCallbacks.forEach((callback) => callback(new Vector(x, y, 0)));
  }

  mousePressed(e: MouseEvent) {
    e.preventDefault();
    const pos = this.positionFromEvent(e);
    this.inputPressed(pos.x, pos.y);
  }

  positionFromEvent(e: MouseEvent | TouchEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const pos = new Vector(0, 0, 0);

    if (e instanceof MouseEvent) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      pos.set(x, y, 0);
    } else if (e instanceof TouchEvent) {
      const x = e.changedTouches[0].clientX - rect.left;
      const y = e.changedTouches[0].clientY - rect.top;
      pos.set(x, y, 0);
    }

    return pos;
  }

  touchPressed(e: TouchEvent) {
    e.preventDefault();
    const pos = this.positionFromEvent(e);
    this.inputPressed(pos.x, pos.y);
  }

  preventDefault(e: TouchEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  keydown(e: KeyboardEvent) {
    this.keydownCallbacks.forEach((callback) => callback(e.key));
  }

  mouseMoved(e: MouseEvent) {
    const pos = this.positionFromEvent(e);
    this.inputMoved(pos.x, pos.y);
  }

  touchMoved(e: TouchEvent) {
    const pos = this.positionFromEvent(e);
    this.inputMoved(pos.x, pos.y);
  }

  inputMoved(x, y) {
    this.moveCallbacks.forEach((callback) => callback(new Vector(x, y, 0)));
  }

  inputReleased(e: MouseEvent | TouchEvent) {
    e.preventDefault();
    e.stopPropagation();

    const currPos = this.positionFromEvent(e);

    this.clickCallbacks.forEach((callback) =>
      callback(new Vector(currPos.x, currPos.y, 0))
    );

    this.selectedRallyPoint = null;
  }
}
