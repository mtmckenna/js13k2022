import SoundEffect from "./sound_effect";

import clickDataUrl from "../assets/click.wav";
import killDataUrl from "../assets/kill.wav";
import safeDataUrl from "../assets/safe.wav";

export default class SoundEffects {
  public static instance: SoundEffects;
  private static context: AudioContext;

  kill: SoundEffect;
  safe: SoundEffect;
  click: SoundEffect;

  public static getInstance(): SoundEffects {
    if (!this.context) this.context = new AudioContext();
    if (!SoundEffects.instance)
      SoundEffects.instance = new SoundEffects(this.context);
    return SoundEffects.instance;
  }

  constructor(context: AudioContext) {
    this.click = new SoundEffect(clickDataUrl, context);
    this.kill = new SoundEffect(killDataUrl, context);
    this.safe = new SoundEffect(safeDataUrl, context);
  }
}
