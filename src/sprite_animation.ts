export default class SpriteAnimation {
  name: string;
  numFrames: number;
  offset: number;

  constructor(name: string, numFrames: number, offset: number) {
    this.name = name;
    this.numFrames = numFrames;
    this.offset = offset;
  }
}
