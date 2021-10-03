import {Serializable, pluck, deserialize, serialize} from './serialization.js';
import {Thing} from './main.js';
import {Room} from './room.js';
import {debug} from './debug.js';
import {ResourceSpawner, ResourceSpawnerData} from './resource-spawner.js';

@Serializable('./container.js')
export class Container implements Thing {
  x: number;
  y: number;
  width: number;
  height: number;

  constructor(private readonly room: Room, private readonly items: ResourceSpawner[], data: ContainerData) {
    this.x = data.x;
    this.y = data.y;
    this.width = data.width;
    this.height = data.height;
  }

  doClick(x: number, y: number) {
    if(!this.isUnderPointer(x, y)) return false;

    const player = this.room.player;
    if(!player?.canReach(this.x, this.y)) return false;

    for(const item of this.items) this.room.adoptThing(item);
    this.items.length = 0;
    this.room.disown(this);

    window.game!.save();

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

type ContainerData = Pick<Container, 'x'|'y'|'width'|'height'>&{items: ResourceSpawnerData[]}
