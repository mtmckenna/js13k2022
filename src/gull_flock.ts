import Flock from "./flock";
import Gull from "./gull";
import { CircleTargetState, GULL_FLOCK_INPUTS } from "./gull_flock_states";

import { IState } from "./interfaces";
import RallyPoint from "./rally_point";
import SoundEffects from "./sound_effects";

export default class GullFlock extends Flock {
  flockState: IState<GullFlock, GULL_FLOCK_INPUTS>;
  sprites: Gull[];
  rallyPoint: RallyPoint;

  constructor(gulls: Gull[], rallyPoint: RallyPoint) {
    super(gulls);
    this.flockState = new CircleTargetState();
    this.rallyPoint = rallyPoint;
  }

  flock() {
    for (let i = 0; i < this.sprites.length; i++) {
      const sprite = this.sprites[i];
      sprite.flock(this.sprites);
    }
  }

  attack() {
    this.flockState.handleInput(this, GULL_FLOCK_INPUTS.ATTACK);
    SoundEffects.getInstance().click.play();
  }

  circleTarget() {
    this.flockState.handleInput(this, GULL_FLOCK_INPUTS.CIRCLE_TARGET);
  }
}
