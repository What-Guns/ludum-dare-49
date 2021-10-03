export interface Type<T> {
  new(...params: any[]): T;
}

export function ofType<T>(t: Type<T>) {
  return (x: any): x is T => x instanceof t;
}

export function removeFromArray<T>(array: T[], item: T) {
  const index = array.indexOf(item);
  if(index === -1) {
    throw new RangeError(`Trying to remove non-present item from array.`);
  }
  array.splice(index, 1);
}
