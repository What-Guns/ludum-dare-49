import {Room} from './room.js';
import {Thing} from './main.js';
import {Serializable} from './serialization.js';
import { hideHudItemWindow, makeHudItemWindow } from './hud.js';
import { materials, MaterialType, Material} from './material.js';

@Serializable('./resource-spawner.js')
export class ResourceSpawner implements Thing {
  x: number;
  y: number;
  readonly width: number;
  readonly height: number;
  room?: Room;

  constructor(readonly material: Material, readonly worldImage: HTMLImageElement, {x, y}: ResourceSpawnerData) {
    this.x = x;
    this.y = y;
    this.width = worldImage.width;
    this.height = worldImage.height;
  }

  static async deserialize(data: ResourceSpawnerData) {
    const material = materials[data.resourceType];
    if(!material) throw new Error(`Cannot find material with name ${data.resourceType}`);
    const image = material.worldImage!;
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
      hideHudItemWindow();
      return false;
    } 
    if(!this.room?.player?.canReach(this.x, this.y)) return false;
    const hudWindow = makeHudItemWindow({
      image: this.material.inventoryImageUrl!,
      name: this.material.name,
      traits: [this.material.effect],
      description: this.material.description,
      onTake: () => this.take(),
    });
    hudWindow.x = this.x;
    hudWindow.y = this.y;
    hudWindow.visible = true;
    return true;
  }

  take() {
    this.room?.player?.takeMaterial(this.material);
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
