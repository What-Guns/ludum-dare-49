export class RpgTextBox {
  private element = document.createElement('div');
  private _image = document.createElement('img');
  private _text = document.createElement('div');
  private _dismissButton = document.createElement('span');

  constructor() {
    this.element.classList.add('rpgTextBox');
    document.body.appendChild(this.element);

    this._image.classList.add('rpgTextBoxPortrait');
    this._image.setAttribute('src', 'portraits/cat.png');
    this.element.appendChild(this._image);

    this._text.classList.add('rpgTextBoxText');
    this._text.innerText = "I'm not actually the cauldron talking! That's crazy! No, I'm your familiar! I could be a cat or a bat or a rat, or even an animal that doesn't end in 'at'!"
    this.element.appendChild(this._text);

    this._dismissButton.innerText = 'expand_more';
    this._dismissButton.classList.add('material-icons-outlined', 'rpgTextBoxDismissButton');
    this._dismissButton.addEventListener('click', () => this.clickDismiss());
    this.element.appendChild(this._dismissButton);
  }

  set visible(isVisible: boolean) {
    this.element.style.setProperty('visibility', isVisible ? 'visible' : 'hidden');
  }

  clickDismiss() {
    this.visible = false;
  }

  tick(_dt: number) {
    //this.revealLetter();
  }
}

new RpgTextBox();