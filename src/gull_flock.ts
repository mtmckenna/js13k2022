import Flock from "./flock";
import Gull from "./gull";

import RallyPoint from "./rally_point";

export default class GullFlock extends Flock {
  sprites: Gull[];
  rallyPoint: RallyPoint;

  constructor(gulls: Gull[], rallyPoint: RallyPoint) {
    super(gulls);
    this.rallyPoint = rallyPoint;
  }

  flock() {
    for (let i = 0; i < this.sprites.length; i++) {
      const sprite = this.sprites[i];
      sprite.flock(this.sprites);
    }
  }
}
