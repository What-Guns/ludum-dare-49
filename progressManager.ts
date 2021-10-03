import { NpcType } from "./npc.js";

const progressData = [
  {
    level: 0,
    catDialog: 'Welcome to the cottage! Try, idk, picking things up.',
    ghostDialog: 'You definitely should not be in the attic yet',
    unlockedDoors: ['left']
  }
]

let currentLevel = 0;
let currentLevelData = progressData.find(d => d.level === currentLevel)!;

export function setProgressLevel(level: number) {
  const newData = progressData.find(d => d.level === level);
  if (!newData) return alert(`No progress data of level ${level} exists!`);
  currentLevel = level;
  currentLevelData = newData;
}

export function isDoorUnlocked(doorName: string): boolean {
  return currentLevelData.unlockedDoors.includes(doorName);
}

export function getDialog(npcType: NpcType) {
  return npcType === 'CAT' ? currentLevelData.catDialog : currentLevelData.ghostDialog;
}