import {loadImage} from './loader.js';
import { MaterialType } from './material.js';
import {PuzzleObjectType} from './puzzleObject.js'
import {SfxName} from './audio.js';
import { HSBColor } from './crap.js';

/** A thing that goes in your pocket and applied to puzzle object, material, or player. Cannot exist in the world. */
export interface Potion {
  name: string;
  description: string;
  recipe?: MaterialType[];
  color: HSBColor;
  applyTo?: PuzzleObjectType | MaterialType;
  inventoryImageUrl: string;
  inventoryImage?: HTMLImageElement;
  turnsInto?: PuzzleObjectType | MaterialType;
  sfx?: SfxName;
}

export const POTION_INVENTORY_URL = './sprites/potion.png';
export const potions: {[key: string]: Potion} = {
  'ensmallening': {
    name: 'Potion of Ensmallening',
    description: 'Apply this potion to an object to make it smaller!',
    recipe: ['mouse-whisker'],
    color: {
      hue: 222,
      saturation: 68,
      brightness: 87,
    },
    applyTo: 'key',
    turnsInto: 'small-key',
    inventoryImageUrl: POTION_INVENTORY_URL,
    sfx: 'ensmallening',
  },
  'embiggening': {
    name: 'Potion of Embiggening',
    description: 'Apply this potion to an object to make it larger!',
    recipe: ['mouse-whisker', 'anti-dote'],
    color: {
      hue: 24,
      saturation: 99,
      brightness: 100,
    },
    applyTo: 'key',
    turnsInto: 'big-key',
    inventoryImageUrl: POTION_INVENTORY_URL,
  },
  'temp-transmutation-metal': {
    name: 'Temporary Potion of Metal Transmutation',
    description: 'Apply this potion to an object to make it turn into metal, for a little while anyway!',
    recipe:  ['transmuters-draught', 'coin', 'morning-dew'],
    color: {
      hue: 49,
      saturation: 29,
      brightness: 68,
    },
    applyTo: 'hushroom',
    turnsInto: 'metal-hushroom',
    inventoryImageUrl: POTION_INVENTORY_URL,
  },
  'temp-transmutation-wood': {
    name: 'Temporary Potion of Wood Transmutation',
    description: 'Apply this potion to an object to make it turn into wood, for a little while anyway!',
    recipe: ['transmuters-draught', 'firewood', 'morning-dew'],
    color: {
      hue: 38,
      saturation: 51,
      brightness: 47,
    },
    applyTo: 'hushroom',
    turnsInto: 'wooden-hushroom',
    inventoryImageUrl: POTION_INVENTORY_URL,
  },
  'energy': {
    name: 'Potion of Energy',
    description: 'Apply this potion to an object to imbue it with lots of energy!',
    recipe: ['hushroom', 'anti-dote'],
    color: {
      hue: 237,
      saturation: 92,
      brightness: 80,
    },
    inventoryImageUrl: 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/298/coin_1fa99.png',
    applyTo: 'broken-radio',
    turnsInto: 'fixed-radio',
  },
  'fiery-flight': {
    name: 'Enduring Potion of Fiery Flight',
    description: 'Apply this potion to a scalding hot object to make it take flight!',
    recipe: ['doused-phoenix-feather','morning-dew','anti-dote'],
    color: {
      hue: 0,
      saturation: 100,
      brightness: 100,
    },
    applyTo: 'hot-gravity-stone',
    inventoryImageUrl: POTION_INVENTORY_URL,
  },
  'ghostly': {
    name: 'Ghostly Potion',
    description: 'Apply this potion to yourself and you will be able to phase right through doors!',
    recipe: ['gravity-stone-piece', 'anti-dote','ghost-tears','morning-dew'],
    color: {
      hue: 305,
      saturation: 52,
      brightness: 65,
    },
    //applyTo: You look in a mirror and question... Am I a Player? Am I just a Thing? 
    //         Or I am the final puzzele object waiting to be solved....
    inventoryImageUrl: POTION_INVENTORY_URL,
  },
  'unstable': {
    name: 'Unstable Potion',
    description: 'Whoops, this potion didn\'t come out right. You can throw it away probably.',
    color: {
      hue: 129,
      saturation: 78,
      brightness: 89,
    },
    inventoryImageUrl: POTION_INVENTORY_URL,
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
