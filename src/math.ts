// A lot of the math comes from https://p5js.org/

import { IBox } from "./interfaces";

export class Vector {
  x: number;
  y: number;
  z: number;

  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  public static sub(vec1: Vector, vec2: Vector) {
    return new Vector(vec1.x - vec2.x, vec1.y - vec2.y, vec1.z - vec2.z);
  }

  toString() {
    console.log(`[${this.x}, ${this.y}, ${this.z}]`);
  }

  add(otherVector: Vector) {
    this.x += otherVector.x;
    this.y += otherVector.y;
    this.z += otherVector.z;
    return this;
  }

  sub(otherVector: Vector) {
    this.x -= otherVector.x;
    this.y -= otherVector.y;
    this.z -= otherVector.z;
    return this;
  }

  copy() {
    return new Vector(this.x, this.y, this.z);
  }

  set(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  div(otherVector: Vector | number) {
    let x = 0;
    let y = 0;
    let z = 0;

    if (otherVector instanceof Vector) {
      x = otherVector.x;
      y = otherVector.y;
      z = otherVector.z;
    } else {
      x = otherVector;
      y = x;
      z = x;
    }

    if (Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z)) {
      if (x === 0 || y === 0 || z === 0) {
        console.warn("Vector.div:", "divide by 0");
        return this;
      }
      this.x /= x;
      this.y /= y;
      this.z /= z;
    } else {
      console.warn(
        "Vector.div:",
        "contains components that are either undefined or not finite numbers"
      );
    }
    return this;
  }

  mult(otherVector: Vector | number) {
    let x = 0;
    let y = 0;
    let z = 0;

    if (otherVector instanceof Vector) {
      x = otherVector.x;
      y = otherVector.y;
      z = otherVector.z;
    } else {
      x = otherVector;
      y = x;
      z = x;
    }

    if (Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z)) {
      this.x *= x;
      this.y *= y;
      this.z *= z;
    } else {
      console.warn(
        "Vector.mult:",
        "x contains components that are either undefined or not finite numbers"
      );
    }
    return this;
  }

  // https://github.com/processing/p5.js/blob/v1.4.2/src/math/p5.Vector.js#L1289
  limit(max: number) {
    const mSq = this.magSq();
    if (mSq > max * max) {
      this.div(Math.sqrt(mSq)) //normalize it
        .mult(max);
    }
    return this;
  }

  setMag(n: number) {
    return this.normalize().mult(n);
  }

  mag() {
    return Math.sqrt(this.magSq());
  }

  normalize() {
    const len = this.mag();
    if (len !== 0) this.mult(1 / len);
    return this;
  }

  magSq() {
    const x = this.x;
    const y = this.y;
    const z = this.z;
    return x * x + y * y + z * z;
  }
}

export function overlaps(box1: IBox, box2: IBox) {
  const r1Left = box1.pos.x;
  const r1Right = box1.pos.x + box1.size.x;
  const r1Top = box1.pos.y;
  const r1Bottom = box1.pos.y + box1.size.y;

  const r2Left = box2.pos.x;
  const r2Right = box2.pos.x + box2.size.x;
  const r2Top = box2.pos.y;
  const r2Bottom = box2.pos.y + box2.size.y;

  return !(
    r2Left > r1Right ||
    r2Right < r1Left ||
    r2Top > r1Bottom ||
    r2Bottom < r1Top
  );
}

export function dist(vec1: Vector, vec2: Vector) {
  return Math.hypot(vec2.x - vec1.x, vec2.y - vec1.y, vec2.z - vec1.z);
}

export function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max);
}

export function randomFloatBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function randomIntBetween(min, max) {
  return Math.floor(randomFloatBetween(min, max + 1));
}

// https://easings.net/
export function easeOutElastic(x: number): number {
  const c4 = (2 * Math.PI) / 3;

  return x === 0
    ? 0
    : x === 1
    ? 1
    : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
}
