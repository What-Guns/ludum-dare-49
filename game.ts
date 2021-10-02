import {pointer} from './input.js';
import {Player} from './player.js';
import { HudItemHotbar } from './hud.js';
import {Room, RoomData} from './room.js';
import {Door} from './door.js';
import {serialize, Serializable, deserialize} from './serialization.js';
import {ofType} from './crap.js';
import './audio.js';

@Serializable('./game.js')
export class Game {
  readonly rooms: Room[] = [];
  private room: Room|null = null;
  private ctx: CanvasRenderingContext2D;
  hotbar = new HudItemHotbar();
  private nextRoom: [string, string]|null = null;
  private wasPointerActive = false;

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
    this.room?.draw(this.ctx);

    if(pointer.active) {
      this.ctx.fillRect(pointer.x - 4, pointer.y - 1, 8, 2);
      this.ctx.fillRect(pointer.x - 1, pointer.y - 4, 2, 8);
    }
  }

  goToFirstRoom() {
    this.room = this.rooms.find(r => r.things.some(ofType(Player)))!;
  }

  goToDoor(roomName: string, doorName: string) {
    // defer the room transition so we don't tick two rooms in one pass
    this.nextRoom = [roomName, doorName];
  }

  private goToDoorImmediately(roomName: string, doorName: string) {
    if(!this.room) throw new Error(`Cannot go through a door when we don't have a source room.`);

    const player = this.room.things.find(ofType(Player));
    if(!player) throw new Error(`The player isn't in the current room!`);

    this.room!.things.splice(this.room.things.indexOf(player), 1);

    const targetRoom = this.rooms.find(room => room.name === roomName);
    if(!targetRoom) throw new Error(`Couldn't find room named ${roomName}`);
    const targetDoor = targetRoom.things.filter<Door>(ofType(Door)).find(d => d.name === doorName);
    if(!targetDoor) throw new Error(`Couldn't find door named ${doorName}`);
    this.room = targetRoom;

    player.x = targetDoor.x;
    player.y = targetDoor.base;
    player.targetX = targetDoor.x;
    targetRoom.things.push(player);
  }
}

interface GameData {
  rooms: RoomData[]
}

interface GameExtras {
  canvas: HTMLCanvasElement;
}
