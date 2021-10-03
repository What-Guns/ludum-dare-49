import {loadImage} from './loader.js';
import { MaterialType } from './material.js';

/** A thing that goes in your pocket and applied to puzzle object, player, and possibly an NPC. Cannot exist in the world. */
export interface Potion {
  name: string;
  recipe: MaterialType[]
  inventoryImageUrl?: string;
  inventoryImage?: HTMLImageElement;
}

export const potion: {[key: string]: Potion} = {
  'ensmallening': {
    name: 'Potion of Ensmallening',
    recipe: ['mouse-whisker']
  },
  'embiggening': {
    name: 'Potion of Embiggening',
    recipe: ['mouse-whisker', 'anti-dote']
  },
  'temp-transmutation-metal': {
    name: 'Temporary Potion of Metal Transmutation',
    recipe:  ['transmuters-draught', 'coin', 'morning-dew']
  },
  'temp-transmutation-wood': {
    name: 'Temporary Potion of Wood Transmutation',
    recipe: ['transmuters-draught', 'firewood', 'morning-dew']
  },
  'energy': {
    name: 'Potion of Energy',
    recipe: ['hushroom', 'anti-dote'],
    inventoryImageUrl: 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/298/coin_1fa99.png',
  },
  'phoenix-feather': {
    name: 'Phoenix Feather Potion',
    recipe: ['feather','gunpowder','fire-salts']
  },
  'ghostly': {
    name: 'Ghostly Potion',
    recipe: ['anti-dote','ghost-tears','morning-dew']
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


