import {Thing} from './main.js';
import {MaterialType, materials} from './material.js';
import { Cauldron } from './cauldron.js';


export class CauldronViewer implements Thing {

  static IMAGES: Array<HTMLImageElement> = [];

  public viewItems : MaterialType[]

  constructor(public x: number, public y: number, public width: number, public height: number, public readonly cauldron: Cauldron) {
    this.viewItems = cauldron.placedItems
  }
  // public async loadThem() {
  //   const theImages = await Promise.all(someImageUrls.map(async url => loadImage(url)))
  // }
  //  static async load() {
  //     CauldronViewer.IMAGES = await Promise.all(CauldronViewer.urlArray(this.viewItems).map(loadImage));
  // }

   urlArray (itm: MaterialType[]){
    return itm.map(x=>materials[x].inventoryImageUrl)
  }

  // tick(dt: number) {

  // }

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
  }






