import {Player} from './player.js';
import {Thing} from './main.js';
import {loadImage} from './loader.js';
import {Serializable, serialize, isSerializable, deserialize, pluck} from './serialization.js';
import {pointer} from './input.js';
import {Door} from './door.js';
import {translateAndScalePopupContainer, resizePopupContainer} from './hud.js';

@Serializable('./room.js')
export class Room {
  readonly name: string;
  readonly width: number;
  readonly height: number;
  readonly vanishingPoint: {x: number, y: number};
  readonly camera = {x: 0, scale: 1};
  readonly floorHeight: number;
  readonly doors: Door[] = [];

  private readonly things: Thing[] = [];

  pattern?: CanvasPattern;

  player?: Player;

  constructor(private readonly background: CanvasImageSource, private readonly roomData: RoomData) {
    this.name = roomData.name;
    this.width = roomData.width;
    this.height = roomData.height;
    this.vanishingPoint = roomData.vanishingPoint;
    this.floorHeight = roomData.floorHeight;
  }

  static async deserialize(roomData: RoomData) {
    const background = await loadImage(roomData.background);
    const room = new Room(background, roomData);
    for(const thing of await Promise.all(roomData.things.map(x => deserialize(x, {room}) as Promise<Thing>))) {
      room.adoptThing(thing);
    }
    return Promise.resolve(room);
  }

  adoptThing(thing: Thing) {
    this.things.push(thing);
    if(thing instanceof Player) this.player = thing;
    if(thing instanceof Door) this.doors.push(thing);
  }

  disown(thing: Thing) {
    if(thing instanceof Door) {
      throw new TypeError(`Cannot remove doors from rooms`);
    }
    if(thing === this.player) this.player = undefined;
    const index = this.things.indexOf(thing);
    if(index === -1) throw new Error(`Trying to get a room to disown something it doesn't own`);
    this.things.splice(index, 1);
  }

  serialize(): RoomData {
    return {
      ...pluck(this, 'name', 'width', 'height', 'vanishingPoint', 'floorHeight'),
      background: this.roomData.background,
      things: (this.things as object[]).filter(isSerializable).map(serialize),
    };
  }

  tick(dt: number) {
    for(const thing of this.things) {
      thing.tick?.(dt);
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    this.doCameraStuff(ctx);
    ctx.translate(this.camera.x, 0);
    ctx.scale(this.camera.scale, this.camera.scale);
    this.pattern = this.pattern ?? ctx.createPattern(this.background, 'no-repeat')!;
    ctx.fillStyle = this.pattern!;
    ctx.fillRect(0, 0, this.width, this.height);
    for(const thing of this.things) {
      thing.draw?.(ctx);
    }
    ctx.restore();
  }

  doClick() {
    const transformedX = (pointer.x - this.camera.x) / this.camera.scale;
    const transformedY = pointer.y / this.camera.scale;
    for(const thing of this.things) {
      if(thing.doClick?.(transformedX, transformedY)) return;
    }
    this.things.find((t): t is Player => t instanceof Player)?.moveToCursor(transformedX);
  }

  activate() {
    this.things.forEach(t => t.startDrawingDOM?.());
    resizePopupContainer(this);
  }

  deactivate() {
    this.things.forEach(t => t.stopDrawingDOM ? t.stopDrawingDOM() : null);
    this.player = undefined;
  }

  getThingUnderCursor() {
    const transformedX = (pointer.x - this.camera.x) / this.camera.scale;
    const transformedY = pointer.y / this.camera.scale;
    return this.things.find(thing => thing.isUnderPointer?.(transformedX, transformedY));
  }

  private doCameraStuff(ctx: CanvasRenderingContext2D) {
    this.camera.scale = Math.min(ctx.canvas.height / this.height, 1);
    if(!this.player) return;
    const xAmount = this.player.x / this.width;
    const xOverflow = (this.width * this.camera.scale) - ctx.canvas.width;
    if(xOverflow < 0) {
      this.camera.x = -xOverflow/2;
    } else {
      this.camera.x = xOverflow * -xAmount;
    }
    translateAndScalePopupContainer(this);
  }
}

export interface RoomData {
  name: string;
  background: string;
  things: object[];
  width: number;
  height: number;
  vanishingPoint: {x: number, y: number};
  floorHeight: number;
}
