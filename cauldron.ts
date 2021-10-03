import {Thing} from './main.js';
import {Serializable} from './serialization.js';
import {Material, MaterialType, getMaterialType, materials} from './material.js';
import {toast} from './toast.js';
import {debug} from './debug.js';


@Serializable('./cauldron.js')
export class Cauldron implements Thing {
  
  x: number;
  y: number;
  width: number;
  height: number;
  readonly placedItems: Material[];
  public timer = 0;
  public totalTime = 0;
  public timeOut = false;
  public transformedItem: MaterialType | null = null;
  public hurryUp = this.totalTime / 3;
  readonly ITEM_CAPACITY = 5;
  private rotation = 0;

  constructor(data: CauldronData) {
    this.x = data.x;
    this.y = data.y;
    this.height = data.height;
    this.width = data.width;
    this.placedItems = (data.placedItems ?? []).map(matType => materials[matType]);
  }

  tick(dt: number) {
    if (this.placedItems.length > 0) {
    this.timer -= dt;
      if (this.timer <= this.hurryUp) // transform item
      if (this.transformedItem != null){
        this.timer = this.timer - (dt * 1.25);
        if(this.timer <= 0){
          this.transformedItem = null;
          this.timer = 0;
          this.timeOut = true
         }
      }
    }
    this.rotation -= dt;
    this.rotation = this.rotation % (2 * Math.PI);
  }

  static async deserialize(data: CauldronData) {
    return new Cauldron(data);
  }

  serialize(): CauldronData {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      placedItems: this.placedItems.map(getMaterialType),
    };
  }

  draw(ctx: CanvasRenderingContext2D) {
    if(debug) {
      ctx.fillStyle = 'black';
      ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
    }

    for(let i = 0; i < this.placedItems.length; i++) {
      const dir = 2 * Math.PI * (i/this.ITEM_CAPACITY) + this.rotation;
      const x = Math.cos(dir) * this.width / 3 + this.x;
      const y = Math.sin(dir) * this.width / 6 + this.y - this.height/2 - 50;
      ctx.drawImage(this.placedItems[i].inventoryImage!, x - 20, y - 20, 40, 40);
    }
  }

  debugResize(evt: WheelEvent) {
    this.width += evt.deltaX / 50;
    this.height -= evt.deltaY / 50;
  }

  isUnderPointer(x: number, y: number) {
    return Math.abs(x - this.x) < this.width / 2  && Math.abs(y - this.y) < this.height / 2;
  }

  putItem(material: Material): boolean {
    if (this.placedItems.length >= this.ITEM_CAPACITY) {
      this.denyItem();
      return false;
    }
    this.placedItems.push(material)
    return true;
  }

  denyItem(){
    toast("I'm a cauldron not a storage unit!")
  }
}

interface CauldronData {
  x: number;
  y: number;
  width: number;
  height: number;
  placedItems?: MaterialType[];
}
