import {loadImage} from './loader.js';

const PLACEHOLDER_IMAGE_URL = "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/285/large-blue-square_1f7e6.png";

/** A thing that goes in your pocket, or in a cauldron. Cannot exist in the world. */
export interface Material {
  name: string;
  effect: Effect;
  description: string;
  inventoryImageUrl: string;
  worldImageUrl?: string;
  inventoryImage?: HTMLImageElement;
  worldImage?: HTMLImageElement;
  brewTime: number;
  expireTime: number;
  plural: boolean;
  uselessInPotions?: boolean;
}

export type Effect = 
  'transmuted'|
  'bigger'|
  'cold'|
  'corporeal'|
  'enduring'|
  'energetic'|
  'ephemeral'|
  'heavy'|
  'hot'|
  'hovering'|
  'incorporeal'|
  'loud'|
  'metallic'|
  'quiet'|
  'relaxed'|
  'reversed'|
  'smaller'|
  'strong'|
  'weak'|
  'wooden'|
  'identity';

export const materials: {[key: string]: Material} = {
  'mouse-whisker': {
    name: 'Mouse Whisker',
    description: 'Mice grow these on their faces, they help the mice to know whether holes are big enough for them to squeeze through! This whisker fell off of a mouse, I didn’t have to pluck it out (that would be cruel).',
    effect: 'smaller',
    brewTime: 2,
    expireTime: 4,
    inventoryImageUrl: './sprites/mouse-whisker-inventory.png',
    worldImageUrl: './sprites/mouse-whisker.png',
    plural: false,
  },
  'morning-dew': {
    name: 'Morning Dew',
    description: 'Overnight, water condenses on grass and leaves. Early in the morning, you can feel this water, but it will evaporate before long!',
    effect: 'ephemeral',
    brewTime: 1,
    expireTime: 2.5,
    inventoryImageUrl: './sprites/morning-dew-inventory.png',
    worldImageUrl: './sprites/Morning_Dew.png',
    plural: false,
  },
  'coin': {
    name: 'Coins',
    description: 'Coins are an old form of currency, and a coin was worth the amount of metal used to make it. These coins are hard, tough, and shiny!',
    effect: 'metallic',
    inventoryImageUrl: './sprites/coins-inventory.png',
    worldImageUrl: './sprites/coins.png',
    brewTime: 10,
    expireTime: Infinity,
    plural: true,
  },
  'firewood': {
    name: 'Firewood',
    description: 'The best wood for making a fire is dry dead wood! Firewood is lightweight, rigid, and relatively flammable compared to live wood, or wood that’s been rained on.',
    effect: 'wooden',
    brewTime: 5,
    expireTime: 10,
    inventoryImageUrl: './sprites/firewood-inventory.png',
    worldImageUrl: './sprites/invisible.png',
    plural: false,
  },
  'anti-dote': {
    name: 'Anti-dote',
    description: 'emit emas eht ta thgil dna yvaeh sleef ti ,tnaillirb dna elap skool ti ,gnibmun dna ycips sllems ffuts sihT',
    effect: 'reversed',
    brewTime: 5,
    expireTime: 7,
    inventoryImageUrl: './sprites/anti-dote-inventory.png',
    worldImageUrl: './sprites/anti-dote.png',
    plural: false
  },
  'hushroom': {
    name: 'Hushroom',
    description: 'This little mushroom will wilt if exposed to loud sounds. Chill times and good vibes are this mushroom’s specialty!',
    effect: 'relaxed',
    brewTime: 1,
    expireTime: 2.5,
    inventoryImageUrl: './sprites/hushroom-inventory.png',
    worldImageUrl: './sprites/hushroom.png',
    plural: false,
  },
  'metal-hushroom': {
    name: 'Metal Hushroom',
    description: 'The hushroom looks a lot sturdier now! Heavy, too! But it’s not useful in potions like this.',
    effect: 'relaxed',
    brewTime: 0.000001,
    expireTime: 0.000001,
    inventoryImageUrl: './sprites/metal-hushroom-inventory.png',
    worldImageUrl: './sprites/metal-hushroom.png',
    plural: false,
    uselessInPotions: true,
  },
  'permanently-metal-hushroom': {
    name: 'Metal Hushroom ',
    description: 'The hushroom looks a lot sturdier now! Heavy, too! But it’s not useful in potions like this.',
    effect: 'relaxed',
    brewTime: 0.000001,
    expireTime: 0.000001,
    inventoryImageUrl: './sprites/metal-hushroom-inventory.png',
    worldImageUrl: './sprites/metal-hushroom.png',
    plural: false,
    uselessInPotions: true,
  },
  'wooden-hushroom': {
    name: 'Wooden Hushroom',
    description: 'The hushroom looks a lot sturdier now! But it’s not useful in potions like this.',
    effect: 'relaxed',
    brewTime: 0.000001,
    expireTime: 0.000001,
    inventoryImageUrl: './sprites/wooden-hushroom-inventory.png',
    worldImageUrl: './sprites/wooden-hushroom.png',
    plural: false,
    uselessInPotions: true,
  },
  'permanently-wooden-hushroom': {
    name: 'Wooden Hushroom ',
    description: 'The hushroom looks a lot sturdier now! But it’s not useful in potions like this.',
    effect: 'relaxed',
    brewTime: 0.000001,
    expireTime: 0.000001,
    inventoryImageUrl: './sprites/wooden-hushroom-inventory.png',
    worldImageUrl: './sprites/wooden-hushroom.png',
    plural: false,
    uselessInPotions: true,
  },
  'ghost-tears': {
    name: 'Ghost Tears',
    description: 'Just like humans, ghosts get sad sometimes too. You should never make a ghost cry, but if you do, their tears can be collected!',
    effect: 'incorporeal',
    brewTime: .25,
    expireTime: .75,
    inventoryImageUrl: './sprites/ghost-tears-inventory.png',
    plural: true,
  },
  'transmuters-draught': {
    name: 'Transmuter’s Draught',
    description: 'Transmutation is the magical art of turning one object or substance into another. Alchemists use this substance to aid them in their art!',
    effect: 'transmuted',
    brewTime: 3,
    expireTime: 6,
    inventoryImageUrl: './sprites/transmuters-draught-inventory.png',
    worldImageUrl: './sprites/transmuters-draught.png',
    plural: false,
  },
  'doused-phoenix-feather': {
    name: 'Doused Phoenix Feather',
    description: 'A feather than has fallen up from the ashes',
    effect: 'hovering',
    brewTime: .5,
    expireTime: 1,
    inventoryImageUrl: './sprites/doused-phoenix-feather-inventory.png',
    worldImageUrl: './sprites/doused-phoenix-feather.png',
    plural: false,
  },
  'gravity-stone-piece': {
    name: 'Gravity Stone Piece',
    effect: 'heavy',
    description: 'After floating up the flue the Enduring Potion of Fiery Flight wore off the Gravity Stone sending it crashing on the ground, breaking it to pieces. The pieces are still really heavy and so you need to time to recover picking each one up.',
    inventoryImageUrl: './sprites/Broken_Gravity_Stone.png',
    worldImageUrl: './sprites/Broken_Gravity_Stone.png',
    brewTime: 10,
    expireTime: 15,
    plural: false
  }
};

export async function preloadMaterialImages() {
  await Promise.all(Object.values(materials).map(loadMaterial));
}

async function loadMaterial(material: Material) {
  material.inventoryImage = await loadImage(material.inventoryImageUrl ?? PLACEHOLDER_IMAGE_URL);
  material.worldImage = await loadImage(material.worldImageUrl ?? PLACEHOLDER_IMAGE_URL);
}

export const oppositeEffects: {[key in Effect]: Effect} = {
  'transmuted': 'transmuted',
  'corporeal': 'incorporeal',
  'hot': 'cold',
  'incorporeal': 'corporeal',
  'identity': 'reversed',
  'reversed': 'identity',
  'hovering': 'heavy',
  'cold': 'hot',
  'bigger': 'smaller',
  'smaller': 'bigger',
  'quiet': 'loud',
  'wooden': 'metallic',
  'metallic': 'wooden',
  'heavy': 'hovering',
  'loud': 'quiet',
  'relaxed': 'energetic',
  'energetic': 'relaxed',
  'strong': 'weak',
  'weak': 'strong',
  'ephemeral': 'enduring',
  'enduring': 'ephemeral'
};

export function getMaterialType(material: Material) {
  const entry = Object.entries(materials).find(([_, mat]) => mat === material);
  if(!entry) {
    throw new Error(`Material not found.`);
  }
  return entry![0];
}

export type MaterialType = keyof typeof materials;

