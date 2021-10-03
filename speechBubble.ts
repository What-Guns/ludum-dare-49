import { Thing } from "./main.js";

export class SpeechBubble implements Thing {
  private div = document.createElement('div');
  private visibleText = document.createElement('span');
  private invisibleText = document.createElement('span');

  constructor(public x: number, public y: number, public z: number) {
    this.div.style.setProperty('position', 'absolute');
    this.div.style.setProperty('left', '500px');
    this.div.style.setProperty('top', '300px')
    this.div.style.setProperty('width', '200px');
    this.div.style.setProperty('padding', '10px');
    document.body.appendChild(this.div);

    this.div.appendChild(this.visibleText);
    this.div.appendChild(this.invisibleText);
    this.invisibleText.style.setProperty('color', 'white');

    this.stringContent = "I'm not actually the cauldron talking! That's crazy! No, I'm your familiar! I could be a cat or a bat or a rat, or even an animal that doesn't end in 'at'!";
    this.visible = false;
  }

  set visible(isVisible: boolean) {
    this.div.style.setProperty('visibility', isVisible ? 'visible' : 'hidden');
  }

  set stringContent(s: string) {
    this.visibleText.innerText = '';
    this.invisibleText.innerText = s;
  }

  revealLetter() {
    if (this.invisibleText.innerText.length === 0) return;
    const letter = this.invisibleText.innerText.slice(0, 1);
    this.invisibleText.innerText = this.invisibleText.innerText.slice(1);
    this.visibleText.innerText = this.visibleText.innerText + letter;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const { left, right, top, bottom } = this.div.getBoundingClientRect();
    const offset = 15;
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.lineTo(this.x, this.y);
    ctx.lineTo(this.x - offset, bottom);
    ctx.lineTo(left, bottom);
    ctx.lineTo(left, top);
    ctx.lineTo(right, top);
    ctx.lineTo(right, bottom);
    ctx.lineTo(this.x + offset, bottom);
    ctx.lineTo(this.x, this.y);
    ctx.fill();
    ctx.stroke();
  }

  tick(_dt: number) {
    this.revealLetter();
  }

  static deserialize({x, y, z}: SpeechBubbleData) {
    return Promise.resolve(new SpeechBubble(x, y, z));
  }

  stopDrawingDOM() {
    this.visible = false;
  }

  startDrawingDOM() {
    this.visible = true;
    this.invisibleText.innerText = this.visibleText.innerText + this.invisibleText.innerText;
    this.visibleText.innerText = "";
  }
}

interface SpeechBubbleData {
  x: number;
  y: number;
  z: number;
}
