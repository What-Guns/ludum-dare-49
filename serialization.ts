export function serialize<T extends IAmSerializable<TData>, TData>(s: T) {
  const typeName = Array.from(typeByName.entries()).find(([_, type]) => s instanceof type)?.[0];
  if(!typeName) throw new Error(`No type name found when attempting to serialize ${s}`);
  return {
    '@type': typeName,
    ...s.serialize(),
  };
}

export function deserialize<T extends IAmSerializable<TData>, TData>(data: TData, type: SerializableType<T, TData>): Promise<T>;
export function deserialize<T extends IAmSerializable<TData>, TData>(data: TData&{'@type': string}): Promise<T>;
export function deserialize<T extends IAmSerializable<TData>, TData>(data: TData&{'@type'?: string}, type?: SerializableType<T, TData>): Promise<T> {
  if(!type) {
    const name = data['@type']!;
    type = typeByName.get(name) as any;
  }
  if(!type) throw new Error(`Failed to find serializable type ${name}`);
  return type.deserialize(data) as Promise<T>;
}

export function Serializable() {
  return <T extends IAmSerializable<TData>, TData>(type: SerializableType<T, TData>) => {
    typeByName.set(type.name, type);
  }
}

export function isSerializable(x: object): x is IAmSerializable<unknown> {
  return Array.from(typeByName.values()).some(t => x instanceof t);
}

type SerializableType<T extends IAmSerializable<TData>, TData> = {
  new(...args: any[]): T;
  deserialize(data: TData): Promise<T>;
}

export interface IAmSerializable<TData> {
  serialize(): TData;
}

const typeByName = new Map<string, SerializableType<IAmSerializable<unknown>, unknown>>();
