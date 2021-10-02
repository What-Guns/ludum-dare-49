addEventListener('load', () => {
  const canvas = document.querySelector('canvas')!;
  const game = new Game(canvas);

  requestAnimationFrame(main);

  canvas.addEventListener('touchstart', evt => {
    evt.preventDefault();
    game.touched(evt);
  });

  canvas.addEventListener('touchmove', evt => {
    evt.preventDefault();
    game.touched(evt);
  });

  canvas.addEventListener('mousedown', evt => {
    game.mouseClicked(evt);
  });

  canvas.addEventListener('mousemove', evt => {
    game.mouseMoved(evt);
  })

  canvas.addEventListener('mouseup', evt => {
    game.mouseUnclicked(evt);
  });

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

interface Pointer {
  identifier: number;
  x: number;
  y: number;
  active: boolean;
}

class Game {
  private room: Room;
  private ctx: CanvasRenderingContext2D;

  pointer: Pointer = {
    identifier: -1,
    x: 0,
    y: 0,
    active: false,
  };

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

    if(this.pointer.active) {
      this.ctx.fillRect(this.pointer.x - 4, this.pointer.y - 1, 8, 2);
      this.ctx.fillRect(this.pointer.x - 1, this.pointer.y - 4, 2, 8);
    }
  }

  touched(evt: TouchEvent) {
    const touch = this.getRelevantTouch(evt);
    if(!touch) return;
    this.pointer.identifier = touch.identifier;
    this.pointer.x = touch.pageX;
    this.pointer.y = touch.pageY;
    this.pointer.active = true;
  }

  touchend(evt: TouchEvent) {
    if(this.getRelevantTouch(evt)) {
      this.pointer.active = false;
    }
  }

  mouseClicked(evt: MouseEvent) {
    this.pointer.active = true;
    this.pointer.x = evt.pageX;
    this.pointer.y = evt.pageY;
    this.pointer.identifier = -1;
  }

  mouseMoved(evt: MouseEvent) {
    this.pointer.x = evt.pageX;
    this.pointer.y = evt.pageY;
  }

  mouseUnclicked(evt: MouseEvent) {
    this.pointer.active = false;
    this.pointer.x = evt.pageX;
    this.pointer.y = evt.pageY;
    this.pointer.identifier = -1;
  }

  private getRelevantTouch(evt: TouchEvent) {
    if(!this.pointer.active) return evt.changedTouches.item(0);
    for(let i = 0; i < evt.changedTouches.length; i++) {
      const touch = evt.changedTouches.item(i);
      if(!touch) return;
      if(touch.identifier === this.pointer.identifier) return touch;
    }

    return null;
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

class Player {
  constructor(public x: number, public y: number) {}

  draw(ctx: CanvasRenderingContext2D) {
    const width = 32;
    const height = 48;
    ctx.fillRect(this.x - width/2, this.y - height, width, height);
  }
}

