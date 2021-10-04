import {debug} from './debug.js';
import { startSpeech, stopSpeech, SfxName } from "./audio.js";
import { Thing } from "./main.js";
import { getDialog } from "./progressManager.js";
import { RpgTextBox } from "./rpgTextBox.js";
import {Serializable, pluck} from './serialization.js';
import { loadImage } from './loader.js';
import { Game } from './game.js';
import { puzzleObjects } from './puzzleObject.js';
import { materials } from './material.js';

@Serializable('./npc.js')
export class Npc implements Thing {
  readonly textbox: RpgTextBox = new RpgTextBox(this.textboxDone.bind(this));
  static readonly speechParams: {[k in NpcType]: SpeechParams} = {
    "CAT": { sample: 'meow', timeBetweenSamples: 150, variance: 1.2, shift: 0.8 },
    "GHOST": { sample: 'mahp', timeBetweenSamples: 150, variance: 1.2, shift: 0.8 },
    "RUTABAGA": { sample: 'mahp', timeBetweenSamples: 150, variance: 1.2, shift: 0.8 }, // todo give him a voice
  };
  static readonly textBoxImages: {[k in NpcType]: string} = {
    "CAT": './sprites/av_cat.png',
    "GHOST": './sprites/av_ghost.png',
    "RUTABAGA": './sprites/av_rutabaga.png',
  };
  static readonly worldImages: {[k in NpcType]: string} = {
    "CAT": './sprites/cat.png',
    "GHOST": './sprites/Ghost.png',
    "RUTABAGA": './sprites/Rutabaga_.png',
  };
  static loading = false
  constructor(readonly x: number, readonly y: number, readonly z: number, readonly width: number, readonly height: number, readonly npcType: NpcType, readonly image: HTMLImageElement) {
    this.textbox.visible = false;
    this.textbox.imageSrc = Npc.textBoxImages[npcType];
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.drawImage(this.image, this.x, this.y)
    if(!debug) return;
    ctx.fillStyle = 'purple';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  tick(dt: number): void {
    this.textbox.tick(dt);
  }

  stopDrawingDOM() {
    this.textbox.visible = false;
    this.textboxDone();
  }

  doClick(x: number, y: number): boolean {
    if (!this.isUnderPointer(x, y)) return false;
    const game = (window as any).game as Game;
    if(game.room?.player?.hasPuzzleObject(puzzleObjects['rutabaga-no-more-potion'])) {
      game.win();
    }
    if(this.npcType === 'GHOST') {
      game.room?.player?.takeMaterial(materials['ghost-tears'])
    }
    this.speak(getDialog(this.npcType));
    return true;
  }

  speak(message: string) {
    this.textbox.visible = true;
    this.textbox.textContent = message;
    
    stopSpeech();
    const { sample, timeBetweenSamples, variance, shift } = Npc.speechParams[this.npcType];
    startSpeech(sample, timeBetweenSamples, variance, shift);
  }
  
  isUnderPointer(x: number, y: number): boolean {
    if(x < this.x || x > this.x + this.width) return false;
    if(y < this.y || y > this.y + this.height) return false;
    return true;
  }

  textboxDone() {
    stopSpeech();
  }

  static async deserialize({x, y, z, width, height, type}: NpcData) {
    const image = await loadImage(Npc.worldImages[type]);
    return new Npc(x, y, z ?? 0, width, height, type, image);
  }

  serialize(): NpcData {
    return {
      ...pluck(this, 'x', 'y', 'z', 'width', 'height'),
      type: this.npcType,
    };
  }
}

interface NpcData {
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  type: NpcType;
}

interface SpeechParams {
  sample: SfxName,
  timeBetweenSamples: number,
  variance: number,
  shift: number
}

export type NpcType = "CAT" | "GHOST" | "RUTABAGA";
