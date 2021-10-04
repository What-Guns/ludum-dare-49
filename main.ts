import {deserialize} from './serialization.js';
import {loadObject} from './loader.js';
import {Game} from './game.js';
import {init} from './input.js';
import {Room} from './room.js';
import {preloadMaterialImages} from './material.js';
import {resizePopupContainer} from './hud.js';
import './audio.js';
import './music.js';

declare global {
  interface Window {
    game?: Game;
  }
}

addEventListener('unhandledrejection', rejection => {
  alert(rejection.reason.message);
});

addEventListener('error', error => {
  alert(error.message);
});

const materialsLoaded = preloadMaterialImages();

addEventListener('load', async () => {
  const canvas = document.querySelector('canvas')!;
  const continueButton = document.getElementById('continue-button') as HTMLButtonElement;
  await materialsLoaded;
  init(canvas);

  document.getElementById('new-game-button')!.addEventListener('click', async () => {
    try {
      localStorage.clear();
    } catch (e) {
      //whatever
    }
    const gameData = await loadObject('./rooms.json');
    await startGame(gameData, canvas);
  });

  let savedGame: any;
  try {
    savedGame = localStorage.getItem('game-state');
  } catch (e) {
    savedGame = null;
    continueButton.remove();
  }

  continueButton.disabled = !savedGame;

  continueButton.addEventListener('click', async () => {
    const gameData = JSON.parse(savedGame);
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
  document.getElementById('loading')!.remove();

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
  z: number;
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
