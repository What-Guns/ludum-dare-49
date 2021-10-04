import { loadImage } from "./loader.js";
import { Thing } from "./main.js";
import { Serializable } from "./serialization.js";

@Serializable('./cheatSheet.js')
export class CheatSheet implements Thing {
  x: number;
  y: number;
  z: number;
  
  private readonly width: number;
  private readonly height: number;

  private image: HTMLImageElement;

  constructor(objectData: CheatSheetData, img: HTMLImageElement) {
    this.x = objectData.x;
    this.y = objectData.y;
    this.z = objectData.z;
    this.width = objectData.width;
    this.height = objectData.height;
    this.image = img;

    document.querySelector('#cheat-sheet-close-button')!.addEventListener('click', () => {
      (document.querySelector('#cheat-sheet') as HTMLDivElement).style.setProperty('display', 'none');
    })
  }

  serialize(): CheatSheetData {
    return {
      x: this.x,
      y: this.y,
      z: this.z,
      width: this.width,
      height: this.height,
    };
  }

  static async deserialize(data: CheatSheetData) {
    const image = await loadImage('./sprites/cheat-sheet.png')
    return new CheatSheet(data, image);
  }

  doClick(x: number, y: number) {
    if(!this.isUnderPointer(x, y)) {
      return false;
    }
    (document.querySelector('#cheat-sheet') as HTMLDivElement).style.setProperty('display', 'flex');
    return true;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.drawImage(this.image, this.x - this.width / 2, this.y - this.height/2);
  }

  isUnderPointer(x: number, y: number) {
    return !(Math.abs(this.x - x) > this.width / 2 || Math.abs(this.y - y) > this.height / 2);
  }
}

export interface CheatSheetData {
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
}
