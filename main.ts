import {Player} from './player.js';
import {pointer} from './input.js';
import { HudWindow } from './hud.js';

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

  tick(dt: number) {
    for(const thing of this.things) {
      thing.tick?.(dt);
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    for(const thing of this.things) {
      thing.draw?.(ctx);
    }
  }
}

interface Thing {
  draw?(ctx: CanvasRenderingContext2D): void;
  tick?(dt: number): void;
}


