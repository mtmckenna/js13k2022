import Flock from "./flock";
import Gull from "./gull";
import { CircleTargetState, GULL_FLOCK_INPUTS } from "./gull_flock_states";

import { IState } from "./interfaces";

export default class GullFlock extends Flock {
  fearDistance: number;
  flockState: IState<GullFlock, GULL_FLOCK_INPUTS>;
  sprites: Gull[];

  constructor(gulls: Gull[]) {
    super(gulls);
    this.flockState = new CircleTargetState();
  }

  flock() {
    for (let i = 0; i < this.sprites.length; i++) {
      const sprite = this.sprites[i];
      sprite.flock(this.sprites);
    }
  }

  attack() {
    this.flockState.handleInput(this, GULL_FLOCK_INPUTS.ATTACK);
  }

  circleTarget() {
    this.flockState.handleInput(this, GULL_FLOCK_INPUTS.CIRCLE_TARGET);
  }
}
