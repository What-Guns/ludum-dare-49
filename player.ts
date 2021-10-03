import {Serializable} from './serialization.js';
import {loadImage} from './loader.js';
import {Material, MaterialType, materials, getMaterialType} from './material.js';
import {HudItemHotbar} from './hud.js';
import {playSFX} from './audio.js';

@Serializable('./player.js')
export class Player {
  public x: number;
  public y: number;
  public targetX: number;
  private readonly hotbar = new HudItemHotbar();
  private materialInventorySize: number;

  readonly heldMaterials: Material[] = [];

  constructor({x, y, heldMaterials = [], materialInventorySize}: PlayerData, private standingImage: HTMLImageElement, private walkingImage: HTMLImageElement) {
    this.x = x;
    this.y = y;
    this.targetX = x;
    this.materialInventorySize = materialInventorySize ?? 5;
    this.hotbar.setCapacity(this.materialInventorySize);
    for(const mat of heldMaterials) this.takeMaterial(materials[mat], true);
  }

  static async deserialize(playerData: PlayerData) {
    const standing = await loadImage('./sprites/player-forwards.png');
    const walking = await loadImage('./sprites/player-right.png');
    return new Player(playerData, standing, walking);
  }

  tick(dt: number) {
    const maxMovement = 500 * dt;
    if(this.x > this.targetX) {
      this.x = Math.max(this.x - maxMovement, this.targetX);
    } else if(this.x < this.targetX) {
      this.x = Math.min(this.x + maxMovement, this.targetX);
    }
  }

  canReach(x: number, _y: number) {
    return Math.abs(x - this.x) < 200;
  }

  moveToCursor(x: number) {
    this.targetX = x;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const image = this.targetX !== this.x ? this.walkingImage : this.standingImage;
    const width = image.width;
    const height = image.height;
    ctx.save();
    ctx.translate(this.x, this.y);
    if(this.targetX < this.x) ctx.scale(-1, 1);
    ctx.drawImage(image, -width/2, -height);
    ctx.restore();
  }

  serialize(): PlayerData {
    return {
      x: this.x,
      y: this.y,
      heldMaterials: this.heldMaterials.map(getMaterialType),
      materialInventorySize: this.materialInventorySize,
    };
  }

  takeMaterial(mat: Material, silent = false) {
    if(this.heldMaterials.length >= this.materialInventorySize) {
      playSFX('bad-job-4');
      alert('You can’t hold that many things.');
      return;
    }
    if(this.heldMaterials.indexOf(mat) !== -1) {
      playSFX('bad-job-4');
      alert('You’ve already got one of those.');
      return;
    }
    if(!silent) {
      playSFX('great-jearb-06');
    }
    this.heldMaterials.push(mat);
    this.hotbar.addItem({
      imageUrl: mat.inventoryImageUrl ?? mat.worldImageUrl ?? PLACEHOLDER_IMAGE_URL,
      onActivate: () => {
        alert(`TODO: use ${mat.name}`);
      }
    });
    window.game!.save();
  }
}

interface PlayerData {
  x: number;
  y: number;
  heldMaterials: MaterialType[];
  materialInventorySize?: number;
}

const PLACEHOLDER_IMAGE_URL = "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/285/large-blue-square_1f7e6.png";
