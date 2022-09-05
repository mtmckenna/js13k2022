export default class Debug {
  private static instance: Debug;

  gullFlockStrengths: {
    alignment: number;
    cohesion: number;
    separation: number;
  };

  gullAlignmentSlider?: HTMLInputElement;
  gullCohesionSlider?: HTMLInputElement;
  gullSeparationSlider?: HTMLInputElement;
  gullSlidersEnabled: boolean;
  gullSpritesEnabled: boolean;
  peopleSlidersEnabled: boolean;
  peopleSpritesEnabled: boolean;
  gridEnabled: boolean;

  private constructor() {
    this.gullFlockStrengths = {
      alignment: 0.1,
      cohesion: 0.1,
      separation: 0.1,
    };
    this.gullSlidersEnabled = false;
    this.gullSpritesEnabled = false;
    this.gridEnabled = false;
    this.peopleSlidersEnabled = false;
    this.peopleSpritesEnabled = false;
  }

  public static getInstance(): Debug {
    if (!Debug.instance) Debug.instance = new Debug();
    return Debug.instance;
  }
}

// https://github.com/processing/p5.js/blob/v1.4.2/src/dom/dom.js#L492
export function createSlider(min, max, value, step, node) {
  const elt = document.createElement("input");
  elt.type = "range";
  elt.min = min;
  elt.max = max;
  if (step === 0) {
    elt.step = "0.000000000000000001"; // smallest valid step
  } else if (step) {
    elt.step = step;
  }

  elt.value = value;
  node.appendChild(elt);
  return elt;
}
