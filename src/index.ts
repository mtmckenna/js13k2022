import Gull from "./gull";
import Person from "./person";
import PersonFlock from "./person_flock";
import GullFlock from "./gull_flock";
import Stage from "./stage";
import { randomFloatBetween, Vector, overlaps, clamp } from "./math";
import Debug from "./debug";
import RallyPoint from "./rally_point";
import Input from "./input";
import Renderer from "./renderer";
import Ui from "./ui";
import { AttackState } from "./gull_flock_states";
import { CalmState } from "./person_flock_states";
import Camera from "./camera";
import BloodSystem from "./blood_system";
import SafeHouseTop from "./safe_house_top";
import SafeHouseLeft from "./safe_house_left";
import SafeHouseRight from "./safe_house_right";
import SafeHouseDoor from "./safe_house_door";
import Trash from "./trash";

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

const safeHouseLeft = new SafeHouseLeft(
  new Vector(4, height / 2, 0),
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

const trash = new Trash(new Vector(300, 400, 0), currentStage);

const bumpables = [safeHouseTop, safeHouseLeft, safeHouseRight];
currentStage.bumpables = bumpables;

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

for (let i = 0; i < 1; i++) {
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

function tick(t: number) {
  requestAnimationFrame(tick);
  resize();
  renderer.renderTick(currentStage);

  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  currentStage.draw();

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

  // safeHouse.draw(t);

  safeHouseLeft.draw(t);
  safeHouseRight.draw(t);
  safeHouseDoor.draw();
  safeHouseTop.draw(t);

  const alivePeople = [];
  for (let i = 0; i < people.length; i++) {
    const person = people[i];
    if (personFlock.modeState instanceof CalmState) personFlock.flock();

    person.update(t);
    if (!person.dead && !person.safe) {
      alivePeople.push(person);
      person.draw(t);
    }
  }
  people = alivePeople;

  trash.draw(t);

  gulls.forEach((gull) => {
    gull.flock(gulls, flockCenter);
    gull.update(t);
    gull.draw(t);
  });

  personFlock.update(t);
  gullFlock.update(t);

  if (gullFlock.modeState instanceof AttackState) {
    personFlock.panic(gullFlock.center);
    gullFlock.sprites.forEach((gull: Gull) => {
      people.forEach((person: Person) => {
        if (overlaps(gull, person)) {
          person.damage(1, t);
        }
      });
    });
  } else {
    personFlock.calm();
  }

  ui.update(gullFlock);

  if (debug.gridEnabled) {
    ctx.fillStyle = "red";
    renderer.drawGrid();
  }

  // testPathFinding();

  // moveStage();
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
  // resetCameraWhenAtLimit();
}

function dragCallback(pos: Vector) {
  const MAX_DRAG = 2;
  renderer.camera.moveBy(
    clamp(-pos.x, -1 * MAX_DRAG, MAX_DRAG),
    clamp(-pos.y, -1 * MAX_DRAG, MAX_DRAG),
    0
  );
  document.body.style.cursor = "grab";
  // resetCameraWhenAtLimit();
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
      renderer.camera.moveBy(-1, 0, 0);
      break;
    case "ArrowRight":
      renderer.camera.moveBy(1, 0, 0);
      break;
    case "ArrowUp":
      renderer.camera.moveBy(0, -1, 0);
      break;
    case "ArrowDown":
      renderer.camera.moveBy(0, 1, 0);
      break;
    case "-":
      renderer.camera.moveBy(0, 0, -0.1);
      resize(true);
      break;
    case "+":
      renderer.camera.moveBy(0, 0, 0.1);
      resize(true);
      break;
  }

  // resetCameraWhenAtLimit();
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

document.body.onkeyup = function (e) {
  if (e.key == " " || e.code == "Space" || e.keyCode == 32) {
    tick(performance.now());
  }
};
