export function serialize<T extends IAmSerializable<TData>, TData>(s: T) {
  const typeName = s.constructor.name;
  if(!typeName) throw new Error(`No type name found when attempting to serialize ${s}`);
  return {
    '@type': typeName,
    '@path': pathByType.get(s.constructor),
    ...s.serialize(),
  };
}

export async function deserialize<T extends IAmSerializable<TData>, TData>(data: TData): Promise<T> {
  const name = (data as any)['@type']!;
  const path = (data as any)['@path']!;
  const theModule = await import(path);
  const type = theModule[name];
  if(!type) throw new Error(`Failed to find serializable type ${name}`);
  return type.deserialize(data) as Promise<T>;
}

export function Serializable(filePath: string) {
  return <T extends IAmSerializable<TData>, TData>(type: SerializableType<T, TData>) => {
    pathByType.set(type, filePath);
  }
}

export function isSerializable(x: object): x is IAmSerializable<unknown> {
  return pathByType.has(x.constructor);
}

type SerializableType<T extends IAmSerializable<TData>, TData> = {
  new(...args: any[]): T;
  deserialize(data: TData): Promise<T>;
}

export interface IAmSerializable<TData> {
  serialize(): TData;
}

const pathByType = new Map<Function, string>();
