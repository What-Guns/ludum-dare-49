import {Serializable, pluck} from './serialization.js';
import {Room} from './room.js';
import {Thing} from './main.js';
import {debug} from './debug.js';

export abstract class Portal implements Thing {
  x: number;
  y: number;
  width: number;
  height: number;
  readonly name: string;
  readonly target: [string, string, TransitionDirection];
  room?: Room;

  debugResize(evt: WheelEvent) {
    this.height -= evt.deltaY / 100;
    this.width += evt.deltaX / 100;
  }

  constructor({name, x, y, height, width, target}: DoorData) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.height = height;
    this.width = width;
    this.target = target;
  }

  static deserialize(data: DoorData) {
    return Promise.resolve(new (this as any)(data));
  }

  serialize(): DoorData {
    return pluck(this, 'x', 'y', 'height', 'width', 'target', 'name');
  }

  doClick(x: number, y: number) {
    if(!this.isUnderPointer(x, y)) return false;

    const player = this.room!.player;
    if(!player?.canReach(this.x, this.y)) return false;

    window.game?.goToDoor(...this.target);
    return true;
  }

  abstract isUnderPointer(x: number, y: number): boolean;
}

@Serializable('./door.js')
export class Door extends Portal {
  draw(ctx: CanvasRenderingContext2D) {
    if(!debug) return;
    const floorSlope = (this.room!.vanishingPoint.y - this.y) / (this.room!.vanishingPoint.x - this.x);
    const ceilingSlope = (this.room!.vanishingPoint.y - (this.y - this.height)) / (this.room!.vanishingPoint.x - this.x);

    ctx.fillStyle =  'brown';
    ctx.beginPath();
    ctx.moveTo(this.x - this.width / 2, this.y - floorSlope * (this.width / 2));
    ctx.lineTo(this.x + this.width / 2, this.y + floorSlope * (this.width / 2));
    ctx.lineTo(this.x + this.width / 2, this.y - this.height + ceilingSlope * (this.width / 2));
    ctx.lineTo(this.x - this.width / 2, this.y - this.height - ceilingSlope * (this.width / 2));
    ctx.fill();

    ctx.fillStyle = 'lime';
    ctx.textAlign = 'center';
    ctx.font = '24px sans-serif';
    ctx.fillText(this.target.join(', '), this.x, this.y - this.height / 2);
  }

  override isUnderPointer(x: number, y: number) {
    if(Math.abs(x - this.x) > this.width / 2) return false;
    const slope = (this.room!.vanishingPoint.y - y) / (this.room!.vanishingPoint.x - x);
    const adjustedY = y - slope * (x - this.x);
    if(adjustedY > this.y) return false;
    if(adjustedY < (this.y - this.height)) return false;
    return true;
  }
}

@Serializable('./door.js')
export class Ladder extends Portal {
  override isUnderPointer(x: number, y: number) {
    return Math.abs(x - this.x) < this.width / 2 && y < this.y && y > this.y - this.height;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if(!debug) return;
    ctx.fillStyle = 'brown';
    ctx.beginPath();
    ctx.moveTo(this.x - this.width / 2, this.y);
    ctx.lineTo(this.x + this.width / 2, this.y);
    ctx.lineTo(this.x + this.width / 2, this.y - this.height);
    ctx.lineTo(this.x - this.width / 2, this.y - this.height);
    ctx.fill();

    ctx.fillStyle = 'lime';
    ctx.textAlign = 'center';
    ctx.font = '24px sans-serif';
    ctx.fillText(this.target.join(', '), this.x, this.y - this.height / 2);

  }
}

@Serializable('./door.js')
export class TrapDoor extends Portal {
  draw(ctx: CanvasRenderingContext2D) {
    if(!debug) return;
    const leftSlope = (this.room!.vanishingPoint.y - this.y) / (this.room!.vanishingPoint.x - (this.x - this.width / 2));
    const rightSlope = (this.room!.vanishingPoint.y - this.y) / (this.room!.vanishingPoint.x - (this.x + this.width / 2));

    ctx.fillStyle = 'brown';
    ctx.beginPath();
    ctx.moveTo(this.x - this.width / 2 - (1/leftSlope) * (this.height/2), this.y - this.height / 2);
    ctx.lineTo(this.x + this.width / 2 - (1/rightSlope) * (this.height/2), this.y - this.height / 2);
    ctx.lineTo(this.x + this.width / 2 + (1/rightSlope) * (this.height/2), this.y + this.height / 2);
    ctx.lineTo(this.x - this.width / 2 + (1/leftSlope) * (this.height/2), this.y + this.height / 2);
    ctx.fill();

    ctx.fillStyle = 'lime';
    ctx.textAlign = 'center';
    ctx.font = '24px sans-serif';
    ctx.fillText(this.target.join(', '), this.x, this.y);
  }

  override isUnderPointer(x: number, y: number) {
    if(Math.abs(y - this.y) > this.height / 2) return false;
    const slope = (this.room!.vanishingPoint.y - y) / (this.room!.vanishingPoint.x - x);
    const adjustedX = x - (1/slope) * (y - this.y);
    return Math.abs(adjustedX - this.x) < this.width / 2;
  }
}

type DoorData = Pick<Door, 'x'|'y'|'height'|'width'|'target'|'name'>;

export type TransitionDirection = 'right'|'left'|'up'|'down';

