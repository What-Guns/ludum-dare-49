import {Room} from './room.js';
import {Thing} from './main.js';
import {Serializable} from './serialization.js';
import { hideHudItemWindow, makeHudItemWindow } from './hud.js';
import { materials, MaterialType, Material} from './material.js';
import { getProgressLevel, getProgressLevelIndex } from './progressManager.js';
import { debug } from './debug.js';

@Serializable('./resource-spawner.js')
export class ResourceSpawner implements Thing {
  x: number;
  y: number;
  z: number;
  minimumLevel?: string;
  readonly width: number;
  readonly height: number;
  room?: Room;

  constructor(readonly material: Material, readonly worldImage: HTMLImageElement, {x, y, z, minimumLevel}: ResourceSpawnerData) {
    this.x = x;
    this.y = y;
    this.z = z ?? 0;
    this.minimumLevel = minimumLevel;
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
      z: this.z,
      resourceType,
      minimumLevel: this.minimumLevel,
    };
  }

  doClick(x: number, y: number) {
    if(!this.isUnderPointer(x, y)) {
      hideHudItemWindow();
      return false;
    } 
    if (!this.isVisible()) return false;
    if(!this.room?.player?.canReach(this.x, this.y)) return false;
    const image = this.material.inventoryImageUrl ?? this.material.worldImageUrl ?? PLACEHOLDER_IMAGE_URL;
    makeHudItemWindow({
      image,
      name: this.material.name,
      traits: [this.material.effect],
      description: this.material.description,
      onTake: () => this.take(),
    }).showByThing(this);
    return true;
  }

  isVisible() {
    if (debug) return true;
    if (this.minimumLevel && getProgressLevelIndex(this.minimumLevel) > getProgressLevel()) return false;
    return true;
  }

  take() {
    this.room?.player?.takeMaterial(this.material);
  }

  isUnderPointer(x: number, y: number) {
    if (!this.isVisible()) return false;
    return !(Math.abs(this.x - x) > this.width / 2 || Math.abs(this.y - y) > this.height / 2);
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.isVisible()) return;
    ctx.drawImage(this.worldImage, this.x - this.width / 2, this.y - this.height/2);
  }
}

export interface ResourceSpawnerData {
  x: number;
  y: number;
  z: number;
  minimumLevel?: string;
  resourceType: MaterialType;
}

const PLACEHOLDER_IMAGE_URL = "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/285/large-blue-square_1f7e6.png";
