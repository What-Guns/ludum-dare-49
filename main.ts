import {Player} from './player.js';
import {pointer} from './input.js';

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
      const dt = timestamp - lastTick;
      game.draw(dt);
    }
    lastTick = timestamp;
    requestAnimationFrame(main);
  }
});

class Game {
  private room: Room;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
    this.room = new Room();
    this.room.things.push(new Player(100, 100));
  }

  draw(dt: number) {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.room.draw(this.ctx);
    const frameRate = 1000/dt;
    this.ctx.fillText(frameRate.toFixed(0), 10, 10);

    if(pointer.active) {
      this.ctx.fillRect(pointer.x - 4, pointer.y - 1, 8, 2);
      this.ctx.fillRect(pointer.x - 1, pointer.y - 4, 2, 8);
    }
  }

}

class Room {
  things: Thing[] = [];

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


