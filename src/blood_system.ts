import Blood from "./blood";
import { Vector } from "./math";
import Person from "./person";
import Renderer from "./renderer";

const POOL_SIZE = 1000;

export default class BloodSystem {
  private static instance: BloodSystem;

  private bloods: Blood[] = [];

  constructor(renderer: Renderer, poolSize = POOL_SIZE) {
    for (let i = 0; i < poolSize; i++) {
      const blood = new Blood(new Vector(0, 0, 0), renderer);
      this.bloods.push(blood);
    }
  }

  getBlood(person: Person) {
    return this.bloods.find((blood) => !blood.inUse()).regen(person);
  }

  public static getInstance(): BloodSystem {
    if (!BloodSystem.instance)
      BloodSystem.instance = new BloodSystem(Renderer.getInstance());
    return BloodSystem.instance;
  }
}
