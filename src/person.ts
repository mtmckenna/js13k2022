import { overlaps, Vector } from "./math";
import Sprite, { ISpriteProps } from "./sprite";
import Stage from "./stage";
import { Bleedable, Damagable, ICell, IState } from "./interfaces";
import BloodSystem from "./blood_system";
import personImageDataUrl from "../assets/person2.png";
import { align, cohere, separate } from "./flock";
import SpriteAnimation from "./sprite_animation";
import blood from "./blood";
import SafeHouseDoors from "./safe_house_door";
import Search from "./search";
import { PERSON_INPUTS } from "./person_states";
import PersonFlock from "./person_flock";
import { PERSON_FLOCK_INPUTS } from "./person_flock_states";

const bloodSystem = BloodSystem.getInstance();

const MAX_WALKING_SPEED = 0.5;
const MAX_RUNNING_SPEED = 1;
const MAX_HEALTH_BAR_WIDTH = 50;
const HEALTH_BAR_Y_OFFSET = 5;
const HEALTH_BAR_OUTSIDE_HEIGHT = 10;
const HEALTH_BAR_BORDER = 4;
const HEALTH_BAR_INSIDE_HEIGHT = HEALTH_BAR_OUTSIDE_HEIGHT - HEALTH_BAR_BORDER;
const HEALTH_BAR_INSIDE_OFFSET = HEALTH_BAR_BORDER / 2;

const PEOPLE_CALM_ALIGNMENT_STRENGTH = 0.05;
const PEOPLE_CALM_COHERENCE_STRENGTH = 0.4;
const PEOPLE_CALM_SEPARATION_STRENGTH = 0.7;

const PEOPLE_PANIC_ALIGNMENT_STRENGTH = 0.05;
const PEOPLE_PANIC_COHERENCE_STRENGTH = 6;
const PEOPLE_PANIC_SEPARATION_STRENGTH = 0.02;

export default class Person extends Sprite implements Bleedable, Damagable {
  public pos: Vector;

  afraid: boolean;
  lastBleedAt: number;
  bleeding: boolean;
  bloods: blood[];
  maxBleedBloods = Sprite.MAX_HEALTH;
  maxDeathBloods = 50;
  bloodTimeDelta = 5;
  safeHouseDoors: SafeHouseDoors[] = [];
  canBump = true;
  search: Search;
  path: ICell[] = [];
  safe = false;
  modeState: IState<Person, PERSON_INPUTS>;
  flockState: IState<PersonFlock, PERSON_FLOCK_INPUTS>;

  constructor(pos: Vector, stage: Stage) {
    const scale = 3;
    const size = new Vector(8 * scale, 16 * scale, 1);
    const originalSize = new Vector(8, 16, 1);
    const walk_right = new SpriteAnimation("walk_left", 2, 4, 10);
    const walk_left = new SpriteAnimation("walk_left", 2, 6, 10);
    const run_right = new SpriteAnimation("run_right", 2, 0, 5);
    const run_left = new SpriteAnimation("run_left", 2, 2, 5);
    const props: ISpriteProps = {
      name: "person",
      pos,
      imageDataUrl: personImageDataUrl,
      numFrames: 2,
      originalSize,
      size,
      debugColor: "#70c4db",
      stage,
      spriteAnimations: {
        run_right,
        run_left,
        walk_right,
        walk_left,
        default: walk_right,
      },
    };

    super(props);

    this.afraid = false;
    this.bloods = [];
    this.bleeding = false;
    this.lastBleedAt = 0;
    this.search = new Search(stage);
  }

  bleed() {
    this.bleeding = true;
  }

  stopBleeding() {
    this.bleeding = false;
  }

  die() {
    if (this.dead) return;
    this.dead = true;
    for (let i = 0; i < this.maxDeathBloods; i++) {
      this.bloods.push(bloodSystem.regenBlood(this));
    }
  }

  flock(people: Person[]) {
    const alignment = align(this, people);

    let housePos: Vector = null;
    if (this.afraid) housePos = this.safeHouseDoors[0].pos;

    const cohesion = cohere(this, people, housePos);
    const separation = separate(this, people, 30);

    let alignmentMult = PEOPLE_CALM_ALIGNMENT_STRENGTH;
    let coherenceMult = PEOPLE_CALM_COHERENCE_STRENGTH;
    let separationMult = PEOPLE_CALM_SEPARATION_STRENGTH;

    if (this.afraid) {
      alignmentMult = PEOPLE_PANIC_ALIGNMENT_STRENGTH;
      coherenceMult = PEOPLE_PANIC_COHERENCE_STRENGTH;
      separationMult = PEOPLE_PANIC_SEPARATION_STRENGTH;
    }

    this.acc.add(alignment.mult(alignmentMult));
    this.acc.add(cohesion.mult(coherenceMult));
    this.acc.add(separation.mult(separationMult));
  }

  scare(scareLocation: Vector) {
    // const steering = scareLocation.copy().sub(this.vel);
    const SCARE_FORCE_MULTIPLIER = 0.3;
    const steering = scareLocation
      .copy()
      .sub(this.pos)
      .mult(-1)
      .setMag(SCARE_FORCE_MULTIPLIER);
    this.acc.add(steering);
    this.afraid = true;
    this.canBump = false;
  }

  damage(amount: number, t: number) {
    if (t < this.lastDamagedAt + this.damageProtectionTimeDelta) return;
    this.health = Math.max(0, this.health - amount);

    for (let i = 0; i < Math.floor(amount); i++) {
      this.bloods.push(bloodSystem.regenBlood(this));
    }

    this.lastDamagedAt = t;
  }

  update(t: number) {
    super.update(t);

    if (this.afraid) {
      const start = this.stage.getCellForPos(this.center);
      const end = this.stage.getCellForPos(this.safeHouseDoors[0].center);
      const path = this.search.search(start, end);
      this.path = path;

      // Check to see if we've arrived at the safe house door
      if (path.length === 0) {
        // they're in the house
        if (overlaps(this, this.safeHouseDoors[0])) {
          this.safe = true;
        } else {
          // no way for them to access house
          console.warn("Person can't get to house");
        }
      } else {
        // Otherwise runn along the path
        const nextCell = path[0];
        const nextCellPos = this.stage.posForCell(nextCell);
        this.vel
          .set(nextCellPos.x, nextCellPos.y, nextCellPos.z)
          .sub(this.center);
        this.vel.setMag(MAX_RUNNING_SPEED);
      }
    } else {
      this.vel.setMag(MAX_WALKING_SPEED);
    }

    let animation = null;

    if (this.vel.x <= 0 && this.afraid) {
      animation = this.spriteAnimations["run_left"];
    } else if (this.vel.x <= 0 && !this.afraid) {
      animation = this.spriteAnimations["walk_left"];
    } else if (this.vel.x > 0 && this.afraid) {
      animation = this.spriteAnimations["run_right"];
    } else if (this.vel.x > 0 && !this.afraid) {
      animation = this.spriteAnimations["walk_right"];
    }

    if (
      this.bleeding &&
      this.bloods.length < this.maxBleedBloods &&
      t > this.lastBleedAt + this.bloodTimeDelta
    ) {
      this.bloods.push(bloodSystem.regenBlood(this));
      this.lastBleedAt = t;
    }

    if (this.health <= 0) this.die();

    this.changeAnimation(animation);
    this.edgesMirror2();
  }

  healthBarWidth(): number {
    return (
      (MAX_HEALTH_BAR_WIDTH * this.health) / Sprite.MAX_HEALTH -
      HEALTH_BAR_INSIDE_OFFSET * 2
    );
  }

  drawHealthBar() {
    const ctx = this.renderer.ctx;
    const h = this.stage.size.y;
    const x = this.pos.x - (MAX_HEALTH_BAR_WIDTH - this.size.x) / 2;
    const y = h - this.pos.y + this.size.y + HEALTH_BAR_Y_OFFSET;
    const offset = this.renderer.offset;

    ctx.fillStyle = "white";
    ctx.fillRect(
      (x - offset.x) * offset.z,
      (y - offset.y) * offset.z,
      MAX_HEALTH_BAR_WIDTH * offset.z,
      HEALTH_BAR_OUTSIDE_HEIGHT * offset.z
    );

    ctx.fillStyle = "red";
    ctx.fillRect(
      (x + HEALTH_BAR_INSIDE_OFFSET - offset.x) * offset.z,
      (y + HEALTH_BAR_INSIDE_OFFSET - offset.y) * offset.z,
      this.healthBarWidth() * offset.z,
      HEALTH_BAR_INSIDE_HEIGHT * offset.z
    );
  }

  draw(t: number) {
    super.draw(t);
    this.drawHealthBar();

    for (const cell of this.path) {
      this.stage.strokeCell(cell, "yellow");
    }
  }
}
