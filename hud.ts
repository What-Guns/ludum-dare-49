import {Room} from './room.js';

const popupContainer = document.getElementById('popup-window-container') as HTMLDivElement;

export function translateAndScalePopupContainer(room: Room) {
  popupContainer.style.transform = `translateX(${room.camera.x}px) scale(${room.camera.scale})`;
}

export function resizePopupContainer(room: Room) {
  popupContainer.style.width = room.width+'px';
  popupContainer.style.height = room.height+'px';
}

export class HudItemWindow {
  private element: HTMLElement;

  set traitsList(list: string[]) {
    const traitsList = this.element.querySelector('ul')!;
    while (traitsList.firstChild) {
      traitsList.removeChild(traitsList.firstChild);
    }
    list.forEach(trait => {
      const li = document.createElement('li');
      li.innerText = trait;
      traitsList.appendChild(li);
    })
  }

  set itemDescription(desc: string) {
    this.element.querySelector('.hudItemDescription')!.textContent = desc;
  }

  set itemName(name: string) {
    this.element.querySelector('.hudItemName')!.textContent = name;
  }

  set image(src: string) {
    this.element.querySelector('img')!.src = src;
  }

  set x(xVal: number) {
    this.element.style.left = String(xVal) + "px";
  }

  set y(yVal: number) {
    this.element.style.top = String(yVal) + "px";
  }

  set visible(isVisible: boolean) {
    this.element.style.visibility = isVisible ? 'visible' : 'hidden';
  }

  constructor({onTake, ...params}: HudItemWindowParams) {
    const template = document.getElementById('hud-window') as HTMLTemplateElement;
    this.element = template.content.firstElementChild!.cloneNode(true) as HTMLDivElement;
    this.image = params.image;
    this.itemName = params.name;
    this.traitsList = params.traits;
    this.itemDescription = params.description;
    const takeButton = this.element.querySelector('[data-take-item]') as HTMLButtonElement;
    if(onTake) {
      takeButton.addEventListener('click', () => {
        onTake();
        this.visible = false;
      })
    } else {
      takeButton.style.display = 'none';
    }
    popupContainer.appendChild(this.element);
  }
}

interface HudItemWindowParams {
  image: string;
  name: string;
  traits: string[];
  description: string;
  onTake?: () => void;
}

export class HudItemHotbar {
  readonly itemWidth = '40px';
  readonly itemHeight = '40px';
  private readonly items: HotbarItem[] = [];
  private _selectedIndex = 0;

  private element = document.createElement('div');
  private _itemList = document.createElement('ul');

  constructor() {
    this.element.classList.add('hudWindow', 'hudItemHotbar');

    this._itemList.classList.add('hudItemHotbarList');
    this.element.appendChild(this._itemList);
    document.body.appendChild(this.element);
  }

  setCapacity(capacity: number) {
    while (this._itemList.firstChild) this._itemList.removeChild(this._itemList.firstChild);
    for(let i = 0; i < capacity; i++) {
      const li = document.createElement('li');
      li.classList.add('hudHotbarItem');
      li.addEventListener('click', () => this.clicked(i));
      this._itemList.appendChild(li);
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
    slots[this.items.length - 1].appendChild(img);
  }

  removeItem(item: HotbarItem) {
    const index = this.items.indexOf(item);
    if(index === -1) throw new Error(`Trying to remove an item from the hotbar that's not there.`);
    const slots = Array.from(this._itemList.querySelectorAll('li'));
    slots[index].querySelector('img')!.remove();
  }

  private clicked(clickedIndex: number) {
    this.items[clickedIndex]?.onActivate();
  }

  set selectedIndex(index: number) {
    this._selectedIndex = index;
    console.log(`Selecting ${this._selectedIndex} in hotbar`);
    [].forEach.call(this._itemList.children, (element: HTMLUListElement, i) => {
      element.classList.remove('selected');
      if (index == i) element.classList.add('selected');
    });
  }
}

interface HotbarItem {
  imageUrl: string;
  onActivate: () => void;
}
