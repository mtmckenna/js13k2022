import Gull from "./gull";
import Person from "./person";
import PersonFlock from "./person_flock";
import GullFlock from "./gull_flock";
import Stage from "./stage";
import { randomFloatBetween, Vector, dist, overlaps } from "./math";
import Debug from "./debug";
import RallyPoint from "./rally_point";
import { registerClickCallback, addEventListeners } from "./input";
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
const camera = new Camera(new Vector(0, 0, 1.5));
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
addEventListeners(canvas);

// const rallyPoint = new RallyPoint(new Vector(width / 2, height / 2, 0));

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
}

function clickCallback(pos: Vector) {
  // rallyPoints.push(new RallyPoint(pos));
  // rallyPoints[0] = new RallyPoint(pos.mult(aspectRatio));
  pos.set(pos.x / canvasWindowScale, pos.y / canvasWindowScale, 0);

  rallyPoints[0] = new RallyPoint(pos);
}

registerClickCallback(clickCallback);

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
