import {Serializable, pluck, deserialize, serialize} from './serialization.js';
import {Thing} from './main.js';
import {toast} from './toast.js';
import {Room} from './room.js';
import {ResourceSpawner, ResourceSpawnerData} from './resource-spawner.js';
import {puzzleObjects} from './puzzleObject.js';
import {loadImage} from './loader.js';
import { increaseProgressLevel } from './progressManager.js';

// the left edge of the cabinet is transparent.
const CLICKABLE_WIDTH = 128;

@Serializable('./cabinet.js')
export class Cabinet implements Thing {
  x: number;
  y: number;
  z: number;
  room?: Room;

  constructor(data: CabinetData, public topItem: ResourceSpawner|null, public bottomItem: ResourceSpawner|null, private readonly frames: HTMLImageElement[]) {
    this.x = data.x;
    this.y = data.y;
    this.z = data.z ?? -1;
    if(this.topItem) {
      this.topItem.x = this.x - CLICKABLE_WIDTH/2;
      this.topItem.y = this.y + frames[0].height / 4;
      this.topItem.z = this.z + 1;
    }
    if(this.bottomItem) {
      this.bottomItem.x = this.x - CLICKABLE_WIDTH/2;
      this.bottomItem.y = this.y + frames[0].height * 3 / 4;
      this.bottomItem.z = this.z + 1;
    }
  }

  doClick(x: number, y: number) {
    if(!this.isUnderPointer(x, y)) return false;

    const player = this.room?.player;
    if(!player?.canReach(this.x, this.y)) return false;

    if(!this.bottomItem && !this.topItem) return false;

    if(this.bottomItem) {
      if(player.hasPuzzleObject(puzzleObjects['small-key'])) {
        this.room!.adoptThing(this.bottomItem);
        this.bottomItem = null;
        increaseProgressLevel(6);
        window.game!.save();
      } else if(player.hasPuzzleObject(puzzleObjects['key'])) {
        toast('This key is too big!')
      } else {
        toast(`Locked`);
      }
      return true;
    }

    if(this.topItem) {
      if (player.hasPuzzleObject(puzzleObjects['big-key'])) {
        this.room?.adoptThing(this.topItem);
        this.topItem = null;
        increaseProgressLevel(7);
        window.game!.save();
      } else if(player.hasPuzzleObject(puzzleObjects['key'])) {
        toast('This key is too small!')
      } else if(player.hasPuzzleObject(puzzleObjects['small-key'])) {
        toast('This key is much too small!')
      } else {
        toast(`Locked`);
      }
    }

    return true;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const frameNumber = this.bottomItem ? 0 : this.topItem ? 1 : 2;
    const frame = this.frames[frameNumber];
    ctx.drawImage(frame, this.x - frame.width, this.y);
  }

  isUnderPointer(x: number, y: number) {
    if(!this.topItem && !this.bottomItem) return false;
    if(y < this.y || y > this.y + this.frames[0].height) return false
    if(x > this.x) return false;
    return x > this.x - CLICKABLE_WIDTH;
  }

  static async deserialize(data: CabinetData) {
    const topItem = (data.topItem && await deserialize(data.topItem)) ?? null;
    const bottomItem = (data.bottomItem && await deserialize(data.bottomItem)) ?? null;
    const frames = await Promise.all([
      './sprites/Cabinets-closed.png',
      './sprites/Cabinets-bottom.png',
      './sprites/Cabinets-open.png',
    ].map(loadImage));
    return new Cabinet(data, topItem, bottomItem, frames);
  }

  serialize(): CabinetData {
    return {
      ...pluck(this, 'x', 'y', 'z'),
      topItem: this.topItem ? serialize(this.topItem) : null,
      bottomItem: this.bottomItem ? serialize(this.bottomItem) : null,
    };
  }
}

type CabinetData = Pick<Cabinet, 'x'|'y'|'z'>&{topItem: ResourceSpawnerData|null, bottomItem: ResourceSpawnerData|null}
