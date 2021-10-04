import {pointer} from './input.js';
import {Thing} from './main.js';
import {materials} from './material.js';
import { getProgressLevel, progressData, setProgressLevel } from './progressManager.js';
import {deserialize, isSerializable, serialize} from './serialization.js';
import {puzzleObjects} from './puzzleObject.js';

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

addEventListener('mousedown', evt => {
  if(!debug) return;
  if(evt.which !== 2) return;
  evt.preventDefault();
  const thing = window.game?.room?.getThingUnderCursor();
  if(thing && isSerializable(thing)) {
    console.log(serialize(thing));
  }
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
    const spawner = await deserialize(data, {room: window.game!.room!});
    window.game!.room!.adoptThing(spawner);
  },
  giveResource() {
    const mat = materials[resourceSelector!.value]!;
    window.game!.room!.player!.takeMaterial(mat, false);
  },
  givePuzzleObject() {
    const p = puzzleObjects[puzzleObjectSelector.value]!;
    window.game!.room!.player!.takePuzzleObject(p, false);
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

const puzzleObjectSelector = document.getElementById('puzzle-object-selector') as HTMLSelectElement;
for(const puzzleObject of Object.keys(puzzleObjects)) {
  const option = document.createElement('option');
  option.textContent = option.value = puzzleObject;
  option.selected = true;
  puzzleObjectSelector.appendChild(option);
}

const progressSelector = document.getElementById('progress-level-selector') as HTMLSelectElement;
for (let level = 0; level < progressData.length; level++) {
  const option = document.createElement('option');
  option.textContent = `${progressData[level].name}: ${progressData[level].unlockedRooms.toString()}`;
  if(getProgressLevel() === level) option.selected = true;
  progressSelector.appendChild(option);
}
progressSelector.addEventListener('change', ev => {
  setProgressLevel((ev.target as HTMLSelectElement).selectedIndex);
});
