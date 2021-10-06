import { Serializable } from "./serialization.js";

@Serializable('./flags.js')
export class Flags {
  static _instance: Flags;
  readonly flagsList: FlagData[];

  constructor(objectData: FlagsData) {
    this.flagsList = objectData;
  }

  static async deserialize(data: FlagsData) {
    const flags = new Flags(data);
    if (Flags._instance) throw 'Tried to instantiate another set of flags!'
    Flags._instance = flags;
    return flags;
  }

  serialize(): FlagsData {
    return this.flagsList;
  }

  toggleFlag(flagName: string) {
    let flag = this.getFlag(flagName);
    if (!flag) {
      flag = this.createFlag(flagName, true);
    }
    flag.value = !flag.value;
    window.game!.music.roomChanged(window.game?.room?.name!, true);
  }

  enableFlag(flagName: string) {
    let flag = this.getFlag(flagName);
    if (!flag) {
      flag = this.createFlag(flagName, true);
    }
    flag.value = true;
  }

  disableFlag(flagName: string) {
    let flag = this.getFlag(flagName);
    if (!flag) {
      flag = this.createFlag(flagName, false);
    }
    flag.value = false;
  }

  getFlagValue(flagName: string) {
    const negativeFlag = flagName.startsWith('!');
    const realFlagName = negativeFlag ? flagName.substring(1) : flagName;
    let flag = this.getFlag(realFlagName);
    if (!flag) {
      flag = this.createFlag(realFlagName, negativeFlag);
    }
    return negativeFlag ? !flag.value : flag.value;
  }

  getFlag(flagName: string) {
    return this.flagsList.find(f => f.name === flagName);
  }

  private createFlag(flagName: string, initialValue: boolean) {
    const negativeFlag = flagName.startsWith('!');
    const flag = { name: negativeFlag ? flagName.substring(1) : flagName, value: negativeFlag ? initialValue : !initialValue };
    this.flagsList.push(flag);
    console.warn(`New flag '${flagName}' created`);
    return flag;
  }
}

export function toggleFlag(flagName: string) {
  Flags._instance.toggleFlag(flagName);
}

export function enableFlag(flagName: string) {
  Flags._instance.enableFlag(flagName);
}

export function disableFlag(flagName: string) {
  Flags._instance.disableFlag(flagName);
}

export function getFlagValue(flagName: string) {
  return Flags._instance.getFlagValue(flagName);
}

export type FlagsData = FlagData[];

type FlagData = {
  name: string,
  value: boolean,
}