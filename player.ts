import {pointer} from './input.js';
import {Serializable} from './serialization.js';

@Serializable('./player.js')
export class Player {
  public x: number;
  public y: number;

  private targetX;

  constructor({x, y}: PlayerData) {
    this.targetX = x;
    this.x = x;
    this.y = y;
  }

  static deserialize(playerData: PlayerData) {
    return Promise.resolve(new Player(playerData));
  }

  tick(dt: number) {
    const maxMovement = 500 * dt;
    if(this.x > this.targetX) {
      this.x = Math.max(this.x - maxMovement, this.targetX);
    } else if(this.x < this.targetX) {
      this.x = Math.min(this.x + maxMovement, this.targetX);
    }
  }

  moveToCursor() {
    if(pointer.active) this.targetX = pointer.x;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const width = 32;
    const height = 48;
    ctx.fillStyle = 'black';
    ctx.fillRect(this.x - width/2, this.y - height, width, height);
  }

  serialize(): PlayerData {
    return {
      x: this.x,
      y: this.y,
    };
  }
}

interface PlayerData {
  x: number;
  y: number;
}
