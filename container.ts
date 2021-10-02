import {Serializable, pluck, deserialize, serialize} from './serialization.js';
import {pointer} from './input.js';
import {Thing} from './main.js';
import {ofType} from './crap.js';
import {Player} from './player.js';
import {Room} from './room.js';
import {debug} from './debug.js';
import {Item, ItemData} from './item.js';

@Serializable('./container.js')
export class Container implements Thing {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;

  constructor(private readonly room: Room, private readonly items: Item[], data: ContainerData) {
    this.x = data.x;
    this.y = data.y;
    this.width = data.width;
    this.height = data.height;
  }

  doClick() {
    if(pointer.x < this.x || pointer.x > this.x + this.width) return false;
    if(pointer.y < this.y || pointer.y > this.y + this.height) return false;

    const player = this.room.things.find(ofType(Player));
    if(!player?.canReach(this.x, this.y)) return false;

    this.room.things.push(...this.items);
    this.items.length = 0;
    const index = this.room.things.indexOf(this);
    if(index === -1) throw new Error(`Trying to remove the cupboard from a room that doesn't contain it.`);
    this.room.things.splice(index, 1);

    return true;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if(!debug) return;
    ctx.fillStyle = this.isPointerOver() ? 'lime':'coral';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  private isPointerOver() {
    if(pointer.x < this.x || pointer.x > this.x + this.width) return false;
    if(pointer.y < this.y || pointer.y > this.y + this.height) return false;
    return true;
  }

  static async deserialize(data: ContainerData, extras: {room: Room}) {
    const items = await Promise.all(data.items.map(i => deserialize(i, extras)));
    return new Container(extras.room, items, data);
  }

  serialize(): ContainerData {
    return {
      ...pluck(this, 'x', 'y', 'width', 'height'),
      items: this.items.map(serialize),
    };
  }
}

type ContainerData = Pick<Container, 'x'|'y'|'width'|'height'>&{items: ItemData[]}
