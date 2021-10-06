import { playSFX, SfxName } from "./audio.js";
import { debug } from "./debug.js";
import { disableFlag, enableFlag, toggleFlag } from "./flags.js";
import { Thing } from "./main.js";
import { Room } from "./room.js";
import { pluck, Serializable } from "./serialization.js";

@Serializable('./flagSwitcher.js')
export class FlagSwitcher implements Thing {
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;

  room?: Room | undefined;
  flagsToToggle: string[];
  flagsToEnable: string[];
  flagsToDisable: string[];
  
  sfx?: SfxName;

  constructor({x, y, z, width, height, flagsToToggle, flagsToEnable, flagsToDisable, sfx}: FlagSwitcherData) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.width = width;
    this.height = height;
    this.flagsToToggle = flagsToToggle || [];
    this.flagsToEnable = flagsToEnable || [];
    this.flagsToDisable = flagsToDisable || [];
    this.sfx = sfx;
  }

  serialize(): FlagSwitcherData {
    return pluck(this, 'x', 'y', 'z', 'width', 'height', 'flagsToToggle', 'flagsToEnable', 'flagsToDisable', 'sfx');
  }

  static async deserialize(data: FlagSwitcherData) {
    return new FlagSwitcher(data);
  }

  doClick(x: number, y: number) {
    if(!this.isUnderPointer(x, y)) {
      return false;
    }
    if(!this.room?.player?.canReach(this.x, this.y)) return false;
    this.flagsToToggle.forEach(f => toggleFlag(f));
    this.flagsToEnable.forEach(f => enableFlag(f));
    this.flagsToDisable.forEach(f => disableFlag(f));
    if (this.sfx) playSFX(this.sfx);
    window.game!.save();
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
  flagsToToggle: string[],
  flagsToEnable: string[],
  flagsToDisable: string[],
  sfx?: SfxName,
  x: number,
  y: number,
  z: number,
  width: number,
  height: number,
}
