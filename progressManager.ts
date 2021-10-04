import { NpcType } from "./npc.js";

export const progressData = [
  {
    name: 'initial',
    catDialog: 'Welcome to the cottage! Try, idk, picking things up.',
    ghostDialog: 'You definitely should not be in the attic yet',
    unlockedRooms: ['foyer', 'greenhouse', 'hall']
  },
  {
    catDialog: 'You\'ve reached the next level! I am so very proud of you.',
    ghostDialog: 'I\'m serious dude, get out of the attic',
    unlockedRooms: ['foyer', 'greenhouse', 'hall']
  },
  {
    catDialog: 'You\'ve reached the next level! I am so very proud of you.',
    ghostDialog: 'I\'m serious dude, get out of the attic',
    unlockedRooms: ['foyer', 'greenhouse', 'hall']
  },
  {
    catDialog: 'You\'ve reached the next level! I am so very proud of you.',
    ghostDialog: 'I\'m serious dude, get out of the attic',
    unlockedRooms: ['foyer', 'greenhouse', 'hall']
  },
  {
    catDialog: 'You\'ve reached the next level! I am so very proud of you.',
    ghostDialog: 'I\'m serious dude, get out of the attic',
    unlockedRooms: ['foyer', 'greenhouse', 'hall']
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

export function isRoomUnlocked(roomName: string): boolean {
  return progressData[currentLevel].unlockedRooms.includes(roomName);
}

export function getDialog(npcType: NpcType) {
  const currentLevelData = progressData[currentLevel];
  return npcType === 'CAT' ? currentLevelData.catDialog : currentLevelData.ghostDialog;
}
