import {Room} from './room.js';
import {Thing} from './main.js';
import { getFilterFromColor, HSBColor, fractionalize } from './crap.js';

const popupContainer = document.getElementById('popup-window-container') as HTMLDivElement;

export function translateAndScalePopupContainer(room: Room) {
  popupContainer.style.transform = `translateX(${room.camera.x}px) scale(${room.camera.scale})`;
}

export function resizePopupContainer(room: Room) {
  popupContainer.style.width = room.width+'px';
  popupContainer.style.height = room.height+'px';
}

export class HudItemWindow {
  element: HTMLElement;

  set itemDescription(desc: string) {
    this.element.querySelector('.hudItemDescription')!.textContent = desc;
  }

  set effect(effect: string|undefined) {
    this.element.querySelector('.hudItemEffect')!.textContent = effect ? `Effect: ${effect}` : '';
  }

  set brewTime(time: {min: number, max: number}|undefined) {
    this.element.querySelector('.hudItemBrewTime')!.textContent = time ? `Brew time: between ${fractionalize(time.min)} and ${fractionalize(time.max)} seconds.` : '';
  }

  set itemName(name: string) {
    this.element.querySelector('.hudItemName')!.textContent = name;
  }

  set image(src: string) {
    this.element.querySelector('img')!.src = src;
  }

  set imageColor(color: HSBColor | undefined) {
    if (!color) return;
    this.element.querySelector('img')!.style.filter = getFilterFromColor(color);
  }

  set visible(isVisible: boolean) {
    this.element.style.visibility = isVisible ? 'visible' : 'hidden';
    this.element.style.display = isVisible ? 'block' : 'none';
  }

  constructor() {
    const template = document.getElementById('hud-window') as HTMLTemplateElement;
    this.element = template.content.firstElementChild!.cloneNode(true) as HTMLDivElement;
    popupContainer.appendChild(this.element);
  }

  showByHotbar() {
    this.element.style.transform = '';
    document.querySelector('.hud-window-container')!.appendChild(this.element);
    this.visible = true;
  }

  showByThing({x, y, room}: Thing) {
    const widthREAL = 266;
    popupContainer.append(this.element);
    const tx = Math.min(room!.width - widthREAL, Math.max(0, x - widthREAL/2));
    const ty = y > 500 ? y - 400 : y + 50;
    const transform =  `translate(${tx}px, ${ty}px)`;
    this.element.style.transform = transform;
    this.visible = true;
  }
}

const _hudItemWindow = new HudItemWindow();
export function makeHudItemWindow({onTake, onToss, onPlace, onApply, onBrew, ...params}: HudItemWindowParams): HudItemWindow {
  _hudItemWindow.image = params.image;
  _hudItemWindow.imageColor = params.imageColor;
  _hudItemWindow.itemName = params.name;
  _hudItemWindow.itemDescription = params.description;
  _hudItemWindow.effect = params.effect;
  _hudItemWindow.brewTime = params.brewTime;
  const buttonContainer = document.querySelector('#buttonContainer')!;
  while(buttonContainer.firstChild) {
    buttonContainer.removeChild(buttonContainer.firstChild);
  }

  if(onTake) {
    const takeButton = document.createElement('button');
    takeButton.innerText = 'Take';
    takeButton.addEventListener('click', () => {
      onTake();
      _hudItemWindow.visible = false;
    })
    buttonContainer.appendChild(takeButton);
  }
  
  if(onPlace) {
    const placeButton = document.createElement('button');
    placeButton.innerText = 'Place';
    placeButton.addEventListener('click', () => {
      onPlace();
      _hudItemWindow.visible = false;
    })
    buttonContainer.appendChild(placeButton);
  }
  
  if(onToss) {
    const tossButton = document.createElement('button');
    tossButton.innerText = 'Toss';
    tossButton.addEventListener('click', () => {
      onToss();
      _hudItemWindow.visible = false;
    })
    buttonContainer.appendChild(tossButton);
  }

  if(onApply) {
    const applyButton = document.createElement('button');
    applyButton.innerText = 'Apply';
    applyButton.addEventListener('click', () => {
      onApply();
      _hudItemWindow.visible = false;
    })
    buttonContainer.appendChild(applyButton);
  }

  if(onBrew) {
    const applyButton = document.createElement('button');
    applyButton.innerText = 'Brew';
    applyButton.addEventListener('click', () => {
      onBrew();
      _hudItemWindow.visible = false;
    })
    buttonContainer.appendChild(applyButton);
  }
  return _hudItemWindow;
}
export function hideHudItemWindow() { _hudItemWindow.visible = false }

export interface HudItemWindowParams {
  image: string;
  imageColor?: HSBColor;
  name: string;
  description: string;
  brewTime?: {min: number, max: number};
  effect?: string;
  onTake?: () => void;
  onToss?: () => void;
  onPlace?: () => void;
  onApply?: () => void;
  onBrew?: () => void;
}

export class HudItemHotbar {
  readonly itemWidth = '40px';
  readonly itemHeight = '40px';
  private readonly items: HotbarItem[] = [];

  private element = document.createElement('div');
  readonly _itemList = document.createElement('ul');

  constructor() {
    this.element.classList.add('hudWindow', 'hudItemHotbar');

    this._itemList.classList.add('hudItemHotbarList');
    this.element.appendChild(this._itemList);

    const hudWindowContainer = document.createElement('div');
    hudWindowContainer.className = 'hud-window-container';
    this.element.appendChild(hudWindowContainer)
    document.body.appendChild(this.element);
  }

  setCapacity(capacity: number) {
    while (this._itemList.firstChild) this._itemList.removeChild(this._itemList.firstChild);
    for(let i = 0; i < capacity; i++) {
      this.createSlot();
    }
  }

  addItem(item: HotbarItem) {
    this.items.push(item);
    const slots = Array.from(this._itemList.querySelectorAll('li'));
    if(this.items.length > slots.length) {
      throw new Error(`Overencumbered!`);
    }
    const img = document.createElement('img');
    img.src = item.imageUrl;
    if (item.imageColor) {
      img.style.filter = getFilterFromColor(item.imageColor);
    }
    slots[this.items.length - 1].appendChild(img);
  }

  removeItemByName(name: string) {
    const item = this.items.find(i => i.name === name);
    if (item) this.removeItem(item);
  }

  removeItem(item: HotbarItem) {
    const index = this.items.indexOf(item);
    if(index === -1) throw new Error(`Trying to remove an item from the hotbar that's not there.`);
    this.items.splice(index, 1);
    const slots = Array.from(this._itemList.querySelectorAll('li'));
    slots[index].remove();
    this.createSlot();
  }

  private createSlot() {
    const li = document.createElement('li');
    li.classList.add('hudHotbarItem');
    li.addEventListener('click', () => this.clicked(li));
    this._itemList.appendChild(li);
  }

  private clicked(li: HTMLLIElement) {
    const clickedIndex = Array.from(li.parentElement!.querySelectorAll('li')).indexOf(li);
    this.items[clickedIndex]?.onActivate();
  }
}

interface HotbarItem {
  imageUrl: string;
  imageColor?: HSBColor;
  name: string;
  onActivate: () => void;
}
