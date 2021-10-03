import {Thing} from './main.js';
import {Serializable} from './serialization.js';
import {MaterialType} from './material.js';
import {CauldronViewer} from './cauldron_viewer.js';


@Serializable('./cauldron.js')
export class Cauldron implements Thing {
  
  public thingy: MaterialType = 'coin'
  public timer = 0;
  public totalTime = 0;
  public timeOut = false;
  readonly placedItems: MaterialType[] = ['coin'];
  public transformedItem: MaterialType | null = null;
  public hurryUp = this.totalTime / 3;
  readonly ITEM_CAPACITY = 5;
  public cv :CauldronViewer

  constructor(public x: number, public y: number, public width: number, public height: number) {
    this.cv = new CauldronViewer(x, y, width, height, this)
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

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'black';
    ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
  }

  debugResize(evt: WheelEvent) {
    this.width += evt.deltaX / 50;
    this.height -= evt.deltaY / 50;
  }

  isUnderPointer(x: number, y: number) {
    return Math.abs(x - this.x) < this.width && Math.abs(y - this.y) < this.height;
  }

  putItem(itm: MaterialType): boolean {
    if (this.placedItems.length >= this.ITEM_CAPACITY) {
      this.denyItem();
      return false;
    }
    this.placedItems.push(itm)
    return true;
  }

  denyItem(){
    alert("I'm a cauldron not a storage unit!")
  }
}

interface CauldronData {
  x: number;
  y: number;
  width: number;
  height: number;
}
