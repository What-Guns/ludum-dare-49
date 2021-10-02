import {Serializable, pluck, deserialize, serialize} from './serialization.js';
import {Thing} from './main.js';
import {ofType} from './crap.js';
import {Player} from './player.js';
import {Room} from './room.js';
import {debug} from './debug.js';
import {Item, ItemData} from './item.js';

@Serializable('./container.js')
export class Container implements Thing {
  x: number;
  y: number;
  width: number;
  height: number;

  constructor(private readonly room: Room, private readonly items: Item[], data: ContainerData) {
    this.x = data.x;
    this.y = data.y;
    this.width = data.width;
    this.height = data.height;
  }

  doClick(x: number, y: number) {
    if(!this.isUnderPointer(x, y)) return false;

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
    ctx.fillStyle = 'coral';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  isUnderPointer(x: number, y: number) {
    if(x < this.x || x > this.x + this.width) return false;
    if(y < this.y || y > this.y + this.height) return false;
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

  debugResize(evt: WheelEvent) {
    this.width += evt.deltaX / 100;
    this.height += evt.deltaY / 50;
  }
}

type ContainerData = Pick<Container, 'x'|'y'|'width'|'height'>&{items: ItemData[]}
