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
import BloodSystem from "./blood_system";

const canvas: HTMLCanvasElement = document.getElementById(
  "game"
) as HTMLCanvasElement;
const ctx: CanvasRenderingContext2D = canvas.getContext("2d");

const desiredWidth = 640;
const desiredHeight = 480;
const width = desiredWidth;
const height = desiredHeight;

const desiredAspectRatio = width / height;
let aspectRatio = null;
let canvasWindowScale = 0;

const renderer = Renderer.getInstance();
const zoom = 1;
const camera = new Camera(new Vector(0, 0, zoom));
renderer.camera = camera;

canvas.width = width;
canvas.height = height;

const currentStage = new Stage(new Vector(width, height, 0));
const gulls: Gull[] = [];
const gullFlock: GullFlock = new GullFlock(gulls);
const rallyPoints: RallyPoint[] = [
  new RallyPoint(new Vector(width / 4, height / 2, 0), currentStage),
];

const bloodSystem = BloodSystem.getInstance();
let people: Person[] = [];
const personFlock = new PersonFlock(people);

const ui = new Ui();
ui.createUi(gullFlock);

Debug.start();
const debug = Debug.getInstance();

const input = Input.getInstance();
input.addEventListeners(canvas);

for (let i = 0; i < 4; i++) {
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

for (let i = 0; i < 2; i++) {
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
  renderer.renderTick(currentStage);

  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  currentStage.draw();

  if (debug.gridEnabled) {
    ctx.fillStyle = "red";
    renderer.drawGrid();
  }

  const flockCenter = rallyPoints[0].pos;

  rallyPoints.forEach((rallyPoint) => {
    rallyPoint.update(t);
    rallyPoint.draw();
  });

  for (let i = 0; i < bloodSystem.bloods.length; i++) {
    const blood = bloodSystem.bloods[i];
    if (blood.inUse()) {
      blood.update();
      blood.draw();
    }
  }

  const alivePeople = [];
  for (let i = 0; i < people.length; i++) {
    const person = people[i];
    person.flock(people);
    person.update(t);
    if (!person.dead) {
      alivePeople.push(person);
      person.draw(t);
    }
  }
  people = alivePeople;

  gulls.forEach((gull) => {
    gull.flock(gulls, flockCenter);
    gull.update(t);
    gull.draw(t);
  });

  personFlock.update(t);
  gullFlock.update(t);

  const personGullFlockDistance = dist(personFlock.center, gullFlock.center);
  // console.log(personFlock.center, gullFlock.center);
  if (
    gullFlock.modeState instanceof AttackState &&
    personGullFlockDistance <= personFlock.fearDistance
  ) {
    personFlock.flipOut(gullFlock.center);
    gullFlock.sprites.forEach((gull: Gull) => {
      personFlock.sprites.forEach((person: Person) => {
        if (overlaps(gull, person)) {
          person.damage(1, t);
        }
      });
    });
  }

  ui.update(gullFlock);

  moveStage();
}

function resetCameraWhenAtLimit() {
  const scale = camera.pos.z;
  if (camera.pos.x < 0) {
    camera.pos.set(0, camera.pos.y, camera.pos.z);
  } else if (
    currentStage.size.x * scale >= canvas.width &&
    camera.pos.x * scale + canvas.width > currentStage.size.x * scale
  ) {
    camera.pos.set(
      currentStage.size.x - canvas.width / scale,
      camera.pos.y,
      camera.pos.z
    );
  }

  if (camera.pos.y < 0) {
    camera.pos.set(camera.pos.x, 0, camera.pos.z);
  } else if (
    currentStage.size.y * scale >= canvas.height &&
    camera.pos.y * scale + canvas.height > currentStage.size.y * scale
  ) {
    camera.pos.set(
      camera.pos.x,
      currentStage.size.y - canvas.height / scale,
      camera.pos.z
    );
  }
}

function moveStage() {
  if (Input.isTouchDevice()) return;
  if (input.inputHash.currPos.x === -1) return;

  const threshold = 15;
  if (input.inputHash.currPos.x <= threshold) {
    camera.moveBy(-1, 0, 0);
  } else if (input.inputHash.currPos.x >= window.innerWidth - threshold) {
    camera.moveBy(1, 0, 0);
  } else if (input.inputHash.currPos.y <= threshold) {
    camera.moveBy(0, -1, 0);
  } else if (input.inputHash.currPos.y >= window.innerHeight - threshold) {
    camera.moveBy(0, 1, 0);
  }
  resetCameraWhenAtLimit();
}

function dragCallback(pos: Vector) {
  const MAX_DRAG = 2;
  renderer.camera.moveBy(
    clamp(-pos.x, -1 * MAX_DRAG, MAX_DRAG),
    clamp(-pos.y, -1 * MAX_DRAG, MAX_DRAG),
    0
  );
  document.body.style.cursor = "grab";
  resetCameraWhenAtLimit();
}

function releaseCallback(pos: Vector) {
  document.body.style.cursor = "default";
}

function clickCallback(pos: Vector) {
  // I don't know how this works but it's supposed to scale from screen to game
  pos.set(
    (pos.x / canvasWindowScale + renderer.offset.x * renderer.offset.z) /
      renderer.offset.z,
    (pos.y / canvasWindowScale + renderer.offset.y * renderer.offset.z) /
      renderer.offset.z,
    0
  );

  const h = currentStage.size.y;
  pos.set(pos.x, h - pos.y, pos.z);
  rallyPoints[0] = new RallyPoint(pos, currentStage);
}

function keydownCallback(keyCode: string) {
  switch (keyCode) {
    case "ArrowLeft":
      console.log("left");
      renderer.camera.moveBy(-1, 0, 0);
      break;
    case "ArrowRight":
      console.log("right");
      renderer.camera.moveBy(1, 0, 0);
      break;
    case "ArrowUp":
      console.log("up");
      renderer.camera.moveBy(0, -1, 0);
      break;
    case "ArrowDown":
      console.log("down");
      renderer.camera.moveBy(0, 1, 0);
      break;
    case "-":
      renderer.camera.moveBy(0, 0, -0.1);
      console.log("zoom out", renderer.camera.pos.z);
      resize(true);
      break;
    case "+":
      renderer.camera.moveBy(0, 0, 0.1);
      console.log("zoom in", renderer.camera.pos.z);
      resize(true);
      break;
  }

  resetCameraWhenAtLimit();
}

input.registerClickCallback(clickCallback);
// input.registerDragCallback(dragCallback);
input.registerReleaseCallback(releaseCallback);
input.registerKeydownCallback(keydownCallback);

requestAnimationFrame(tick);

function resize(force = false) {
  const newAspectRatio = window.innerWidth / window.innerHeight;

  // If we haven't changed or it's the first time
  if (aspectRatio === newAspectRatio && force === false) {
    return;
  } else {
    aspectRatio = newAspectRatio;
  }

  let scaledWidth = width;
  let scaledHeight = height;

  if (aspectRatio >= desiredAspectRatio) {
    scaledHeight = height;
    scaledWidth = height * aspectRatio;
  } else {
    scaledHeight = width / aspectRatio;
    scaledWidth = width;
  }

  // if (aspectRatio >= 1) {
  //   scaledWidth = width;
  //   scaledHeight = width / aspectRatio;
  // } else {
  //   scaledHeight = height;
  //   scaledWidth = height * aspectRatio;
  // }

  canvas.width = scaledWidth;
  canvas.height = scaledHeight;
  console.log(scaledWidth);

  renderer.canvasOffset.set(
    (scaledWidth - desiredWidth) / 2,
    (scaledHeight - desiredHeight) / 2,
    0
  );

  // How much have we stretched the canvas to fit the screen
  canvasWindowScale = window.innerHeight / scaledHeight;
}

document.body.onkeyup = function (e) {
  if (e.key == " " || e.code == "Space" || e.keyCode == 32) {
    tick(performance.now());
  }
};
