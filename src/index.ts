import Gull from "./gull";
import Person from "./person";
import PersonFlock from "./person_flock";
import GullFlock from "./gull_flock";
import Stage from "./stage";
import { randomFloatBetween, Vector, dist, overlaps, clamp } from "./math";
import Debug from "./debug";
import RallyPoint from "./rally_point";
import Input from "./input";
import Renderer from "./renderer";
import Ui from "./ui";
import { AttackState } from "./gull_flock_states";
import Camera from "./camera";

const canvas: HTMLCanvasElement = document.getElementById(
  "game"
) as HTMLCanvasElement;
const ctx: CanvasRenderingContext2D = canvas.getContext("2d");

const width = 640;
const height = 480;

let aspectRatio = null;
let canvasWindowScale = 0;

const renderer = Renderer.getInstance();
const camera = new Camera(new Vector(0, 0, 1));
renderer.camera = camera;

canvas.width = width;
canvas.height = height;

const currentStage = new Stage(new Vector(width, height, 0), camera);
const gulls: Gull[] = [];
const gullFlock: GullFlock = new GullFlock(gulls);
const rallyPoints: RallyPoint[] = [
  new RallyPoint(new Vector(width / 4, height / 4, 0)),
];
const people: Person[] = [];
const personFlock = new PersonFlock(people);

const ui = new Ui();
ui.createUi(gullFlock);

Debug.start();
const debug = Debug.getInstance();

const input = Input.getInstance();
input.addEventListeners(canvas);

for (let i = 0; i < 5; i++) {
  const pos = new Vector(
    randomFloatBetween(0, canvas.width),
    randomFloatBetween(0, canvas.height),
    0
  );
  const gull = new Gull(pos, currentStage);
  gull.vel.x = randomFloatBetween(-5, 5);
  gull.vel.y = randomFloatBetween(-0.5, 5);
  gulls.push(gull);
}

for (let i = 0; i < 4; i++) {
  const randomOffset = 50;
  const pos = new Vector(
    width / 2 + randomFloatBetween(-1 * randomOffset, randomOffset),
    height / 2 + randomFloatBetween(-1 * randomOffset, randomOffset),
    10
  );
  const person = new Person(pos, currentStage);
  person.vel.x = randomFloatBetween(-5, 5);
  person.vel.y = randomFloatBetween(-0.5, 5);
  people.push(person);
}

function tick(t: number) {
  requestAnimationFrame(tick);
  resize();
  renderer.renderTick();

  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  currentStage.draw();

  if (debug.gridEnabled) {
    ctx.fillStyle = "red";
    ctx.fillRect(0, 0, 5, 5);
  }

  const flockCenter = rallyPoints[0].pos;

  rallyPoints.forEach((rallyPoint) => {
    rallyPoint.draw();
  });

  people.forEach((person) => {
    person.flock(people);
    person.update();
    person.draw();
  });

  gulls.forEach((gull) => {
    gull.flock(gulls, flockCenter);
    gull.update();
    gull.draw();
  });

  const personGullFlockDistance = dist(personFlock.center, gullFlock.center);
  if (
    gullFlock.modeState instanceof AttackState &&
    personGullFlockDistance <= personFlock.fearDistance
  ) {
    personFlock.flipOut(gullFlock.center);
    gullFlock.sprites.forEach((gull: Gull) => {
      personFlock.sprites.forEach((person: Person) => {
        if (overlaps(gull, person)) {
          person.damage(1);
        }
      });
    });
  }

  ui.update(gullFlock);

  moveStage();
}

function moveStage() {
  // console.log(camera.pos.x, camera.pos.y);
  if (Input.isTouchDevice()) return;
  if (input.inputHash.currPos.x === -1) return;

  const limitRight = camera.pos.x + canvas.width;
  const limitBottom = camera.pos.y + canvas.height;
  // console.log(camera.pos);

  // if (camera.pos.x >= 0) {
  //   camera.pos.set(0, camera.pos.y, camera.pos.z);
  // }
  // // } else if (limitRight >= currentStage.size.x) {
  // //   camera.pos.set(limitRight, camera.pos.y, camera.pos.z);
  // // }

  // if (camera.pos.y >= 0) {
  //   camera.pos.set(camera.pos.y, 0, camera.pos.z);
  // } else if (limitBottom >= currentStage.size.y) {
  //   camera.pos.set(camera.pos.x, limitBottom, camera.pos.z);
  // }

  const threshold = 15;
  if (input.inputHash.currPos.x <= threshold) {
    camera.moveBy(1, 0, 0);
  } else if (input.inputHash.currPos.x >= window.innerWidth - threshold) {
    camera.moveBy(-1, 0, 0);
  } else if (input.inputHash.currPos.y <= threshold) {
    camera.moveBy(0, 1, 0);
  } else if (input.inputHash.currPos.y >= window.innerHeight - threshold) {
    camera.moveBy(0, -1, 0);
  }
}

function dragCallback(pos: Vector) {
  const MAX_DRAG = 2;
  renderer.camera.moveBy(
    clamp(pos.x, -1 * MAX_DRAG, MAX_DRAG),
    clamp(pos.y, -1 * MAX_DRAG, MAX_DRAG),
    0
  );
  document.body.style.cursor = "grab";
}

function releaseCallback(pos: Vector) {
  document.body.style.cursor = "default";
}

function clickCallback(pos: Vector) {
  // Transform point to deal with 1) scaling and 2) moving the camera around
  pos.set(
    (pos.x / canvasWindowScale - renderer.offset.x) * renderer.offset.z,
    (pos.y / canvasWindowScale - renderer.offset.y) * renderer.offset.z,
    0
  );

  rallyPoints[0] = new RallyPoint(pos);
}

input.registerClickCallback(clickCallback);
input.registerDragCallback(dragCallback);
input.registerReleaseCallback(releaseCallback);

requestAnimationFrame(tick);

function resize() {
  const newAspectRatio = window.innerWidth / window.innerHeight;

  // If we haven't changed or it's the first time
  if (aspectRatio === newAspectRatio) {
    return;
  } else {
    aspectRatio = newAspectRatio;
  }

  let scaledWidth = width;
  let scaledHeight = height;

  if (aspectRatio >= 1) {
    scaledWidth = width;
    scaledHeight = width / aspectRatio;
  } else {
    scaledHeight = height;
    scaledWidth = height * aspectRatio;
  }

  canvas.width = scaledWidth;
  canvas.height = scaledHeight;

  // How much have we stretched the canvas to fit the screen
  canvasWindowScale = window.innerHeight / scaledHeight;
}

// window.addEventListener("resize", resize);

document.body.onkeyup = function (e) {
  if (e.key == " " || e.code == "Space" || e.keyCode == 32) {
    tick(performance.now());
  }
};
