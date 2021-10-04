import {Thing} from './main.js';
import {Serializable, pluck} from './serialization.js';
import {loadImage} from './loader.js';
import {debug} from './debug.js';

@Serializable('./plants.js')
export class Plants implements Thing {
  x: number;
  y: number;
  z: number;
  readonly width: number;
  readonly height: number;
  t = 0;

  private readonly analyzerData: Float32Array;
  private readonly minData: Float32Array;
  private readonly maxData: Float32Array;

  constructor(private readonly images: PlantImages, {x, y, z}: PlantData) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.width = images.pot.width;
    this.height = images.pot.height;
    this.analyzerData = new Float32Array(window.game!.music.plantAnalyzer.frequencyBinCount);
    this.minData = new Float32Array(this.analyzerData.length);
    this.maxData = new Float32Array(this.analyzerData.length);
  }

  draw(ctx: CanvasRenderingContext2D) {
    window.game!.music.plantAnalyzer.getFloatFrequencyData(this.analyzerData);
    for(let i = 0; i < this.analyzerData.length; i++) {
      let value = Math.abs(this.analyzerData[i]);
      if(value === Infinity) value = 0;
      this.minData[i] = Math.min(this.minData[i], value);
      this.maxData[i] = Math.max(this.maxData[i], value);
    }

    ctx.drawImage(this.images.pot, this.x - this.width / 2, this.y - this.height / 2);
    for(const [key, offset] of Object.entries(plantOffsets)) {
      const image = (this.images as any)[key] as HTMLImageElement;
      let yscale;
      yscale = 1 + 0.2 * Math.sin(this.t * offset.timescale);
      ctx.save();
      ctx.translate(this.x + offset.x, this.y + offset.y + image.height - image.height * yscale) ;
      ctx.scale(1, yscale);
      ctx.drawImage(image, 0, 0);
      ctx.restore();
    }

    if(debug) {
      let x = 0;
      ctx.fillStyle = 'red';
      for(const bin of this.analyzerData) {
        ctx.fillRect(this.x - 300 + x, this.y - 100, 10, Math.pow(bin, 3) / 10000)
        x += 10;
      }
    }
  }

  tick(dt: number) {
    this.t += dt;
  }

  isUnderPointer(x: number, y: number) {
    if(!debug) return false;
    return Math.abs(this.x - x) < this.width/2 && Math.abs(this.y - y) < this.height/2;
  }

  static async deserialize(data: PlantData) {
    return new Plants({
      pot: await loadImage('./sprites/pots.png'),
      big: await loadImage('./sprites/bigg.png'),
      medium: await loadImage('./sprites/medium.png'),
      small: await loadImage('./sprites/small.png'),
      tiny: await loadImage('./sprites/tiny.png'),
    }, data);
  }

  serialize() {
    return pluck(this, 'x', 'y', 'z');
  }
}

interface PlantImages {
  pot: HTMLImageElement;
  big: HTMLImageElement;
  medium: HTMLImageElement;
  small: HTMLImageElement;
  tiny: HTMLImageElement;
}

interface PlantData {
  x: number;
  y: number;
  z: number;
}

const plantOffsets = {
  big: { x: 20, y: -505, binNumber: 8, timescale: 1},
  medium: { x: -230, y: -320, binNumber: 16, timescale: 8},
  small: {x: -100, y: -195, binNumber: 32, timescale: 12},
  tiny: {x: 75, y: -40, binNumber: 60, timescale: 15},
};

(window as any).plantOffsets = plantOffsets;
