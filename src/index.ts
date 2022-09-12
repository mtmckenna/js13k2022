import { Vector, overlaps } from "./math";
import Input from "./input";
import Renderer from "./renderer";
import Ui from "./ui";
import BloodSystem from "./blood_system";
import { AttackState, UI_INPUTS } from "./ui_states";
import { stages, stageGenerators } from "./stages";
import RallyPoint from "./rally_point";

const bloodSystem = BloodSystem.getInstance();

const canvas: HTMLCanvasElement = document.getElementById(
  "game"
) as HTMLCanvasElement;
const ctx: CanvasRenderingContext2D = canvas.getContext("2d");

enum GAME_STATES {
  TITLE = "TITLE",
  PLAYING = "PLAYING",
  WAITING_FOR_RETRY = "WAITING_FOR_RETRY",
  WAITING_FOR_NEXT = "WAITING_FOR_NEXT",
  WON = "WON",
}

const desiredWidth = 640;
const desiredHeight = 480;
canvas.width = desiredWidth;
canvas.height = desiredHeight;

const desiredAspectRatio = desiredWidth / desiredHeight;
let aspectRatio = null;
let canvasWindowScale = 0;
let gameState: GAME_STATES = GAME_STATES.TITLE;

const renderer = Renderer.getInstance();

let currentStage = stages[2];

const input = Input.getInstance();
input.addEventListeners(canvas);

const ui = Ui.getInstance();
ui.createUi(currentStage);

function tick(t: number) {
  requestAnimationFrame(tick);
  resize();
  renderer.renderTick(currentStage);
  ctx.imageSmoothingEnabled = false;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  currentStage.draw();
  updateSprites(t);
  ui.update();

  const numPeopleLeft =
    currentStage.totalNumberOfPeople -
    currentStage.numPeopleKilled -
    currentStage.numPeopleSafe;

  if (numPeopleLeft <= 0) {
    if (currentStage.percentKilled < 0.5) {
      ui.showRetryResults();
      gameState = GAME_STATES.WAITING_FOR_RETRY;
    } else {
      const curr = stages.indexOf(currentStage) + 1;
      ui.showWinResults(curr, stages.length);
      if (curr === stages.length) {
        gameState = GAME_STATES.WON;
      } else {
        gameState = GAME_STATES.WAITING_FOR_NEXT;
      }
    }
  }

  // const door = currentStage.safeHouse.door;
  // const h = renderer.stage.size.y;
  // ctx.fillStyle = "red";
  // ctx.fillRect(
  //   (door.pos.x - renderer.offset.x) * renderer.offset.z,
  //   (h - door.pos.y - renderer.offset.y) * renderer.offset.z,
  //   door.size.x * renderer.offset.z,
  //   door.size.y * renderer.offset.z
  // );

  // renderer.drawGrid();
}

function updateSprites(t: number) {
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
}

function moveCallback(pos: Vector) {
  if (!input.selectedRallyPoint) return;
  const rallyPoint = input.selectedRallyPoint;
  if (!rallyPoint) return;
  const gamePos = screenToGameCoordinates(pos);
  rallyPoint.pos.set(gamePos.x, gamePos.y, gamePos.z);
  currentStage.resetRallyPointCosts();
}

function rallyPointClickCallback(pos: Vector) {
  if (gameState === GAME_STATES.TITLE) {
    startGame();
    return;
  } else if (gameState === GAME_STATES.WAITING_FOR_RETRY) {
    ui.hideResults();
    regenerateStage(currentStage.index);
    gameState = GAME_STATES.PLAYING;
  } else if (gameState === GAME_STATES.WAITING_FOR_NEXT) {
    ui.hideResults();
    goToNextStage();
    gameState = GAME_STATES.PLAYING;
  }

  const gamePos = screenToGameCoordinates(pos);
  const rallyPoint = currentStage.rallyPointForPos(gamePos);
  if (!rallyPoint) return;

  setFlockFromRallyPoint(rallyPoint);
}

function regenerateStage(index) {
  stages[index] = stageGenerators[index](); // regenerate stage
  currentStage = stages[index];
  reset();
}

function reset() {
  bloodSystem.reset();
  ui.state.handleInput(ui, UI_INPUTS.DEFAULT);
  ui.stage = currentStage;
}

input.registerClickCallback(rallyPointClickCallback);
input.registerMoveCallback(moveCallback);

function setFlockFromRallyPoint(rallyPoint: RallyPoint) {
  const gullFlock = currentStage.gullFlocks.find(
    (flock) => flock.rallyPoint === rallyPoint
  );
  currentStage.selectFlock(gullFlock);
  input.selectedRallyPoint = rallyPoint;
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

showMainMenu();
requestAnimationFrame(tick);

function resize(force = false) {
  const newAspectRatio = window.innerWidth / window.innerHeight;

  // If we haven't changed or it's the first time
  if (aspectRatio === newAspectRatio && force === false) {
    return;
  } else {
    aspectRatio = newAspectRatio;
  }

  let scaledWidth = desiredWidth;
  let scaledHeight = desiredHeight;

  if (aspectRatio >= desiredAspectRatio) {
    scaledHeight = desiredHeight;
    scaledWidth = desiredHeight * aspectRatio;
  } else {
    scaledHeight = desiredWidth / aspectRatio;
    scaledWidth = desiredWidth;
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

function goToNextStage() {
  const currentIndex = stages.indexOf(currentStage);
  if (currentIndex === stages.length - 1) {
    return;
  }
  const nextIndex = currentIndex + 1;
  currentStage = stages[nextIndex];
  reset();
}

function startGame() {
  ui.showUi();
  ui.hideTitle();
  gameState = GAME_STATES.PLAYING;
}

function showMainMenu() {
  ui.hideUi();
}
