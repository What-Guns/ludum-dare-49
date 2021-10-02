import {pointer} from './input.js';

export class Player {
  private targetX;

  constructor(public x: number, public y: number) {
    this.targetX = x;
  }

  tick(dt: number) {
    if(pointer.active) this.targetX = pointer.x;
    const maxMovement = 500 * dt;
    if(this.x > this.targetX) {
      this.x = Math.max(this.x - maxMovement, this.targetX);
    } else if(this.x < this.targetX) {
      this.x = Math.min(this.x + maxMovement, this.targetX);
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    const width = 32;
    const height = 48;
    ctx.fillRect(this.x - width/2, this.y - height, width, height);
  }
}

