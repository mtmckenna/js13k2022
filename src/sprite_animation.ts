export default class SpriteAnimation {
  name: string;
  numFrames: number;
  offset: number;
  speed: number;

  constructor(name: string, numFrames: number, offset: number, speed: number) {
    this.name = name;
    this.numFrames = numFrames;
    this.offset = offset;
    this.speed = speed;
  }
}
