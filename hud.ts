import { playBGM, playSFX, playSpeech } from "./audio.js";
import {Room} from './room.js';

const popupContainer = document.getElementById('popup-window-container') as HTMLDivElement;

export function translateAndScalePopupContainer(room: Room) {
  popupContainer.style.transform = `translateX(${room.camera.x}px) scale(${room.camera.scale})`;
}

export function resizePopupContainer(room: Room) {
  popupContainer.style.width = room.width+'px';
  popupContainer.style.height = room.height+'px';
}

class HudItemWindow {
  private element: HTMLElement;
  private _image: HTMLImageElement = document.createElement('img');
  private _itemName: HTMLDivElement = document.createElement('div');
  private _itemDescription: HTMLDivElement = document.createElement('div');
  private _traitsList: HTMLUListElement = document.createElement('ul');

  readonly imageHeight = "40px";
  readonly imageWidth  = "40px";

  set traitsList(list: string[]) {
    while (this._traitsList.firstChild) {
      this._traitsList.removeChild(this._traitsList.firstChild);
    }
    list.forEach(trait => {
      const li = document.createElement('li');
      li.innerText = trait;
      this._traitsList.appendChild(li);
    })
  }

  set itemDescription(desc: string) {
    this._itemDescription.innerText = desc;
  }

  set itemName(name: string) {
    this._itemName.innerText = name;
  }

  set image(src: string) {
    this._image.src = src;
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

  constructor() {
    this.element = document.createElement('div');
    this.element.classList.add('hudWindow', 'hudItemWindow');
    this.element.style.left = String(this.x);
    this.element.style.right = String(this.y);
    this.populateWindow();
    popupContainer.appendChild(this.element);
  }

  private populateWindow() {
    const picAndName = document.createElement('div');
    picAndName.classList.add('hudPictureAndName');
    this.element.appendChild(picAndName);

    const picDiv = document.createElement('div');
    picDiv.classList.add('hudItemPicture');
    picAndName.appendChild(picDiv);

    this._image.setAttribute('height', this.imageHeight);
    this._image.setAttribute('width', this.imageWidth);
    picDiv.appendChild(this._image);

    this._itemName.classList.add('hudItemName');
    picAndName.appendChild(this._itemName);

    this._itemDescription.classList.add('hudItemDescription');
    this.element.appendChild(this._itemDescription);

    const traitsTitleDiv = document.createElement('div');
    traitsTitleDiv.classList.add('hudItemTraitsTitle');
    this.element.appendChild(traitsTitleDiv);

    const traitsTitle = document.createElement('strong');
    traitsTitle.innerText = 'Traits';
    traitsTitleDiv.appendChild(traitsTitle);

    const traitsListDiv = document.createElement('div');
    traitsListDiv.classList.add('hudItemTraitsList');
    this.element.appendChild(traitsListDiv);

    traitsListDiv.appendChild(this._traitsList);
  }
}

class HudItemHotbar {
  readonly itemWidth = '40px';
  readonly itemHeight = '40px';
  private _capacity = 5;
  private _selectedIndex = 0;

  private element = document.createElement('div');
  private _itemList = document.createElement('ul');
  private _imageSrcList: string[] = [];

  constructor() {
    this.element.classList.add('hudWindow', 'hudItemHotbar');

    this._itemList.classList.add('hudItemHotbarList');
    this.element.appendChild(this._itemList);
    this.element.addEventListener('mousedown', ev => {
      ev.stopPropagation();
      const clickedItem = ev.composedPath()[1];
      const clickedIndex = Array.from(this._itemList.childNodes).findIndex(el => el === clickedItem);
      if (clickedIndex > -1) this.selectedIndex = clickedIndex;
      if (clickedIndex === 0) playBGM('banjo');
      if (clickedIndex === 1) playBGM('crystal');
      if (clickedIndex === 2) playSpeech('meow', 12, 130, 1.15, 1.1);
      if (clickedIndex === 3) playSFX('splat');
    })
    document.body.appendChild(this.element);
  }

  redrawItems() {
    while (this._itemList.firstChild) this._itemList.removeChild(this._itemList.firstChild);
    for(let i=0; i<this._capacity; i++) {
      const li = document.createElement('li');
      li.classList.add('hudHotbarItem');
      if (i == this.selectedIndex) {
        li.classList.add('selected');
      }
      this._itemList.appendChild(li);

      const img = document.createElement('img');
      img.setAttribute('height', this.itemHeight);
      img.setAttribute('width', this.itemWidth);
      if (i < this._imageSrcList.length) {
        img.setAttribute('src', this._imageSrcList[i]);
      }
      li.appendChild(img);
    } 
  }

  set capacity(c: number) {
    this._capacity = c;
    this.redrawItems();
  }

  set imgSrcList(srcList: string[]) {
    this._imageSrcList = srcList;
    this.redrawItems();
  }

  setImageAt(index: number, src: string) {
    this._imageSrcList[index] = src;
    this.redrawItems();
  }
  
  set selectedIndex(index: number) {
    this._selectedIndex = index;
    console.log(`Selecting ${this._selectedIndex} in hotbar`);
    [].forEach.call(this._itemList.children, (element: HTMLUListElement, i) => {
      element.classList.remove('selected');
      if (index == i) element.classList.add('selected');
    });
  }

  static defaultList = [
    "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/298/banjo_1fa95.png",
    "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/298/crystal-ball_1f52e.png",
    "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/298/cat_1f408.png",
    "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/298/jack-o-lantern_1f383.png",
  ]

}
export { HudItemWindow, HudItemHotbar }
