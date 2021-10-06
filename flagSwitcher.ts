import { debug } from "./debug.js";
import { toggleFlag } from "./flags.js";
import { Thing } from "./main.js";
import { Room } from "./room.js";
import { pluck, Serializable } from "./serialization.js";

@Serializable('./flagSwitcher.js')
export class FlagSwitcher implements Thing {
  x: number;
  y: number;
  z: number;
  room?: Room | undefined;
  flagsToSwitch: string[];
  
  width: number;
  height: number;

  constructor({x, y, z, width, height, flagsToSwitch}: FlagSwitcherData) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.width = width;
    this.height = height;
    this.flagsToSwitch = flagsToSwitch;
  }

  serialize(): FlagSwitcherData {
    return pluck(this, 'x', 'y', 'z', 'flagsToSwitch', 'width', 'height');
  }

  static async deserialize(data: FlagSwitcherData) {
    return new FlagSwitcher(data);
  }

  doClick(x: number, y: number) {
    if(!this.isUnderPointer(x, y)) {
      return false;
    }
    if(!this.room?.player?.canReach(this.x, this.y)) return false;
    this.flagsToSwitch.forEach(f => toggleFlag(f));
    return true;
  }
  
  draw(ctx: CanvasRenderingContext2D) {
    if (!debug) return;
    ctx.fillStyle = 'red';
    ctx.fillRect(this.x - this.width / 2, this.y - this.height/2, this.width , this.height );
  }

  isUnderPointer(x: number, y: number) {
    return !(Math.abs(this.x - x) > this.width / 2 || Math.abs(this.y - y) > this.height / 2);
  }
}

type FlagSwitcherData = {
  flagsToSwitch: string[],
  x: number,
  y: number,
  z: number,
  width: number,
  height: number,
}
