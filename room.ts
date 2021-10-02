import {Player} from './player.js';
import {Thing} from './main.js';
import {loadImage} from './loader.js';
import {pointer} from './input.js';
import {Serializable, serialize, isSerializable, deserialize} from './serialization.js';

@Serializable()
export class Room {
  things: Thing[] = [];
  width: number;
  height: number;
  pattern?: CanvasPattern;

  private wasPointerActive = false;

  constructor(private readonly background: CanvasImageSource, private readonly roomData: RoomData) {
    this.width = roomData.width;
    this.height = roomData.height;
  }

  static async deserialize(roomData: RoomData) {
    const background = await loadImage(roomData.background);
    const room = new Room(background, roomData);
    const loadedItems = (await Promise.all(roomData.things.map(deserialize)) as Thing[]);
    room.things.push(...loadedItems);
    return Promise.resolve(room);
  }

  serialize(): RoomData {
    return {
      background: this.roomData.background,
      things: (this.things as object[]).filter(isSerializable).map(serialize),
      width: this.width,
      height: this.height,
    };
  }

  tick(dt: number) {
    if(!this.wasPointerActive && pointer.active) {
      this.doClick();
    }
    this.wasPointerActive = pointer.active;
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

  private doClick() {
    for(const thing of this.things) {
      if(thing.doClick?.()) return;
    }
    this.things.find((t): t is Player => t instanceof Player)?.moveToCursor();
  }
}

import './item.js';
export const demoRoom: RoomData = {
  width: 600,
  height: 600,
  background: 'https://picsum.photos/600/600',
  things: [
    {
      '@type': 'Item',
      x: 50,
      y: 50,
      height: 32,
      width: 32,
    }
  ],
}

export interface RoomData {
  background: string;
  things: object[];
  width: number;
  height: number;
}
