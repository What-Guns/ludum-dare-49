import {pointer} from './input.js';
import {Player} from './player.js';
import { HudItemHotbar } from './hud.js';
import {Room, RoomData} from './room.js';
import {Door} from './door.js';
import {serialize, Serializable, deserialize} from './serialization.js';
import {ofType} from './crap.js';
import {debugTick} from './debug.js';
import {TransitionDirection} from './door.js';
import './audio.js';

@Serializable('./game.js')
export class Game {
  readonly rooms: Room[] = [];
  now = 0;

  room: Room|null = null;
  private ctx: CanvasRenderingContext2D;
  hotbar = new HudItemHotbar();
  private nextRoom: [string, string, TransitionDirection]|null = null;
  private wasPointerActive = false;
  private transition: Transition|null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
    this.hotbar.imgSrcList = HudItemHotbar.defaultList;
    this.hotbar.redrawItems();
    window.game = this;
    (window as any).hotbar = this.hotbar;
  }

  static async deserialize(data: GameData, {canvas}: GameExtras)  {
    const game = new Game(canvas);
    const rooms = (await Promise.all(data.rooms.map(deserialize))) as Room[];
    game.rooms.push(...rooms as Room[]);
    game.goToFirstRoom();
    return Promise.resolve(game);
  }

  serialize(): GameData {
    return {
      rooms: this.rooms.map(room => serialize<Room, RoomData>(room))
    };
  }

  save() {
    return serialize(this);
  }

  tick(dt: number) {
    debugTick();
    if(this.transition) return;

    if(!this.wasPointerActive && pointer.active) {
      this.room?.doClick();
    }
    this.wasPointerActive = pointer.active;
    this.room?.tick(dt);
    if(this.nextRoom) {
      this.goToDoorImmediately(...this.nextRoom)
      this.nextRoom = null;
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.save();
    if(this.transition) {
      const amount = (this.now - this.transition.startTime) / this.transition.duration;
      if(amount > 1) {
        this.transition = null
      } else {
        const dx = this.transition.direction === 'right' ? -1 : 1;
        this.ctx.translate(dx * this.ctx.canvas.width * amount, 0);
        this.transition.from.draw(this.ctx);
        this.ctx.translate(this.ctx.canvas.width * dx * -1, 0);
        if(this.transition.startTime + this.transition.duration < this.now) this.transition = null;
      }
    }

    this.room?.draw(this.ctx);

    if(pointer.active) {
      this.ctx.fillRect(pointer.x - 4, pointer.y - 1, 8, 2);
      this.ctx.fillRect(pointer.x - 1, pointer.y - 4, 2, 8);
    }

    this.ctx.restore();
  }

  goToFirstRoom() {
    this.room = this.rooms.find(r => r.things.some(ofType(Player)))!;
    this.room.activate();
  }

  goToDoor(roomName: string, doorName: string, direction: TransitionDirection) {
    // defer the room transition so we don't tick two rooms in one pass
    this.nextRoom = [roomName, doorName, direction];
  }

  private goToDoorImmediately(roomName: string, doorName: string, direction: TransitionDirection) {
    if(!this.room) throw new Error(`Cannot go through a door when we don't have a source room.`);

    const player = this.room.things.find(ofType(Player));
    if(!player) throw new Error(`The player isn't in the current room!`);

    this.room.deactivate();
    this.room.things.splice(this.room.things.indexOf(player), 1);

    const targetRoom = this.rooms.find(room => room.name === roomName);
    if(!targetRoom) throw new Error(`Couldn't find room named ${roomName}`);
    const targetDoor = targetRoom.things.filter<Door>(ofType(Door)).find(d => d.name === doorName);
    if(!targetDoor) throw new Error(`Couldn't find door named ${doorName}`);

    this.transition = {
      from: this.room,
      startTime: this.now,
      direction,
      duration: 1,
    };

    this.room = targetRoom;

    player.x = targetDoor.x;
    player.y = targetDoor.y;
    player.targetX = targetDoor.x;
    targetRoom.things.push(player);
    targetRoom.activate();
  }
}

interface GameData {
  rooms: RoomData[]
}

interface GameExtras {
  canvas: HTMLCanvasElement;
}

interface Transition {
  from: Room;
  startTime: number;
  direction: TransitionDirection;
  duration: number;
}
