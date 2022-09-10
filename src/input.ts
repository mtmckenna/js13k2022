import { Vector } from "./math";
import Renderer from "./renderer";

export default class Input {
  private static instance: Input;

  inputPressedOnce = false;
  canvas: HTMLCanvasElement;
  renderer: Renderer;

  clickCallbacks: Array<(pos: Vector) => void> = [];
  keydownCallbacks: Array<(keyCode: string) => void> = [];

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

    element.addEventListener("touchstart", this.touchPressed.bind(this), {
      passive: true,
    });
    element.addEventListener("touchcancel", this.preventDefault.bind(this));
    // window.addEventListener("keydown", this.keydown.bind(this));
  }

  registerClickCallback(callback: (pos: Vector) => void) {
    this.clickCallbacks.push(callback);
  }

  // registerKeydownCallback(callback: (keyCode: string) => void) {
  //   this.keydownCallbacks.push(callback);
  // }

  inputPressed(x: number, y: number) {
    console.log("input");
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
}
