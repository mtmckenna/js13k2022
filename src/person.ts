import { overlaps, Vector } from "./math";
import Sprite, { ISpriteProps } from "./sprite";
import Stage from "./stage";
import { Bleedable, Damagable, ICell, IState } from "./interfaces";
import BloodSystem from "./blood_system";
import personImageDataUrl from "../assets/spritesheet.png";
import { align, cohere, separate } from "./flock";
import SpriteAnimation from "./sprite_animation";
import Blood from "./blood";
import SafeHouseDoors from "./safe_house_door";
import Search from "./search";
import { PERSON_INPUTS } from "./person_states";
import PersonFlock from "./person_flock";
import { PanicState, PERSON_FLOCK_INPUTS } from "./person_flock_states";
import { PeaceState, PERSON_FIGHT_INPUTS } from "./person_battle_states";
import SoundEffects from "./sound_effects";

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

  lastBleedAt: number;
  bleeding: boolean;
  bloods: Blood[];
  maxBleedBloods = Sprite.MAX_HEALTH;
  maxDeathBloods = 50;
  bloodTimeDelta = 5;
  safeHouseDoors: SafeHouseDoors[] = [];
  canBump = true;
  canMove = true;
  search: Search;
  path: ICell[] = [];
  safe = false;
  modeState: IState<Person, PERSON_INPUTS>;
  flockState: IState<PersonFlock, PERSON_FLOCK_INPUTS>;
  battleState: IState<Person, PERSON_FIGHT_INPUTS>;
  startOffset = 200;

  constructor(pos: Vector, stage: Stage) {
    const scale = 3;
    const size = new Vector(8 * scale, 16 * scale, 1);
    const originalSize = new Vector(8, 16, 1);
    const walk_right = new SpriteAnimation("walk_right", 2, 4, 10);
    const walk_left = new SpriteAnimation("walk_left", 2, 6, 10);
    const run_right = new SpriteAnimation("run_right", 2, 0, 5);
    const run_left = new SpriteAnimation("run_left", 2, 2, 5);
    const punch_right = new SpriteAnimation("punch_right", 2, 8, 5);
    const punch_left = new SpriteAnimation("punch_left", 2, 10, 5);
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
        punch_left,
        punch_right,
        default: walk_right,
      },
    };

    super(props);

    this.bloods = [];
    this.bleeding = false;
    this.lastBleedAt = 0;
    this.search = new Search(stage);
    this.battleState = new PeaceState();
  }

  bleed() {
    this.bleeding = true;
  }

  stopBleeding() {
    this.bleeding = false;
  }

  flock(people: Person[]) {
    const alignment = align(this, people);

    let housePos: Vector = null;
    if (this.flockState instanceof PanicState)
      housePos = this.safeHouseDoors[0].pos;

    const cohesion = cohere(this, people, housePos);
    const separation = separate(this, people, 30);

    let alignmentMult = PEOPLE_CALM_ALIGNMENT_STRENGTH;
    let coherenceMult = PEOPLE_CALM_COHERENCE_STRENGTH;
    let separationMult = PEOPLE_CALM_SEPARATION_STRENGTH;

    if (this.flockState instanceof PanicState) {
      alignmentMult = PEOPLE_PANIC_ALIGNMENT_STRENGTH;
      coherenceMult = PEOPLE_PANIC_COHERENCE_STRENGTH;
      separationMult = PEOPLE_PANIC_SEPARATION_STRENGTH;
    }

    this.acc.add(alignment.mult(alignmentMult));
    this.acc.add(cohesion.mult(coherenceMult));
    this.acc.add(separation.mult(separationMult));
  }

  scare() {
    this.canBump = false;
  }

  die() {
    super.die();
    SoundEffects.getInstance().kill.play();
  }

  update(t: number) {
    super.update(t);

    let nextBattleState = PERSON_FIGHT_INPUTS.PEACE;
    let nextCell = null;

    if (this.flockState instanceof PanicState) {
      const start = this.stage.getCellForPos(this.center);
      const end = this.stage.getCellForPos(this.safeHouseDoors[0].center);
      const path = this.search.search(start, end);
      this.path = path;

      // Check to see if we've arrived at the safe house door
      if (path.length === 0) {
        // they're in the house
        if (overlaps(this, this.safeHouseDoors[0])) {
          this.safe = true;
          console.log("safe!");
          SoundEffects.getInstance().safe.play();
        } else {
          // no way for them to access house
          console.warn("Person can't get to house");
        }
      } else {
        // Otherwise run along the path
        nextCell = path[0];

        // I'm sorry for this very long if statement
        // If current cell is breakable start punching
        if (nextCell.breakable) {
          nextBattleState = PERSON_FIGHT_INPUTS.FIGHT;
          this.vel.setMag(0);
        } else {
          // Otherwise RUN
          const nextCellPos = this.stage.posForCell(nextCell);
          this.vel
            .set(nextCellPos.x, nextCellPos.y, nextCellPos.z)
            .sub(this.center);
          this.vel.setMag(MAX_RUNNING_SPEED);
        }
      }
    } else {
      this.vel.setMag(MAX_WALKING_SPEED);
    }

    let animation = null;
    const panicked = this.flockState instanceof PanicState;

    // TODO: Go back and make this a hierarchical state machine
    if (this.direction === "left" && panicked) {
      animation = this.spriteAnimations["run_left"];
    } else if (this.direction === "left" && !panicked) {
      animation = this.spriteAnimations["walk_left"];
    } else if (this.direction === "right" && panicked) {
      animation = this.spriteAnimations["run_right"];
    } else if (this.direction === "right" && !panicked) {
      animation = this.spriteAnimations["walk_right"];
    }

    this.changeAnimation(animation);
    this.battleState.handleInput(this, nextBattleState);

    this.damageBreakables(nextCell, t);
    if (this.health <= 0) this.die();

    this.edgesMirror();
  }

  damageBreakables(cell: ICell, t: number) {
    const breakable = cell?.breakable;
    if (cell && breakable) {
      cell.sprite.damage(1, t);
      if (cell.sprite.health <= 0) {
        cell.sprite.die();
        cell.sprite.setCell(cell, true, false);
      }
    }
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
