import {deserialize} from './serialization.js';
import {loadObject} from './loader.js';
import {Game} from './game.js';
import './audio.js';

declare global {
  interface Window {
    game?: Game;
  }
}

addEventListener('load', async () => {
  const canvas = document.querySelector('canvas')!;
  const gameData = await loadObject('./rooms.json');
  const game = await deserialize(gameData, {canvas}) as Game;

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
      game.now = timestamp/1000;
      game.tick(dt);
      game.draw();
    }
    lastTick = timestamp;
    requestAnimationFrame(main);
  }
});


export interface Thing {
  draw?(ctx: CanvasRenderingContext2D): void;
  tick?(dt: number): void;

  /** Returns whether the thing was clicked. */
  doClick?(): boolean;
}
