import { startSpeech, stopSpeech } from "./audio.js";
import { Thing } from "./main.js";
import { RpgTextBox } from "./rpgTextBox.js";

export class Npc implements Thing {
  readonly textbox: RpgTextBox = new RpgTextBox(this.textboxDone.bind(this));
  constructor(readonly x: number, readonly y: number, readonly width: number, readonly height: number) {
    this.textbox.visible = false;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'purple';
    ctx.fillRect(this.x, this.y, 100, 100);
  }

  tick(dt: number): void {
    this.textbox.tick(dt);
  }

  stopDrawingDOM() {
    this.textbox.visible = false;
    this.textboxDone();
  }

  doClick(x: number, y: number): boolean {
    if (!this.isUnderPointer(x, y)) return false;
    this.textbox.visible = true;
    this.textbox.textContent = "I'm an NPC! I may look like an ordinary purple square, but I'm actually ... a monster? Of some kind?";
    
    stopSpeech();
    startSpeech('mahp', 150, 1.2, 0.8);
    return true;
  }
  
  isUnderPointer(x: number, y: number): boolean {
    if(x < this.x || x > this.x + this.width) return false;
    if(y < this.y || y > this.y + this.height) return false;
    return true;
  }

  textboxDone() {
    stopSpeech();
  }

  static deserialize({x, y, width, height}: NpcData) {
    return new Npc(x, y, width, height);
  }
}

interface NpcData {
  x: number,
  y: number,
  width: number,
  height: number,
}