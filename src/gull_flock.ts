import Flock from "./flock";
import Gull from "./gull";
import {
  IState,
  CircleTargetState,
  GULL_FLOCK_INPUTS,
} from "./gull_flock_states";

export default class GullFlock extends Flock {
  fearDistance: number;
  modeState: IState<GullFlock, GULL_FLOCK_INPUTS>;

  constructor(gulls: Gull[]) {
    super(gulls);
    this.modeState = new CircleTargetState();
  }

  attack() {
    console.log("attack button");
    this.modeState.handleInput(this, GULL_FLOCK_INPUTS.ATTACK);
    console.log("and now we are in", this.modeState);
  }

  circleTarget() {
    console.log("circle button");
    this.modeState.handleInput(this, GULL_FLOCK_INPUTS.CIRCLE_TARGET);
  }
}
