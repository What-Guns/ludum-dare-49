import {CauldronViewer} from './cauldron-viewer.js';
import {Material, MaterialType, getMaterialType, materials} from './material.js';
import {Room} from './room.js';
import {Serializable} from './serialization.js';
import {Thing} from './main.js';
import {debug} from './debug.js';
import {toast} from './toast.js';
import { potion } from './potions.js';


@Serializable('./cauldron.js')
export class Cauldron implements Thing {
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  readonly brewing: BrewingMaterial[];
  readonly ITEM_CAPACITY = 5;
  room?: Room;
  private viewer?: CauldronViewer;

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
    for(const item of this.brewing) {
      item.timeSpentInCauldron += dt;
    }
    // gross hack: room isn't set in the constructor, so create the cauldron viewer later
    if(this.room && !this.viewer) {
      this.viewer = new CauldronViewer(this);
      this.room.adoptThing(this.viewer);
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
      const ingredients = this.brewing.map(bm => getMaterialType(bm.material)).sort();
      const createdPotion = Object.values(potion).find(p => p.recipe?.sort().every((ing, index) => ing === ingredients[index]));
      if (createdPotion) {
        console.log('You made a ' + createdPotion.name);
      } else {
        console.log('You made something dubious')
      }
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

export interface BrewingMaterial {
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
