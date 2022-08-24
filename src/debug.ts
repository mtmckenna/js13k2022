export default class Debug {
  private static instance: Debug;

  gullFlockStrengths: {
    alignment: number;
    cohesion: number;
    separation: number;
  };
  peopleFlockStrengths: {
    alignment: number;
    cohesion: number;
    separation: number;
  };
  gullAlignmentSlider?: HTMLInputElement;
  gullCohesionSlider?: HTMLInputElement;
  gullSeparationSlider?: HTMLInputElement;
  peopleAlignmentSlider?: HTMLInputElement;
  peopleCohesionSlider?: HTMLInputElement;
  peopleSeparationSlider?: HTMLInputElement;
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
    this.gridEnabled = true;
    this.peopleFlockStrengths = {
      alignment: 0.1,
      cohesion: 0.1,
      separation: 0.1,
    };
    this.peopleSlidersEnabled = false;
    this.peopleSpritesEnabled = false;
  }

  public static getInstance(): Debug {
    if (!Debug.instance) Debug.instance = new Debug();
    return Debug.instance;
  }

  public static start() {
    const debug = Debug.getInstance();
    if (!debug.gullSlidersEnabled) return;
    debug.createSliders();
  }

  createSliders() {
    this.createGullSliders();
    this.createPeopleSliders();
  }

  createGullSliders() {
    const wrapper = document.createElement("div");
    this.gullAlignmentSlider = createSlider(0, 2, 0, 0.1, wrapper);
    this.gullCohesionSlider = createSlider(0, 2, 1, 0.1, wrapper);
    this.gullSeparationSlider = createSlider(0, 2, 1, 0.1, wrapper);
    const uiWrapper = document.getElementById("ui-wrapper");
    uiWrapper.appendChild(wrapper);

    this.gullAlignmentSlider.addEventListener("change", (event: Event) =>
      console.log((event.target as HTMLInputElement).value)
    );

    this.gullCohesionSlider.addEventListener("change", (event: Event) =>
      console.log((event.target as HTMLInputElement).value)
    );

    this.gullSeparationSlider.addEventListener("change", (event: Event) =>
      console.log((event.target as HTMLInputElement).value)
    );
  }

  createPeopleSliders() {
    const wrapper = document.createElement("div");
    wrapper.classList.add("ui");
    this.peopleAlignmentSlider = createSlider(0, 2, 0, 0.1, wrapper);
    this.peopleCohesionSlider = createSlider(0, 2, 1, 0.1, wrapper);
    this.peopleSeparationSlider = createSlider(0, 2, 1, 0.1, wrapper);
    const uiWrapper = document.getElementById("ui-wrapper");
    uiWrapper.appendChild(wrapper);

    this.peopleAlignmentSlider.addEventListener("change", (event: Event) =>
      console.log((event.target as HTMLInputElement).value)
    );

    this.peopleCohesionSlider.addEventListener("change", (event: Event) =>
      console.log((event.target as HTMLInputElement).value)
    );

    this.peopleSeparationSlider.addEventListener("change", (event: Event) =>
      console.log((event.target as HTMLInputElement).value)
    );
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
