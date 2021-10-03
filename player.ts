import {Serializable} from './serialization.js';
import {loadImage} from './loader.js';
import {Material, MaterialType, materials, getMaterialType} from './material.js';

@Serializable('./player.js')
export class Player {
  public x: number;
  public y: number;
  public targetX: number;

  readonly heldMaterials: Material[];  

  constructor({x, y, heldMaterials = []}: PlayerData, private standingImage: HTMLImageElement, private walkingImage: HTMLImageElement) {
    this.x = x;
    this.y = y;
    this.targetX = x;
    this.heldMaterials = heldMaterials.map(type => materials[type]);
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
    };
  }

  takeMaterial(mat: Material) {
    if(this.heldMaterials.indexOf(mat) !== -1) return;
    this.heldMaterials.push(mat);
    window.game!.save();
  }
}

interface PlayerData {
  x: number;
  y: number;
  heldMaterials: MaterialType[];
}
