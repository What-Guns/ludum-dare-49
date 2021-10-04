import { Material } from './material.js';
import {Room} from './room.js';
import {Serializable} from './serialization.js';
import {Thing} from './main.js';
import {debug} from './debug.js';
import {toast} from './toast.js';
import { PuzzleObject, puzzleObjects } from './puzzleObject.js';
import { increaseProgressLevelName } from './progressManager.js';


@Serializable('./furnace.js')
export class Furnace implements Thing {
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  contents?: PuzzleObject | Material;
  room?: Room;
  furnaceTime = 0;
  finishedCooking = true;

  constructor(data: FurnaceData) {
    this.x = data.x;
    this.y = data.y;
    this.z = data.z ?? -1;
    this.height = data.height;
    this.width = data.width;
  }

  putObjectIn(obj: PuzzleObject | Material): boolean {
    if (this.contents) {
      toast("There's already something in the furnace");
      return false;
    }
    if (obj.name.includes('Key')) {
      toast('The ' + obj.name + ' melts into a puddle!');
    } else if (obj.name === 'Gravity Stone') {
      this.contents = obj;
      this.furnaceTime = 5;
      this.finishedCooking = false;
    } else if (obj.name === 'Hot Gravity Stone') {
      this.contents = obj;
      this.furnaceTime = 0.5;
      this.finishedCooking = false;
    } else if (obj.name === 'Hot Floating Gravity Stone') {
      toast('The stone floated up the flue! Maybe it\'s upstairs...');
      increaseProgressLevelName('recovered-gravity-stone');
    } else {
      toast('The ' + obj.name + ' burns to ash!')
    }
    return true;
  }

  tick(dt: number) {
    if (!this.contents) return;
    if (this.finishedCooking) return;
    this.furnaceTime -= dt;
    if (this.furnaceTime < 0) this.finishCooking();
  }

  finishCooking() {
    this.finishedCooking = true;
    if (!this.contents) {

    } else if (this.contents.name === 'Gravity Stone') {
      this.contents = puzzleObjects['hot-gravity-stone'];
    } else if (this.contents.name === 'Hot Gravity Stone') {
      this.contents = puzzleObjects['hot-gravity-stone'];
    } else if (this.contents.name === 'Hot Floating Gravity Stone') {
      this.contents = puzzleObjects['hot-floating-gravity-stone'];
    } else {
      toast('The ' + this.contents.name + ' burns to ash!')
    }
    toast('Done cooking ' + this.contents?.name); // heh heh, toast
  }

  static async deserialize(data: FurnaceData) {
    return new Furnace(data);
  }

  doClick(x: number, y: number) {
    if(!this.isUnderPointer(x, y)) return false;
    if (!this.contents) {
      toast("It's a furnace")
    } else {
      this.room?.player?.takePuzzleObject(this.contents as PuzzleObject, false);
      this.contents = undefined;
    }
    return true;
  }

  serialize(): FurnaceData {
    return {
      x: this.x,
      y: this.y,
      z: this.z,
      width: this.width,
      height: this.height,
    };
  }

  draw(ctx: CanvasRenderingContext2D) {
    if(debug) {
      ctx.fillStyle = 'darkred';
      ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
    }
  }

  debugResize(evt: WheelEvent) {
    this.width += evt.deltaX / 50;
    this.height -= evt.deltaY / 50;
  }

  isUnderPointer(x: number, y: number) {
    return Math.abs(x - this.x) < this.width / 2  && Math.abs(y - this.y) < this.height / 2;
  }
}

interface FurnaceData {
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
}
