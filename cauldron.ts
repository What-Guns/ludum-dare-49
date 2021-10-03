import {Thing} from './main.js';
import {Serializable} from './serialization.js';
import {Material, MaterialType, getMaterialType, materials} from './material.js';
import {toast} from './toast.js';
import {debug} from './debug.js';


@Serializable('./cauldron.js')
export class Cauldron implements Thing {
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  readonly brewing: BrewingMaterial[];
  readonly ITEM_CAPACITY = 5;
  private rotation = 0;

  constructor(data: CauldronData) {
    this.x = data.x;
    this.y = data.y;
    this.z = data.z ?? -1;
    this.height = data.height;
    this.width = data.width;
    this.brewing = (data.brewing ?? []).map(({materialType, timeSpentInCauldron}) => ({
      material: materials[materialType],
      timeSpentInCauldron, 
    }));
  }

  tick(dt: number) {
    this.rotation -= dt;
    this.rotation = this.rotation % (2 * Math.PI);
    for(const item of this.brewing) {
      item.timeSpentInCauldron += dt;
    }
  }

  static async deserialize(data: CauldronData) {
    return new Cauldron(data);
  }

  doClick(x: number, y: number) {
    if(!this.isUnderPointer(x, y)) return false;
    if(!this.brewing.length) return false;
    const isSuccessful = this.brewing.every(({timeSpentInCauldron, material}) => 
      timeSpentInCauldron < material.expireTime && timeSpentInCauldron > material.brewTime);
    if(isSuccessful) {
      toast('hooray');
    } else {
      toast('oh no');
    }
    // TODO: actually produce a potion
    this.brewing.length = 0;
    return true;
  }

  serialize(): CauldronData {
    return {
      x: this.x,
      y: this.y,
      z: this.z,
      width: this.width,
      height: this.height,
      brewing: this.brewing.map(({material, timeSpentInCauldron}) => ({
        materialType: getMaterialType(material),
        timeSpentInCauldron
      })),
    };
  }

  draw(ctx: CanvasRenderingContext2D) {
    if(debug) {
      ctx.fillStyle = 'black';
      ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
    }

    for(let i = 0; i < this.brewing.length; i++) {
      const dir = 2 * Math.PI * (i/this.ITEM_CAPACITY) + this.rotation;
      const x = Math.cos(dir) * this.width / 3 + this.x;
      const y = Math.sin(dir) * this.width / 6 + this.y - this.height/2 - 50;
      this.drawBrewingItem(ctx, this.brewing[i], x, y);
    }
  }

  private drawBrewingItem(ctx: CanvasRenderingContext2D, {material, timeSpentInCauldron}: BrewingMaterial, x: number, y: number) {
    const radius = 44;
    ctx.textAlign = 'center';
    ctx.font = '20px sans-serif';

    // Here's my reasoning: all items should fill their rings at the same rate.
    // If an item has a CRAZY brew time, we don't want all of the wedges to be too small, so clamp that to some arbitrary number.
    const ringTime = Math.max(...this.brewing.map(b => Math.min(b.material.expireTime, 30)));
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

  debugResize(evt: WheelEvent) {
    this.width += evt.deltaX / 50;
    this.height -= evt.deltaY / 50;
  }

  isUnderPointer(x: number, y: number) {
    return Math.abs(x - this.x) < this.width / 2  && Math.abs(y - this.y) < this.height / 2;
  }

  putItem(material: Material): boolean {
    if (this.brewing.length >= this.ITEM_CAPACITY) {
      this.denyItem();
      return false;
    }
    this.brewing.push(({material, timeSpentInCauldron: 0}));
    return true;
  }

  denyItem(){
    toast("I'm a cauldron not a storage unit!")
  }
}

interface BrewingMaterial {
  material: Material;
  timeSpentInCauldron: number;
}

interface CauldronData {
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  brewing?: BrewingMaterialData[];
}

interface BrewingMaterialData {
  materialType: MaterialType;
  timeSpentInCauldron: number;
}
