import {pointer} from './input.js';
import {Thing} from './main.js';
import {materials} from './material.js';
import {deserialize} from './serialization.js';

export let debug = false;
export let held: Held|null = null;

addEventListener('keydown', evt => {
  if(evt.key === '`') debug = !debug;
  if(debug) {
    document.body.classList.add('debug');
  } else {
    document.body.classList.remove('debug');
  }
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

const debugFunctions = {
  async addResourceSpawner() {
    const data = {
      "@type": "ResourceSpawner",
        "@path": "./resource-spawner.js",
        "x": window.game!.room!.vanishingPoint.x,
        "y": window.game!.room!.vanishingPoint.y,
        "resourceType": resourceSelector!.value,
    };
    const spawner = await deserialize(data);
    window.game!.room!.things.push(spawner);
  },
  save() {
    localStorage.setItem('game-state', JSON.stringify(window.game?.getState()));
  },
  copy() {
    navigator.clipboard.writeText(JSON.stringify(window.game!.getState(), null, 2));
    alert('copied!');
  }
};

for(const btn of Array.from(document.querySelectorAll('[data-debug-click]'))) {
  const fnName = btn.getAttribute('data-debug-click') as keyof typeof debugFunctions;
  const fn = debugFunctions[fnName];
  if(!fn) throw new Error(`No debug function named ${fnName}`);
  btn.addEventListener('click', fn);
}

const resourceSelector = document.getElementById('resource-selector') as HTMLSelectElement;
for(const material of Object.keys(materials)) {
  const option = document.createElement('option');
  option.textContent = option.value = material;
  option.selected = true;
  resourceSelector.appendChild(option);
}
