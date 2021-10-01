addEventListener('load', () => {
  const game = new Game(document.querySelector('canvas')!);

  requestAnimationFrame(main);

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
}

class Player {
  constructor(public x: number, public y: number) {}

  draw(ctx: CanvasRenderingContext2D) {
    const width = 32;
    const height = 48;
    ctx.fillRect(this.x - width/2, this.y - height, width, height);
  }
}
