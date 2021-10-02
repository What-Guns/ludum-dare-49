/** A thing that goes in your pocket, or in a cauldron. Cannot exist in the world. */
interface Material {
  name: string;
  effect: Effect;
  description: string;
  inventoryImageUrl?: string;
  worldImageUrl?: string;
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
    description: 'the whisker from a mouse',
    effect: 'smaller',
  },
  'gunpowder': {
    name: 'Gunpowder',
    description: 'stuff that explodes',
    effect: 'strong'
  },
  'morning-dew': {
    name: 'Morning Dew',
    description: 'wet, found on the ground',
    effect: 'ephemeral',
  },
  'coin': {
    name: 'Coins',
    description: 'smol CA$H MONEY',
    effect: 'metallic',
    inventoryImageUrl: 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/298/coin_1fa99.png',
    worldImageUrl: 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/298/coin_1fa99.png',
  },
  'firewrood': {
    name: 'Firewood',
    description: 'combustable dead trees',
    effect: 'wooden',
  },
  'anti-dote': {
    name: 'Anti-dote',
    description: '?????',
    effect: 'reversed'
  },
  'hushroom': {
    name: 'Hushroom',
    description: 'mushroom that is quieter than the average mushroom',
    effect: 'relaxed',
  },
  'ghost-tears': {
    name: 'Ghost Tears',
    description: 'tears of a ghost? or tears that have perished?',
    effect: 'incorporeal',
  },
  'gravity-stone': {
    name: 'Gravity Stone',
    description: 'a very heavy rock',
    effect: 'heavy'
  },
  'transmuters-draught': {
    name: 'Transmuter’s Draught',
    description: 'Miki please tell me what this is',
    effect: 'transmuted',
  }
};

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

export type MaterialType = keyof typeof materials;
