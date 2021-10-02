import {pointer} from './input.js';

export class Player {
  private targetX;

  constructor(public x: number, public y: number) {
    this.targetX = x;
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
}

