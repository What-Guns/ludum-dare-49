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
      flag = { name: flagName, value: true };
      this.flagsList.push(flag);
      console.log(`New flag '${flagName}' created`);
    }
    flag.value = !flag.value;
  }

  getFlagValue(flagName: string) {
    let flag = this.getFlag(flagName);
    if (!flag) {
      flag = { name: flagName, value: false };
      this.flagsList.push(flag);
      console.log(`New flag '${flagName}' created`);
    }
    return flag.value;
  }

  getFlag(flagName: string) {
    return this.flagsList.find(f => f.name === flagName);
  }
}

export function toggleFlag(flagName: string) {
  Flags._instance.toggleFlag(flagName);
}

export function getFlagValue(flagName: string) {
  return Flags._instance.getFlagValue(flagName);
}

export type FlagsData = FlagData[];

type FlagData = {
  name: string,
  value: boolean,
}