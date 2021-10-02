export class RpgTextBox {
  private element = document.createElement('div');
  private _image = document.createElement('img');
  private _text = document.createElement('div');
  private visibleText = document.createElement('span');
  private invisibleText = document.createElement('span');
  private _dismissButton = document.createElement('button');

  constructor() {
    this.element.classList.add('rpgTextBox');
    document.body.appendChild(this.element);

    this._image.classList.add('rpgTextBoxPortrait');
    this._image.setAttribute('src', 'portraits/cat.png');
    this.element.appendChild(this._image);

    this._text.classList.add('rpgTextBoxText');
    this.element.appendChild(this._text);

    this.invisibleText.style.setProperty('color', 'lightgrey');
    this.invisibleText.innerText = "I'm not actually the cauldron talking! That's crazy! No, I'm your familiar! I could be a cat or a bat or a rat, or even an animal that doesn't end in 'at'!"
    this._text.appendChild(this.visibleText);
    this._text.appendChild(this.invisibleText);

    this._dismissButton.innerText = 'expand_more';
    this._dismissButton.classList.add('material-icons-outlined', 'rpgTextBoxDismissButton');
    this._dismissButton.addEventListener('click', () => this.clickDismiss());
    this.element.appendChild(this._dismissButton);
  }

  set visible(isVisible: boolean) {
    this.element.style.setProperty('visibility', isVisible ? 'visible' : 'hidden');
  }

  clickDismiss() {
    if (this.invisibleText.innerText.length !== 0) {
      this.visibleText.innerText = this.visibleText.innerText + this.invisibleText.innerText;
      this.invisibleText.innerText = "";
    } else {
      this.visible = false;
    }
  }

  tick(_dt: number) {
    this.revealLetter(2);
  }

  revealLetter(letters: number) {
    if (this.invisibleText.innerText.length === 0) return;
    const letter = this.invisibleText.innerText.slice(0, 2);
    this.invisibleText.innerText = this.invisibleText.innerText.slice(letters);
    this.visibleText.innerText = this.visibleText.innerText + letter;
  }
}

(window as any).textBox = new RpgTextBox();