import {Serializable, pluck} from './serialization.js';
import {Room} from './room.js';
import {Thing} from './main.js';
import {pointer} from './input.js';

@Serializable('./door.js')
export class Door implements Thing {
  readonly x: number;
  readonly width: number;
  readonly base: number;
  readonly height: number;

  constructor(private readonly room: Room, {x, height, width, base}: DoorData) {
    this.x = x;
    this.height = height;
    this.width = width;
    this.base = base;
  }

  static deserialize(data: DoorData, {room}: {room: Room}) {
    return Promise.resolve(new Door(room, data));
  }

  serialize(): DoorData {
    return pluck(this, 'x', 'height', 'width', 'base');
  }

  draw(ctx: CanvasRenderingContext2D) {
    if(!this.isPointerOverDoor()) return;
    const floorSlope = (this.room.vanishingPoint.y - this.base) / (this.room.vanishingPoint.x - this.x);
    const ceilingSlope = (this.room.vanishingPoint.y - (this.base - this.height)) / (this.room.vanishingPoint.x - this.x);

    ctx.fillStyle = 'lime';
    ctx.beginPath();
    ctx.moveTo(this.x - this.width / 2, this.base - floorSlope * (this.width / 2));
    ctx.lineTo(this.x + this.width / 2, this.base + floorSlope * (this.width / 2));
    ctx.lineTo(this.x + this.width / 2, this.base - this.height + ceilingSlope * (this.width / 2));
    ctx.lineTo(this.x - this.width / 2, this.base - this.height - ceilingSlope * (this.width / 2));
    ctx.fill();
  }

  doClick() {
    if(!this.isPointerOverDoor()) return false;
    alert('go to another room now please');
    return true;
  }

  private isPointerOverDoor() {
    if(Math.abs(pointer.x - this.x) > this.width / 2) return false;
    const slope = (this.room.vanishingPoint.y - pointer.y) / (this.room.vanishingPoint.x - pointer.x);
    const adjustedY = pointer.y - slope * (pointer.x - this.x);
    if(adjustedY > this.base) return false;
    if(adjustedY < (this.base - this.height)) return false;
    return true;
  }
}

type DoorData = Pick<Door, 'x'|'height'|'width'|'base'>;
