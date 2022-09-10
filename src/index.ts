import Gull from "./gull";
import Person from "./person";
import PersonFlock from "./person_flock";
import GullFlock from "./gull_flock";
import Stage from "./stage";
import { randomFloatBetween, Vector, overlaps } from "./math";
import Input from "./input";
import Renderer from "./renderer";
import Ui from "./ui";
import BloodSystem from "./blood_system";
import Trash from "./trash";
import Car from "./car";
import { AttackState } from "./ui_states";
import SafeHouse from "./safe_house";
import { stage1 } from "./stages";

const bloodSystem = BloodSystem.getInstance();

const canvas: HTMLCanvasElement = document.getElementById(
  "game"
) as HTMLCanvasElement;
const ctx: CanvasRenderingContext2D = canvas.getContext("2d");

const desiredWidth = 640;
const desiredHeight = 480;
const width = desiredWidth;
const height = desiredHeight;
canvas.width = width;
canvas.height = height;

const desiredAspectRatio = width / height;
let aspectRatio = null;
let canvasWindowScale = 0;

const renderer = Renderer.getInstance();

const currentStage = stage1;

// const currentStage = new Stage(new Vector(width, height, 0));
// const gulls: Gull[] = [];
// const gullFlocks: GullFlock[] = [];

// const safeHouse = new SafeHouse(new Vector(16 * 2, 16 * 15, 0), currentStage);

// const trashCans = [];
// for (let i = 0; i < 13; i++) {
//   const trashCan = new Trash(
//     new Vector(20 * 16, 28 * 16 - i * 8 * 2, 0),
//     currentStage
//   );
//   trashCans.push(trashCan);
// }

// const cars = [];
// const car1 = new Car(new Vector(3 * 16, 8 * 16, 0), currentStage);

// cars.push(car1);

// const bumpables = [safeHouse, ...trashCans, ...cars];

// currentStage.bumpables = bumpables;

// const bloodSystem = BloodSystem.getInstance();
// const people: Person[] = [];

const input = Input.getInstance();
input.addEventListeners(canvas);

// for (let i = 0; i < 10; i++) {
//   const pos = new Vector(
//     randomFloatBetween(0, canvas.width),
//     randomFloatBetween(0, canvas.height),
//     0
//   );
//   const gull = new Gull(pos, currentStage);
//   gull.vel.x = randomFloatBetween(-5, 5);
//   gull.vel.y = randomFloatBetween(-0.5, 5);
//   gulls.push(gull);
// }

// for (let i = 0; i < 3; i++) {
//   const randomOffset = 50;
//   const pos = new Vector(
//     width + randomFloatBetween(-1 * randomOffset, randomOffset),
//     height + randomFloatBetween(-1 * randomOffset, randomOffset),
//     10
//   );
//   const person = new Person(pos, currentStage);
//   person.vel.x = randomFloatBetween(-5, 5);
//   person.vel.y = randomFloatBetween(-0.5, 5);

//   person.safeHouse = safeHouse;
//   people.push(person);
// }

// for (let i = 0; i < 3; i++) {
//   const randomOffset = 50;
//   const pos = new Vector(
//     100 + randomFloatBetween(-1 * randomOffset, randomOffset),
//     50 + randomFloatBetween(-1 * randomOffset, randomOffset),
//     10
//   );
//   const person = new Person(pos, currentStage);
//   person.vel.x = randomFloatBetween(-5, 5);
//   person.vel.y = randomFloatBetween(-0.5, 5);
//   // person.safeHouseDoors = [safeHouseDoor];
//   // person.safeHouseCells = [safeHouse.doorCell];
//   person.safeHouse = safeHouse;
//   people.push(person);
// }

// const personFlock1 = new PersonFlock(people.slice(0, 3));
// const personFlock2 = new PersonFlock(people.slice(3, 6));
// const personFlocks = [personFlock1, personFlock2];

// currentStage.setPeople(people);
// currentStage.gulls = gulls;
// currentStage.gullFlocks = gullFlocks;
// currentStage.personFlocks = personFlocks;
// currentStage.recalculateAvailableBirds();

const ui = Ui.getInstance();
ui.createUi(currentStage);

function tick(t: number) {
  requestAnimationFrame(tick);
  resize();
  renderer.renderTick(currentStage);

  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  currentStage.draw();

  for (let i = 0; i < bloodSystem.bloods.length; i++) {
    const blood = bloodSystem.bloods[i];
    if (blood.inUse()) {
      blood.update();
      blood.draw();
    }
  }

  currentStage.safeHouse.draw(t);

  currentStage.trashCans.forEach((trashCan) => trashCan.draw(t));
  currentStage.cars.forEach((car) => car.draw(t));

  for (let i = 0; i < currentStage.people.length; i++) {
    const person = currentStage.people[i];
    if (person.safe || person.dead) continue;
    person.update(t);
    person.draw(t);
  }

  currentStage.gullFlocks.forEach((gullFlock) => {
    gullFlock.rallyPoint.draw();
    gullFlock.sprites.forEach((gull) => {
      gull.flock(gullFlock.sprites, gullFlock.rallyPoint.pos);
      if (currentStage.selectedFlock === gullFlock)
        gullFlock.rallyPoint.drawLineToGull(gull);
    });
  });

  currentStage.gulls.forEach((gull) => {
    gull.update(t);
    gull.draw(t);
  });

  currentStage.availableGulls.forEach((gull) => {
    gull.flock(currentStage.availableGulls, currentStage.center);
  });

  // Panic if under attack
  if (ui.state instanceof AttackState) {
    currentStage.people.forEach((person) => {
      if (!person.dead && !person.safe) {
        currentStage.gulls.forEach((gull) => {
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

  // renderer.drawGrid();
}

function rallyPointClickCallback(pos: Vector) {
  if (!currentStage.selectedFlock) return;

  const gamePos = screenToGameCoordinates(pos);
  currentStage.selectedFlock.rallyPoint.pos.set(
    gamePos.x,
    gamePos.y,
    gamePos.z
  );
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

input.registerClickCallback(rallyPointClickCallback);

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
    (scaledWidth - desiredWidth) / 2,
    (scaledHeight - desiredHeight) / 2,
    0
  );

  // How much have we stretched the canvas to fit the screen
  canvasWindowScale = window.innerHeight / scaledHeight;
}
