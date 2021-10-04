import {debug} from './debug.js';
import { startSpeech, stopSpeech, SfxName } from "./audio.js";
import { Thing } from "./main.js";
import { getDialog } from "./progressManager.js";
import { RpgTextBox } from "./rpgTextBox.js";
import {Serializable, pluck} from './serialization.js';

@Serializable('./npc.js')
export class Npc implements Thing {
  readonly textbox: RpgTextBox = new RpgTextBox(this.textboxDone.bind(this));
  static readonly speechParams: {[k in NpcType]: SpeechParams} = {
    "CAT": { sample: 'meow', timeBetweenSamples: 150, variance: 1.2, shift: 0.8 },
    "GHOST": { sample: 'mahp', timeBetweenSamples: 150, variance: 1.2, shift: 0.8 },
  };
  static readonly textBoxImages: {[k in NpcType]: string} = {
    "CAT": 'https://static.tvtropes.org/pmwiki/pub/images/achewood_789.jpg',
    "GHOST": 'https://static.wikia.nocookie.net/vsbattles/images/f/f6/6d0c7f35a66688f309ceedf4e94013dc.png',
  }
  constructor(readonly x: number, readonly y: number, readonly z: number, readonly width: number, readonly height: number, readonly npcType: NpcType) {
    this.textbox.visible = false;
    this.textbox.imageSrc = Npc.textBoxImages[npcType];
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if(!debug) return;
    ctx.fillStyle = 'purple';
    ctx.fillRect(this.x, this.y, 100, 100);
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
    this.textbox.visible = true;
    this.textbox.textContent = getDialog(this.npcType);
    
    stopSpeech();
    const { sample, timeBetweenSamples, variance, shift } = Npc.speechParams[this.npcType];
    startSpeech(sample, timeBetweenSamples, variance, shift);
    return true;
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
    return new Npc(x, y, z ?? 0, width, height, type);
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

export type NpcType = "CAT" | "GHOST";
