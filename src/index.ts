import Gull from "./gull";
import Person from "./person";
import PersonFlock from "./person_flock";
import GullFlock from "./gull_flock";
import Stage from "./stage";
import { randomFloatBetween, Vector, overlaps } from "./math";
import RallyPoint from "./rally_point";
import Input from "./input";
import Renderer from "./renderer";
import Ui from "./ui";
import Camera from "./camera";
import BloodSystem from "./blood_system";
import SafeHouseTop from "./safe_house_top";
import SafeHouseLeft from "./safe_house_left";
import SafeHouseRight from "./safe_house_right";
import SafeHouseDoor from "./safe_house_door";
import Trash from "./trash";
import Car from "./car";
import { AttackState } from "./ui_states";

const debug = false;

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
const rallyPoints: RallyPoint[] = [
  new RallyPoint(new Vector(width / 4, height / 2, 0), currentStage),
];
const gulls: Gull[] = [];
const gullFlocks: GullFlock[] = [];
const gullFlock: GullFlock = new GullFlock(gulls, rallyPoints[0]);
gullFlocks.push(gullFlock);

const safeHouseLeft = new SafeHouseLeft(
  new Vector(8 * 4, 32 * 3 * 2, 0),
  currentStage
);

const safeHouseDoor = new SafeHouseDoor(
  new Vector(
    safeHouseLeft.pos.x + safeHouseLeft.size.x,
    safeHouseLeft.pos.y,
    0
  ),
  currentStage
);

const safeHouseRight = new SafeHouseRight(
  new Vector(
    safeHouseLeft.pos.x + safeHouseLeft.size.x + safeHouseDoor.size.x,
    safeHouseLeft.pos.y,
    0
  ),
  currentStage
);

const safeHouseTop = new SafeHouseTop(
  new Vector(safeHouseLeft.pos.x, safeHouseLeft.pos.y, 0),
  currentStage
);

safeHouseTop.pos.set(
  safeHouseTop.pos.x,
  safeHouseTop.pos.y + safeHouseTop.size.y,
  safeHouseTop.pos.z
);
safeHouseTop.setOverlappingCellsWalkability();

const trashCans = [];
for (let i = 0; i < 13; i++) {
  const trashCan = new Trash(
    new Vector(20 * 16, 28 * 16 - i * 8 * 2, 0),
    currentStage
  );
  trashCans.push(trashCan);
}

const cars = [];
const car1 = new Car(new Vector(3 * 16, 8 * 16, 0), currentStage);

cars.push(car1);

const bumpables = [
  safeHouseTop,
  safeHouseLeft,
  safeHouseRight,
  ...trashCans,
  ...cars,
];
currentStage.bumpables = bumpables;

const bloodSystem = BloodSystem.getInstance();
const people: Person[] = [];

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

for (let i = 0; i < 3; i++) {
  const randomOffset = 50;
  const pos = new Vector(
    width + randomFloatBetween(-1 * randomOffset, randomOffset),
    height + randomFloatBetween(-1 * randomOffset, randomOffset),
    10
  );
  const person = new Person(pos, currentStage);
  person.vel.x = randomFloatBetween(-5, 5);
  person.vel.y = randomFloatBetween(-0.5, 5);
  person.safeHouseDoors = [safeHouseDoor];
  people.push(person);
}

for (let i = 0; i < 3; i++) {
  const randomOffset = 50;
  const pos = new Vector(
    100 + randomFloatBetween(-1 * randomOffset, randomOffset),
    50 + randomFloatBetween(-1 * randomOffset, randomOffset),
    10
  );
  const person = new Person(pos, currentStage);
  person.vel.x = randomFloatBetween(-5, 5);
  person.vel.y = randomFloatBetween(-0.5, 5);
  person.safeHouseDoors = [safeHouseDoor];
  people.push(person);
}

const personFlock1 = new PersonFlock(people.slice(0, 3));
const personFlock2 = new PersonFlock(people.slice(3, 6));
const personFlocks = [personFlock1, personFlock2];

currentStage.people = people;
currentStage.gulls = gulls;
currentStage.gullFlocks = gullFlocks;
currentStage.personFlocks = personFlocks;

const ui = Ui.getInstance();
ui.createUi(currentStage);

function tick(t: number) {
  requestAnimationFrame(tick);
  resize();
  renderer.renderTick(currentStage);

  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  currentStage.draw();

  // const flockCenter = rallyPoints[0].pos;

  rallyPoints.forEach((rallyPoint) => rallyPoint.draw());

  for (let i = 0; i < bloodSystem.bloods.length; i++) {
    const blood = bloodSystem.bloods[i];
    if (blood.inUse()) {
      blood.update();
      blood.draw();
    }
  }

  safeHouseLeft.draw(t);
  safeHouseRight.draw(t);
  safeHouseDoor.draw();
  safeHouseTop.draw(t);
  trashCans.forEach((trashCan) => trashCan.draw(t));
  cars.forEach((car) => car.draw(t));

  gulls.forEach((gull) => {
    gull.update(t);
    gull.draw(t);
  });

  for (let i = 0; i < people.length; i++) {
    const person = people[i];
    if (person.safe || person.dead) continue;
    person.update(t);
    person.draw(t);
  }

  currentStage.gullFlocks.forEach((gullFlock) => {
    gullFlock.sprites.forEach((gull) =>
      gull.flock(gullFlock.sprites, gullFlock.rallyPoint.pos)
    );
  });

  // Panic if under attack
  if (ui.state instanceof AttackState) {
    currentStage.people.forEach((person) => {
      if (!person.dead && !person.safe) {
        gulls.forEach((gull) => {
          if (overlaps(gull, person)) {
            person.damage(1, t);
          }
        });
      }
    });
  } else {
    currentStage.personFlocks.forEach((personFlock) => {
      personFlock.sprites.forEach((person) =>
        person.flock(personFlock.sprites)
      );
    });
  }

  ui.update();

  if (debug) renderer.drawGrid();
  currentStage.fillCell(mouseCell, "blue");
}

function moveObjectClickCallback(pos: Vector) {
  const gamePos = screenToGameCoordinates(pos);
  const obstacle = currentStage.selectObstacle(pos);
  console.log("move");
}

let mouseCell = { x: 0, y: 0 };
function moveMouseCallback(pos: Vector) {
  const gamePos = screenToGameCoordinates(pos);
  // console.log(gamePos);
  const cell = currentStage.getCellForPos(gamePos, true);
  // console.log("move");
  mouseCell = { x: cell.x, y: cell.y };
}

function rallyPointClickCallback(pos: Vector) {
  const gamePos = screenToGameCoordinates(pos);
  rallyPoints[0].pos.set(gamePos.x, gamePos.y, gamePos.z);
}

function screenToGameCoordinates(pos: Vector): Vector {
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

  return pos;
}

// function keydownCallback(keyCode: string) {
//   switch (keyCode) {
//     case "ArrowLeft":
//       renderer.camera.moveBy(-1, 0, 0);
//       break;
//     case "ArrowRight":
//       renderer.camera.moveBy(1, 0, 0);
//       break;
//     case "ArrowUp":
//       renderer.camera.moveBy(0, -1, 0);
//       break;
//     case "ArrowDown":
//       renderer.camera.moveBy(0, 1, 0);
//       break;
//     case "-":
//       renderer.camera.moveBy(0, 0, -0.1);
//       resize(true);
//       break;
//     case "+":
//       renderer.camera.moveBy(0, 0, 0.1);
//       resize(true);
//       break;
//   }

//   // resetCameraWhenAtLimit();
// }

input.registerClickCallback(rallyPointClickCallback);
input.registerClickCallback(moveObjectClickCallback);
input.registermoveCallback(moveMouseCallback);

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

  canvas.width = scaledWidth;
  canvas.height = scaledHeight;

  renderer.canvasOffset.set(
    (scaledWidth / camera.pos.z - desiredWidth) / 2,
    (scaledHeight / camera.pos.z - desiredHeight) / 2,
    0
  );

  // How much have we stretched the canvas to fit the screen
  canvasWindowScale = window.innerHeight / scaledHeight;
}
