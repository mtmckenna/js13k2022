import { Vector, dist } from "./math";
import Sprite from "./sprite";

export default class Flock {
  afraid: boolean;
  sprites: Sprite[];
  fearDistance: number;

  private _center: Vector;

  constructor(sprites: Sprite[]) {
    this._center = new Vector(0, 0, 0);
    this.sprites = sprites;
    this.afraid = false;
  }

  get center(): Vector {
    this._center.set(0, 0, 0);

    for (const person of this.sprites) {
      this._center.add(person.pos);
    }

    this._center.div(this.sprites.length);

    return this._center;
  }
}

const MAX_STEERING_FORCE = 0.1;
const MAX_SPEED = 3;

// Coding Train: https://www.youtube.com/watch?v=mhjuuHl6qHM
// https://editor.p5js.org/codingtrain/sketches/ry4XZ8OkN
export function align(owner: Sprite, sprites: Sprite[]): Vector {
  let total = 0;

  // steering = desired - velocity
  const steering = new Vector(0, 0, 0);

  for (const sprite of sprites) {
    if (owner.id !== sprite.id) {
      steering.add(sprite.vel);
      total++;
    }
  }

  if (total > 0) {
    steering.div(total);
    steering.setMag(MAX_SPEED);

    steering.sub(owner.vel);
    steering.limit(MAX_STEERING_FORCE);
  }

  return steering;
}

export function cohere(
  owner: Sprite,
  gulls: Sprite[],
  posToCircle?: Vector,
  multiplier = 1
): Vector {
  let total = 0;

  // steering = desired - velocity
  const steering = new Vector(0, 0, 0);

  for (const gull of gulls) {
    if (!posToCircle) posToCircle = gull.pos;

    if (owner.id !== gull.id) {
      steering.add(posToCircle);
      total++;
    }
  }

  if (total > 0) {
    steering.div(total);
    steering.sub(owner.pos);
    // steering.setMag(MAX_SPEED);

    steering.limit(MAX_STEERING_FORCE);
  }

  return steering.mult(multiplier);
}

export function separate(
  owner: Sprite,
  gulls: Sprite[],
  radius: number,
  multiplier = 1
): Vector {
  let total = 0;

  // steering = desired - velocity
  const steering = new Vector(0, 0, 0);

  for (const gull of gulls) {
    const d = dist(owner.pos, gull.pos);

    if (owner.id !== gull.id && d < radius) {
      const diff = Vector.sub(owner.pos, gull.pos);
      if (d !== 0) diff.div(d);
      steering.add(diff);
      total++;
    }
  }

  if (total > 0) {
    steering.div(total);
    steering.setMag(MAX_SPEED);
    steering.sub(owner.vel);

    steering.limit(MAX_STEERING_FORCE);
  }

  return steering.mult(multiplier);
}
