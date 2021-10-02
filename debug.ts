import {pointer} from './input.js';
import {Thing} from './main.js';

export let debug = false;
export let held: Held|null = null;

addEventListener('keydown', evt => {
  if(evt.key === '`') debug = !debug;
  held = null;
});

addEventListener('contextmenu', evt => {
  if(!debug) return;
  evt.preventDefault();
  const thing = window.game?.room?.getThingUnderCursor();
  held = thing ? {thing, previousPointer: {x: pointer.x, y: pointer.y}} : null;
});

addEventListener('mouseup', () => held = null);

addEventListener('wheel', evt => {
  if(!debug) return;
  evt.preventDefault();
  held?.thing?.debugResize?.(evt);
}, {passive: false});

interface Held {
  thing: Thing;
  previousPointer: {x: number, y: number};
}

export function debugTick() {
  if(held) {
    const dx = pointer.x - held.previousPointer.x;
    const dy = pointer.y - held.previousPointer.y;
    held.thing.x += dx;
    held.thing.y += dy;
    held.previousPointer.x = pointer.x;
    held.previousPointer.y = pointer.y;
  }
}
