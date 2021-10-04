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

export type HSBColor = {
  hue: number,
  saturation: number,
  brightness: number,
}

export function getFilterFromColor(color: HSBColor) {
  return `hue-rotate(${color.hue}deg) saturate(${color.saturation}%) brightness(${color.brightness}%)`
}
