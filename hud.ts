class HudItemWindow {
  private element: HTMLElement;
  private _image: HTMLImageElement = document.createElement('img');
  private _itemName: HTMLDivElement = document.createElement('div');
  private _itemDescription: HTMLDivElement = document.createElement('div');
  private _traitsList: HTMLUListElement = document.createElement('ul');

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
    document.body.appendChild(this.element);
  }

  private populateWindow() {
    const picAndName = document.createElement('div');
    picAndName.classList.add('hudPictureAndName');
    this.element.appendChild(picAndName);

    const picDiv = document.createElement('div');
    picDiv.classList.add('hudItemPicture');
    picAndName.appendChild(picDiv);

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

}
export { HudItemWindow, HudItemHotbar }