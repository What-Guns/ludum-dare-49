import {Thing} from './main.js';
import {Serializable, pluck} from './serialization.js';
import {loadImage} from './loader.js';

@Serializable('./animated-object.js')
export class AnimatedObject implements Thing {
  x: number;
  y: number;
  z: number;
  animating: boolean;
  frameRate: number;
  visible: boolean;
  private readonly width: number;
  private readonly height: number;
  private t = 0;

  constructor(readonly frames: HTMLImageElement[], private readonly objectData: AnimatedObjectData) {
    this.x = objectData.x;
    this.y = objectData.y;
    this.z = objectData.z;
    this.animating = objectData.animating;
    this.frameRate = objectData.frameRate;
    this.visible = objectData.visible;
    this.frames = frames;
    this.width = frames[0].width;
    this.height = frames[0].height;
  }

  tick(dt: number) {
    this.t += dt;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const frameNumber = Math.floor((this.t * this.frameRate)) % this.frames.length
    const frame = this.frames[frameNumber];
    ctx.drawImage(frame, this.x, this.y);
  }

  serialize(): AnimatedObjectData {
    return {
      ...pluck(this, 'x', 'y', 'z', 'animating', 'frameRate', 'visible'),
      frames: this.objectData.frames,
    };
  }

  isUnderPointer(x: number, y: number) {
    if(x < this.x || y < this.y) return false;
    if(x > this.x + this.width || y > this.y + this.height) return false;
    return true;
  }

  debugResize(evt: WheelEvent) {
    // firefox on Chris's computer scrolls by 114 px.
    this.frameRate -= evt.deltaY / 1140;
  }

  static async deserialize(data: AnimatedObjectData) {
    const frames = await Promise.all(data.frames.map(loadImage));
    if(!frames.length) throw new Error(`Cannot make animated object with no frames`);
    if(!frames.every(({width, height}) => width === frames[0].width && height === frames[0].height)) {
      throw new Error(`Frames in animated object must have the same height. First frame is ${frames[0].src}.`);
    }
    return new AnimatedObject(frames, data);
  }
}

export interface AnimatedObjectData {
  x: number;
  y: number;
  z: number;
  frames: string[];
  frameRate: number;
  visible: boolean;
  animating: boolean;
}

