import {deserialize} from './serialization.js';
import {loadObject} from './loader.js';
import {Game} from './game.js';
import {init} from './input.js';
import {Room} from './room.js';
import {preloadMaterialImages} from './material.js';
import {resizePopupContainer} from './hud.js';
import './audio.js';

declare global {
  interface Window {
    game?: Game;
  }
}

const materialsLoaded = preloadMaterialImages();

addEventListener('load', async () => {
  const canvas = document.querySelector('canvas')!;
  const continueButton = document.getElementById('continue-button') as HTMLButtonElement;
  await materialsLoaded;
  init(canvas);

  document.getElementById('new-game-button')!.addEventListener('click', async () => {
    localStorage.clear();
    const gameData = await loadObject('./rooms.json');
    await startGame(gameData, canvas);
  });

  continueButton.disabled = !localStorage.getItem('game-state');

  continueButton.addEventListener('click', async () => {
    const gameData = JSON.parse(localStorage.getItem('game-state')!);
    await startGame(gameData, canvas);
  });

  addEventListener('resize', resizeCanvas);

  function resizeCanvas() {
    const {width, height} = canvas.getBoundingClientRect();
    canvas.width = width;
    canvas.height = height;
    if(window?.game?.room) resizePopupContainer(window.game.room);
  }

  resizeCanvas();

});

async function startGame(gameData: any, canvas: HTMLCanvasElement) {
  document.getElementById('welcome')!.remove();
  const game = await deserialize(gameData, {canvas}) as Game;

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

  requestAnimationFrame(main);
}

export interface Thing {
  x: number;
  y: number;
  room?: Room;

  draw?(ctx: CanvasRenderingContext2D): void;
  tick?(dt: number): void;

  /** Returns whether the thing was clicked. */
  doClick?(x: number, y: number): boolean;

  isUnderPointer?(x: number, y: number): boolean;

  stopDrawingDOM?(): void; // tells the dom nodes to go invisible
  startDrawingDOM?(): void; // tells the dom nodes to go visible

  debugResize?(evt: WheelEvent): void;
}
