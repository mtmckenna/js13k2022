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

export const stage1 = new Stage(stageSize);
const stage1House = new SafeHouse(stage1.topCenter, stage1);
const stage1Car1 = new Car(stage1.center, stage1);
const stage1Car2 = new Car(
  new Vector(stage1.center.x + C * 6, stage1.center.y - C * 5, 0),
  stage1
);
const stage1Car3 = new Car(
  new Vector(stage1.center.x - C * 6, stage1.center.y + C * 5, 0),
  stage1
);
const stage1PersonFlock = generatePersonFlock(stage1.bottomCenter, 3, stage1);

const trashCan1 = new Trash(
  new Vector(stage1.center.x, stage1.center.y + C * 3, 0),
  stage1
);

const trashCan2 = new Trash(
  new Vector(stage1.center.x, stage1.center.y + C * 5, 0),
  stage1
);

const trashCan3 = new Trash(
  new Vector(stage1.center.x + C * 2, stage1.center.y + C * 2, 0),
  stage1
);

const stage1Props: IStageProps = {
  trashCans: [trashCan1, trashCan2, trashCan3],
  cars: [stage1Car1, stage1Car2, stage1Car3],
  safeHouse: stage1House,
  personFlocks: [stage1PersonFlock],
  gulls: generateGulls(5, stage1),
  number: 1,
};

stage1.processStageProps(stage1Props);

export const stages = [stage1];

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
  number: number;
}
