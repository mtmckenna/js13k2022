import Car from "./car";
import { randomIntBetween, Vector } from "./math";
import Person from "./person";
import PersonFlock from "./person_flock";
import SafeHouse from "./safe_house";
import Stage from "./stage";
import Trash from "./trash";
import Gull from "./gull";

const width = 640;
const height = 480;
const stageSize = new Vector(width, height, 0);
const C = Stage.CELL_SIZE;

export const stages = [];
export const stageGenerators = [];
const stage1 = generateStage1();
const stage2 = generateStage2();
const stage3 = generateStage3();

stageGenerators.push(generateStage1);
stageGenerators.push(generateStage2);
stageGenerators.push(generateStage3);

stages.push(stage1);
stages.push(stage2);
stages.push(stage3);

function generateStage1(): Stage {
  const stage = new Stage(stageSize);
  const stage1House = new SafeHouse(stage.topCenter, stage);
  const stage1Car1 = new Car(stage.center, stage);
  const stage1Car2 = new Car(
    new Vector(stage.center.x + C * 6, stage.center.y - C * 5, 0),
    stage
  );
  const stage1Car3 = new Car(
    new Vector(stage.center.x - C * 6, stage.center.y + C * 5, 0),
    stage
  );
  const stage1PersonFlock = generatePersonFlock(stage.bottomCenter, 3, stage);

  const trashCan1 = new Trash(
    new Vector(stage.center.x, stage.center.y + C * 3, 0),
    stage
  );

  const trashCan2 = new Trash(
    new Vector(stage.center.x, stage.center.y + C * 5, 0),
    stage
  );

  const trashCan3 = new Trash(
    new Vector(stage.center.x + C * 2, stage.center.y + C * 2, 0),
    stage
  );

  const stage1Props: IStageProps = {
    trashCans: [trashCan1, trashCan2, trashCan3],
    cars: [stage1Car1, stage1Car2, stage1Car3],
    safeHouse: stage1House,
    personFlocks: [stage1PersonFlock],
    gulls: generateGulls(5, stage),
    index: 0,
  };

  stage.processStageProps(stage1Props);

  return stage;
}

stageGenerators.push(generateStage1);

function generateStage2(): Stage {
  const stage = new Stage(stageSize);
  const housePos = stage.bottomLeft.copy();
  housePos.set(housePos.x, housePos.y + SafeHouse.SIZE.y, housePos.z);

  const stageHouse = new SafeHouse(housePos, stage);

  const stage1Car1 = new Car(stage.center, stage);
  const stage1Car2 = new Car(
    new Vector(stage.center.x + C, stage.center.y - C * 5, 0),
    stage
  );
  const stage1Car3 = new Car(
    new Vector(stage.center.x - C * 6, stage.center.y + C * 5, 0),
    stage
  );

  const stage1Car4 = new Car(
    new Vector(stage.center.x - C * 13, stage.center.y + C * 5, 0),
    stage
  );
  const personFlock1 = generatePersonFlock(stage.topLeft, 3, stage);
  const personFlock2 = generatePersonFlock(stage.topRight, 5, stage);

  const trashCan1 = new Trash(
    new Vector(stage.topRight.x, stage.center.y + C * 3, 0),
    stage
  );

  const trashCan2 = new Trash(
    new Vector(stage.topLeft.x - C * 3, stage.center.y - C * 5, 0),
    stage
  );

  const trashCan3 = new Trash(
    new Vector(stage.center.x + C * 2, stage.center.y + C * 2, 0),
    stage
  );

  const trashCan4 = new Trash(
    new Vector(stage.center.x + C * 5, stage.center.y + C * 2, 0),
    stage
  );

  const stageProps: IStageProps = {
    trashCans: [trashCan1, trashCan2, trashCan3, trashCan4],
    cars: [stage1Car1, stage1Car2, stage1Car3, stage1Car4],
    safeHouse: stageHouse,
    personFlocks: [personFlock1, personFlock2],
    gulls: generateGulls(4, stage),
    index: 0,
  };

  stage.processStageProps(stageProps);

  return stage;
}

function generateStage3(): Stage {
  const stage = new Stage(stageSize);
  const housePos = stage.center.copy();
  housePos.set(
    housePos.x - SafeHouse.SIZE.x / 2,
    housePos.y + SafeHouse.SIZE.y / 2,
    housePos.z
  );

  const stageHouse = new SafeHouse(housePos, stage);

  const car1Pos = stage.center.copy();
  car1Pos.set(
    car1Pos.x - C * 8 - SafeHouse.SIZE.x / 2,
    car1Pos.y + C * 8 + SafeHouse.SIZE.y / 2,
    0
  );

  const car2Pos = stage.center.copy();
  car2Pos.set(
    car2Pos.x + C * 8 - SafeHouse.SIZE.x / 2,
    car2Pos.y + C * 8 + SafeHouse.SIZE.y / 2,
    0
  );

  const car3Pos = stage.center.copy();
  car3Pos.set(
    car3Pos.x - C * 8 - SafeHouse.SIZE.x / 2,
    car3Pos.y - C * 8 + SafeHouse.SIZE.y / 2,
    0
  );

  const car4Pos = stage.center.copy();
  car4Pos.set(
    car4Pos.x + C * 8 - SafeHouse.SIZE.x / 2,
    car4Pos.y - C * 8 + SafeHouse.SIZE.y / 2,
    0
  );

  const stageCar1 = new Car(car1Pos, stage);
  const stageCar2 = new Car(car2Pos, stage);
  const stageCar3 = new Car(car3Pos, stage);
  const stageCar4 = new Car(car4Pos, stage);

  const personFlock1 = generatePersonFlock(stage.leftCenter, 12, stage);

  const stageProps: IStageProps = {
    trashCans: [],
    cars: [stageCar1, stageCar2, stageCar3, stageCar4],
    safeHouse: stageHouse,
    personFlocks: [personFlock1],
    gulls: generateGulls(8, stage),
    index: 0,
  };

  stage.processStageProps(stageProps);

  return stage;
}

function generatePersonFlock(
  location: Vector,
  numberOfPeople: number,
  stage: Stage,
  spread = 3
): PersonFlock {
  const people: Person[] = [];
  for (let i = 0; i < numberOfPeople; i++) {
    const location2 = new Vector(
      location.x + randomIntBetween(-C * spread, C * spread),
      location.y + randomIntBetween(-C * spread, C * spread),
      0
    );
    const person = new Person(location2, stage);
    people.push(person);
  }

  return new PersonFlock(people);
}

function generateGulls(numGulls, stage, spread = 3) {
  const gulls: Gull[] = [];

  for (let i = 0; i < numGulls; i++) {
    const location2 = new Vector(
      stage.center.x + randomIntBetween(-C * spread, C * spread),
      stage.center.y + randomIntBetween(-C * spread, C * spread),
      0
    );
    const gull = new Gull(location2, stage);
    gulls.push(gull);
  }

  return gulls;
}

export interface IStageProps {
  trashCans: Trash[];
  cars: Car[];
  safeHouse: SafeHouse;
  personFlocks: PersonFlock[];
  gulls: Gull[];
  index: number;
}
