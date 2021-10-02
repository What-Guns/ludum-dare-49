import {Serializable, pluck} from './serialization.js';
import {Room} from './room.js';
import {Thing} from './main.js';
import {Player} from './player.js';
import {debug} from './debug.js';
import {ofType} from './crap.js';

@Serializable('./door.js')
export class Door implements Thing {
  readonly name: string;
  x: number;
  width: number;
  y: number;
  height: number;
  readonly target: [string, string, TransitionDirection];

  constructor(private readonly room: Room, {name, x, y, height, width, target}: DoorData) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.height = height;
    this.width = width;
    this.target = target;
  }

  static deserialize(data: DoorData, {room}: {room: Room}) {
    return Promise.resolve(new this(room, data));
  }

  serialize(): DoorData {
    return pluck(this, 'x', 'y', 'height', 'width', 'target', 'name');
  }

  draw(ctx: CanvasRenderingContext2D) {
    if(!debug) return;
    const floorSlope = (this.room.vanishingPoint.y - this.y) / (this.room.vanishingPoint.x - this.x);
    const ceilingSlope = (this.room.vanishingPoint.y - (this.y - this.height)) / (this.room.vanishingPoint.x - this.x);

    ctx.fillStyle = 'brown';
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

  doClick(x: number, y: number) {
    if(!this.isUnderPointer(x, y)) return false;

    const player = this.room.things.find(ofType(Player));
    if(!player?.canReach(this.x, this.y)) return false;

    window.game?.goToDoor(...this.target);
    return true;
  }

  isUnderPointer(x: number, y: number) {
    if(Math.abs(x - this.x) > this.width / 2) return false;
    const slope = (this.room.vanishingPoint.y - y) / (this.room.vanishingPoint.x - x);
    const adjustedY = y - slope * (x - this.x);
    if(adjustedY > this.y) return false;
    if(adjustedY < (this.y - this.height)) return false;
    return true;
  }

  debugResize(evt: WheelEvent) {
    this.height -= evt.deltaY / 100;
    this.width += evt.deltaX / 100;
  }
}

@Serializable('./door.js')
export class Ladder extends Door {
  override isUnderPointer(x: number, y: number) {
    return Math.abs(x - this.x) < this.width && y < this.y && y > this.y - this.height;
  }

  override draw(ctx: CanvasRenderingContext2D) {
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

type DoorData = Pick<Door, 'x'|'y'|'height'|'width'|'target'|'name'>;

export type TransitionDirection = 'right'|'left'|'up'|'down';
