import {Thing} from './main.js';
import {pointer} from './input.js';
import {Serializable} from './serialization.js';

@Serializable()
export class Item implements Thing {
  constructor(public x: number, public y: number, public width: number, public height: number) { }

  static deserialize({x, y, width, height}: ItemData) {
    return Promise.resolve(new Item(x, y, width, height));
  }

  serialize(): ItemData {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

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

interface ItemData {
  x: number;
  y: number;
  width: number;
  height: number;
}
