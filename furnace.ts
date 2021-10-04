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
  requiredTime = 0;
  remainingTime = 0;
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
    } else if (obj === puzzleObjects['gravity-stone']) {
      this.contents = obj;
      this.requiredTime = this.remainingTime = 5;
      this.finishedCooking = false;
    } else if (obj === puzzleObjects['hot-gravity-stone']) {
      this.contents = obj;
      this.requiredTime = this.remainingTime = 0.5;
      this.finishedCooking = false;
    } else if (obj === puzzleObjects['hot-floating-gravity-stone']) {
      toast('The stone floated up the flue! Maybe it\'s upstairs...');
      increaseProgressLevelName('recovered-gravity-stone');
    } else if (obj === puzzleObjects['hot-temporarily-floating-gravity-stone']) {
      toast('The stone starts to rise up the flue!');
      this.contents = obj;
      this.requiredTime = this.remainingTime = 2;
      this.finishedCooking = false;
    } else {
      toast('The ' + obj.name + ' burns to ash!')
    }
    return true;
  }

  tick(dt: number) {
    if (!this.contents) return;
    if (this.finishedCooking) return;
    this.remainingTime -= dt;
    if (this.remainingTime < 0) this.finishCooking();
  }

  finishCooking() {
    this.finishedCooking = true;
    let didToast = false;
    if (!this.contents) {

    } else if (this.contents === puzzleObjects['gravity-stone']) {
      this.contents = puzzleObjects['hot-gravity-stone'];
    } else if (this.contents === puzzleObjects['hot-gravity-stone']) {
      this.contents = puzzleObjects['hot-gravity-stone'];
    } else if (this.contents === puzzleObjects['hot-floating-gravity-stone']) {
      this.contents = puzzleObjects['hot-floating-gravity-stone'];
    } else if (this.contents === puzzleObjects['hot-temporarily-floating-gravity-stone']) {
      toast('…but it fell back down!');
      didToast = true;
      this.contents = puzzleObjects['hot-gravity-stone'];
    } else {
      toast('The ' + this.contents.name + ' burns to ash!')
      didToast = true;
    }
    if(!didToast) {
      toast('Done cooking ' + this.contents?.name); // heh heh, toast
    }
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

    if(!this.finishedCooking) {
      const amount = this.remainingTime / this.requiredTime;
      const UP = -Math.PI / 2;
      const TAU = 2 * Math.PI;
      ctx.fillStyle = 'orange';
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.arc(this.x, this.y, 64, UP, UP + TAU * (1-amount), false);
      ctx.lineTo(this.x, this.y);
      ctx.fill();
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
