import { Vector, overlaps } from "./math";
import Input from "./input";
import Renderer from "./renderer";
import Ui from "./ui";
import BloodSystem from "./blood_system";
import { AttackState } from "./ui_states";
import { stages } from "./stages";

const bloodSystem = BloodSystem.getInstance();

const canvas: HTMLCanvasElement = document.getElementById(
  "game"
) as HTMLCanvasElement;
const ctx: CanvasRenderingContext2D = canvas.getContext("2d");

const desiredWidth = 640;
const desiredHeight = 480;
canvas.width = desiredWidth;
canvas.height = desiredHeight;

const desiredAspectRatio = desiredWidth / desiredHeight;
let aspectRatio = null;
let canvasWindowScale = 0;
let gameStarted = false;

const renderer = Renderer.getInstance();

let currentStage = stages[0];

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

  if (currentStage.peopleLeft <= 0) {
    if (currentStage.percentKilled < 0.5) {
      // console.log("show retry");
      ui.showRetryResults();
    }
  }

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

function rallyPointClickCallback(pos: Vector) {
  if (!gameStarted) {
    startGame();
    return;
  }

  if (!currentStage.selectedFlock) return;

  const gamePos = screenToGameCoordinates(pos);
  currentStage.selectedFlock.rallyPoint.pos.set(
    gamePos.x,
    gamePos.y,
    gamePos.z
  );

  currentStage.resetRallyPointCosts();
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

function retryStage() {
  ui.hideResults();
}

function goToNextStage() {
  const currentIndex = stages.indexOf(currentStage);
  if (currentIndex === stages.length - 1) {
    win();
    return;
  }
  const nextIndex = currentIndex + 1;
  currentStage = stages[nextIndex];
}

function win() {
  console.log("win!");
}

function startGame() {
  ui.showUi();
  ui.hideTitle();
  gameStarted = true;
}

function showMainMenu() {
  ui.hideUi();
}

// document.addEventListener(
//   "keyup",
//   (event) => {
//     const keyName = event.key;

//     console.log(keyName);
//     // As the user releases the Ctrl key, the key is no longer active,
//     // so event.ctrlKey is false.
//     if (keyName === "p") {
//       console.log("p");
//       // pause = true;
//     }
//   },
//   false
// );
