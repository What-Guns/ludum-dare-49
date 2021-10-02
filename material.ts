/** A thing that goes in your pocket, or in a cauldron. Cannot exist in the world. */
interface Material {
  name: string;
  effect: Effect;
  imageUrl?: string;
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
    effect: 'smaller',
  },
  'gunpowder': {
    name: 'Gunpowder',
    effect: 'strong'
  },
  'morning-dew': {
    name: 'Morning Dew',
    effect: 'ephemeral',
  },
  'coin': {
    name: 'Coins',
    effect: 'metallic'
  },
  'firewrood': {
    name: 'Firewood',
    effect: 'wooden',
  },
  'anti-dote': {
    name: 'Anti-dote',
    effect: 'reversed'
  },
  'hushroom': {
    name: 'Hushroom',
    effect: 'relaxed',
  },
  'ghost-tears': {
    name: 'Ghost Tears',
    effect: 'incorporeal',
  },
  'gravity-stone': {
    name: 'Gravity Stone',
    effect: 'heavy'
  },
  'transmuters-draught': {
    name: 'Transmuter’s Draught',
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
