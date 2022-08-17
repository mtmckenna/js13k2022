import Gull from "./gull";
import Person from "./person";
import PersonFlock from "./person_flock";
import GullFlock from "./gull_flock";
import Stage from "./stage";
import { randomFloatBetween, Vector, dist } from "./math";
import Debug from "./debug";
import RallyPoint from "./rally_point";
import { registerClickCallback, addEventListeners } from "./input";
import Renderer from "./renderer";
import Ui from "./ui";

const canvas: HTMLCanvasElement = document.getElementById(
  "game"
) as HTMLCanvasElement;
const ctx: CanvasRenderingContext2D = canvas.getContext("2d");

const width = 640;
const height = 480;
let aspectRatio = window.innerWidth / window.innerHeight;

let scaledWidth = width;
let scaledHeight = height;

const skyPos: Vector = new Vector(0, 0, 0);
const skySize: Vector = new Vector(width, 50, 0);

const beachPos: Vector = new Vector(0, skyPos.y + skySize.y, 0);
const beachSize: Vector = new Vector(width, 100, 0);

const sunPos: Vector = new Vector(width / 2, skyPos.y + skySize.y, 0);
const sunSize: Vector = new Vector(beachSize.y / 2.5, beachSize.y / 2.5, 0);

const lotPos: Vector = new Vector(0, beachPos.y + beachSize.y, 0);
const lotSize: Vector = new Vector(width, height - beachSize.y - skySize.y, 0);

const renderer = Renderer.getInstance();

canvas.width = width;
canvas.height = height;

const currentStage = new Stage(new Vector(width, height, 0));
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
  renderer.renderTick();

  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBackground();

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
  if (personGullFlockDistance <= personFlock.fearDistance) {
    personFlock.flipOut(gullFlock.center);
  }

  ui.update(gullFlock);
}

function clickCallback(pos: Vector) {
  // rallyPoints.push(new RallyPoint(pos));
  // rallyPoints[0] = new RallyPoint(pos.mult(aspectRatio));
  rallyPoints[0] = new RallyPoint(pos);
  console.log(pos);
}

registerClickCallback(clickCallback);

// resize();
requestAnimationFrame(tick);

function drawBackground() {
  ctx.fillStyle = "#42bfe8";
  ctx.fillRect(skyPos.x, skyPos.y, skySize.x, skySize.y);

  ctx.beginPath();
  ctx.fillStyle = "#f8f644";
  ctx.arc(sunPos.x, sunPos.y, sunSize.x, 0, 2 * Math.PI);
  ctx.fill();

  ctx.fillStyle = "#e3d6b1";
  ctx.fillRect(beachPos.x, beachPos.y, beachSize.x, beachSize.y);

  ctx.fillStyle = "#bdbdbd";
  ctx.fillRect(lotPos.x, lotPos.y, lotSize.x, lotSize.y);
}

function resize() {
  aspectRatio = window.innerWidth / window.innerHeight;
  scaledWidth = width;
  scaledHeight = height;
  console.log(aspectRatio);

  if (aspectRatio >= 1) {
    scaledWidth = width;
    // if wider than it is tall, scale the width
    scaledHeight = width / aspectRatio;
    console.log("wide", scaledWidth, scaledHeight);
  } else {
    scaledHeight = height;
    scaledWidth = height * aspectRatio;
    console.log("tall", scaledWidth, scaledHeight);
  }

  canvas.width = scaledWidth;
  canvas.height = scaledHeight;
}

// window.addEventListener("resize", resize);

document.body.onkeyup = function (e) {
  if (e.key == " " || e.code == "Space" || e.keyCode == 32) {
    tick(performance.now());
  }
};
