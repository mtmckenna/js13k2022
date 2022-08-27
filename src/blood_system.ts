import Blood from "./blood";
import { Vector } from "./math";
import Renderer from "./renderer";
import { IBox } from "./interfaces";

const POOL_SIZE = 1000;

export default class BloodSystem {
  private static instance: BloodSystem;

  public bloods: Blood[] = [];

  constructor(renderer: Renderer, poolSize = POOL_SIZE) {
    for (let i = 0; i < poolSize; i++) {
      const blood = new Blood(new Vector(0, 0, 0), renderer);
      this.bloods.push(blood);
    }
  }

  regenBlood(box: IBox) {
    let blood: Blood | null = null;
    for (let i = 0; i < this.bloods.length; i++) {
      blood = this.bloods[i];
      if (!blood.inUse()) {
        blood.regen(box);
        break;
      }
    }

    return blood;
    // return this.bloods.find((blood) => !blood.inUse()).regen(person);
  }

  public static getInstance(): BloodSystem {
    if (!BloodSystem.instance)
      BloodSystem.instance = new BloodSystem(Renderer.getInstance());
    return BloodSystem.instance;
  }
}
