import {Thing} from './main.js';
import {Serializable} from './serialization.js';
import {Material, MaterialType, getMaterialType, materials} from './material.js';
import {toast} from './toast.js';
import {debug} from './debug.js';


@Serializable('./cauldron.js')
export class Cauldron implements Thing {
  
  x: number;
  y: number;
  width: number;
  height: number;
  readonly brewing: BrewingMaterial[];
  readonly ITEM_CAPACITY = 5;
  private rotation = 0;

  constructor(data: CauldronData) {
    this.x = data.x;
    this.y = data.y;
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

  private drawBrewingItem(ctx: CanvasRenderingContext2D, brewing: BrewingMaterial, x: number, y: number) {
    const radius = 44;
    ctx.textAlign = 'center';
    ctx.font = '20px sans-serif';

    const goodPercent = brewing.material.brewTime / brewing.material.expireTime;

    // draw background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
    ctx.fill();

    // draw "good" region
    ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, radius, -Math.PI / 2 + 2 * Math.PI * goodPercent, Math.PI * 3/2, false);
    ctx.lineTo(x, y);
    ctx.fill();

    // draw "brewed" region
    const fillColor = brewing.timeSpentInCauldron > brewing.material.expireTime
      ? 'red'
      : brewing.timeSpentInCauldron >= brewing.material.brewTime
        ? 'green'
        : 'yellow';

    ctx.fillStyle = fillColor;
    const percent = Math.min(1, brewing.timeSpentInCauldron / brewing.material.expireTime);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * percent, false);
    ctx.lineTo(x, y);
    ctx.fill();


    ctx.drawImage(brewing.material.inventoryImage!, x - 20, y - 20, 40, 40);

    ctx.fillStyle = 'rebeccapurple';
    ctx.fillText(brewing.timeSpentInCauldron.toFixed(2), x, y);
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
  width: number;
  height: number;
  brewing?: BrewingMaterialData[];
}

interface BrewingMaterialData {
  materialType: MaterialType;
  timeSpentInCauldron: number;
}
