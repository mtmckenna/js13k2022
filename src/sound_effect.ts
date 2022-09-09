import SoundEffects from "./sound_effects";

export default class SoundEffect {
  context: AudioContext;
  path: string;
  buffer: AudioBuffer;
  source: AudioBufferSourceNode;

  constructor(path, context) {
    this.path = path;
    this.context = context;
    this.loadAudio(this.path);
  }

  loadAudio(path) {
    const request = new XMLHttpRequest();
    request.open("GET", path, true);
    request.responseType = "arraybuffer";

    request.onload = () => {
      const data = request.response;
      this.decodeAudio(data);
    };

    request.send();
  }

  decodeAudio(data) {
    if (!this.context) {
      return;
    }

    this.context.decodeAudioData(data, (buffer) => {
      this.buffer = buffer;
    });
  }

  play() {
    if (!this.buffer || !this.context) return;

    this.source = this.context.createBufferSource();
    this.source.loop = false;
    this.source.buffer = this.buffer;
    this.source.connect(this.context.destination);
    this.source.start(0);
  }
}
