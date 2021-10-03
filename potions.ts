import {loadImage} from './loader.js';
import { MaterialType } from './material.js';
import {PuzzleObjectType} from './puzzleObject.js'

/** A thing that goes in your pocket and applied to puzzle object, material, or player. Cannot exist in the world. */
export interface Potion {
  name: string;
  recipe?: MaterialType[]
  color: string;
  applyTo?: PuzzleObjectType | MaterialType,
  inventoryImageUrl: string;
  inventoryImage?: HTMLImageElement;
  turnsInto?: PuzzleObjectType | MaterialType;
}

const PLACEHOLDER_IMAGE_URL = "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/285/large-blue-square_1f7e6.png";

export const potions: {[key: string]: Potion} = {
  'ensmallening': {
    name: 'Potion of Ensmallening',
    recipe: ['mouse-whisker'],
    color: '#4e79de',
    applyTo: 'key',
    turnsInto: 'small-key',
    inventoryImageUrl: PLACEHOLDER_IMAGE_URL,
  },
  'embiggening': {
    name: 'Potion of Embiggening',
    recipe: ['mouse-whisker', 'anti-dote'],
    color: '#ff7417',
    applyTo: 'key',
    turnsInto: 'big-key',
    inventoryImageUrl: PLACEHOLDER_IMAGE_URL,
  },
  'temp-transmutation-metal': {
    name: 'Temporary Potion of Metal Transmutation',
    recipe:  ['transmuters-draught', 'coin', 'morning-dew'],
    color: '#ada168',
    applyTo: 'hushroom',
    turnsInto: 'metal-hushroom',
    inventoryImageUrl: PLACEHOLDER_IMAGE_URL,
  },
  'temp-transmutation-wood': {
    name: 'Temporary Potion of Wood Transmutation',
    recipe: ['transmuters-draught', 'firewood', 'morning-dew'],
    color: '#785a26',
    applyTo: 'hushroom',
    turnsInto: 'wooden-hushroom',
    inventoryImageUrl: PLACEHOLDER_IMAGE_URL,
  },
  'energy': {
    name: 'Potion of Energy',
    recipe: ['hushroom', 'anti-dote'],
    color: '#080fcc',
    inventoryImageUrl: 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/298/coin_1fa99.png',
    applyTo: 'broken-radio',
    turnsInto: 'fixed-radio',
  },
  'fiery-flight': {
    name: 'Enduring Potion of Fiery Flight',
    recipe: ['doused-phoenix-feather','morning-dew','anti-dote'],
    color: '#ff0000',
    applyTo: 'hot-gravity-stone',
    inventoryImageUrl: PLACEHOLDER_IMAGE_URL,
  },
  'ghostly': {
    name: 'Ghostly Potion',
    recipe: ['gravity-stone-piece', 'anti-dote','ghost-tears','morning-dew'],
    color: '#a6339c',
    //applyTo: You look in a mirror and question... Am I a Player? Am I just a Thing? 
    //         Or I am the final puzzele object waiting to be solved....
    inventoryImageUrl: PLACEHOLDER_IMAGE_URL,
  },
  'unstable': {
    name: 'Unstable Potion',
    color: '#1be339',
    inventoryImageUrl: PLACEHOLDER_IMAGE_URL,
  }
};

export async function preloadPotionImages() {
  await Promise.all(Object.values(potions).map(loadPotion));
}

async function loadPotion(potion: Potion) {
  if(potion.inventoryImageUrl) {
    potion.inventoryImage = await loadImage(potion.inventoryImageUrl);
  }
}


export function getPotionType(potion: Potion) {
  const entry = Object.entries(potions).find(([_, pot]) => pot === potion);
  if(!entry) {
    throw new Error(`Potion ${potion.name} not found.`);
  }
  return entry![0];
}

export type PotionType = keyof typeof potions;
