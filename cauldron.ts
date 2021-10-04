import {CauldronViewer} from './cauldron-viewer.js';
import {Material, MaterialType, getMaterialType, materials} from './material.js';
import {Room} from './room.js';
import {Serializable} from './serialization.js';
import {Thing} from './main.js';
import {debug} from './debug.js';
import {toast} from './toast.js';
import {Npc} from './npc.js';
import { potions, getPotionType } from './potions.js';


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
    if(!this.brewing.length) {
      toast(`There’s nothing in here.`);
      return true
    }
    if(!this.room?.player) {
      alert('but who was potion?');
      return false;
    }
    const failureReason = this.brewing.map(({timeSpentInCauldron, material}) => {
      if(material.uselessInPotions) {
        return [
          material.plural ? 'Those' : 'That',
          material.name,
          'can’t be used in potions in that state.',
        ].join(' ');
      }
      if(timeSpentInCauldron > material.expireTime) {
        return [
          material.plural ? 'Those' : 'That',
          material.name,
          'was in the cauldron for too long.'
        ].join(' ');
      } else if(timeSpentInCauldron < material.brewTime) {
        return [
          material.plural ? 'Those' : 'That',
          material.name,
          'needed more time in the cauldron.'
        ].join(' ');
      }
      return null;
    }).reduce((x, y) => x ?? y);
    if(failureReason) {
      this.announceFailure(failureReason);
      this.room.player.takePotion('unstable')
    } else {
      const ingredients = this.brewing.map(bm => getMaterialType(bm.material)).sort();
      const createdPotion = Object.values(potions).find(p => p.recipe?.sort().every((ing, index) => ing === ingredients[index]));
      if (createdPotion) {
        this.room.player.takePotion(getPotionType(createdPotion));
      } else {
        this.announceFailure(`That combination doesn’t make anything useful.`);
        this.room.player.takePotion('unstable')
      }
    }
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

  private announceFailure(msg: string) {
    const npcs = this.room?.getObjectsOfType(Npc) ?? [];
    if(npcs.length) {
      npcs[0].speak(msg);
    } else {
      toast(msg);
    }
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
