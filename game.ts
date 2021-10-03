import {pointer} from './input.js';
import {Room, RoomData} from './room.js';
import {serialize, Serializable, deserialize} from './serialization.js';
import {debugTick} from './debug.js';
import {TransitionDirection} from './door.js';
import './audio.js';
import { Toast } from './toast.js';
import './toast.js';
import './progressManager.js';

@Serializable('./game.js')
export class Game {
  readonly rooms: Room[] = [];
  now = 0;

  room: Room|null = null;
  toast?: Toast;
  private ctx: CanvasRenderingContext2D;
  private nextRoom: [string, string, TransitionDirection]|null = null;
  private wasPointerActive = false;
  private transition: Transition|null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
    window.game = this;
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

  getState() {
    return serialize(this);
  }

  save() {
    localStorage.setItem('game-state', JSON.stringify(this.getState()));
  }

  tick(dt: number) {
    debugTick();
    if(this.transition) return;

    if(!this.wasPointerActive && pointer.active) {
      this.room?.doClick();
    }
    this.wasPointerActive = pointer.active;
    this.room?.tick(dt);
    this.toast?.tick(dt);
    if(this.nextRoom) {
      try {
        this.goToDoorImmediately(...this.nextRoom)
      } finally {
        this.nextRoom = null;
      }
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
        let dx, dy;
        switch(this.transition.direction) {
          case 'right':
            dx = -1;
            dy = 0;
            break;
          case 'left':
            dx = 1;
            dy = 0;
            break;
          case 'down':
            dx = 0;
            dy = -1;
            break;
          case 'up':
            dx = 0;
            dy = 1;
        }
        this.ctx.translate(dx * this.ctx.canvas.width * amount, dy * this.ctx.canvas.height * amount);
        this.transition.from.draw(this.ctx);
        this.ctx.translate(this.ctx.canvas.width * dx * -1, this.ctx.canvas.height * dy * -1);
        if(this.transition.startTime + this.transition.duration < this.now) this.transition = null;
      }
    }

    this.room?.draw(this.ctx);
    this.toast?.draw(this.ctx);

    if(pointer.active) {
      this.ctx.fillRect(pointer.x - 4, pointer.y - 1, 8, 2);
      this.ctx.fillRect(pointer.x - 1, pointer.y - 4, 2, 8);
    }

    this.ctx.restore();
  }

  goToFirstRoom() {
    this.room = this.rooms.find(r => r.player)!;
    this.room.activate();
  }

  goToDoor(roomName: string, doorName: string, direction: TransitionDirection) {
    // defer the room transition so we don't tick two rooms in one pass
    this.nextRoom = [roomName, doorName, direction];
  }

  private goToDoorImmediately(roomName: string, doorName: string, direction: TransitionDirection) {
    if(!this.room) throw new Error(`Cannot go through a door when we don't have a source room.`);

    const player = this.room.player;
    if(!player) throw new Error(`The player isn't in the current room!`);

    this.room.deactivate();
    this.room.disown(player);

    const targetRoom = this.rooms.find(room => room.name === roomName);
    if(!targetRoom) throw new Error(`Couldn't find room named ${roomName}`);
    const targetDoor = targetRoom.doors.find(d => d.name === doorName);
    if(!targetDoor) throw new Error(`Couldn't find door named ${doorName}`);

    this.transition = {
      from: this.room,
      startTime: this.now,
      direction,
      duration: 1,
    };

    this.room = targetRoom;

    player.x = targetDoor.x;
    player.y = targetRoom.floorHeight;
    player.targetX = targetDoor.x;
    targetRoom.adoptThing(player);
    targetRoom.activate();

    this.save();
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
