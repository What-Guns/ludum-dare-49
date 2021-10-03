import {loadImage} from './loader.js';
import { MaterialType } from './material.js';
import {PuzzleObjectType} from './puzzleObject.js'

/** A thing that goes in your pocket and applied to puzzle object, player, and possibly an NPC. Cannot exist in the world. */
export interface Potion {
  name: string;
  recipe?: MaterialType[]
  color: string;
  applyTo?: PuzzleObjectType,
  inventoryImageUrl?: string;
  inventoryImage?: HTMLImageElement;
}

export const potion: {[key: string]: Potion} = {
  'ensmallening': {
    name: 'Potion of Ensmallening',
    recipe: ['mouse-whisker'],
    color: '#4e79de',
    applyTo: 'key',
  },
  'embiggening': {
    name: 'Potion of Embiggening',
    recipe: ['mouse-whisker', 'anti-dote'],
    color: '#ff7417',
    applyTo: 'key'
  },
  'temp-transmutation-metal': {
    name: 'Temporary Potion of Metal Transmutation',
    recipe:  ['transmuters-draught', 'coin', 'morning-dew'],
    color: '#ada168'
  },
  'temp-transmutation-wood': {
    name: 'Temporary Potion of Wood Transmutation',
    recipe: ['transmuters-draught', 'firewood', 'morning-dew'],
    color: '#785a26'
  },
  'energy': {
    name: 'Potion of Energy',
    recipe: ['hushroom', 'anti-dote'],
    color: '#080fcc',
    inventoryImageUrl: 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/298/coin_1fa99.png',
  },
  'fiery-flight': {
    name: 'Enduring Potion of Fiery Flight',
    recipe: ['doused-phoenix-feather','morning-dew','anti-dote'],
    color: '#ff0000'
  },
  'ghostly': {
    name: 'Ghostly Potion',
    recipe: ['gravity-stone-piece', 'anti-dote','ghost-tears','morning-dew'],
    color: '#a6339c'
  },
  'unstable': {
    name: 'Unstable Potion',
    color: '#1be339'
  }
};

export async function preloadPotionImages() {
  await Promise.all(Object.values(potion).map(loadPotion));
}

async function loadPotion(potion: Potion) {
  if(potion.inventoryImageUrl) {
    potion.inventoryImage = await loadImage(potion.inventoryImageUrl);
  }
}


export function getMaterialType(potion: Potion) {
  const entry = Object.entries(potion).find(([_, pot]) => pot === potion);
  if(!entry) {
    throw new Error(`Material not found.`);
  }
  return entry![0];
}

export type PotionType = keyof typeof potion;


