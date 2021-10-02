import {Thing} from './main.js';
import {pointer} from './input.js';
import {Serializable} from './serialization.js';
import { HudItemWindow } from './hud.js';

@Serializable('./item.js')
export class Item implements Thing {
  private hudWindow: HudItemWindow;
  constructor(public x: number, public y: number, public width: number, public height: number) {
    this.hudWindow = new HudItemWindow();
    this.hudWindow.image = "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/285/large-blue-square_1f7e6.png";
    this.hudWindow.itemName = "Blue Square";
    this.hudWindow.traitsList = ["Blue", "Four-sided"];
    this.hudWindow.itemDescription = "A two-dimensional piece of blue material";
  }

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
    if(Math.abs(this.x - pointer.x) > this.width / 2 || Math.abs(this.y - pointer.y) > this.height / 2) {
      this.hudWindow.visible = false;
      return false;
    } 
    this.hudWindow.x = pointer.x;
    this.hudWindow.y = pointer.y;
    this.hudWindow.visible = true;
    return true;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'blue';
    ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
  }
}

export interface ItemData {
  x: number;
  y: number;
  width: number;
  height: number;
}
