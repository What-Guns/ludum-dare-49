/** A thing that goes in your pocket, or in a cauldron. Cannot exist in the world. */
export interface Material {
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
    description: 'Mice grow these on their faces, they help the mice to know whether holes are big enough for them to squeeze through! This whisker fell off of a mouse, I didn’t have to pluck it out (that would be cruel).',
    effect: 'smaller',
  },
  'gunpowder': {
    name: 'Gunpowder',
    description: 'Mixing sulfur, saltpeter, and charcoal makes an explosive powder! Please be careful with this stuff, there’s a great deal of power stored here.',
    effect: 'strong'
  },
  'morning-dew': {
    name: 'Morning Dew',
    description: 'Overnight, water condenses on grass and leaves. Early in the morning, you can feel this water, but it will evaporate before long!',
    effect: 'ephemeral',
  },
  'coin': {
    name: 'Coins',
    description: 'Coins are an old form of currency, and a coin was worth the amount of metal used to make it. These coins are hard, tough, and shiny!',
    effect: 'metallic',
    inventoryImageUrl: 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/298/coin_1fa99.png',
    worldImageUrl: 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/298/coin_1fa99.png',
  },
  'firewood': {
    name: 'Firewood',
    description: 'The best wood for making a fire is dry dead wood! Firewood is lightweight, rigid, and relatively flammable compared to live wood, or wood that’s been rained on.',
    effect: 'wooden',
  },
  'anti-dote': {
    name: 'Anti-dote',
    description: 'emit emas eht ta thgil dna yvaeh sleef ti ,tnaillirb dna elap skool ti ,gnibmun dna ycips sllems ffuts sihT',
    effect: 'reversed'
  },
  'hushroom': {
    name: 'Hushroom',
    description: 'This little mushroom will wilt if exposed to bright lights or loud sounds. Chill times and good vibes are this mushroom’s specialty!',
    effect: 'relaxed',
  },
  'ghost-tears': {
    name: 'Ghost Tears',
    description: 'Just like humans, ghosts get sad sometimes too. You should never make a ghost cry, but if you do, their tears can be collected!',
    effect: 'incorporeal',
  },
  'gravity-stone': {
    name: 'Gravity Stone',
    description: 'This rock is made out of some very heavy minerals and metals! It’s also really slippery, and it feels like it might fall from your grasp. Watch your toes!',
    effect: 'heavy'
  },
  'transmuters-draught': {
    name: 'Transmuter’s Draught',
    description: 'Transmutation is the magical art of turning one object or substance into another. Alchemists use this substance to aid them in their art!',
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
