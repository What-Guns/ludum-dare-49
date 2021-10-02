import {Player} from './player.js';
import {pointer} from './input.js';
import { HudWindow } from './hud.js';
import {Item} from './item.js';

addEventListener('load', () => {
  const canvas = document.querySelector('canvas')!;
  const game = new Game(canvas);

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
  private room: Room;
  private ctx: CanvasRenderingContext2D;
  private hudWindow = new HudWindow();

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
    this.room = new Room();
    this.room.things.push(new Player(100, 100));
  }

  tick(dt: number) {
    this.room.tick(dt);
  }

  draw() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.room.draw(this.ctx);
    this.hudWindow.draw(this.ctx);

    if(pointer.active) {
      this.ctx.fillRect(pointer.x - 4, pointer.y - 1, 8, 2);
      this.ctx.fillRect(pointer.x - 1, pointer.y - 4, 2, 8);
    }
  }
}

class Room {
  things: Thing[] = [];

  private wasPointerActive = false;

  constructor() {
    this.things.push(new Item(50, 50));
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

export interface Thing {
  draw?(ctx: CanvasRenderingContext2D): void;
  tick?(dt: number): void;

  /** Returns whether the thing was clicked. */
  doClick?(): boolean;
}
