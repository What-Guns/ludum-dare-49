export class Player {
  constructor(public x: number, public y: number) {}

  draw(ctx: CanvasRenderingContext2D) {
    const width = 32;
    const height = 48;
    ctx.fillRect(this.x - width/2, this.y - height, width, height);
  }
}

