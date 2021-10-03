import { Game } from "./game.js";
import { pointer } from "./input.js";

export function toast(message: string) {
  ((window as any).game as Game).toast = new Toast(message, 2, pointer.x , pointer.y);
}

(window as any).toast = toast;

export class Toast {
  readonly maxFadeTime = .4;
  private fadeTime = this.maxFadeTime;
  private fadeTransitionLength = 15;
  constructor(readonly message: string, private durationSec: number, readonly x: number, readonly y: number) {}

  tick(dt: number) {
    if (this.durationSec < 0) return;
    this.fadeTime -= dt;
    this.durationSec -= dt;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.durationSec < 0) return;
    const oldAlpha = ctx.globalAlpha;
    ctx.globalAlpha = 1 - (this.fadeTime / this.maxFadeTime);
    const offset = (1 - Math.max(this.fadeTime / this.maxFadeTime, 0)) * this.fadeTransitionLength;
    ctx.strokeStyle = 'black';
    ctx.fillStyle = 'gold';
    ctx.font = "20px 'Yusei Magic'";
    ctx.fillText(this.message, this.x, this.y - offset);
    ctx.strokeText(this.message, this.x, this.y - offset);
    ctx.globalAlpha = oldAlpha;
  }
}