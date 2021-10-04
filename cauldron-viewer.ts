import {Cauldron, BrewingMaterial} from './cauldron.js';
import {Thing} from './main.js';

export class CauldronViewer implements Thing {
  readonly x: number;
  readonly y: number;
  readonly z = 2;
  private rotation = 0;

  constructor(private readonly cauldron: Cauldron) {
    this.x = cauldron.x;
    this.y = cauldron.y;
  }

  tick(dt: number) {
    this.rotation -= dt;
    this.rotation = this.rotation % (2 * Math.PI);
  }

  draw(ctx: CanvasRenderingContext2D) {
    for(let i = 0; i < this.cauldron.brewing.length; i++) {
      const dir = 2 * Math.PI * (i/this.cauldron.brewing.length) + this.rotation;
      const x = Math.cos(dir) * this.cauldron.width / 3 + this.x;
      const y = Math.sin(dir) * this.cauldron.width / 6 + this.y - this.cauldron.height/2 - 50;
      this.drawBrewingItem(ctx, this.cauldron.brewing[i], x, y);
    }
  }

  private drawBrewingItem(ctx: CanvasRenderingContext2D, {material, timeSpentInCauldron}: BrewingMaterial, x: number, y: number) {
    const radius = 44;
    ctx.textAlign = 'center';
    ctx.font = '20px sans-serif';

    // Here's my reasoning: all items should fill their rings at the same rate.
    // If an item has a CRAZY brew time, we don't want all of the wedges to be too small, so clamp that to some arbitrary number.
    const ringTime = Math.max(...this.cauldron.brewing.map(b => Math.min(b.material.expireTime, 30)));
    const brewTimePercentOfRingTime = material.brewTime / ringTime;
    const expireTimePercentOfRingTime = Math.min(1, material.expireTime / ringTime);

    // draw background
    // draw "brewed" region
    const fillColor = timeSpentInCauldron > material.expireTime
      ? 'red'
      : timeSpentInCauldron >= material.brewTime
        ? 'green'
        : 'black';

    ctx.fillStyle = fillColor;
    ctx.beginPath();
    ctx.arc(x, y, radius + 2, 0, 2 * Math.PI, false);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
    ctx.fill();

    const UP = -Math.PI / 2;
    const tau = 2 * Math.PI;

    // draw "good" region
    ctx.fillStyle = 'green';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, radius, UP + tau * brewTimePercentOfRingTime, UP + tau * expireTimePercentOfRingTime, false);
    ctx.lineTo(x, y);
    ctx.fill();

    // draw meter
    const percent = timeSpentInCauldron / ringTime;
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'black';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + radius * Math.sin(percent * tau), y - radius * Math.cos(percent * tau));
    ctx.stroke();

    ctx.drawImage(material.inventoryImage!, x - 20, y - 20, 40, 40);
  }

}
