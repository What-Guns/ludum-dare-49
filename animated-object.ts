import {debug} from './debug.js';
import {Thing} from './main.js';
import {Serializable, pluck} from './serialization.js';
import {loadImage} from './loader.js';
import { getFlagValue } from './flags.js';

@Serializable('./animated-object.js')
export class AnimatedObject implements Thing {
  x: number;
  y: number;
  z: number;
  animating: boolean;
  frameRate: number;
  visible: string | boolean;
  oneshot: boolean;
  t = 0;

  private readonly width: number;
  private readonly height: number;

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
    this.oneshot = objectData.oneshot ?? false;
  }

  tick(dt: number) {
    if(this.animating) this.t += dt * this.frameRate;
    if(this.oneshot) {
      this.t = Math.min(this.t, this.frames.length - 1)
    } else {
      this.t = this.t % this.frames.length
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.shouldBeInvisible()) return;
    const frameNumber = Math.floor(this.t);
    const frame = this.frames[frameNumber];
    ctx.drawImage(frame, this.x, this.y);
  }

  shouldBeInvisible(): boolean {
    if (typeof this.visible == 'boolean') return !this.visible;
    let visibleString = this.visible as string;
    let negative = false;
    if (visibleString.startsWith('!')) {
      visibleString = visibleString.substring(1);
      negative = true;
    }
    return getFlagValue(visibleString) ? negative : !negative;
  }

  serialize(): AnimatedObjectData {
    return {
      ...pluck(this, 'x', 'y', 'z', 'animating', 'frameRate', 'visible', 'oneshot'),
      frames: this.objectData.frames,
    };
  }

  isUnderPointer(x: number, y: number) {
    if(!debug) return false;
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
  visible: string | boolean;
  animating: boolean;
  oneshot: boolean;
}

