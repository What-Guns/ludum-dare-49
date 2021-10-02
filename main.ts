import {Player} from './player.js';
import {pointer} from './input.js';
import { HudItemHotbar } from './hud.js';
import {Room, demoRoom} from './room.js';
import {deserialize} from './serialization.js';

addEventListener('load', async () => {
  const canvas = document.querySelector('canvas')!;
  const room = await deserialize(demoRoom, Room);
  const game = new Game(room, canvas);

  requestAnimationFrame(main);

  addEventListener('resize', resizeCanvas);

  function resizeCanvas() {
    const {width, height} = canvas.getBoundingClientRect();
    canvas.width = width;
    canvas.height = height;
  }

  resizeCanvas();

  let lastTick: number;

  function main(timestamp: number) {
    if(lastTick) {
      const dt = (timestamp - lastTick) / 1000;
      game.tick(dt);
      game.draw();
    }
    lastTick = timestamp;
    requestAnimationFrame(main);
  }
});

class Game {
  private ctx: CanvasRenderingContext2D;
  hotbar = new HudItemHotbar();

  constructor(public room: Room, canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
    this.room.things.push(new Player(100, 100));
    this.hotbar.imgSrcList = HudItemHotbar.defaultList;
    this.hotbar.redrawItems();
  }

  tick(dt: number) {
    this.room.tick(dt);
  }

  draw() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.room.draw(this.ctx);

    if(pointer.active) {
      this.ctx.fillRect(pointer.x - 4, pointer.y - 1, 8, 2);
      this.ctx.fillRect(pointer.x - 1, pointer.y - 4, 2, 8);
    }
  }
}

export interface Thing {
  draw?(ctx: CanvasRenderingContext2D): void;
  tick?(dt: number): void;

  /** Returns whether the thing was clicked. */
  doClick?(): boolean;
}
