import {Item} from './item.js';
import {Player} from './player.js';
import {Thing} from './main.js';
import {pointer} from './input.js';

export class Room {
  things: Thing[] = [];

  private wasPointerActive = false;

  constructor() {
    this.things.push(new Item(50, 50));
  }

  tick(dt: number) {
    if(!this.wasPointerActive && pointer.active) {
      this.doClick();
    }
    this.wasPointerActive = pointer.active;
    for(const thing of this.things) {
      thing.tick?.(dt);
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    for(const thing of this.things) {
      thing.draw?.(ctx);
    }
  }

  private doClick() {
    for(const thing of this.things) {
      if(thing.doClick?.()) return;
    }
    this.things.find((t): t is Player => t instanceof Player)?.moveToCursor();
  }
}

