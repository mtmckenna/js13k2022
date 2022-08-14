import Flock from "./flock";
import Gull from "./gull";

export default class GullFlock extends Flock {
  fearDistance: number;

  constructor(gulls: Gull[]) {
    super(gulls);
  }
}
