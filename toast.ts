import { Game } from "./game.js";
import { pointer } from "./input.js";

export function toast(message: string) {
  const toastY = Math.min(pointer.y, window.innerHeight - 100);
  ((window as any).game as Game).toast = new Toast(message, 2, pointer.x, toastY);
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
    ctx.lineWidth = 2;
    ctx.fillStyle = 'white';
    ctx.font = "48px 'Yusei Magic'";
    ctx.textAlign = 'center';
    const centerX = ctx.canvas.width / 2;
    ctx.fillText(this.message, centerX, this.y - offset);
    ctx.strokeText(this.message, centerX, this.y - offset);
    ctx.globalAlpha = oldAlpha;
  }
}
