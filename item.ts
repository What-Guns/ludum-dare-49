import {Thing} from './main.js';
import {pointer} from './input.js';

export class Item implements Thing {
  width = 8;
  height = 12;

  constructor(public x: number, public y: number) { }

  doClick() {
    if(Math.abs(this.x - pointer.x) > this.width / 2) return false;
    if(Math.abs(this.y - pointer.y) > this.height / 2) return false;
    console.log('ya clicked me');
    return true;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'blue';
    ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
  }
}
