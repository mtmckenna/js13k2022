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
}
