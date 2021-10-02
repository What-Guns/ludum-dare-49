import {Thing} from './main.js';
import {Serializable} from './serialization.js';
import { HudItemWindow } from './hud.js';

@Serializable('./resource-spawner.js')
export class ResourceSpawner implements Thing {
  private hudWindow: HudItemWindow;
  constructor(public x: number, public y: number, public width: number, public height: number, public brewTime: number) {
    this.hudWindow = new HudItemWindow();
    this.hudWindow.image = "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/285/large-blue-square_1f7e6.png";
    this.hudWindow.itemName = "Blue Square";
    this.hudWindow.traitsList = ["Blue", "Four-sided"];
    this.hudWindow.itemDescription = "A two-dimensional piece of blue material";
  }

  static async deserialize({x, y, width, height, brewTime}: ResourceSpawnerData) {
    return Promise.resolve(new ResourceSpawner(x, y, width, height, brewTime));
  }

  serialize(): ResourceSpawnerData {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      brewTime: this.brewTime
    };
  }

  doClick(x: number, y: number) {
    if(!this.isUnderPointer(x, y)) {
      this.hudWindow.visible = false;
      return false;
    } 
    this.hudWindow.x = x;
    this.hudWindow.y = y;
    this.hudWindow.visible = true;
    return true;
  }

  isUnderPointer(x: number, y: number) {
    return !(Math.abs(this.x - x) > this.width / 2 || Math.abs(this.y - y) > this.height / 2);
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'blue';
    ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
  }

  debugResize(evt: WheelEvent) {
    this.width += evt.deltaX / 50;
    this.height -= evt.deltaY / 50;
  }
}

export interface ResourceSpawnerData {
  x: number;
  y: number;
  width: number;
  height: number;
  brewTime: number;
}
