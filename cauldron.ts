import {Thing} from './main.js';
import {Serializable} from './serialization.js';
import {Item} from './item.js';

import {HudCauldronItemWindow } from './cauldron_hud.js';

@Serializable('./cauldron_hud.ts')
export class Cauldron implements Thing {

  private hudCauldronWindow: HudCauldronItemWindow;


  public timer = 0;
  public totalTime = 0;
  public timeOut = false;
  readonly placedItems: Item[] = [];
  public transformedItem: Item | null = null;
  public hurryUp = this.totalTime / 3;

  constructor(public x: number, public y: number, public width: number, public height: number) {
    this.hudCauldronWindow = new HudCauldronItemWindow();
    this.hudCauldronWindow.image = "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/285/large-blue-square_1f7e6.png";
    this.hudCauldronWindow.itemName = "Blue Square";
    this.hudCauldronWindow.traitsList = ["Blue", "Four-sided"];
    this.hudCauldronWindow.itemDescription = "A two-dimensional piece of blue material";
  }

  tick(dt: number) {

    if (this.placedItems.length > 0) {
    this.timer -= dt;
      if (this.timer <= this.hurryUp) //transform item
      if (this.transformedItem != null){
        this.timer = this.timer - (dt * 1.25);
        if(this.timer <= 0){
          this.transformedItem = null;
          this.timer = 0;
          this.timeOut = true
         }
      }
    }
  }
  static deserialize({x, y, width, height}: CauldronData) {
    return Promise.resolve(new Cauldron(x, y, width, height));
  }

  serialize(): CauldronData {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  doClick(x: number, y: number) {
    if(Math.abs(this.x - x) > this.width / 2 || Math.abs(this.y - y) > this.height / 2) {
      this.hudCauldronWindow.visible = false;
      return false;
    } 
    this.hudCauldronWindow.x = x;
    this.hudCauldronWindow.y = y;
    this.hudCauldronWindow.visible = true;
    return true;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'black';
    ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
  }
}

interface CauldronData {
  x: number;
  y: number;
  width: number;
  height: number;
}




