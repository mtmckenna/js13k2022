import { Vector, dist } from "./math";
import Renderer from "./renderer";

const DRAG_THRESHOLD = 50;

export default class Input {
  private static instance: Input;

  inputHash: IInputMap;

  inputPressedOnce = false;
  canvas: HTMLCanvasElement;
  renderer: Renderer;

  // private posFromEventTempVec = new Vector(0, 0, 0);

  clickCallbacks: Array<(pos: Vector) => void> = [];
  moveCallbacks: Array<(pos: Vector) => void> = [];
  dragCallbacks: Array<(pos: Vector) => void> = [];
  releaseCallbacks: Array<(pos: Vector) => void> = [];
  keydownCallbacks: Array<(keyCode: string) => void> = [];

  public static getInstance(): Input {
    if (!Input.instance) Input.instance = new Input();
    return Input.instance;
  }

  constructor() {
    this.inputHash = {
      downAt: null,
      downPos: new Vector(0, 0, 0),
      currPos: new Vector(-1, -1, -1),
    };

    this.renderer = Renderer.getInstance();
    this.canvas = this.renderer.canvas;
  }

  static isTouchDevice() {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
  }

  addEventListeners(element: HTMLElement) {
    element.addEventListener("mousedown", this.mousePressed.bind(this));
    element.addEventListener("mousemove", this.mouseMoved.bind(this));
    element.addEventListener("mouseup", this.inputReleased.bind(this));

    element.addEventListener("touchstart", this.touchPressed.bind(this));
    element.addEventListener("touchend", this.inputReleased.bind(this));
    element.addEventListener("touchmove", this.touchMoved.bind(this));
    element.addEventListener("touchcancel", this.preventDefault.bind(this));
    window.addEventListener("keydown", this.keydown.bind(this));
    // window.addEventListener("keyup", keyup);
  }

  registerClickCallback(callback: (pos: Vector) => void) {
    this.clickCallbacks.push(callback);
  }

  registerMoveCallback(callback: (pos: Vector) => void) {
    this.moveCallbacks.push(callback);
  }

  registerDragCallback(callback: (pos: Vector) => void) {
    this.dragCallbacks.push(callback);
  }

  registerReleaseCallback(callback: (pos: Vector) => void) {
    this.releaseCallbacks.push(callback);
  }

  registerKeydownCallback(callback: (keyCode: string) => void) {
    this.keydownCallbacks.push(callback);
  }

  userHasInteracted(): boolean {
    return this.inputPressedOnce;
  }

  handleInitialInput() {
    if (!this.inputPressedOnce) {
      this.inputPressedOnce = true;
      // createAudioContext();
      // setVolume(gameState.audio ? VOLUME : 0.0);
    }
  }

  inputPressed(x: number, y: number) {
    this.handleInitialInput();
    this.inputHash.downAt = performance.now();
    this.inputHash.downPos.set(x, y, 0);
    // this.clickCallbacks.forEach((callback) => callback(new Vector(x, y, 0)));
  }

  inputMoved(x, y) {
    const oldX = this.inputHash.currPos.x;
    const oldY = this.inputHash.currPos.y;
    // const oldZ = this.inputHash.currPos.z;
    this.inputHash.currPos.set(x, y, 0);
    this.moveCallbacks.forEach((callback) => callback(new Vector(x, y, 0)));
    if (this.inputHash.downAt) {
      this.dragCallbacks.forEach((callback) =>
        callback(new Vector(x - oldX, y - oldY, 0))
      );
    }
  }

  inputReleased(e: MouseEvent | TouchEvent) {
    e.preventDefault();
    e.stopPropagation();

    const currPos = this.positionFromEvent(e);
    const distBetweenDownAndUp = dist(currPos, this.inputHash.downPos);
    // const clicked =
    //   performance.now() - this.inputHash.downAt <= CLICK_THRESHOLD;
    const dragged = distBetweenDownAndUp >= DRAG_THRESHOLD;

    // Don't click if we're dragging
    if (!dragged) {
      this.clickCallbacks.forEach((callback) =>
        callback(new Vector(currPos.x, currPos.y, 0))
      );
    }

    this.releaseCallbacks.forEach((callback) =>
      callback(new Vector(currPos.x, currPos.y, 0))
    );

    this.inputHash.downAt = null;
  }

  mousePressed(e: MouseEvent) {
    e.preventDefault();

    // const rect = this.canvas.getBoundingClientRect();
    // const x = e.clientX - rect.left;
    // const y = e.clientY - rect.top;
    const pos = this.positionFromEvent(e);
    this.inputPressed(pos.x, pos.y);
  }

  positionFromEvent(e: MouseEvent | TouchEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const pos = new Vector(0, 0, 0);

    if (e instanceof MouseEvent) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // this.posFromEventTempVec.set(x, y, 0);
      pos.set(x, y, 0);
    } else if (e instanceof TouchEvent) {
      const x = e.changedTouches[0].clientX - rect.left;
      const y = e.changedTouches[0].clientY - rect.top;
      // this.posFromEventTempVec.set(x, y, 0);
      pos.set(x, y, 0);
    }

    // return this.posFromEventTempVec;
    return pos;
  }

  touchPressed(e: TouchEvent) {
    e.preventDefault();
    const pos = this.positionFromEvent(e);
    this.inputPressed(pos.x, pos.y);
  }

  mouseMoved(e: MouseEvent) {
    // this.inputReleased(e);
    // this.mousePressed(e);

    const pos = this.positionFromEvent(e);
    this.inputMoved(pos.x, pos.y);
  }

  touchMoved(e: TouchEvent) {
    // this.inputReleased(e);
    // this.touchPressed(e);
    const pos = this.positionFromEvent(e);
    this.inputMoved(pos.x, pos.y);
  }

  preventDefault(e: TouchEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  keydown(e: KeyboardEvent) {
    this.keydownCallbacks.forEach((callback) => callback(e.key));
  }

  keyup(e: KeyboardEvent) {
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
}

interface IInputMap {
  downAt: DOMHighResTimeStamp | null;
  downPos: Vector;
  currPos: Vector;
}
