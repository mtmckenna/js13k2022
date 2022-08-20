import Camera from "./camera";
import { Vector } from "./math";
import Renderer from "./renderer";
import Box from "./box";

export default class Stage {
  public size: Vector;

  private camera: Camera;
  private renderer: Renderer;

  private sky: Box;
  private beach: Box;
  private sun: Box;
  private lot: Box;

  constructor(size: Vector, camera: Camera) {
    this.size = size;
    this.camera = camera;
    this.renderer = Renderer.getInstance();

    const width = this.size.x;
    const height = this.size.y;

    const skyPos: Vector = new Vector(0, 0, 0);
    const skySize: Vector = new Vector(width, 50, 0);
    this.sky = new Box(skyPos, skySize);

    const beachPos: Vector = new Vector(0, skyPos.y + skySize.y, 0);
    const beachSize: Vector = new Vector(width, 100, 0);
    this.beach = new Box(beachPos, beachSize);

    const sunPos: Vector = new Vector(width / 2, skyPos.y + skySize.y, 0);
    const sunSize: Vector = new Vector(beachSize.y / 2.5, beachSize.y / 2.5, 0);
    this.sun = new Box(sunPos, sunSize);

    const lotPos: Vector = new Vector(0, beachPos.y + beachSize.y, 0);
    const lotSize: Vector = new Vector(
      width,
      height - beachSize.y - skySize.y,
      0
    );

    this.lot = new Box(lotPos, lotSize);
  }

  public draw() {
    const ctx = this.renderer.ctx;

    const scale = this.camera.pos.z;
    ctx.fillStyle = "#42bfe8";
    ctx.fillRect(
      this.sky.pos.x + this.renderer.offset.x,
      this.sky.pos.y + this.renderer.offset.y,
      this.sky.size.x * scale,
      this.sky.size.y * scale
    );

    ctx.beginPath();
    ctx.fillStyle = "#f8f644";
    ctx.arc(
      this.sun.pos.x + this.renderer.offset.x,
      this.sun.pos.y + this.renderer.offset.y,
      this.sun.size.x,
      0,
      2 * Math.PI
    );
    ctx.fill();

    ctx.fillStyle = "#e3d6b1";
    ctx.fillRect(
      this.beach.pos.x + this.renderer.offset.x,
      this.beach.pos.y + this.renderer.offset.y,
      this.beach.size.x,
      this.beach.size.y
    );

    ctx.fillStyle = "#bdbdbd";
    ctx.fillRect(
      this.lot.pos.x + this.renderer.offset.x,
      this.lot.pos.y + this.renderer.offset.y,
      this.lot.size.x,
      this.lot.size.y
    );
  }
}
