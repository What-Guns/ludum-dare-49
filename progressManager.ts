import { NpcType } from "./npc.js";

export const progressData = [
  {
    name: 'initial',
    catDialog: 'Welcome to the cottage! Try, idk, picking things up.',
    ghostDialog: 'You definitely should not be in the attic yet',
    unlockedRooms: ['foyer', 'greenhouse', 'hall', 'locked']
  },
  {
    name: 'got-key',
    catDialog: 'That key looks right, but it\'s far too large! You might need to apply a potion to the key to make it the correct size...',
    ghostDialog: 'I\'m serious dude, get out of the attic',
    unlockedRooms: ['foyer', 'greenhouse', 'hall']
  },
  {
    name: 'unlocked-bottom-cabinet',
    catDialog: 'Well done! The other keyhole is far larger than the original key, but I think there\'s another potion that could help you. You can take another regular key if you need to!',
    ghostDialog: 'I\'m serious dude, get out of the attic',
    unlockedRooms: ['foyer', 'greenhouse', 'hall']
  },
  {
    name: 'unlocked-top-cabinet',
    catDialog: 'The cupboard is fully unlocked, I\'m impressed! The cellar should be open now, try going down there and procuring a hushroom or two.',
    ghostDialog: 'I\'m serious dude, get out of the attic',
    unlockedRooms: ['foyer', 'greenhouse', 'hall', 'cellar']
  },
  {
    name: 'destroyed-hushroom',
    catDialog: 'Hushrooms can\'t withstand loud music, they crumble away! Maybe you could create a potion to toughen it up temporarily?',
    ghostDialog: 'I\'m serious dude, get out of the attic',
    unlockedRooms: ['foyer', 'greenhouse', 'hall', 'cellar']
  },
  {
    name: 'recovered-hushroom',
    catDialog: 'Good thinking! Now you\'ll have hushrooms available in the hall whenever you want!',
    ghostDialog: 'I\'m serious dude, get out of the attic',
    unlockedRooms: ['foyer', 'greenhouse', 'hall', 'cellar']
  },
  {
    name: 'got-radio',
    catDialog: 'Please don\'t be scared of the ghost, they\'re just grumpy. I wonder what\'s wrong with their radio?',
    ghostDialog: 'I\'m serious dude, get out of the attic',
    unlockedRooms: ['foyer', 'greenhouse', 'hall', 'cellar']
  },
  {
    name: 'fixed-radio',
    catDialog: 'That looks like it did the trick! That radio should be back in working condition, the ghost will be overjoyed!',
    ghostDialog: 'I\'m serious dude, get out of the attic',
    unlockedRooms: ['foyer', 'greenhouse', 'hall', 'cellar']
  },
  {
    name: 'returned-radio',
    catDialog: 'To finish your potion, you\'ll need a Gravity Stone. There are some in the cellar, but it\'ll be tough to lift out of there...',
    ghostDialog: 'welcome to the spooooooooky attic, ha ha i mean its spooky because i live here, can i interest you in some ghost tears',
    unlockedRooms: ['foyer', 'greenhouse', 'hall', 'cellar', 'attic']
  },
  {
    name: 'dropped-gravity-stone',
    catDialog: 'No luck? I think you\'ll need to use the furnace down there; certain potions only work on really, really hot items',
    ghostDialog: 'do you want more of my tears, no no i assure you its no trouble',
    unlockedRooms: ['foyer', 'greenhouse', 'hall', 'cellar', 'attic']
  },
  {
    name: 'heated-gravity-stone',
    catDialog: 'I know there\'s a potion you can make to make that hot rock as light as a feather! If you make it, the rock should be no trouble.',
    ghostDialog: 'do you want more of my tears, no no i assure you its no trouble',
    unlockedRooms: ['foyer', 'greenhouse', 'hall', 'cellar', 'attic']
  },
  {
    name: 'heated-floating-gravity-stone',
    catDialog: 'Once the gravity stone is floating, put it back in the furnace and it should float up the flue!',
    ghostDialog: 'do you want more of my tears, no no i assure you its no trouble',
    unlockedRooms: ['foyer', 'greenhouse', 'hall', 'cellar', 'attic']
  },
  {
    name: 'recovered-gravity-stone',
    catDialog: 'That\'s fantastic! You should now have all of the ingredients you need to finish the last potion on the list!',
    ghostDialog: 'do you want more of my tears, no no i assure you its no trouble',
    unlockedRooms: ['foyer', 'greenhouse', 'hall', 'cellar', 'attic']
  },
  {
    name: 'drank-ghostly-potion',
    catDialog: 'Look at you, you\'re transparent! Quick, go through the locked door before it wears off!',
    ghostDialog: 'hee hee you look like me, thats awesome',
    rutabagaDialog: 'Goodness, where did you come from? Please use that potion over there to transform me back!',
    unlockedRooms: ['foyer', 'greenhouse', 'hall', 'cellar', 'attic', 'locked']
  },
]

let currentLevel = 0;

export function setProgressLevelName(name: string) {
  setProgressLevel(progressData.findIndex(p => p.name === name));
}
export function setProgressLevel(level: number) {
  if(level >= progressData.length || level === -1) return alert(`No progress data of level ${level} exists!`);
  currentLevel = level;
  console.log('Progress level set to ' + level);
}

export function increaseProgressLevelName(name: string) {
  increaseProgressLevel(progressData.findIndex(p => p.name === name));
}

export function increaseProgressLevel(level: number) {
  if(level > currentLevel) setProgressLevel(level);
}

export function getProgressLevel() { return currentLevel };
export function getProgressLevelName() { return progressData[currentLevel].name }
export function getProgressLevelIndex(name: string) { return progressData.findIndex(p => p.name === name) }

export function isRoomUnlocked(roomName: string): boolean {
  return progressData[currentLevel].unlockedRooms.includes(roomName);
}

export function getDialog(npcType: NpcType) {
  const currentLevelData = progressData[currentLevel];
  return npcType === 'CAT' ? currentLevelData.catDialog :  npcType === 'RUTABAGA' ? currentLevelData.rutabagaDialog : currentLevelData.ghostDialog;
}
