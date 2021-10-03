import {Thing} from './main.js';
import {Serializable} from './serialization.js';
import {loadImage} from './loader.js';
import { HudItemWindow } from './hud.js';
import { materials, MaterialType, Material} from './material.js';

@Serializable('./resource-spawner.js')
export class ResourceSpawner implements Thing {
  private hudWindow: HudItemWindow;
  x: number;
  y: number;
  readonly width: number;
  readonly height: number;

  constructor(readonly material: Material, readonly worldImage: HTMLImageElement, {x, y}: ResourceSpawnerData) {
    this.x = x;
    this.y = y;
    this.width = worldImage.width;
    this.height = worldImage.height;
    this.hudWindow = new HudItemWindow();
    this.hudWindow.image = worldImage.src;
    this.hudWindow.itemName = material.name;
    this.hudWindow.traitsList = [material.effect];
    this.hudWindow.itemDescription = material.description;
  }

  static async deserialize(data: ResourceSpawnerData) {
    const material = materials[data.resourceType];
    if(!material) throw new Error(`Cannot find material with name ${data.resourceType}`);
    const image = await loadImage(material.worldImageUrl ?? material.inventoryImageUrl ?? PLACEHOLDER_IMAGE_URL);
    return new ResourceSpawner(material, image, data);
  }

  serialize(): ResourceSpawnerData {
    const resourceType = Object.entries(materials).find(([_key, value]) => value === this.material)![0];
    return {
      x: this.x,
      y: this.y,
      resourceType,
    };
  }

  doClick(x: number, y: number) {
    if(!this.isUnderPointer(x, y)) {
      this.hudWindow.visible = false;
      return false;
    } 
    this.hudWindow.x = x;
    this.hudWindow.y = y;
    this.hudWindow.visible = true;
    return true;
  }

  isUnderPointer(x: number, y: number) {
    return !(Math.abs(this.x - x) > this.width / 2 || Math.abs(this.y - y) > this.height / 2);
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.drawImage(this.worldImage, this.x - this.width / 2, this.y - this.height/2);
  }
}

export interface ResourceSpawnerData {
  x: number;
  y: number;
  resourceType: MaterialType;
}

const PLACEHOLDER_IMAGE_URL = "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/285/large-blue-square_1f7e6.png";
