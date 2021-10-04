import { NpcType } from "./npc.js";

export const progressData = [
  {
    catDialog: 'Welcome to the cottage! Try, idk, picking things up.',
    ghostDialog: 'You definitely should not be in the attic yet',
    unlockedRooms: ['foyer', 'hall']
  },
  {
    catDialog: 'You\'ve reached the next level! I am so very proud of you.',
    ghostDialog: 'I\'m serious dude, get out of the attic',
    unlockedRooms: ['foyer', 'greenhouse', 'hall', 'cellar']
  },
  {
    catDialog: 'You\'ve reached the next level! I am so very proud of you.',
    ghostDialog: 'I\'m serious dude, get out of the attic',
    unlockedRooms: ['foyer', 'greenhouse', 'hall', 'cellar', 'attic']
  },
]

let currentLevel = 0;

export function setProgressLevel(level: number) {
  if(level >= progressData.length) return alert(`No progress data of level ${level} exists!`);
  currentLevel = level;
}

export function getProgressLevel() { return currentLevel };

(window as any).setProgressLevel = setProgressLevel;

export function isRoomUnlocked(roomName: string): boolean {
  return progressData[currentLevel].unlockedRooms.includes(roomName);
}

export function getDialog(npcType: NpcType) {
  const currentLevelData = progressData[currentLevel];
  return npcType === 'CAT' ? currentLevelData.catDialog : currentLevelData.ghostDialog;
}
