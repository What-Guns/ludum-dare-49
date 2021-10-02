import {Player} from './player.js';
import {Thing} from './main.js';
import {loadImage} from './loader.js';
import {Serializable, serialize, isSerializable, deserialize, pluck} from './serialization.js';

@Serializable('./room.js')
export class Room {
  readonly name: string;
  readonly width: number;
  readonly height: number;
  readonly things: Thing[] = [];
  readonly vanishingPoint: {x: number, y: number};

  pattern?: CanvasPattern;

  constructor(private readonly background: CanvasImageSource, private readonly roomData: RoomData) {
    this.name = roomData.name;
    this.width = roomData.width;
    this.height = roomData.height;
    this.vanishingPoint = roomData.vanishingPoint;
  }

  static async deserialize(roomData: RoomData) {
    const background = await loadImage(roomData.background);
    const room = new Room(background, roomData);
    const loadedItems = await Promise.all(roomData.things.map(x => deserialize(x, {room}) as Promise<Thing>));
    room.things.push(...loadedItems);
    return Promise.resolve(room);
  }

  serialize(): RoomData {
    return {
      ...pluck(this, 'name', 'width', 'height', 'vanishingPoint'),
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
    this.pattern = this.pattern ?? ctx.createPattern(this.background, 'no-repeat')!;
    ctx.fillStyle = this.pattern!;
    ctx.fillRect(0, 0, this.width, this.height);
    for(const thing of this.things) {
      thing.draw?.(ctx);
    }
  }

  doClick() {
    for(const thing of this.things) {
      if(thing.doClick?.()) return;
    }
    this.things.find((t): t is Player => t instanceof Player)?.moveToCursor();
    import('./item.js').then(x => (window as any).x = x);
  }
}

export interface RoomData {
  name: string;
  background: string;
  things: object[];
  width: number;
  height: number;
  vanishingPoint: {x: number, y: number};
}
