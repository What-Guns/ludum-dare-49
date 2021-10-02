export function serialize<T extends IAmSerializable<TData>, TData>(s: T): any {
  const typeName = s.constructor.name;
  if(!typeName) throw new Error(`No type name found when attempting to serialize ${s}`);
  return {
    '@type': typeName,
    '@path': pathByType.get(s.constructor),
    ...s.serialize(),
  };
}

export async function deserialize<T extends IAmSerializable<TData>, TData, TExtras = never>(data: TData, extras?: TExtras): Promise<any> {
  const path = (data as any)['@path']!;
  const name = (data as any)['@type']!;
  const theModule = await import(path);
  const type = theModule[name];
  if(!type) throw new Error(`Failed to find serializable type ${name}`);
  return type.deserialize(data, extras) as Promise<T>;
}

export function Serializable(filePath: string) {
  return <T extends IAmSerializable<TData>, TData>(type: SerializableType<T, TData>) => {
    pathByType.set(type, filePath);
  }
}

export function isSerializable(x: object): x is IAmSerializable<unknown> {
  return pathByType.has(x.constructor);
}

type SerializableType<T extends IAmSerializable<TData>, TData, TExtras = never> = {
  new(...args: any[]): T;
  deserialize(data: TData, extras: TExtras): Promise<T>;
}

export interface IAmSerializable<TData> {
  serialize(): TData;
}

const pathByType = new Map<Function, string>();

async function whatDoIHave() {
  const modules = await Promise.all(Array.from(pathByType.values()).map(async (path) => {
    return [path, Object.keys(await import(path))];
  }));
  return Object.fromEntries(modules);
}

(window as any).whatDoIHave = whatDoIHave;

export function pluck<T, K extends keyof T>(o: T, ...propertyNames: K[]): Pick<T, K> {
  return Object.fromEntries(propertyNames.map(n => ([n, o[n]]))) as Pick<T, K>;
}
