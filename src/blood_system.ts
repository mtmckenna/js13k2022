import Blood, { COLOR_MAP } from "./blood";
import { Vector } from "./math";
import Renderer from "./renderer";
import { IBox } from "./interfaces";

const POOL_SIZE = 10000;

export default class BloodSystem {
  private static instance: BloodSystem;

  public bloods: Blood[] = [];

  constructor(renderer: Renderer, poolSize = POOL_SIZE) {
    for (let i = 0; i < poolSize; i++) {
      const blood = new Blood(new Vector(0, 0, 0), renderer);
      this.bloods.push(blood);
    }
  }

  regenBlood(box: IBox, color: COLOR_MAP) {
    let blood = this.bloods.find((blood) => !blood.inUse());
    if (!blood) {
      for (let i = 0; i < Math.floor(POOL_SIZE / 2); i++) {
        const bloodToUpdate = this.bloods[i];
        bloodToUpdate.timeLeft = 0;
      }
      blood = this.bloods[0];
    }
    blood.regen(box, color);
    return blood;
  }

  reset() {
    this.bloods.forEach((blood) => (blood.timeLeft = 0));
  }

  public static getInstance(): BloodSystem {
    if (!BloodSystem.instance)
      BloodSystem.instance = new BloodSystem(Renderer.getInstance());
    return BloodSystem.instance;
  }
}
