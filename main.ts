import {deserialize} from './serialization.js';
import {loadObject} from './loader.js';
import {Game} from './game.js';
import {init} from './input.js';
import {resizePopupContainer} from './hud.js';
import './audio.js';
import './rpgTextBox.js';

declare global {
  interface Window {
    game?: Game;
  }
}

addEventListener('load', async () => {
  const canvas = document.querySelector('canvas')!;
  init(canvas);
  const gameData = await loadObject('./rooms.json');
  const game = await deserialize(gameData, {canvas}) as Game;

  requestAnimationFrame(main);

  addEventListener('resize', resizeCanvas);

  function resizeCanvas() {
    const {width, height} = canvas.getBoundingClientRect();
    canvas.width = width;
    canvas.height = height;
    if(game?.room) resizePopupContainer(game.room);
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
  x: number;
  y: number;

  draw?(ctx: CanvasRenderingContext2D): void;
  tick?(dt: number): void;

  /** Returns whether the thing was clicked. */
  doClick?(x: number, y: number): boolean;

  isUnderPointer?(x: number, y: number): boolean;

  stopDrawingDOM?(): void; // tells the dom nodes to go invisible
  startDrawingDOM?(): void; // tells the dom nodes to go visible

  debugResize?(evt: WheelEvent): void;
}
